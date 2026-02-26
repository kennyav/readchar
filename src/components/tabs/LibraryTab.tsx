import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { BookOpen, Library } from 'lucide-react'
import { BookLogCard } from '../reading/BookLogCard'
import { AppData } from '@/hooks/use-app-data'

interface LibraryTabProps {
   data: AppData
   setShowAddBook: (show: boolean) => void
   removeBook: (bookId: string) => void
   isActive: boolean
}

export default function LibraryTab({ data, setShowAddBook, removeBook, isActive }: LibraryTabProps) {
   return (
      <motion.div
         key={isActive ? 'active' : 'inactive'}
         initial={{ opacity: 0, y: -24 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
         className="space-y-6"
      >
         <div className="flex items-center justify-between mb-4">
            <h2 className="font-reading-heading text-xl text-[hsl(var(--reading-ink))]">
               Your library
            </h2>
            <Button
               onClick={() => setShowAddBook(true)}
               className="reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white rounded-lg font-medium text-sm border-0"
            >
               <BookOpen className="w-4 h-4 mr-2" />
               Add book
            </Button>
         </div>

         {data.books.length > 0 ? (
            <div className="space-y-4">
               {data.books.map((book) => (
                  <BookLogCard key={book.id} book={book} onDelete={removeBook} />
               ))}
            </div>
         ) : (
            <div className="reading-card-soft p-12 rounded-xl text-center">
               <Library className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--reading-ink-muted))]" />
               <h3 className="font-reading-heading text-lg text-[hsl(var(--reading-ink))] mb-2">
                  No books yet
               </h3>
               <p className="text-[hsl(var(--reading-ink-muted))] mb-6">
                  Add your first book and watch your companion start to grow.
               </p>
               <Button
                  onClick={() => setShowAddBook(true)}
                  className="reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white font-game font-medium border-0"
               >
                  Add your first book
               </Button>
            </div>
         )}
      </motion.div>
   )
}
