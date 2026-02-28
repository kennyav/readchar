'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Genre, BookResult } from '@/types/reading'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, BookOpen } from 'lucide-react'
import { useBookSearch } from '@/hooks/use-book-search.tsx'
import { BookSearchItem } from '@/components/reading/BookSearchItem'

interface AddBookDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (book: { title: string; author: string; genre: Genre; coverId: number | null }) => void
}

const genres: Genre[] = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Biography',
  'History',
  'Self-Help',
  'Philosophy',
  'Poetry',
  'Romance',
  'Thriller',
  'Other',
]

type Tab = 'search' | 'manual'

export function AddBookDialog({ open, onClose, onAdd }: AddBookDialogProps) {
  const [tab, setTab] = useState<Tab>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState<Genre>('Fiction')

  const { results, isSearching, hasSearched, search, clear } = useBookSearch()

  // Debounced search
  useEffect(() => {
    if (tab !== 'search') return
    const timer = setTimeout(() => {
      search(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, search, tab])

  const reset = useCallback(() => {
    setSearchQuery('')
    setTitle('')
    setAuthor('')
    setGenre('Fiction')
    setTab('search')
    clear()
  }, [clear])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const handleSelectBook = useCallback(
    (book: BookResult) => {
      onAdd({ title: book.title, author: book.author, genre: book.genre, coverId: book.coverId })
      reset()
      onClose()
    },
    [onAdd, reset, onClose]
  )

  const handleManualSubmit = useCallback(() => {
    if (title && author && genre) {
      onAdd({ title, author, genre, coverId: null })
      reset()
      onClose()
    }
  }, [title, author, genre, onAdd, reset, onClose])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-[85vh] max-h-[85vh] flex-col overflow-hidden bg-[hsl(var(--reading-bg))] border-[hsl(var(--reading-border))] rounded-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-reading-heading text-[hsl(var(--reading-ink))]">
            Add a Book
          </DialogTitle>
          <DialogDescription className="text-sm text-[hsl(var(--reading-ink-muted))]">
            Search the Open Library or add a book manually.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg reading-card-soft p-1 border border-[hsl(var(--reading-border))]">
          <button
            onClick={() => setTab('search')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium font-game transition-colors ${
              tab === 'search'
                ? 'bg-[hsl(var(--reading-accent-soft))] text-[hsl(var(--reading-ink))] shadow-sm'
                : 'text-[hsl(var(--reading-ink-muted))] hover:text-[hsl(var(--reading-ink))]'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium font-game transition-colors ${
              tab === 'manual'
                ? 'bg-[hsl(var(--reading-accent-soft))] text-[hsl(var(--reading-ink))] shadow-sm'
                : 'text-[hsl(var(--reading-ink-muted))] hover:text-[hsl(var(--reading-ink))]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Manual
          </button>
        </div>

        {/* Search Tab */}
        {tab === 'search' && (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--reading-ink-muted))]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="reading-card bg-[hsl(var(--reading-surface))] border-[hsl(var(--reading-border))] pl-9"
                autoFocus
              />
            </div>

            {/* Plain scrollable div instead of ScrollArea — prevents right-side clipping of the Add button */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--reading-accent))]" />
                    <p className="mt-2 text-sm text-[hsl(var(--reading-ink-muted))]">Searching Open Library...</p>
                  </div>
                )}

                {!isSearching && hasSearched && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <BookOpen className="h-8 w-8 text-[hsl(var(--reading-ink-muted))]/50" />
                    <p className="mt-2 text-sm text-[hsl(var(--reading-ink-muted))]">
                      No books found. Try a different search.
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setTab('manual')}
                      className="mt-1 text-[hsl(var(--reading-accent))]"
                    >
                      Add manually instead
                    </Button>
                  </div>
                )}

                {!isSearching && !hasSearched && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Search className="h-8 w-8 text-[hsl(var(--reading-ink-muted))]/50" />
                    <p className="mt-2 text-sm text-[hsl(var(--reading-ink-muted))]">
                      Start typing to search millions of books
                    </p>
                  </div>
                )}

                {!isSearching &&
                  results.map((book) => (
                    <BookSearchItem
                      key={book.key}
                      book={book}
                      onSelect={handleSelectBook}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Manual Tab */}
        {tab === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium text-[hsl(var(--reading-ink))]">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                className="reading-card bg-[hsl(var(--reading-surface))] border-[hsl(var(--reading-border))]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="font-medium text-[hsl(var(--reading-ink))]">
                Author
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
                className="reading-card bg-[hsl(var(--reading-surface))] border-[hsl(var(--reading-border))]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre" className="font-medium text-[hsl(var(--reading-ink))]">
                Genre
              </Label>
              <Select value={genre} onValueChange={(value) => setGenre(value as Genre)}>
                <SelectTrigger className="reading-card bg-[hsl(var(--reading-surface))] border-[hsl(var(--reading-border))]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-[hsl(var(--reading-border))] text-[hsl(var(--reading-ink))] hover:bg-[hsl(var(--reading-surface-soft))] font-game"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualSubmit}
                disabled={!title || !author}
                className="flex-1 reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white border-0 font-game"
              >
                Add Book
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}