import { useState } from 'react';
import { Genre, OnboardingAnswers, AttributeType } from '@/types/reading';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, Sparkles } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (answers: OnboardingAnswers) => void;
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
];

const readingGoals = [
  { value: 'casual' as const, label: 'Casual Reader', description: '1-2 books a month' },
  { value: 'moderate' as const, label: 'Moderate Reader', description: '3-5 books a month' },
  { value: 'avid' as const, label: 'Avid Reader', description: '6+ books a month' },
];

const attributes: { value: AttributeType; label: string; icon: string }[] = [
  { value: 'wisdom', label: 'Wisdom', icon: '🦉' },
  { value: 'curiosity', label: 'Curiosity', icon: '🔍' },
  { value: 'empathy', label: 'Empathy', icon: '💖' },
  { value: 'imagination', label: 'Imagination', icon: '✨' },
  { value: 'focus', label: 'Focus', icon: '🎯' },
  { value: 'creativity', label: 'Creativity', icon: '🎨' },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [readingGoal, setReadingGoal] = useState<'casual' | 'moderate' | 'avid' | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeType[]>([]);

  const toggleGenre = (genre: Genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 3) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const toggleAttribute = (attr: AttributeType) => {
    if (selectedAttributes.includes(attr)) {
      setSelectedAttributes(selectedAttributes.filter((a) => a !== attr));
    } else if (selectedAttributes.length < 3) {
      setSelectedAttributes([...selectedAttributes, attr]);
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete({
        favoriteGenres: selectedGenres,
        readingGoal: readingGoal!,
        preferredAttributes: selectedAttributes,
      });
    }
  };

  const canProceed = () => {
    if (step === 0) return selectedGenres.length > 0;
    if (step === 1) return readingGoal !== null;
    if (step === 2) return selectedAttributes.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {step === 0 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <BookOpen className="w-16 h-16 mx-auto text-[#9B7EBD]" />
                  <h1 className="text-4xl font-bold text-[#2C2C2E]" style={{ fontFamily: 'serif' }}>
                    Welcome to ReadSelf
                  </h1>
                  <p className="text-lg text-[#6C6C70]">
                    Select your favorite genres (up to 3)
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`p-4 rounded-2xl text-center font-medium transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-[#9B7EBD] text-white shadow-lg scale-105'
                          : 'bg-white text-[#2C2C2E] hover:shadow-md'
                      }`}
                      style={{
                        boxShadow: selectedGenres.includes(genre)
                          ? '0 8px 16px rgba(155, 126, 189, 0.3)'
                          : '-4px -4px 8px rgba(255, 255, 255, 0.8), 4px 4px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <Target className="w-16 h-16 mx-auto text-[#A8C5A0]" />
                  <h1 className="text-4xl font-bold text-[#2C2C2E]" style={{ fontFamily: 'serif' }}>
                    What's your reading goal?
                  </h1>
                  <p className="text-lg text-[#6C6C70]">
                    Choose the pace that fits your lifestyle
                  </p>
                </div>

                <div className="space-y-4">
                  {readingGoals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setReadingGoal(goal.value)}
                      className={`w-full p-6 rounded-2xl text-left transition-all ${
                        readingGoal === goal.value
                          ? 'bg-[#A8C5A0] text-white shadow-lg scale-105'
                          : 'bg-white text-[#2C2C2E] hover:shadow-md'
                      }`}
                      style={{
                        boxShadow: readingGoal === goal.value
                          ? '0 8px 16px rgba(168, 197, 160, 0.3)'
                          : '-4px -4px 8px rgba(255, 255, 255, 0.8), 4px 4px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <div className="font-bold text-xl mb-1">{goal.label}</div>
                      <div className={readingGoal === goal.value ? 'text-white/90' : 'text-[#6C6C70]'}>
                        {goal.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <Sparkles className="w-16 h-16 mx-auto text-[#E8B86D]" />
                  <h1 className="text-4xl font-bold text-[#2C2C2E]" style={{ fontFamily: 'serif' }}>
                    Choose your focus
                  </h1>
                  <p className="text-lg text-[#6C6C70]">
                    Select attributes you want to develop (up to 3)
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {attributes.map((attr) => (
                    <button
                      key={attr.value}
                      onClick={() => toggleAttribute(attr.value)}
                      className={`p-6 rounded-2xl text-center transition-all ${
                        selectedAttributes.includes(attr.value)
                          ? 'bg-[#E8B86D] text-white shadow-lg scale-105'
                          : 'bg-white text-[#2C2C2E] hover:shadow-md'
                      }`}
                      style={{
                        boxShadow: selectedAttributes.includes(attr.value)
                          ? '0 8px 16px rgba(232, 184, 109, 0.3)'
                          : '-4px -4px 8px rgba(255, 255, 255, 0.8), 4px 4px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <div className="text-4xl mb-2">{attr.icon}</div>
                      <div className="font-semibold">{attr.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-between items-center">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? 'bg-[#9B7EBD]' : 'bg-[#6C6C70]/30'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-8 py-6 bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: '0 4px 12px rgba(155, 126, 189, 0.3)',
            }}
          >
            {step === 2 ? 'Begin Journey' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
