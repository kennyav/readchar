import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, StopCircle } from 'lucide-react';

interface ReadingTimerDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (seconds: number) => void;
}

export function ReadingTimerDialog({ open, onClose, onComplete }: ReadingTimerDialogProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleComplete = () => {
    onComplete(seconds);
    setSeconds(0);
    setIsRunning(false);
    onClose();
  };

  const handleClose = () => {
    setSeconds(0);
    setIsRunning(false);
    onClose();
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl sm:max-w-md bg-[hsl(var(--reading-bg))] border-[hsl(var(--reading-border))]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-reading-heading text-[hsl(var(--reading-ink))] text-center">
            Reading Session
          </DialogTitle>
        </DialogHeader>

        <div className="py-8">
          <div className="flex flex-col items-center space-y-8">
            {/* Timer display */}
            <div className="w-48 h-48 rounded-full flex items-center justify-center reading-card bg-[hsl(var(--reading-surface))] border-[hsl(var(--reading-border))]">
              <div className="text-center">
                <Timer className="w-8 h-8 mx-auto mb-4 text-[hsl(var(--reading-accent))]" />
                <div className="text-4xl font-mono font-bold text-[hsl(var(--reading-ink))] tabular-nums">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="w-16 h-16 rounded-full reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white border-0"
              >
                {isRunning ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              {seconds > 0 && (
                <Button
                  onClick={handleComplete}
                  className="px-6 h-16 rounded-full reading-card bg-[hsl(var(--reading-surface))] hover:bg-[hsl(var(--reading-surface-soft))] text-[hsl(var(--reading-ink))] border border-[hsl(var(--reading-border))] font-game"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Complete Session
                </Button>
              )}
            </div>

            <p className="text-sm text-[hsl(var(--reading-ink-muted))] text-center">
              {isRunning
                ? 'Focus on your reading...'
                : seconds > 0
                  ? 'Paused - Resume or complete'
                  : 'Start your focused reading session'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
