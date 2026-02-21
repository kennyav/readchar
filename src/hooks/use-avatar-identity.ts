"use client"

import { useState, useEffect, useCallback } from "react"
import type { Book } from "@/types/reading"
import { generateSeed, getSeed, persistSeed } from "@/lib/avatar-seed"
import { CharacterState } from '@/types/reading';

interface AppData {
  character: CharacterState;
  books: Book[];
  onboarded: boolean;
}

/**
 * Manages the user's avatar identity (seed) and book list persistence.
 * The seed is generated once on first visit and stored in localStorage.
 * Books are also persisted so the avatar survives page refreshes.
 */
export function useAvatarIdentity(data: AppData) {
  const [seed, setSeed] = useState<string>("")
  const [books, setBooks] = useState<Book[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    let storedSeed = getSeed()
    if (!storedSeed) {
      storedSeed = generateSeed()
      persistSeed(storedSeed)
    }
    setSeed(storedSeed)
    setHydrated(true)
  }, [])

  // Keep books in sync with data.books changes
  // This ensures the avatar updates when Supabase syncs in the background
  useEffect(() => {
    if (data?.books) {
      setBooks(data.books)
    }
  }, [data?.books])


  const resetIdentity = useCallback(() => {
    const newSeed = generateSeed()
    persistSeed(newSeed)
    setSeed(newSeed)
  }, [])

  return {
    seed,
    books,
    hydrated,
    resetIdentity,
  }
}
