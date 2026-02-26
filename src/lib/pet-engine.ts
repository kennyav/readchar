/**
 * Pet system: traits and evolution derived from seed + books + character.
 * One pet per user, stored in Supabase; this module is pure computation.
 */

import { seedValue } from './avatar-seed';
import type { Book, CharacterState, Genre, Pet, PetStage, PetTraits } from '@/types/reading';
import { GENRE_VISUALS } from './avatar-traits';

// ── Stage thresholds (by character level) ──

const STAGE_LEVELS: { stage: PetStage; minLevel: number }[] = [
  { stage: 'egg', minLevel: 1 },
  { stage: 'hatchling', minLevel: 4 },
  { stage: 'adult', minLevel: 8 },
];

export function getPetStage(character: CharacterState): PetStage {
  const level = character.currentLevel;
  let result: PetStage = 'egg';
  for (const { stage, minLevel } of STAGE_LEVELS) {
    if (level >= minLevel) result = stage;
  }
  return result;
}

// ── Color palettes for pet ──

const PET_PRIMARY_COLORS = [
  '#9B7EBD', '#A8D8EA', '#D8A7B1', '#E8B86D', '#A8C5A0',
  '#F4A6D7', '#C9A9E0', '#7BA3B8', '#8BC5A7', '#B8A9D4',
];

const PET_SECONDARY_COLORS = [
  '#F5EADB', '#E8F4F8', '#FCE8EC', '#FDF3E0', '#E8F0E8',
  '#FDE8F4', '#EDE0F4', '#E0EEF2', '#E0F0E4', '#EDE8F4',
];

// ── Compute traits from seed + books + character ──

function getDominantGenre(books: Book[]): Genre | null {
  if (books.length === 0) return null;
  const counts = new Map<Genre, number>();
  for (const b of books) counts.set(b.genre, (counts.get(b.genre) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}

export function computePetTraits(seed: string, books: Book[], character: CharacterState): PetTraits {
  const dominantGenre = getDominantGenre(books);
  const genreColor = dominantGenre ? GENRE_VISUALS[dominantGenre].color : PET_PRIMARY_COLORS[0];

  const primaryIndex = Math.floor(seedValue(seed, 'pet_primary') * PET_PRIMARY_COLORS.length);
  const secondaryIndex = Math.floor(seedValue(seed, 'pet_secondary') * PET_SECONDARY_COLORS.length);
  // Blend with genre so reading taste influences color
  const primaryColor = books.length > 0 ? genreColor : PET_PRIMARY_COLORS[primaryIndex];
  const secondaryColor = PET_SECONDARY_COLORS[secondaryIndex];

  const bodyType = Math.floor(seedValue(seed, 'pet_body') * 3);
  const markingStyle = Math.floor(seedValue(seed, 'pet_markings') * 3);
  const eyeStyle = Math.floor(seedValue(seed, 'pet_eyes') * 3);

  let accessory: string | null = null;
  if (dominantGenre && books.length >= 2) {
    const slot = GENRE_VISUALS[dominantGenre].slot;
    if (slot === 'hat') accessory = 'hat';
    else if (slot === 'cloak') accessory = 'scarf';
    else if (dominantGenre === 'Philosophy') accessory = 'glasses';
  }

  return {
    bodyType,
    primaryColor,
    secondaryColor,
    markingStyle,
    eyeStyle,
    accessory,
  };
}

// ── Create / evolve pet ──

export function createInitialPet(seed: string, character: CharacterState, books: Book[], id?: string): Pet {
  const stage = getPetStage(character);
  const traits = computePetTraits(seed, books, character);
  const now = new Date();
  const defaultName = getDefaultPetName(seed);
  return {
    id: id ?? crypto.randomUUID(),
    seed,
    name: defaultName,
    stage,
    traits,
    createdAt: now,
    lastEvolvedAt: now,
  };
}

function getDefaultPetName(seed: string): string {
  const names = ['Spark', 'Ember', 'Page', 'Ink', 'Tome', 'Nimbus', 'Whisper', 'Glint', 'Rune', 'Fable'];
  const i = Math.floor(seedValue(seed, 'pet_name') * names.length);
  return names[i] ?? 'Companion';
}

/**
 * Returns an updated pet if stage or traits should change; otherwise returns the same pet.
 */
export function evolvePetIfNeeded(
  pet: Pet,
  character: CharacterState,
  books: Book[]
): { pet: Pet; didEvolve: boolean } {
  const newStage = getPetStage(character);
  const newTraits = computePetTraits(pet.seed, books, character);
  const stageChanged = newStage !== pet.stage;
  const traitsChanged =
    JSON.stringify(newTraits) !== JSON.stringify(pet.traits);
  if (!stageChanged && !traitsChanged) return { pet, didEvolve: false };
  return {
    pet: {
      ...pet,
      stage: newStage,
      traits: newTraits,
      lastEvolvedAt: new Date(),
    },
    didEvolve: true,
  };
}
