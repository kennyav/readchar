import { useState } from 'react';
import { Genre } from '@/types/reading';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (book: { title: string; author: string; genre: Genre }) => void;
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
];

export function AddBookDialog({ open, onClose, onAdd }: AddBookDialogProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<Genre>('Fiction');

  const handleSubmit = () => {
    if (title && author && genre) {
      onAdd({ title, author, genre });
      setTitle('');
      setAuthor('');
      setGenre('Fiction');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#F9F6F1]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2E]" style={{ fontFamily: 'serif' }}>
            Add a Book
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#2C2C2E] font-medium">
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
            <Label htmlFor="author" className="text-[#2C2C2E] font-medium">
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
            <Label htmlFor="genre" className="text-[#2C2C2E] font-medium">
              Genre
            </Label>
            <Select value={genre} onValueChange={(value) => setGenre(value as Genre)}>
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

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title || !author}
              className="flex-1 bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white"
            >
              Add Book
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
