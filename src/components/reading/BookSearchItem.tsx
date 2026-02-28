'use client'

import { BookResult } from '@/types/reading'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface BookSearchItemProps {
  book: BookResult
  onSelect: (book: BookResult) => void
}

export function BookSearchItem({ book, onSelect }: BookSearchItemProps) {
  const coverUrl = book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
    : null

  return (
    <div className="flex items-start gap-3 rounded-lg reading-card bg-[hsl(var(--reading-surface))] border-[hsl(var(--reading-border))] p-3 transition-colors hover:bg-[hsl(var(--reading-surface-soft))]">
      {/* Cover image */}
      <div className="flex h-16 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[hsl(var(--reading-border))]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6 text-[hsl(var(--reading-accent))]/50"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
          </svg>
        )}
      </div>

      {/* Book info — min-w-0 allows truncate to work inside flex */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold font-reading-heading text-[hsl(var(--reading-ink))]">
          {book.title}
        </p>
        <p className="truncate text-xs text-[hsl(var(--reading-ink-muted))]">{book.author}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="truncate rounded-full bg-[hsl(var(--reading-accent-soft))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--reading-accent))]">
            {book.genre}
          </span>
          {book.firstPublishYear && (
            <span className="shrink-0 text-[10px] text-[hsl(var(--reading-ink-muted))]">
              {book.firstPublishYear}
            </span>
          )}
        </div>
      </div>

      {/* Add button — shrink-0 prevents it from ever being squeezed */}
      <Button
        size="sm"
        onClick={() => onSelect(book)}
        className="shrink-0 h-8 reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white border-0 font-game"
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add
      </Button>
    </div>
  )
}