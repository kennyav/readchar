import { useState } from 'react';
import { AttributeType, Genre } from '@/types/reading';
import { AttributeConstellation } from '@/components/character/AttributeConstellation';
import { AddBookDialog } from '@/components/reading/AddBookDialog';
import { ReadingTimerDialog } from '@/components/reading/ReadingTimerDialog';
import { BookLogCard } from '@/components/reading/BookLogCard';
import { AttributeDetailDialog } from '@/components/character/AttributeDetailDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Library, LogOut, Sparkles, TrendingUp } from 'lucide-react';
import { useAuthOptional } from '@/contexts/AuthContext';
import { isAuthEnabled } from '@/lib/supabase';
import { getRecommendations } from '@/lib/character-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarIdentity } from '@/hooks/use-avatar-identity';
import { ReadingAvatar } from '@/components/character/ReadingAvatar';
import { GenreLegend } from '@/components/character/GenreLegend';
import { useAppData } from '@/hooks/use-app-data';

export default function ReadSelfApp() {
  const auth = useAuthOptional();
  const { data, syncing, addBook, removeBook, completeSession } = useAppData();

  const [showAddBook, setShowAddBook] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);

  const { seed, books } = useAvatarIdentity(data);
  const isEmpty = books.length === 0;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-game text-2xl text-[#6C6C70] font-semibold">Loading...</div>
      </div>
    );
  }

  const handleAddBook = async (bookData: { title: string; author: string; genre: Genre; coverId: number | null }) => {
    const leveledUp = await addBook(bookData);
    if (leveledUp) {
      setShowEvolution(true);
      setTimeout(() => setShowEvolution(false), 3000);
    }
  };

  const recommendations = getRecommendations(data.character);
  const totalReadingHours = Math.floor(data.character.totalReadingTime / 3600);
  const totalReadingMinutes = Math.floor((data.character.totalReadingTime % 3600) / 60);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2C2C2E]/10">
        <div className="text-xs text-[#6C6C70] font-game">
          {syncing && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#9B7EBD] animate-pulse" />
              Syncing...
            </span>
          )}
        </div>
        {isAuthEnabled && auth?.user && (
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 text-sm text-[#6C6C70] hover:text-[#2C2C2E] font-game ml-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        )}
      </div>

      {/* Level up notification */}
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
            <TabsTrigger value="character" className="rounded-xl font-game font-semibold data-[state=active]:bg-[#9B7EBD] data-[state=active]:text-white data-[state=active]:shadow-md">
              Character
            </TabsTrigger>
            <TabsTrigger value="library" className="rounded-xl font-game font-semibold data-[state=active]:bg-[#9B7EBD] data-[state=active]:text-white data-[state=active]:shadow-md">
              Library
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl font-game font-semibold data-[state=active]:bg-[#9B7EBD] data-[state=active]:text-white data-[state=active]:shadow-md">
              Stats
            </TabsTrigger>
          </TabsList>

          {/* ── Character Tab ── */}
          <TabsContent value="character" className="space-y-8">
            <section className="mb-10 flex flex-col items-center">
              <ReadingAvatar seed={seed} books={books} size={260} />
              <div className="mt-6 text-center">
                <h1 className="text-balance text-3xl font-bold text-[#2C2C2E]" style={{ fontFamily: 'serif' }}>
                  Your Reading Avatar
                </h1>
                {isEmpty ? (
                  <p className="mx-auto mt-2 max-w-xs text-sm text-[#6B6B6E]">
                    Add your first book to bring your character to life. Each genre grants new gear and abilities.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-[#6B6B6E]">
                    Level {Math.min(Math.max(Math.floor(Math.log2(books.length + 1) * 3.5), 1), 20)}{'  '}
                    {books.length} book{books.length === 1 ? '' : 's'} collected
                  </p>
                )}
              </div>
              {!isEmpty && (
                <div className="mt-4">
                  <GenreLegend books={books} />
                </div>
              )}
            </section>

            <div className="game-panel p-8 rounded-2xl flex flex-col min-h-[400px]">
              <AttributeConstellation character={data.character} onAttributeClick={setSelectedAttribute} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setShowAddBook(true)}
                className="game-panel h-20 bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white rounded-2xl text-lg font-game font-semibold border-2 border-[#7a6a9a] transition-all active:scale-[0.98]"
              >
                <BookOpen className="w-6 h-6 mr-3" />
                Log a Book
              </Button>
              <Button
                onClick={() => setShowTimer(true)}
                className="game-panel h-20 bg-[#A8C5A0] hover:bg-[#98B590] text-white rounded-2xl text-lg font-game font-semibold border-2 border-[#8ab08a] transition-all active:scale-[0.98]"
              >
                <Clock className="w-6 h-6 mr-3" />
                Start Reading Session
              </Button>
            </div>

            {recommendations.length > 0 && (
              <div className="game-panel p-6 rounded-2xl">
                <h3 className="font-game text-lg font-bold text-[#2C2C2E] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recommended for Balance
                </h3>
                <p className="text-[#6C6C70] mb-3 text-sm">Try these genres to develop your weaker attributes:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.map((genre) => (
                    <div key={genre} className="px-4 py-2 rounded-full text-sm font-medium bg-[#E8B86D] text-white">
                      {genre}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Library Tab ── */}
          <TabsContent value="library" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-game text-3xl font-bold text-[#2C2C2E] tracking-wide">Your Reading Library</h2>
              <Button onClick={() => setShowAddBook(true)} className="game-panel bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white rounded-xl font-game font-semibold border-2 border-[#7a6a9a]">
                <BookOpen className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </div>

            {data.books.length > 0 ? (
              <div className="space-y-4">
                {data.books.map((book) => (
                  <BookLogCard key={book.id} book={book} onDelete={removeBook} />
                ))}
              </div>
            ) : (
              <div className="game-panel p-12 rounded-2xl text-center">
                <Library className="w-16 h-16 mx-auto mb-4 text-[#6C6C70]" />
                <h3 className="font-game text-xl font-bold text-[#2C2C2E] mb-2">No books yet</h3>
                <p className="text-[#6C6C70] mb-6">Start logging your reading journey!</p>
                <Button onClick={() => setShowAddBook(true)} className="game-panel bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white font-game font-semibold border-2 border-[#7a6a9a]">
                  Add Your First Book
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── Stats Tab ── */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="font-game text-3xl font-bold text-[#2C2C2E] mb-6 tracking-wide">Reading Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="game-panel p-6 rounded-2xl">
                <BookOpen className="w-8 h-8 text-[#9B7EBD] mb-3" />
                <div className="font-game text-4xl font-bold text-[#2C2C2E] mb-1 font-mono">{data.character.totalBooksRead}</div>
                <div className="text-sm text-[#6C6C70] font-medium">Books Read</div>
              </div>
              <div className="game-panel p-6 rounded-2xl">
                <Clock className="w-8 h-8 text-[#A8C5A0] mb-3" />
                <div className="font-game text-4xl font-bold text-[#2C2C2E] mb-1 font-mono">{totalReadingHours}h {totalReadingMinutes}m</div>
                <div className="text-sm text-[#6C6C70] font-medium">Reading Time</div>
              </div>
              <div className="game-panel p-6 rounded-2xl">
                <Sparkles className="w-8 h-8 text-[#E8B86D] mb-3" />
                <div className="font-game text-4xl font-bold text-[#2C2C2E] mb-1 font-mono">{data.character.currentLevel}</div>
                <div className="text-sm text-[#6C6C70] font-medium">Character Level</div>
              </div>
            </div>

            <div className="game-panel p-6 rounded-2xl">
              <h3 className="font-game text-lg font-bold text-[#2C2C2E] mb-4">Attribute Levels</h3>
              <div className="space-y-4">
                {Object.values(data.character.attributes).map((attr) => (
                  <div key={attr.name}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize font-medium text-[#2C2C2E] flex items-center gap-2">
                        <span>{attr.icon}</span>{attr.name}
                      </span>
                      <span className="text-sm font-mono text-[#6C6C70]">Level {attr.level} — {attr.value}/{attr.maxValue}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(attr.value / attr.maxValue) * 100}%`, backgroundColor: attr.color }}
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
      <AddBookDialog open={showAddBook} onClose={() => setShowAddBook(false)} onAdd={handleAddBook} />
      <ReadingTimerDialog open={showTimer} onClose={() => setShowTimer(false)} onComplete={completeSession} />
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