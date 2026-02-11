import { Book } from '@/types/reading';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface BookLogCardProps {
  book: Book;
  onClick?: () => void;
}

export function BookLogCard({ book, onClick }: BookLogCardProps) {
  const topAttributes = Object.entries(book.attributeImpact)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 3);

  return (
    <Card
      className="p-6 cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]"
      onClick={onClick}
      style={{
        background: 'white',
        boxShadow: '-4px -4px 8px rgba(255, 255, 255, 0.8), 4px 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex gap-4">
        {/* Book cover placeholder */}
        <div className="flex-shrink-0 w-16 h-24 bg-gradient-to-br from-[#9B7EBD] to-[#A8D8EA] rounded-lg flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-white" />
        </div>

        {/* Book details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#2C2C2E] text-lg mb-1 truncate">
            {book.title}
          </h3>
          <p className="text-sm text-[#6C6C70] mb-2">{book.author}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge
              variant="secondary"
              className="rounded-full text-xs"
              style={{
                background: '#E8B86D20',
                color: '#E8B86D',
              }}
            >
              {book.genre}
            </Badge>
          </div>

          {/* Attribute impacts */}
          {topAttributes.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#6C6C70]">
              <TrendingUp className="w-3 h-3" />
              {topAttributes.map(([attr, value]) => (
                <span key={attr} className="capitalize">
                  {attr} +{value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Date added */}
        <div className="flex-shrink-0 text-xs text-[#6C6C70]">
          {format(book.dateAdded, 'MMM d')}
        </div>
      </div>
    </Card>
  );
}
