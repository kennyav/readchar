import { useState, useEffect, useCallback } from 'react';
import { supabase, isAuthEnabled } from '@/lib/supabase';
import { useAuthOptional } from '@/contexts/AuthContext';
import {
  initializeCharacter,
  applyBookToCharacter,
  applyReadingSession,
} from '@/lib/character-engine';
import { CharacterState, Book, AttributeType, Genre } from '@/types/reading';

const STORAGE_KEY = 'readself_data';

interface AppData {
  character: CharacterState;
  books: Book[];
  onboarded: boolean;
}

function loadFromStorage(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    parsed.books = parsed.books.map((book: any) => ({
      ...book,
      dateAdded: new Date(book.dateAdded),
    }));
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Converts a Supabase books row to our internal Book type.
 */
function dbBookToBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: row.genre as Genre,
    coverId: row.cover_id ?? null,
    themes: row.themes ?? [],
    attributeImpact: row.attribute_impact ?? {},
    dateAdded: new Date(row.date_added ?? row.created_at),
  };
}

/**
 * Converts our internal Book type to a Supabase insert payload.
 */
function bookToDbRow(book: Book, userId: string) {
  return {
    id: book.id,
    user_id: userId,
    title: book.title,
    author: book.author,
    genre: book.genre,
    cover_id: book.coverId ?? null,
    themes: book.themes,
    attribute_impact: book.attributeImpact,
    date_added: book.dateAdded.toISOString(),
  };
}

