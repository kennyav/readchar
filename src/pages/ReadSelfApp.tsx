import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Genre } from '@/types/reading';
import type { PetStage } from '@/types/reading';
import { AddBookDialog } from '@/components/reading/AddBookDialog';
import { ReadingTimerDialog } from '@/components/reading/ReadingTimerDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock,LogOut, Sparkles } from 'lucide-react';
import { useAuthOptional } from '@/contexts/AuthContext';
import { isAuthEnabled } from '@/lib/supabase';
import { getRecommendations } from '@/lib/character-engine';
import { createInitialPet } from '@/lib/pet-engine';
import { generateSeed } from '@/lib/avatar-seed';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/hooks/use-app-data';
import CompanionTab from '@/components/tabs/CompanionTab'
import LibraryTab from '@/components/tabs/LibraryTab';
import StatsTab from '@/components/tabs/StatsTab';

const DEV_PET_STAGES: PetStage[] = ['egg', 'hatchling', 'adult'];
const DEV_ACCESSORIES = ['hat', 'glasses'] as const;

export default function ReadSelfApp() {
  const auth = useAuthOptional();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const totalReadingSeconds = Math.floor(data.character.totalReadingTime % 60);
  const level = data.character.currentLevel;

  // Dev only: ?seed=..., ?petStage=..., ?bodyType=..., ?mouthStyle=..., ?accessory=... override displayed pet for testing
  const displayPet = useMemo(() => {
    const petStageParam = searchParams.get('petStage');
    const stageOverride = petStageParam && DEV_PET_STAGES.includes(petStageParam as PetStage) ? (petStageParam as PetStage) : null;
    const bodyTypeParam = searchParams.get('bodyType');
    const mouthStyleParam = searchParams.get('mouthStyle');
    const accessoryParam = searchParams.get('accessory');
    const bodyTypeOverride = bodyTypeParam === '0' || bodyTypeParam === '1' || bodyTypeParam === '2' ? Number(bodyTypeParam) : null;
    const mouthStyleOverride = mouthStyleParam === '0' || mouthStyleParam === '1' || mouthStyleParam === '2' ? Number(mouthStyleParam) : null;
    const accessoryOverride = accessoryParam === 'none' ? null : DEV_ACCESSORIES.includes(accessoryParam as any) ? (accessoryParam as 'hat' | 'glasses') : undefined;

    let pet: typeof data.pet = null;

    if (import.meta.env.DEV) {
      const seedOverride = searchParams.get('seed')?.trim();
      if (seedOverride) {
        pet = createInitialPet(seedOverride, data.character, data.books);
      }
      if (!pet && (bodyTypeOverride !== null || mouthStyleOverride !== null || accessoryOverride !== undefined)) {
        pet = createInitialPet('dev-preview', data.character, data.books);
      }
    }

    if (!pet) pet = data.pet;
    if (!pet) return null;

    if (!import.meta.env.DEV) return pet;

    let out = pet;
    if (stageOverride) out = { ...out, stage: stageOverride };
    if (bodyTypeOverride !== null) out = { ...out, traits: { ...out.traits, bodyType: bodyTypeOverride } };
    if (mouthStyleOverride !== null) out = { ...out, traits: { ...out.traits, mouthStyle: mouthStyleOverride } };
    if (accessoryOverride !== undefined) out = { ...out, traits: { ...out.traits, accessory: accessoryOverride } };
    return out;
  }, [data.pet, data.character, data.books, searchParams]);

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
            {import.meta.env.DEV && data && (
              <div className="mb-4 space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Dev: preview stage</span>
                  {DEV_PET_STAGES.map((stage) => {
                    const isActive = searchParams.get('petStage') === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            const next = new URLSearchParams(searchParams);
                            next.delete('petStage');
                            setSearchParams(next, { replace: true });
                          } else {
                            const next = new URLSearchParams(searchParams);
                            next.set('petStage', stage);
                            setSearchParams(next, { replace: true });
                          }
                        }}
                        className={`rounded px-2 py-1 font-medium capitalize ${isActive ? 'bg-amber-500/30 text-amber-800 dark:text-amber-200' : 'text-amber-700/80 dark:text-amber-400/80 hover:bg-amber-500/20'}`}
                      >
                        {stage}
                      </button>
                    );
                  })}
                  {searchParams.get('petStage') && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('petStage');
                        setSearchParams(next, { replace: true });
                      }}
                      className="ml-1 rounded px-2 py-1 text-amber-700/70 dark:text-amber-400/70 hover:bg-amber-500/20"
                    >
                      Clear stage
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Override seed</span>
                  <input
                    type="text"
                    value={searchParams.get('seed') ?? ''}
                    onChange={(e) => {
                      const next = new URLSearchParams(searchParams);
                      const v = e.target.value.trim();
                      if (v) next.set('seed', v);
                      else next.delete('seed');
                      setSearchParams(next, { replace: true });
                    }}
                    placeholder="e.g. a1b2c3d4..."
                    className="rounded border border-amber-500/30 bg-white/80 px-2 py-1 font-mono text-xs w-40 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100 placeholder:text-amber-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('seed', generateSeed());
                      setSearchParams(next, { replace: true });
                    }}
                    className="rounded px-2 py-1 font-medium text-amber-700/90 dark:text-amber-400/90 hover:bg-amber-500/20"
                  >
                    Randomize
                  </button>
                  {searchParams.get('seed') && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('seed');
                        setSearchParams(next, { replace: true });
                      }}
                      className="rounded px-2 py-1 text-amber-700/70 dark:text-amber-400/70 hover:bg-amber-500/20"
                    >
                      Clear seed
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Evolution line</span>
                  {(['Charmander', 'Squirtle', 'Bulbasaur'] as const).map((label, i) => {
                    const val = String(i);
                    const isActive = searchParams.get('bodyType') === val;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const next = new URLSearchParams(searchParams);
                          if (isActive) next.delete('bodyType');
                          else next.set('bodyType', val);
                          setSearchParams(next, { replace: true });
                        }}
                        className={`rounded px-2 py-1 font-medium capitalize ${isActive ? 'bg-amber-500/30 text-amber-800 dark:text-amber-200' : 'text-amber-700/80 dark:text-amber-400/80 hover:bg-amber-500/20'}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Mouth</span>
                  {(['Smile', 'Open', 'Tooth'] as const).map((label, i) => {
                    const val = String(i);
                    const isActive = searchParams.get('mouthStyle') === val;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const next = new URLSearchParams(searchParams);
                          if (isActive) next.delete('mouthStyle');
                          else next.set('mouthStyle', val);
                          setSearchParams(next, { replace: true });
                        }}
                        className={`rounded px-2 py-1 font-medium ${isActive ? 'bg-amber-500/30 text-amber-800 dark:text-amber-200' : 'text-amber-700/80 dark:text-amber-400/80 hover:bg-amber-500/20'}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Accessory (adult)</span>
                  {DEV_ACCESSORIES.map((acc) => {
                    const isActive = searchParams.get('accessory') === acc;
                    return (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => {
                          const next = new URLSearchParams(searchParams);
                          if (isActive) next.delete('accessory');
                          else next.set('accessory', acc);
                          setSearchParams(next, { replace: true });
                        }}
                        className={`rounded px-2 py-1 font-medium capitalize ${isActive ? 'bg-amber-500/30 text-amber-800 dark:text-amber-200' : 'text-amber-700/80 dark:text-amber-400/80 hover:bg-amber-500/20'}`}
                      >
                        {acc}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      if (searchParams.get('accessory') === 'none') next.delete('accessory');
                      else next.set('accessory', 'none');
                      setSearchParams(next, { replace: true });
                    }}
                    className={`rounded px-2 py-1 font-medium ${searchParams.get('accessory') === 'none' ? 'bg-amber-500/30 text-amber-800 dark:text-amber-200' : 'text-amber-700/80 dark:text-amber-400/80 hover:bg-amber-500/20'}`}
                  >
                    None
                  </button>
                </div>
              </div>
            )}
            <CompanionTab
              recommendations={recommendations}
              pet={displayPet}
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
            <StatsTab data={data} totalReadingHours={totalReadingHours} totalReadingMinutes={totalReadingMinutes} totalReadingSeconds={totalReadingSeconds} isActive={tabValue === 'stats'} />
          </TabsContent>
        </Tabs>
      </main>

      <AddBookDialog open={showAddBook} onClose={() => setShowAddBook(false)} onAdd={handleAddBook} />
      <ReadingTimerDialog open={showTimer} onClose={() => setShowTimer(false)} onComplete={completeSession} />
    </div>
  );
}
