import { useState, useEffect, useCallback } from 'react';
import { supabase, isAuthEnabled } from '@/lib/supabase';
import { useAuthOptional } from '@/contexts/AuthContext';
import {
  initializeCharacter,
  applyBookToCharacter,
  applyReadingSession,
} from '@/lib/character-engine';
import { CharacterState, Book, AttributeType, Genre, Pet } from '@/types/reading';
import { getSeed } from '@/lib/avatar-seed';
import { createInitialPet, evolvePetIfNeeded } from '@/lib/pet-engine';

const STORAGE_KEY = 'readself_data';

export interface AppData {
  character: CharacterState;
  books: Book[];
  onboarded: boolean;
  pet: Pet | null;
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
    if (parsed.pet) {
      parsed.pet.createdAt = new Date(parsed.pet.createdAt);
      parsed.pet.lastEvolvedAt = new Date(parsed.pet.lastEvolvedAt);
    }
    if (parsed.pet === undefined) parsed.pet = null;
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

function dbRowToPet(row: any): Pet {
  return {
    id: row.id,
    seed: row.seed,
    name: row.name ?? 'Companion',
    stage: row.stage,
    traits: row.traits ?? {},
    createdAt: new Date(row.created_at ?? row.createdAt),
    lastEvolvedAt: new Date(row.last_evolved_at ?? row.lastEvolvedAt),
  };
}

function petToDbRow(pet: Pet, userId: string) {
  return {
    id: pet.id,
    user_id: userId,
    seed: pet.seed,
    name: pet.name,
    stage: pet.stage,
    traits: pet.traits,
    created_at: pet.createdAt.toISOString(),
    last_evolved_at: pet.lastEvolvedAt.toISOString(),
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
        pet: null,
      });
    }
  }, []);

  // Ensure pet exists when we have data but no pet (local-only or first run)
  useEffect(() => {
    setData((prev) => {
      if (!prev || prev.pet) return prev;
      const seed = getSeed();
      if (!seed) return prev;
      const pet = createInitialPet(seed, prev.character, prev.books);
      return { ...prev, pet };
    });
  }, []);

  // Background sync: fetch real data from Supabase and merge it in
  useEffect(() => {
    if (!isAuthEnabled || !userId) return;

    const syncFromSupabase = async () => {
      setSyncing(true);
      try {
        // Fetch books and pet in parallel
        const [booksRes, petsRes] = await Promise.all([
          supabase
            .from('books')
            .select('*')
            .eq('user_id', userId)
            .order('date_added', { ascending: false }),
          supabase
            .from('pets')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(),
        ]);

        if (booksRes.error) throw booksRes.error;
        // Pets table might not exist yet; treat as no pet
        const petRow = petsRes.error ? null : petsRes.data;
        const existingPet = petRow ? dbRowToPet(petRow) : null;

        const dbBooks: Book[] = (booksRes.data ?? []).map(dbBookToBook);

        // Rebuild character state from DB books so it stays consistent
        let character = initializeCharacter();
        [...dbBooks].reverse().forEach((book) => {
          character = applyBookToCharacter(character, book);
        });

        const localData = loadFromStorage();
        const hasLocalBooks = (localData?.books?.length ?? 0) > 0;
        const hasDbBooks = dbBooks.length > 0;

        if (!hasDbBooks && hasLocalBooks && localData) {
          await pushLocalBooksToSupabase(localData.books, userId);
          // Keep local state; still need to merge pet if we have one from DB
          if (existingPet) {
            const { pet: evolvedPet, didEvolve } = evolvePetIfNeeded(
              existingPet,
              localData.character,
              localData.books
            );
            setData((prev) => (prev ? { ...prev, pet: evolvedPet } : prev));
            if (didEvolve) await upsertPet(evolvedPet, userId);
          }
          return;
        }

        // DB is source of truth: set character + books
        let pet = existingPet;
        if (!pet) {
          const seed = getSeed();
          if (seed) {
            pet = createInitialPet(seed, character, dbBooks);
            await upsertPet(pet, userId);
          }
        }
        if (pet) {
          const { pet: evolvedPet, didEvolve } = evolvePetIfNeeded(pet, character, dbBooks);
          pet = evolvedPet;
          if (didEvolve) await upsertPet(pet, userId);
        }

        setData((prev) => ({
          ...prev,
          character,
          books: dbBooks,
          pet,
        }));
      } catch (err) {
        console.error('Background sync failed:', err);
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

      const newBooks = [newBook, ...data.books];
      const seed = getSeed();
      let pet = data.pet ?? (seed ? createInitialPet(seed, updatedCharacter, newBooks) : null);
      if (pet) {
        const result = evolvePetIfNeeded(pet, updatedCharacter, newBooks);
        pet = result.pet;
      }

      // Optimistic update — localStorage + state updated immediately
      setData((prev) => ({
        ...prev,
        character: updatedCharacter,
        books: newBooks,
        pet,
      }));

      // Background write to Supabase
      if (isAuthEnabled && userId) {
        try {
          await supabase.from('books').insert(bookToDbRow(newBook, userId));
          if (pet) await upsertPet(pet, userId);
        } catch (err) {
          console.error('Failed to save book to Supabase:', err);
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

      const seed = getSeed();
      let pet = data.pet ?? (seed ? createInitialPet(seed, character, remainingBooks) : null);
      if (pet) {
        const result = evolvePetIfNeeded(pet, character, remainingBooks);
        pet = result.pet;
      }

      // Optimistic update
      setData((prev) => ({
        ...prev,
        character,
        books: remainingBooks,
        pet,
      }));

      // Background delete from Supabase
      if (isAuthEnabled && userId) {
        try {
          await supabase.from('books').delete().eq('id', bookId).eq('user_id', userId);
          if (pet) await upsertPet(pet, userId);
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
      const seed = getSeed();
      let pet = data.pet ?? (seed ? createInitialPet(seed, updatedCharacter, data.books) : null);
      if (pet) {
        const result = evolvePetIfNeeded(pet, updatedCharacter, data.books);
        pet = result.pet;
      }

      // Optimistic update
      setData((prev) => ({
        ...prev,
        character: updatedCharacter,
        pet,
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
          ]);
          if (pet) await upsertPet(pet, userId);
        } catch (err) {
          console.error('Failed to save session to Supabase:', err);
        }
      }
    },
    [data, userId]
  );

  const completeOnboarding = useCallback(() => {
    setData((prev) => ({ ...prev, onboarded: true }));
  }, []);

  const updatePetName = useCallback(
    async (name: string) => {
      if (!data?.pet) return;
      const pet = { ...data.pet, name };
      setData((prev) => (prev ? { ...prev, pet } : prev));
      if (isAuthEnabled && userId) await upsertPet(pet, userId);
    },
    [data?.pet, userId]
  );

  return {
    data,
    syncing,
    addBook,
    removeBook,
    completeSession,
    completeOnboarding,
    updatePetName,
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

async function upsertPet(pet: Pet, userId: string) {
  try {
    await supabase.from('pets').upsert(petToDbRow(pet, userId), {
      onConflict: 'user_id',
    });
  } catch (err) {
    console.error('Failed to upsert pet to Supabase:', err);
  }
}