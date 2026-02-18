/**
 * Avatar seed generation and deterministic hashing.
 * The seed is a 32-char hex string that creates a unique base identity.
 * Combined with the book collection, it produces a one-of-a-kind avatar.
 */

const STORAGE_KEY = "reading-avatar-seed"

export function generateSeed(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function getSeed(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY)
}

export function persistSeed(seed: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, seed)
}

/**
 * Deterministic hash: converts a string to a number between 0 and 1.
 * Uses a simple FNV-1a inspired hash.
 */
export function hashToNumber(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash) / 4294967295
}

/**
 * Derive multiple deterministic values from a seed string.
 * Each key produces a different hash by appending the key to the seed.
 */
export function seedValue(seed: string, key: string): number {
  return hashToNumber(seed + ":" + key)
}

/**
 * Base traits derived purely from the seed (independent of books).
 */
export interface BaseTraits {
  /** Number of vertices on the core polygon (3-8) */
  coreVertices: number
  /** Base rotation offset in degrees (0-360) */
  baseRotation: number
  /** Hue shift applied to all genre colors (-20 to +20 degrees) */
  hueShift: number
  /** Scale factor for inner pattern (0.6-1.0) */
  innerScale: number
  /** Line pattern angle offset (0-180 degrees) */
  patternAngle: number
}

export function deriveBaseTraits(seed: string): BaseTraits {
  return {
    coreVertices: 3 + Math.floor(seedValue(seed, "vertices") * 6), // 3-8
    baseRotation: seedValue(seed, "rotation") * 360,
    hueShift: (seedValue(seed, "hue") - 0.5) * 40, // -20 to +20
    innerScale: 0.6 + seedValue(seed, "scale") * 0.4,
    patternAngle: seedValue(seed, "pattern") * 180,
  }
}
