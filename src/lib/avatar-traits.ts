/**
 * Character avatar trait system.
 * Maps genres to equipment/accessories and computes character layers from books.
 */

import type { Genre } from "@/types/reading"
import type { Book } from "@/types/reading"
import type { BaseTraits } from "./avatar-seed"
import { seedValue } from "./avatar-seed"

// ── Skin / Hair / Eye palettes ──

export const SKIN_TONES = [
  "#FDDCB5", "#F5C7A1", "#E8B48A", "#D49B6A", "#C48558",
  "#A66E47", "#8B5E3C", "#6B4226", "#F5D6C3", "#F0E0D0",
]

export const HAIR_COLORS = [
  "#2C1810", "#4A3222", "#8B6240", "#D4A76A", "#F2D49B",
  "#C94A2A", "#9B4DCA", "#3D5A99", "#1E7B4E", "#E8E0D0",
]

export const EYE_COLORS = [
  "#4A3222", "#2E5A3E", "#3D5A99", "#7B5CB0", "#8B6240",
  "#1A1A2E",
]

// ── Genre equipment config ──

export type EquipmentSlot = "hat" | "cloak" | "held" | "companion" | "aura" | "face"

export interface GenreEquipment {
  color: string
  slot: EquipmentSlot
  label: string
}

export const GENRE_VISUALS: Record<Genre, GenreEquipment> = {
  Fiction:           { color: "#9B7EBD", slot: "cloak",     label: "Story Cloak" },
  "Non-Fiction":     { color: "#7BA3B8", slot: "held",      label: "Tome" },
  Mystery:           { color: "#6B6B8D", slot: "hat",       label: "Detective Hat" },
  "Science Fiction": { color: "#A8D8EA", slot: "face",      label: "Tech Visor" },
  Fantasy:           { color: "#E8B86D", slot: "hat",       label: "Wizard Hat" },
  Biography:         { color: "#C9A9E0", slot: "held",      label: "Quill" },
  History:           { color: "#A8C5A0", slot: "cloak",     label: "Scholar Robe" },
  "Self-Help":       { color: "#8BC5A7", slot: "aura",      label: "Growth Aura" },
  Philosophy:        { color: "#B8A9D4", slot: "companion", label: "Owl" },
  Poetry:            { color: "#F4A6D7", slot: "hat",       label: "Flower Crown" },
  Romance:           { color: "#D8A7B1", slot: "companion", label: "Heart" },
  Thriller:          { color: "#C97070", slot: "face",      label: "Scar" },
  Other:             { color: "#B5B5B8", slot: "held",      label: "Scroll" },
}

// ── Genre distribution (reused by legend) ──

export interface GenreCount {
  genre: Genre
  count: number
  ratio: number
  visual: GenreEquipment
}

export function computeGenreDistribution(books: Book[]): GenreCount[] {
  if (books.length === 0) return []

  const counts = new Map<Genre, number>()
  for (const book of books) {
    counts.set(book.genre, (counts.get(book.genre) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([genre, count]) => ({
      genre,
      count,
      ratio: count / books.length,
      visual: GENRE_VISUALS[genre],
    }))
    .sort((a, b) => b.count - a.count)
}

// ── Character trait computation ──

export interface CharacterTraits {
  /** Skin color from palette */
  skinTone: string
  /** Hair color from palette */
  hairColor: string
  /** Eye color from palette */
  eyeColor: string
  /** Head shape: 0=round, 1=oval, 2=square-ish */
  headShape: number
  /** Hair style index 0-4 */
  hairStyle: number
  /** Eye style index 0-3 */
  eyeStyle: number
  /** Mouth style index 0-2 */
  mouthStyle: number
}

export function deriveCharacterTraits(seed: string, baseTraits: BaseTraits): CharacterTraits {
  return {
    skinTone: SKIN_TONES[Math.floor(seedValue(seed, "skin") * SKIN_TONES.length)],
    hairColor: HAIR_COLORS[Math.floor(seedValue(seed, "hair") * HAIR_COLORS.length)],
    eyeColor: EYE_COLORS[Math.floor(seedValue(seed, "eyes") * EYE_COLORS.length)],
    headShape: Math.floor(seedValue(seed, "headshape") * 3),
    hairStyle: Math.floor(seedValue(seed, "hairstyle") * 5),
    eyeStyle: Math.floor(seedValue(seed, "eyestyle") * 4),
    mouthStyle: Math.floor(seedValue(seed, "mouth") * 3),
  }
}

// ── Equipment layers ──

export interface EquipmentLayer {
  slot: EquipmentSlot
  genre: Genre
  color: string
  label: string
  intensity: number // 0-1, based on how many books of this genre
}

export interface CharacterLayers {
  character: CharacterTraits
  equipment: EquipmentLayer[]
  dominantGenre: Genre | null
  dominantColor: string
  bookCount: number
  level: number // 1-20, based on total books
}

export function computeCharacterLayers(
  seed: string,
  baseTraits: BaseTraits,
  books: Book[]
): CharacterLayers {
  const character = deriveCharacterTraits(seed, baseTraits)
  const genres = computeGenreDistribution(books)

  // Equipment: one per genre in the collection, strongest genres get highest intensity
  const equipment: EquipmentLayer[] = genres.map((g) => ({
    slot: g.visual.slot,
    genre: g.genre,
    color: g.visual.color,
    label: g.visual.label,
    intensity: Math.min(g.count / 5, 1), // caps at 5 books per genre
  }))

  const dominantGenre = genres.length > 0 ? genres[0].genre : null
  const dominantColor = genres.length > 0 ? genres[0].visual.color : "#D4D0C8"
  const bookCount = books.length
  // Level scales logarithmically: 1 book = lvl 1, 5 = lvl 4, 10 = lvl 7, 20 = lvl 12, 50 = lvl 20
  const level = Math.min(Math.max(Math.floor(Math.log2(bookCount + 1) * 3.5), 1), 20)

  return { character, equipment, dominantGenre, dominantColor, bookCount, level: bookCount === 0 ? 0 : level }
}
