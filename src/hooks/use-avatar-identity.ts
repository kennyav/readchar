"use client"

import { useState, useEffect, useCallback } from "react"
import type { BookResult } from "@/types/reading"
import { generateSeed, getSeed, persistSeed } from "@/lib/avatar-seed"
import { CharacterState, Book } from '@/types/reading';

const BOOKS_STORAGE_KEY = "reading-list-books"

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

    // TODO: Pull books from database or from somewhere that has them
    try {
      //const storedBooks = localStorage.getItem(BOOKS_STORAGE_KEY)
      const storedBooks = data.books
      if (storedBooks) {
        setBooks(storedBooks)
      }
    } catch {
      // Ignore parse errors
    }

    setHydrated(true)
  }, [])

  // Persist books whenever they change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))
  }, [books, hydrated])

  const addBook = useCallback((book: Book) => {
    setBooks((prev) => {
      // Avoid duplicates by key
      if (prev.some((b) => b.id === book.id)) return prev
      return [...prev, book]
    })
  }, [])

  const removeBook = useCallback((bookKey: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookKey))
  }, [])

  const resetIdentity = useCallback(() => {
    const newSeed = generateSeed()
    persistSeed(newSeed)
    setSeed(newSeed)
  }, [])

  return {
    seed,
    books,
    hydrated,
    addBook,
    removeBook,
    resetIdentity,
  }
}
