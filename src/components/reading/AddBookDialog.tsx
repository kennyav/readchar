// import { useState } from 'react';
// import { Genre } from '@/types/reading';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// interface AddBookDialogProps {
//   open: boolean;
//   onClose: () => void;
//   onAdd: (book: { title: string; author: string; genre: Genre }) => void;
// }

// const genres: Genre[] = [
//   'Fiction',
//   'Non-Fiction',
//   'Mystery',
//   'Science Fiction',
//   'Fantasy',
//   'Biography',
//   'History',
//   'Self-Help',
//   'Philosophy',
//   'Poetry',
//   'Romance',
//   'Thriller',
//   'Other',
// ];

// export function AddBookDialog({ open, onClose, onAdd }: AddBookDialogProps) {
//   const [title, setTitle] = useState('');
//   const [author, setAuthor] = useState('');
//   const [genre, setGenre] = useState<Genre>('Fiction');

//   const handleSubmit = () => {
//     if (title && author && genre) {
//       onAdd({ title, author, genre });
//       setTitle('');
//       setAuthor('');
//       setGenre('Fiction');
//       onClose();
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md bg-[#F9F6F1]">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold text-[#2C2C2E]" style={{ fontFamily: 'serif' }}>
//             Add a Book
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4 mt-4">
//           <div className="space-y-2">
//             <Label htmlFor="title" className="text-[#2C2C2E] font-medium">
//               Title
//             </Label>
//             <Input
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter book title"
//               className="bg-white"
//               style={{
//                 boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)',
//               }}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="author" className="text-[#2C2C2E] font-medium">
//               Author
//             </Label>
//             <Input
//               id="author"
//               value={author}
//               onChange={(e) => setAuthor(e.target.value)}
//               placeholder="Enter author name"
//               className="bg-white"
//               style={{
//                 boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)',
//               }}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="genre" className="text-[#2C2C2E] font-medium">
//               Genre
//             </Label>
//             <Select value={genre} onValueChange={(value) => setGenre(value as Genre)}>
//               <SelectTrigger className="bg-white">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {genres.map((g) => (
//                   <SelectItem key={g} value={g}>
//                     {g}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex gap-3 mt-6">
//             <Button
//               variant="outline"
//               onClick={onClose}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSubmit}
//               disabled={!title || !author}
//               className="flex-1 bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white"
//             >
//               Add Book
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Search, BookOpen } from 'lucide-react'
import { useBookSearch } from '@/hooks/use-book-search.tsx'
import { BookSearchItem } from '@/components/reading/BookSearchItem'

interface AddBookDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (book: { title: string; author: string; genre: Genre }) => void
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
      onAdd({ title: book.title, author: book.author, genre: book.genre })
      reset()
      onClose()
    },
    [onAdd, reset, onClose]
  )

  const handleManualSubmit = useCallback(() => {
    if (title && author && genre) {
      onAdd({ title, author, genre })
      reset()
      onClose()
    }
  }, [title, author, genre, onAdd, reset, onClose])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden bg-[#F9F6F1] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-bold text-[#2C2C2E]"
            style={{ fontFamily: 'serif' }}
          >
            Add a Book
          </DialogTitle>
          <DialogDescription className="text-sm text-[#6B6B6E]">
            Search the Open Library or add a book manually.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-[#E8E0D4]/60 p-1">
          <button
            onClick={() => setTab('search')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === 'search'
                ? 'bg-white text-[#2C2C2E] shadow-sm'
                : 'text-[#6B6B6E] hover:text-[#2C2C2E]'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === 'manual'
                ? 'bg-white text-[#2C2C2E] shadow-sm'
                : 'text-[#6B6B6E] hover:text-[#2C2C2E]'
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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B9B9E]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="bg-white pl-9"
                style={{
                  boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)',
                }}
                autoFocus
              />
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="max-h-[350px] space-y-2 pr-2">
                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-[#9B7EBD]" />
                    <p className="mt-2 text-sm text-[#6B6B6E]">
                      Searching Open Library...
                    </p>
                  </div>
                )}

                {!isSearching && hasSearched && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <BookOpen className="h-8 w-8 text-[#9B9B9E]/50" />
                    <p className="mt-2 text-sm text-[#6B6B6E]">
                      No books found. Try a different search.
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setTab('manual')}
                      className="mt-1 text-[#9B7EBD]"
                    >
                      Add manually instead
                    </Button>
                  </div>
                )}

                {!isSearching && !hasSearched && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Search className="h-8 w-8 text-[#9B9B9E]/50" />
                    <p className="mt-2 text-sm text-[#6B6B6E]">
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
            </ScrollArea>
          </div>
        )}

        {/* Manual Tab */}
        {tab === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium text-[#2C2C2E]">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                className="bg-white"
                style={{
                  boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="font-medium text-[#2C2C2E]">
                Author
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
                className="bg-white"
                style={{
                  boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre" className="font-medium text-[#2C2C2E]">
                Genre
              </Label>
              <Select
                value={genre}
                onValueChange={(value) => setGenre(value as Genre)}
              >
                <SelectTrigger className="bg-white">
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
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualSubmit}
                disabled={!title || !author}
                className="flex-1 bg-[#9B7EBD] text-white hover:bg-[#8B6EAD]"
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
