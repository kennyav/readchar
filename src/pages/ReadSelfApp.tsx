import { useState, useEffect } from 'react';
import { CharacterState, Book, OnboardingAnswers, AttributeType, Genre } from '@/types/reading';
import { CharacterAvatar } from '@/components/character/CharacterAvatar';
import { AttributeConstellation } from '@/components/character/AttributeConstellation';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { AddBookDialog } from '@/components/reading/AddBookDialog';
import { ReadingTimerDialog } from '@/components/reading/ReadingTimerDialog';
import { BookLogCard } from '@/components/reading/BookLogCard';
import { AttributeDetailDialog } from '@/components/character/AttributeDetailDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Library, LogOut, Sparkles, TrendingUp } from 'lucide-react';
import { useAuthOptional } from '@/contexts/AuthContext';
import { isAuthEnabled } from '@/lib/supabase';
import {
  initializeCharacter,
  applyBookToCharacter,
  applyReadingSession,
  getRecommendations,
  generateJournalEntry,
} from '@/lib/character-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarIdentity } from '@/hooks/use-avatar-identity'
import { ReadingAvatar } from '@/components/character/ReadingAvatar';
import { GenreLegend } from '@/components/character/GenreLegend';

const STORAGE_KEY = 'readself_data';

interface AppData {
  character: CharacterState;
  books: Book[];
  onboarded: boolean;
}

