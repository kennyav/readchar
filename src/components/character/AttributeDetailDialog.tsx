import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AttributeType, CharacterState, Book } from '@/types/reading';
import { Progress } from '@/components/ui/progress';
import { BookLogCard } from '@/components/reading/BookLogCard';

interface AttributeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  attribute: AttributeType;
  character: CharacterState;
  books: Book[];
}

export function AttributeDetailDialog({
  open,
  onClose,
  attribute,
  character,
  books,
}: AttributeDetailDialogProps) {
  const attr = character.attributes[attribute];
  const contributingBooks = books.filter((book) => book.attributeImpact[attribute]);
  const progress = (attr.value / attr.maxValue) * 100;
  const pointsToNextLevel = (attr.level * 20) - attr.value;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="game-panel sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 border-[#2C2C2E]/10"
              style={{
                background: '#F9F6F1',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.08)',
              }}
            >
              {attr.icon}
            </div>
            <div>
              <DialogTitle className="font-game text-3xl font-bold text-[#2C2C2E] capitalize tracking-wide">
                {attribute}
              </DialogTitle>
              <p className="text-[#6C6C70] font-medium">Level {attr.level}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Progress section */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: 'white',
              boxShadow: '-4px -4px 8px rgba(255, 255, 255, 0.8), 4px 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#2C2C2E]">Current Progress</span>
              <span className="text-sm font-mono text-[#6C6C70]">
                {attr.value} / {attr.maxValue}
              </span>
            </div>
            <Progress
              value={progress}
              className="h-3 mb-4"
              style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
              }}
            />
            <p className="text-sm text-[#6C6C70]">
              {pointsToNextLevel} points until level {attr.level + 1}
            </p>
          </div>

          {/* Contributing books */}
          <div>
            <h3 className="text-lg font-bold text-[#2C2C2E] mb-3">
              Books that contributed to {attribute}
            </h3>
            {contributingBooks.length > 0 ? (
              <div className="space-y-3">
                {contributingBooks.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 rounded-xl bg-white"
                    style={{
                      boxShadow: '-2px -2px 6px rgba(255, 255, 255, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-[#2C2C2E]">{book.title}</h4>
                        <p className="text-sm text-[#6C6C70]">{book.author}</p>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-sm font-mono font-semibold text-white"
                        style={{ backgroundColor: attr.color }}
                      >
                        +{book.attributeImpact[attribute]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="p-8 rounded-xl text-center text-[#6C6C70]"
                style={{
                  background: 'white',
                  boxShadow: '-4px -4px 8px rgba(255, 255, 255, 0.8), 4px 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                No books have contributed to this attribute yet
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
