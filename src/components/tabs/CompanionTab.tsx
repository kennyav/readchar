import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PetAvatar } from '@/components/pet/PetAvatar';
import { GenreLegend } from '@/components/character/GenreLegend';
import { TrendingUp, Pencil } from 'lucide-react';
import { Genre } from '@/types/reading';
import type { Book, Pet } from '@/types/reading';

interface CompanionTabProps {
  recommendations: Genre[];
  pet: Pet | null;
  books: Book[];
  isEmpty: boolean;
  level: number;
  isActive: boolean;
  onUpdatePetName?: (name: string) => void;
}

export default function CompanionTab({
  recommendations,
  pet,
  books,
  isEmpty,
  level,
  isActive,
  onUpdatePetName,
}: CompanionTabProps) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(pet?.name ?? '');

  const handleSaveName = () => {
    const trimmed = draftName.trim();
    if (trimmed && onUpdatePetName) {
      onUpdatePetName(trimmed);
    }
    setEditingName(false);
  };

  return (
    <motion.div
      key={isActive ? 'active' : 'inactive'}
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-6"
    >
      <section className="text-center py-6">
        <div className="inline-flex flex-col items-center">
          <div className="rounded-2xl p-6 reading-card inline-block">
            {pet ? (
              <PetAvatar pet={pet} size={240} />
            ) : (
              <div
                className="flex items-center justify-center rounded-2xl bg-[hsl(var(--reading-surface-soft))] border border-dashed border-[hsl(var(--reading-border))] text-[hsl(var(--reading-ink-muted))]"
                style={{ width: 240, height: 240 }}
              >
                <p className="text-sm max-w-[180px] text-center">
                  Your pet will appear when you start reading.
                </p>
              </div>
            )}
          </div>
          <h1 className="font-reading-heading text-2xl text-[hsl(var(--reading-ink))] mt-8">
            {pet ? pet.name : 'Your companion'}
          </h1>
          {pet && onUpdatePetName && (
            <div className="mt-1 flex items-center justify-center gap-2">
              {editingName ? (
                <>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="text-center text-lg font-reading-heading bg-transparent border-b border-[hsl(var(--reading-border))] text-[hsl(var(--reading-ink))] outline-none w-32"
                    autoFocus
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(pet.name);
                    setEditingName(true);
                  }}
                  className="text-[hsl(var(--reading-ink-muted))] hover:text-[hsl(var(--reading-ink))] p-1 rounded"
                  aria-label="Rename pet"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {isEmpty ? (
            <p className="mt-2 max-w-sm mx-auto text-[hsl(var(--reading-ink-muted))] text-base leading-relaxed">
              They grow when you read. Log a book or start a session to help them evolve.
            </p>
          ) : (
            <p className="mt-2 text-[hsl(var(--reading-ink-muted))] text-sm capitalize">
              {pet?.stage ?? 'egg'} · Level {level} · {books.length} book{books.length === 1 ? '' : 's'}
            </p>
          )}
          {!isEmpty && (
            <div className="mt-4">
              <GenreLegend books={books} />
            </div>
          )}
        </div>
      </section>

      {recommendations.length > 0 && (
        <div className="reading-card-soft p-5 rounded-xl">
          <h3 className="text-sm font-semibold text-[hsl(var(--reading-ink))] mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--reading-accent))]" />
            Try these for balance
          </h3>
          <p className="text-[hsl(var(--reading-ink-muted))] text-sm mb-3">
            These genres can strengthen your companion&apos;s weaker traits.
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-[hsl(var(--reading-accent-soft))] text-[hsl(var(--reading-ink))]"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
