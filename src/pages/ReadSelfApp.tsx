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
import { BookOpen, Clock, Library, Sparkles, TrendingUp } from 'lucide-react';
import {
  initializeCharacter,
  applyBookToCharacter,
  applyReadingSession,
  getRecommendations,
  generateJournalEntry,
} from '@/lib/character-engine';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'readself_data';

interface AppData {
  character: CharacterState;
  books: Book[];
  onboarded: boolean;
}

export default function ReadSelfApp() {
  const [data, setData] = useState<AppData | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);

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
      <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center">
        <div className="text-2xl text-[#6C6C70]">Loading...</div>
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

  const handleAddBook = (bookData: { title: string; author: string; genre: Genre }) => {
    const newBook: Book = {
      id: Date.now().toString(),
      title: bookData.title,
      author: bookData.author,
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
    <div className="min-h-screen bg-[#F9F6F1]">
      {/* Evolution notification */}
      <AnimatePresence>
        {showEvolution && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Card
              className="px-6 py-4 bg-[#9B7EBD] text-white font-bold flex items-center gap-3"
              style={{
                boxShadow: '0 8px 24px rgba(155, 126, 189, 0.4)',
              }}
            >
              <Sparkles className="w-6 h-6" />
              Your character has evolved!
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="character" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white rounded-full p-1">
            <TabsTrigger value="character" className="rounded-full">
              Character
            </TabsTrigger>
            <TabsTrigger value="library" className="rounded-full">
              Library
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-full">
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="space-y-8">
            {/* Character display section */}
            <div
              className="p-8 rounded-3xl"
              style={{
                background: 'white',
                boxShadow: '-8px -8px 16px rgba(255, 255, 255, 0.8), 8px 8px 16px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex flex-col items-center">
                <CharacterAvatar character={data.character} className="mb-6" />
                <h2 className="text-2xl font-bold text-[#2C2C2E] mb-2" style={{ fontFamily: 'serif' }}>
                  Your Reading Companion
                </h2>
                <p className="text-[#6C6C70]">Level {data.character.currentLevel}</p>
              </div>
            </div>

            {/* Attribute constellation */}
            <div
              className="p-8 rounded-3xl"
              style={{
                background: 'white',
                boxShadow: '-8px -8px 16px rgba(255, 255, 255, 0.8), 8px 8px 16px rgba(0, 0, 0, 0.1)',
                minHeight: '400px',
              }}
            >
              <AttributeConstellation
                character={data.character}
                onAttributeClick={setSelectedAttribute}
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setShowAddBook(true)}
                className="h-20 bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white rounded-2xl text-lg"
                style={{
                  boxShadow: '0 4px 12px rgba(155, 126, 189, 0.3)',
                }}
              >
                <BookOpen className="w-6 h-6 mr-3" />
                Log a Book
              </Button>
              <Button
                onClick={() => setShowTimer(true)}
                className="h-20 bg-[#A8C5A0] hover:bg-[#98B590] text-white rounded-2xl text-lg"
                style={{
                  boxShadow: '0 4px 12px rgba(168, 197, 160, 0.3)',
                }}
              >
                <Clock className="w-6 h-6 mr-3" />
                Start Reading Session
              </Button>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'white',
                  boxShadow: '-4px -4px 8px rgba(255, 255, 255, 0.8), 4px 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h3 className="text-lg font-bold text-[#2C2C2E] mb-3 flex items-center gap-2">
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
              <h2 className="text-3xl font-bold text-[#2C2C2E]" style={{ fontFamily: 'serif' }}>
                Your Reading Library
              </h2>
              <Button
                onClick={() => setShowAddBook(true)}
                className="bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white rounded-full"
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
              <div
                className="p-12 rounded-2xl text-center"
                style={{
                  background: 'white',
                  boxShadow: '-8px -8px 16px rgba(255, 255, 255, 0.8), 8px 8px 16px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Library className="w-16 h-16 mx-auto mb-4 text-[#6C6C70]" />
                <h3 className="text-xl font-bold text-[#2C2C2E] mb-2">No books yet</h3>
                <p className="text-[#6C6C70] mb-6">Start logging your reading journey!</p>
                <Button
                  onClick={() => setShowAddBook(true)}
                  className="bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white"
                >
                  Add Your First Book
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-3xl font-bold text-[#2C2C2E] mb-6" style={{ fontFamily: 'serif' }}>
              Reading Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="p-6"
                style={{
                  background: 'white',
                  boxShadow: '-6px -6px 12px rgba(255, 255, 255, 0.8), 6px 6px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <BookOpen className="w-8 h-8 text-[#9B7EBD] mb-3" />
                <div className="text-4xl font-bold text-[#2C2C2E] mb-1">
                  {data.character.totalBooksRead}
                </div>
                <div className="text-sm text-[#6C6C70]">Books Read</div>
              </Card>

              <Card
                className="p-6"
                style={{
                  background: 'white',
                  boxShadow: '-6px -6px 12px rgba(255, 255, 255, 0.8), 6px 6px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Clock className="w-8 h-8 text-[#A8C5A0] mb-3" />
                <div className="text-4xl font-bold text-[#2C2C2E] mb-1">
                  {totalReadingHours}h {totalReadingMinutes}m
                </div>
                <div className="text-sm text-[#6C6C70]">Reading Time</div>
              </Card>

              <Card
                className="p-6"
                style={{
                  background: 'white',
                  boxShadow: '-6px -6px 12px rgba(255, 255, 255, 0.8), 6px 6px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Sparkles className="w-8 h-8 text-[#E8B86D] mb-3" />
                <div className="text-4xl font-bold text-[#2C2C2E] mb-1">
                  {data.character.currentLevel}
                </div>
                <div className="text-sm text-[#6C6C70]">Character Level</div>
              </Card>
            </div>

            {/* Attribute breakdown */}
            <div
              className="p-6 rounded-2xl"
              style={{
                background: 'white',
                boxShadow: '-6px -6px 12px rgba(255, 255, 255, 0.8), 6px 6px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h3 className="text-lg font-bold text-[#2C2C2E] mb-4">Attribute Levels</h3>
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