export default function ReadSelfApp() {
  const auth = useAuthOptional();
  const [data, setData] = useState<AppData | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const { seed, books, hydrated, addBook, removeBook } = useAvatarIdentity(data)
  const isEmpty = books.length === 0


  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      parsed.books = parsed.books.map((book: any) => ({
        ...book,
        dateAdded: new Date(book.dateAdded),
      }));
      setData(parsed);
    } else {
      setData({
        character: initializeCharacter(),
        books: [],
        onboarded: false,
      });
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-game text-2xl text-[#6C6C70] font-semibold">Loading...</div>
      </div>
    );
  }

  if (!data.onboarded) {
    return (
      <OnboardingFlow
        onComplete={(answers: OnboardingAnswers) => {
          setData({ ...data, onboarded: true });
        }}
      />
    );
  }

  const handleAddBook = (bookData: { title: string; author: string; genre: Genre; coverId: number }) => {
    const newBook: Book = {
      id: Date.now().toString(),
      title: bookData.title,
      author: bookData.author,
      coverId: bookData.coverId,
      genre: bookData.genre,
      themes: [],
      dateAdded: new Date(),
      attributeImpact: {},
    };

    const oldLevel = data.character.currentLevel;
    const updatedCharacter = applyBookToCharacter(data.character, newBook);
    const newLevel = updatedCharacter.currentLevel;

    // Update impact on the book
    Object.keys(updatedCharacter.attributes).forEach((attr) => {
      const oldValue = data.character.attributes[attr as AttributeType].value;
      const newValue = updatedCharacter.attributes[attr as AttributeType].value;
      const impact = newValue - oldValue;
      if (impact > 0) {
        newBook.attributeImpact[attr as AttributeType] = impact;
      }
    });

    setData({
      ...data,
      character: updatedCharacter,
      books: [newBook, ...data.books],
    });

    if (newLevel > oldLevel) {
      setShowEvolution(true);
      setTimeout(() => setShowEvolution(false), 3000);
    }
  };

  const handleCompleteSession = (minutes: number) => {
    const updatedCharacter = applyReadingSession(data.character, minutes);
    setData({
      ...data,
      character: updatedCharacter,
    });
  };

  const recommendations = getRecommendations(data.character);
  const totalReadingHours = Math.floor(data.character.totalReadingTime / 3600);
  const totalReadingMinutes = Math.floor((data.character.totalReadingTime % 3600) / 60);

  return (
    <div className="min-h-screen">
      {/* Sign out when auth is enabled */}
      {isAuthEnabled && auth?.user && (
        <div className="flex justify-end px-4 py-2 border-b border-[#2C2C2E]/10">
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 text-sm text-[#6C6C70] hover:text-[#2C2C2E] font-game"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
      {/* Evolution notification - achievement style */}
      <AnimatePresence>
        {showEvolution && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="game-panel rounded-2xl px-6 py-4 flex items-center gap-3 border-2 border-[#9B7EBD] bg-gradient-to-r from-[#9B7EBD] to-[#8B6EAD] text-white font-game font-bold text-lg shadow-lg">
              <Sparkles className="w-7 h-7 drop-shadow" />
              <span className="tracking-wide">LEVEL UP!</span>
              <span className="opacity-90 font-medium">Your character evolved</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="character" className="w-full">
          <TabsList className="game-panel grid w-full grid-cols-3 mb-8 rounded-2xl p-1.5">
            <TabsTrigger
              value="character"
              className="rounded-xl font-game font-semibold data-[state=active]:bg-[#9B7EBD] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Character
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="rounded-xl font-game font-semibold data-[state=active]:bg-[#9B7EBD] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Library
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-xl font-game font-semibold data-[state=active]:bg-[#9B7EBD] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="space-y-8">
            {/* Character display section */}
            {/* <div className="game-panel p-8 rounded-2xl">
              <div className="flex flex-col items-center">
                <CharacterAvatar character={data.character} className="mb-6" />
                <h2 className="font-game text-2xl font-bold text-[#2C2C2E] mb-2 tracking-wide">
                  Your Reading Companion
                </h2>
                <p className="text-[#6C6C70] font-medium">Level {data.character.currentLevel}</p>
              </div>
            </div> */}
            <section className="mb-10 flex flex-col items-center">
              <ReadingAvatar seed={seed} books={books} size={260} />

              <div className="mt-6 text-center">
                <h1
                  className="text-balance text-3xl font-bold text-[#2C2C2E]"
                  style={{ fontFamily: 'serif' }}
                >
                  Your Reading Avatar
                </h1>
                {isEmpty ? (
                  <p className="mx-auto mt-2 max-w-xs text-sm text-[#6B6B6E]">
                    Add your first book to bring your character to life. Each genre grants new gear and abilities.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-[#6B6B6E]">
                    Level {Math.min(Math.max(Math.floor(Math.log2(books.length + 1) * 3.5), 1), 20)} {'  '}
                    {books.length} book{books.length === 1 ? '' : 's'} collected
                  </p>
                )}
              </div>

              {/* Genre legend */}
              {!isEmpty && (
                <div className="mt-4">
                  <GenreLegend books={books} />
                </div>
              )}
            </section> 

            {/* Attribute constellation */}
            <div className="game-panel p-8 rounded-2xl flex flex-col min-h-[400px]">
              <div className="">
                <AttributeConstellation
                  character={data.character}
                  onAttributeClick={setSelectedAttribute}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setShowAddBook(true)}
                className="game-panel h-20 bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white rounded-2xl text-lg font-game font-semibold border-2 border-[#7a6a9a] hover:border-[#6a5a8a] transition-all active:scale-[0.98]"
              >
                <BookOpen className="w-6 h-6 mr-3" />
                Log a Book
              </Button>
              <Button
                onClick={() => setShowTimer(true)}
                className="game-panel h-20 bg-[#A8C5A0] hover:bg-[#98B590] text-white rounded-2xl text-lg font-game font-semibold border-2 border-[#8ab08a] hover:border-[#7aa07a] transition-all active:scale-[0.98]"
              >
                <Clock className="w-6 h-6 mr-3" />
                Start Reading Session
              </Button>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="game-panel p-6 rounded-2xl">
                <h3 className="font-game text-lg font-bold text-[#2C2C2E] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recommended for Balance
                </h3>
                <p className="text-[#6C6C70] mb-3 text-sm">
                  Try these genres to develop your weaker attributes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.map((genre) => (
                    <div
                      key={genre}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-[#E8B86D] text-white"
                    >
                      {genre}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-game text-3xl font-bold text-[#2C2C2E] tracking-wide">
                Your Reading Library
              </h2>
              <Button
                onClick={() => setShowAddBook(true)}
                className="game-panel bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white rounded-xl font-game font-semibold border-2 border-[#7a6a9a]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </div>

            {data.books.length > 0 ? (
              <div className="space-y-4">
                {data.books.map((book) => (
                  <BookLogCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="game-panel p-12 rounded-2xl text-center">
                <Library className="w-16 h-16 mx-auto mb-4 text-[#6C6C70]" />
                <h3 className="font-game text-xl font-bold text-[#2C2C2E] mb-2">No books yet</h3>
                <p className="text-[#6C6C70] mb-6">Start logging your reading journey!</p>
                <Button
                  onClick={() => setShowAddBook(true)}
                  className="game-panel bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white font-game font-semibold border-2 border-[#7a6a9a]"
                >
                  Add Your First Book
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <h2 className="font-game text-3xl font-bold text-[#2C2C2E] mb-6 tracking-wide">
              Reading Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="game-panel p-6 rounded-2xl">
                <BookOpen className="w-8 h-8 text-[#9B7EBD] mb-3" />
                <div className="font-game text-4xl font-bold text-[#2C2C2E] mb-1 font-mono">
                  {data.character.totalBooksRead}
                </div>
                <div className="text-sm text-[#6C6C70] font-medium">Books Read</div>
              </div>

              <div className="game-panel p-6 rounded-2xl">
                <Clock className="w-8 h-8 text-[#A8C5A0] mb-3" />
                <div className="font-game text-4xl font-bold text-[#2C2C2E] mb-1 font-mono">
                  {totalReadingHours}h {totalReadingMinutes}m
                </div>
                <div className="text-sm text-[#6C6C70] font-medium">Reading Time</div>
              </div>

              <div className="game-panel p-6 rounded-2xl">
                <Sparkles className="w-8 h-8 text-[#E8B86D] mb-3" />
                <div className="font-game text-4xl font-bold text-[#2C2C2E] mb-1 font-mono">
                  {data.character.currentLevel}
                </div>
                <div className="text-sm text-[#6C6C70] font-medium">Character Level</div>
              </div>
            </div>

            {/* Attribute breakdown */}
            <div className="game-panel p-6 rounded-2xl">
              <h3 className="font-game text-lg font-bold text-[#2C2C2E] mb-4">Attribute Levels</h3>
              <div className="space-y-4">
                {Object.values(data.character.attributes).map((attr) => (
                  <div key={attr.name}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize font-medium text-[#2C2C2E] flex items-center gap-2">
                        <span>{attr.icon}</span>
                        {attr.name}
                      </span>
                      <span className="text-sm font-mono text-[#6C6C70]">
                        Level {attr.level} - {attr.value}/{attr.maxValue}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(attr.value / attr.maxValue) * 100}%`,
                          backgroundColor: attr.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddBookDialog
        open={showAddBook}
        onClose={() => setShowAddBook(false)}
        onAdd={handleAddBook}
      />

      <ReadingTimerDialog
        open={showTimer}
        onClose={() => setShowTimer(false)}
        onComplete={handleCompleteSession}
      />

      {selectedAttribute && (
        <AttributeDetailDialog
          open={!!selectedAttribute}
          onClose={() => setSelectedAttribute(null)}
          attribute={selectedAttribute}
          character={data.character}
          books={data.books}
        />
      )}
    </div>
  );
}