export function useAppData() {
  const auth = useAuthOptional();
  const userId = auth?.user?.id ?? null;

  // Seed from localStorage immediately so UI loads fast
  const [data, setDataRaw] = useState<AppData | null>(() => loadFromStorage());
  const [syncing, setSyncing] = useState(false);

  // Keep localStorage in sync whenever data changes
  const setData = useCallback((updater: AppData | ((prev: AppData) => AppData)) => {
    setDataRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev!) : updater;
      saveToStorage(next);
      return next;
    });
  }, []);

  // On first load: if nothing in localStorage, initialize with defaults
  useEffect(() => {
    if (!data) {
      setData({
        character: initializeCharacter(),
        books: [],
        onboarded: false,
      });
    }
  }, []);

  // Background sync: fetch real data from Supabase and merge it in
  useEffect(() => {
    if (!isAuthEnabled || !userId) return;

    const syncFromSupabase = async () => {
      setSyncing(true);
      try {
        // Fetch books and character in parallel
        const [booksRes, characterRes] = await Promise.all([
          supabase
            .from('books')
            .select('*')
            .eq('user_id', userId)
            .order('date_added', { ascending: false }),
          supabase
            .from('characters')
            .select('*')
            .eq('user_id', userId)
            .single(),
        ]);

        if (booksRes.error) throw booksRes.error;
        if (characterRes.error && characterRes.error.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is fine for new users
          throw characterRes.error;
        }

        const dbBooks: Book[] = (booksRes.data ?? []).map(dbBookToBook);

        // Rebuild character state from DB books so it stays consistent
        let character = initializeCharacter();
        // Apply books in chronological order so attribute math is correct
        [...dbBooks].reverse().forEach((book) => {
          character = applyBookToCharacter(character, book);
        });

        // Merge: prefer DB data but fall back to localStorage if DB is empty
        // and localStorage has data (e.g. user added books before logging in)
        const localData = loadFromStorage();
        const hasLocalBooks = (localData?.books?.length ?? 0) > 0;
        const hasDbBooks = dbBooks.length > 0;

        if (!hasDbBooks && hasLocalBooks && localData) {
          // User has local data but nothing in DB yet — push local books up
          await pushLocalBooksToSupabase(localData.books, userId);
          // Keep local state as-is, it's already correct
        } else {
          // DB is the source of truth — update local state
          setData((prev) => ({
            ...prev,
            character,
            books: dbBooks,
          }));
        }
      } catch (err) {
        console.error('Background sync failed:', err);
        // Silently fail — localStorage data is still shown
      } finally {
        setSyncing(false);
      }
    };

    syncFromSupabase();
  }, [userId]);

  // ── Mutations ──

  const addBook = useCallback(
    async (bookData: { title: string; author: string; genre: Genre; coverId: number | null }) => {
      if (!data) return;

      const newBook: Book = {
        id: crypto.randomUUID(),
        title: bookData.title,
        author: bookData.author,
        coverId: bookData.coverId ?? null,
        genre: bookData.genre,
        themes: [],
        dateAdded: new Date(),
        attributeImpact: {},
      };

      const oldLevel = data.character.currentLevel;
      const updatedCharacter = applyBookToCharacter(data.character, newBook);

      // Calculate attribute impact for display
      Object.keys(updatedCharacter.attributes).forEach((attr) => {
        const oldValue = data.character.attributes[attr as AttributeType].value;
        const newValue = updatedCharacter.attributes[attr as AttributeType].value;
        const impact = newValue - oldValue;
        if (impact > 0) newBook.attributeImpact[attr as AttributeType] = impact;
      });

      // Optimistic update — localStorage + state updated immediately
      setData((prev) => ({
        ...prev,
        character: updatedCharacter,
        books: [newBook, ...prev.books],
      }));

      // Background write to Supabase
      if (isAuthEnabled && userId) {
        try {
          await supabase.from('books').insert(bookToDbRow(newBook, userId));
          // Update character stats in DB
          await supabase
            .from('characters')
            .update({
              current_level: updatedCharacter.currentLevel,
              total_books_read: updatedCharacter.totalBooksRead,
              total_reading_time: updatedCharacter.totalReadingTime,
            })
            .eq('user_id', userId);
        } catch (err) {
          console.error('Failed to save book to Supabase:', err);
          // Don't revert — localStorage has it, will sync next time
        }
      }

      return updatedCharacter.currentLevel > oldLevel; // true if leveled up
    },
    [data, userId]
  );

  const removeBook = useCallback(
    async (bookId: string) => {
      if (!data) return;

      // Find the book before removing it
      const bookToRemove = data.books.find((b) => b.id === bookId);
      if (!bookToRemove) return;

      // Rebuild character without the removed book
      const remainingBooks = data.books.filter((b) => b.id !== bookId);
      let character = initializeCharacter();
      [...remainingBooks].reverse().forEach((book) => {
        character = applyBookToCharacter(character, book);
      });

      // Optimistic update
      setData((prev) => ({
        ...prev,
        character,
        books: remainingBooks,
      }));

      // Background delete from Supabase
      if (isAuthEnabled && userId) {
        try {
          await supabase.from('books').delete().eq('id', bookId).eq('user_id', userId);
          await supabase
            .from('characters')
            .update({
              current_level: character.currentLevel,
              total_books_read: character.totalBooksRead,
              total_reading_time: character.totalReadingTime,
            })
            .eq('user_id', userId);
        } catch (err) {
          console.error('Failed to delete book from Supabase:', err);
        }
      }
    },
    [data, userId]
  );

  const completeSession = useCallback(
    async (minutes: number) => {
      if (!data) return;

      const updatedCharacter = applyReadingSession(data.character, minutes);

      // Optimistic update
      setData((prev) => ({
        ...prev,
        character: updatedCharacter,
      }));

      // Background write to Supabase
      if (isAuthEnabled && userId) {
        try {
          const sessionId = crypto.randomUUID();
          await Promise.all([
            supabase.from('reading_sessions').insert({
              id: sessionId,
              user_id: userId,
              minutes,
            }),
            supabase
              .from('characters')
              .update({
                current_level: updatedCharacter.currentLevel,
                total_reading_time: updatedCharacter.totalReadingTime,
              })
              .eq('user_id', userId),
          ]);
        } catch (err) {
          console.error('Failed to save session to Supabase:', err);
        }
      }
    },
    [data, userId]
  );

  const completeOnboarding = useCallback(() => {
    setData((prev) => ({ ...prev, onboarded: true }));
    // You can extend this to save onboarding answers to profiles table here
  }, []);

  return {
    data,
    syncing,
    addBook,
    removeBook,
    completeSession,
    completeOnboarding,
  };
}

// ── Helpers ──

async function pushLocalBooksToSupabase(books: Book[], userId: string) {
  if (books.length === 0) return;
  try {
    await supabase
      .from('books')
      .upsert(books.map((b) => bookToDbRow(b, userId)), { onConflict: 'id' });
  } catch (err) {
    console.error('Failed to push local books to Supabase:', err);
  }
}