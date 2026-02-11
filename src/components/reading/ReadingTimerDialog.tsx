import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, StopCircle } from 'lucide-react';

interface ReadingTimerDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (minutes: number) => void;
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
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      onComplete(minutes);
      setSeconds(0);
      setIsRunning(false);
      onClose();
    }
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
      <DialogContent className="sm:max-w-md bg-[#F9F6F1]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2E] text-center" style={{ fontFamily: 'serif' }}>
            Reading Session
          </DialogTitle>
        </DialogHeader>

        <div className="py-8">
          <div className="flex flex-col items-center space-y-8">
            {/* Timer display */}
            <div
              className="w-48 h-48 rounded-full flex items-center justify-center"
              style={{
                background: '#F9F6F1',
                boxShadow: `
                  -8px -8px 16px rgba(255, 255, 255, 0.8),
                  8px 8px 16px rgba(0, 0, 0, 0.1),
                  inset -2px -2px 8px rgba(255, 255, 255, 0.5),
                  inset 2px 2px 8px rgba(0, 0, 0, 0.05)
                `,
              }}
            >
              <div className="text-center">
                <Timer className="w-8 h-8 mx-auto mb-4 text-[#9B7EBD]" />
                <div className="text-4xl font-mono font-bold text-[#2C2C2E]">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="w-16 h-16 rounded-full bg-[#A8C5A0] hover:bg-[#98B590] text-white"
                style={{
                  boxShadow: '0 4px 12px rgba(168, 197, 160, 0.3)',
                }}
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
                  className="px-6 h-16 rounded-full bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white"
                  style={{
                    boxShadow: '0 4px 12px rgba(155, 126, 189, 0.3)',
                  }}
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Complete Session
                </Button>
              )}
            </div>

            <p className="text-sm text-[#6C6C70] text-center">
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
