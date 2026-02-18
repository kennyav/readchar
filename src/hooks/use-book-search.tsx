import { useState, useCallback, useRef } from 'react'
import type { BookResult, Genre } from '@/types/reading'

interface OpenLibraryDoc {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
  subject?: string[]
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[]
  numFound: number
}

const GENRE_KEYWORDS: Record<string, Genre> = {
  fiction: 'Fiction',
  novel: 'Fiction',
  'non-fiction': 'Non-Fiction',
  nonfiction: 'Non-Fiction',
  mystery: 'Mystery',
  detective: 'Mystery',
  'science fiction': 'Science Fiction',
  'sci-fi': 'Science Fiction',
  fantasy: 'Fantasy',
  biography: 'Biography',
  autobiography: 'Biography',
  memoir: 'Biography',
  history: 'History',
  historical: 'History',
  'self-help': 'Self-Help',
  'self help': 'Self-Help',
  philosophy: 'Philosophy',
  poetry: 'Poetry',
  poems: 'Poetry',
  romance: 'Romance',
  love: 'Romance',
  thriller: 'Thriller',
  suspense: 'Thriller',
}

function inferGenre(subjects: string[]): Genre {
  const lowerSubjects = subjects.map((s) => s.toLowerCase())
  for (const subject of lowerSubjects) {
    for (const [keyword, genre] of Object.entries(GENRE_KEYWORDS)) {
      if (subject.includes(keyword)) {
        return genre
      }
    }
  }
  return 'Other'
}

export function useBookSearch() {
  const [results, setResults] = useState<BookResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsSearching(true)
    setHasSearched(true)

    try {
      const encoded = encodeURIComponent(query.trim())
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encoded}&limit=20&fields=key,title,author_name,cover_i,first_publish_year,subject`,
        { signal: controller.signal }
      )

      if (!response.ok) throw new Error('Search failed')

      const data: OpenLibraryResponse = await response.json()

      const books: BookResult[] = data.docs.map((doc) => {
        const subjects = doc.subject?.slice(0, 10) ?? []
        return {
          key: doc.key,
          title: doc.title,
          author: doc.author_name?.[0] ?? 'Unknown Author',
          coverId: doc.cover_i ?? null,
          firstPublishYear: doc.first_publish_year ?? null,
          genre: inferGenre(subjects),
          subjects,
        }
      })

      setResults(books)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setHasSearched(false)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return { results, isSearching, hasSearched, search, clear }
}
