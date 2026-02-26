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
      className="reading-card p-5 rounded-xl cursor-pointer transition-all hover:shadow-md active:scale-[0.99] border border-[hsl(var(--reading-border))]"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Book cover */}
        <div className="flex-shrink-0 w-16 h-24 rounded-lg flex items-center justify-center border border-[hsl(var(--reading-border))] bg-[hsl(var(--reading-surface-soft))] overflow-hidden">
          {coverUrl ?
            (<img
              src={coverUrl}
              alt={`Cover of ${book.title}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />)
            :
            (<BookOpen className="w-8 h-8 text-[hsl(var(--reading-ink-muted))]" />)}
        </div>

        {/* Book details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-game font-bold text-[hsl(var(--reading-ink))] text-lg mb-1 truncate">
            {book.title}
          </h3>
          <p className="text-sm text-[hsl(var(--reading-ink-muted))] mb-2">{book.author}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge
              variant="secondary"
              className="rounded-md text-xs font-medium bg-[hsl(var(--reading-accent-soft))] text-[hsl(var(--reading-accent))] border-0"
            >
              {book.genre}
            </Badge>
          </div>
          {topAttributes.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--reading-ink-muted))]">
              <TrendingUp className="w-3 h-3" />
              {topAttributes.map(([attr, value]) => (
                <span key={attr} className="capitalize">
                  {attr} +{value}
                </span>
              ))}
            </div>
          )}


        </div>

        {/* Right side: Date + Delete */}
        <div className="flex-shrink-0 flex flex-col items-end justify-between">
          <span className="text-xs text-[hsl(var(--reading-ink-muted))] font-mono">
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
