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
    <div className="flex items-start gap-3 rounded-lg border border-[#E8E0D4] bg-white p-3 transition-colors hover:bg-[#F5F0E8]">
      <div className="flex h-16 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#E8E0D4]">
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
            className="h-6 w-6 text-[#9B7EBD]/50"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-semibold text-[#2C2C2E]"
          style={{ fontFamily: 'serif' }}
        >
          {book.title}
        </p>
        <p className="truncate text-xs text-[#6B6B6E]">{book.author}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full bg-[#9B7EBD]/10 px-2 py-0.5 text-[10px] font-medium text-[#9B7EBD]">
            {book.genre}
          </span>
          {book.firstPublishYear && (
            <span className="text-[10px] text-[#9B9B9E]">
              {book.firstPublishYear}
            </span>
          )}
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => onSelect(book)}
        className="h-8 shrink-0 bg-[#9B7EBD] text-white hover:bg-[#8B6EAD]"
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add
      </Button>
    </div>
  )
}
