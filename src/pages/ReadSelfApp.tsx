import { useState } from 'react';
import { Genre } from '@/types/reading';
import { AddBookDialog } from '@/components/reading/AddBookDialog';
import { ReadingTimerDialog } from '@/components/reading/ReadingTimerDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock,LogOut, Sparkles } from 'lucide-react';
import { useAuthOptional } from '@/contexts/AuthContext';
import { isAuthEnabled } from '@/lib/supabase';
import { getRecommendations } from '@/lib/character-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/hooks/use-app-data';
import CompanionTab from '@/components/tabs/CompanionTab'
import LibraryTab from '@/components/tabs/LibraryTab';
import StatsTab from '@/components/tabs/StatsTab';

export default function ReadSelfApp() {
  const auth = useAuthOptional();
  const { data, syncing, addBook, removeBook, completeSession, updatePetName } = useAppData();

  const [showAddBook, setShowAddBook] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [tabValue, setTabValue] = useState('character');

  const books = data.books;
  const isEmpty = books.length === 0;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--reading-bg))]">
        <p className="font-reading-heading text-xl text-[hsl(var(--reading-ink-muted))]">Loading...</p>
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
  const level = data.character.currentLevel;

  return (
    <div className="min-h-screen bg-[hsl(var(--reading-bg))]">
      {/* Header: minimal */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--reading-border))] bg-[hsl(var(--reading-surface))]">
        <div className="text-sm text-[hsl(var(--reading-ink-muted))] font-game">
          {syncing && (
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--reading-accent))] animate-pulse" />
              Syncing...
            </span>
          )}
        </div>
        {isAuthEnabled && auth?.user && (
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 text-sm text-[hsl(var(--reading-ink-muted))] hover:text-[hsl(var(--reading-ink))] font-game transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        )}
      </header>

      {/* Level up toast */}
      <AnimatePresence>
        {showEvolution && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="reading-card px-5 py-3 flex items-center gap-3 bg-[hsl(var(--reading-accent-soft))] border-[hsl(var(--reading-accent))]/20 text-[hsl(var(--reading-ink))]">
              <Sparkles className="w-6 h-6 text-[hsl(var(--reading-accent))]" />
              <span className="font-reading-heading font-semibold">Your pet grew a little.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full px-4 py-6">
        {/* Primary actions: one main CTA, one secondary (datafa.st-style) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setShowAddBook(true)}
            className="h-12 reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white rounded-lg text-sm font-medium border-0 shadow-sm transition-all active:scale-[0.99]"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Log a book
          </Button>
          <Button
            onClick={() => setShowTimer(true)}
            className="h-12 reading-card bg-[hsl(var(--reading-surface))] hover:bg-[hsl(var(--reading-surface-soft))] text-[hsl(var(--reading-ink))] rounded-lg text-sm font-medium border border-[hsl(var(--reading-border))] shadow-sm transition-all active:scale-[0.99]"
          >
            <Clock className="w-4 h-4 mr-2" />
            Start reading session
          </Button>
        </section>

        {/* Tabs: Companion (with hero), Library, Stats */}
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="reading-card-soft grid h-12 w-full grid-cols-3 p-1.5 mb-6 rounded-xl border border-[hsl(var(--reading-border))] bg-[hsl(var(--reading-surface-soft))]">
            <TabsTrigger
              value="character"
              className="flex h-full w-full items-center justify-center rounded-lg font-game font-medium data-[state=active]:bg-[hsl(var(--reading-accent-soft))] data-[state=active]:text-[hsl(var(--reading-ink))] data-[state=active]:shadow-sm"
            >
              Companion
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex h-full w-full items-center justify-center rounded-lg font-game font-medium data-[state=active]:bg-[hsl(var(--reading-accent-soft))] data-[state=active]:text-[hsl(var(--reading-ink))] data-[state=active]:shadow-sm"
            >
              Library
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex h-full w-full items-center justify-center rounded-lg font-game font-medium data-[state=active]:bg-[hsl(var(--reading-accent-soft))] data-[state=active]:text-[hsl(var(--reading-ink))] data-[state=active]:shadow-sm"
            >
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="mt-0">
            <CompanionTab
              recommendations={recommendations}
              pet={data.pet}
              books={books}
              isEmpty={isEmpty}
              level={level}
              isActive={tabValue === 'character'}
              onUpdatePetName={updatePetName}
            />
          </TabsContent>

          <TabsContent value="library" className="mt-0">
            <LibraryTab data={data} setShowAddBook={setShowAddBook} removeBook={removeBook} isActive={tabValue === 'library'} />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <StatsTab data={data} totalReadingHours={totalReadingHours} totalReadingMinutes={totalReadingMinutes} isActive={tabValue === 'stats'} />
          </TabsContent>
        </Tabs>
      </main>

      <AddBookDialog open={showAddBook} onClose={() => setShowAddBook(false)} onAdd={handleAddBook} />
      <ReadingTimerDialog open={showTimer} onClose={() => setShowTimer(false)} onComplete={completeSession} />
    </div>
  );
}
