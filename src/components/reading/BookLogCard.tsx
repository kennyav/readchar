import { Book } from '@/types/reading';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trash, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';

interface BookLogCardProps {
  book: Book;
  onClick?: () => void;
  onDelete?: (bookId: string) => void;
}

export function BookLogCard({ book, onClick, onDelete }: BookLogCardProps) {
  const topAttributes = Object.entries(book.attributeImpact)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 3);

  const coverUrl = book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
    : null

  return (
    <div
      className="game-panel p-6 rounded-2xl cursor-pointer transition-all hover:brightness-[1.02] active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Book cover placeholder - inventory slot style */}
        <div className="flex-shrink-0 w-16 h-24 rounded-lg flex items-center justify-center border-2 border-[#9B7EBD]/40 bg-gradient-to-br from-[#9B7EBD] to-[#7a6a9a] shadow-inner">
          {coverUrl ?
            (<img
              src={coverUrl}
              alt={`Cover of ${book.title}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />)
            :
            (<BookOpen className="w-8 h-8 text-white drop-shadow" />)}
        </div>

        {/* Book details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-game font-bold text-[#2C2C2E] text-lg mb-1 truncate">
            {book.title}
          </h3>
          <p className="text-sm text-[#6C6C70] mb-2">{book.author}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge
              variant="secondary"
              className="rounded-md text-xs font-medium border border-amber-700/30"
              style={{
                background: 'rgba(232, 184, 109, 0.25)',
                color: '#b8860b',
              }}
            >
              {book.genre}
            </Badge>
          </div>
          {/* Attribute impacts - stat gains style */}
          {topAttributes.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#6C6C70] font-medium">
              <TrendingUp className="w-3 h-3" />
              {topAttributes.map(([attr, value]) => (
                <span key={attr} className="capitalize text-green-700/80">
                  {attr} +{value}
                </span>
              ))}
            </div>
          )}


        </div>

        {/* Right side: Date + Delete */}
        <div className="flex-shrink-0 flex flex-col items-end justify-between">
          <span className="text-xs text-[#6C6C70] font-mono">
            {format(book.dateAdded, 'MMM d')}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(book.id);
            }}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div >
  );
}
