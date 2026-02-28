import { useState } from 'react';
import { Genre, OnboardingAnswers, AttributeType } from '@/types/reading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, Sparkles, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isAuthEnabled } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value: string): boolean {
  return value.length > 0 && EMAIL_REGEX.test(value.trim());
}

function getFriendlyError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'An account with this email already exists. Please check your inbox to confirm it, or try signing in.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  if (msg.includes('unable to validate email address')) {
    return 'Please enter a valid email address.';
  }
  return message;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Onboarding state
  const [step, setStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [readingGoal, setReadingGoal] = useState<'casual' | 'moderate' | 'avid' | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeType[]>([]);

  // Signup state (step 3)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const TOTAL_STEPS = 4; // 0: genres, 1: goal, 2: attributes, 3: signup

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

  const canProceed = () => {
    if (step === 0) return selectedGenres.length > 0;
    if (step === 1) return readingGoal !== null;
    if (step === 2) return selectedAttributes.length > 0;
    return false; // signup step has its own submit button
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setError(null);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setError(null);
      setStep(step - 1);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    const answers: OnboardingAnswers = {
      favoriteGenres: selectedGenres,
      readingGoal: readingGoal!,
      preferredAttributes: selectedAttributes,
    };

    // If auth is disabled, just complete onboarding without signup
    if (!isAuthEnabled) {
      setSubmitting(false);
      onComplete(answers);
      return;
    }

    const { error: signUpError } = await signUp(email.trim(), password);

    if (signUpError) {
      setSubmitting(false);
      setError(getFriendlyError(signUpError.message));
      return;
    }

    // Save onboarding answers to profiles table
    // We need to wait briefly for the trigger to create the profile row
    try {
      // Retry a couple of times since the trigger may take a moment
      let saved = false;
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            onboarded: true,
            favorite_genres: answers.favoriteGenres,
            reading_goal: answers.readingGoal,
            preferred_attributes: answers.preferredAttributes,
          })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (!profileError) {
          saved = true;
          break;
        }
      }
      if (!saved) {
        console.warn('Could not save onboarding answers to profile — will retry on next load.');
      }
    } catch (err) {
      console.warn('Profile update failed:', err);
      // Non-fatal — onComplete still fires and local state carries the answers
    }

    setSubmitting(false);
    onComplete(answers);
  };

  const handleSignInWithGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setError(getFriendlyError(error.message));
    }
  };

  // Bring us to the login page by setting OnBoarded to true
  const handleSignIn = async () => {
    await supabase.from('profiles').update({
      onboarded: true,
    }).eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--reading-bg))] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >

            {/* ── Step 0: Genres ── */}
            {step === 0 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <BookOpen className="w-16 h-16 mx-auto text-[hsl(var(--reading-accent))]" />
                  <h1 className="text-4xl font-bold font-reading-heading text-[hsl(var(--reading-ink))]">
                    Welcome to ReadSelf
                  </h1>
                  <p className="text-lg text-[hsl(var(--reading-ink-muted))]">
                    Select your favorite genres (up to 3)
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`p-4 rounded-2xl text-center font-medium font-game transition-all ${selectedGenres.includes(genre)
                          ? 'reading-card bg-[hsl(var(--reading-accent))] text-white shadow-sm scale-[1.02]'
                          : 'reading-card bg-[hsl(var(--reading-surface))] text-[hsl(var(--reading-ink))] hover:bg-[hsl(var(--reading-surface-soft))]'
                        }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 1: Reading Goal ── */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <Target className="w-16 h-16 mx-auto text-[hsl(var(--reading-accent))]" />
                  <h1 className="text-4xl font-bold font-reading-heading text-[hsl(var(--reading-ink))]">
                    What&apos;s your reading goal?
                  </h1>
                  <p className="text-lg text-[hsl(var(--reading-ink-muted))]">
                    Choose the pace that fits your lifestyle
                  </p>
                </div>
                <div className="space-y-4">
                  {readingGoals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setReadingGoal(goal.value)}
                      className={`w-full p-6 rounded-2xl text-left font-game transition-all ${readingGoal === goal.value
                          ? 'reading-card bg-[hsl(var(--reading-accent))] text-white shadow-sm scale-[1.02]'
                          : 'reading-card bg-[hsl(var(--reading-surface))] text-[hsl(var(--reading-ink))] hover:bg-[hsl(var(--reading-surface-soft))]'
                        }`}
                    >
                      <div className="font-bold text-xl mb-1">{goal.label}</div>
                      <div className={readingGoal === goal.value ? 'text-white/90' : 'text-[hsl(var(--reading-ink-muted))]'}>
                        {goal.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Attributes ── */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <Sparkles className="w-16 h-16 mx-auto text-[hsl(var(--reading-accent))]" />
                  <h1 className="text-4xl font-bold font-reading-heading text-[hsl(var(--reading-ink))]">
                    Choose your focus
                  </h1>
                  <p className="text-lg text-[hsl(var(--reading-ink-muted))]">
                    Select attributes you want to develop (up to 3)
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {attributes.map((attr) => (
                    <button
                      key={attr.value}
                      onClick={() => toggleAttribute(attr.value)}
                      className={`p-6 rounded-2xl text-center font-game transition-all ${selectedAttributes.includes(attr.value)
                          ? 'reading-card bg-[hsl(var(--reading-accent))] text-white shadow-sm scale-[1.02]'
                          : 'reading-card bg-[hsl(var(--reading-surface))] text-[hsl(var(--reading-ink))] hover:bg-[hsl(var(--reading-surface-soft))]'
                        }`}
                    >
                      <div className="text-4xl mb-2">{attr.icon}</div>
                      <div className="font-semibold">{attr.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Create Account ── */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <UserPlus className="w-16 h-16 mx-auto text-[hsl(var(--reading-accent))]" />
                  <h1 className="text-4xl font-bold font-reading-heading text-[hsl(var(--reading-ink))]">
                    Save your journey
                  </h1>
                  <p className="text-lg text-[hsl(var(--reading-ink-muted))]">
                    Create an account to keep your progress across devices
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4 reading-card rounded-2xl p-8">
                  <div className="space-y-2">
                    <Label htmlFor="onboarding-email" className="font-medium text-[hsl(var(--reading-ink))]">
                      Email
                    </Label>
                    <Input
                      id="onboarding-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="font-game border-[hsl(var(--reading-border))] bg-[hsl(var(--reading-surface))]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="onboarding-password" className="font-medium text-[hsl(var(--reading-ink))]">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="onboarding-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="font-game pr-10 border-[hsl(var(--reading-border))] bg-[hsl(var(--reading-surface))]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--reading-ink-muted))] hover:text-[hsl(var(--reading-ink))] p-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">{error}</p>
                      {(error.includes('already exists') || error.includes('confirm it')) && (
                        <p className="text-sm text-[hsl(var(--reading-ink-muted))]">
                          Already have an account?{' '}
                          <a href="/login" className="text-[hsl(var(--reading-accent))] underline font-medium">
                            Sign in instead
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white font-game font-semibold border-0 rounded-xl py-6"
                    disabled={submitting || !email.trim() || password.length < 6}
                  >
                    {submitting ? 'Creating your account...' : 'Begin Journey 🚀'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSignInWithGoogle}
                    className="w-full reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white font-game font-semibold border-0 rounded-xl py-6"
                  >
                    Sign in with Google
                  </Button>
                </form>
                <div className="text-center text-lg text-[hsl(var(--reading-ink-muted))]">Or</div>
                <div className="flex flex-col reading-card rounded-2xl p-8 gap-4 justify-center items-center w-full mt-4">
                  <Button
                    type="button"
                    onClick={handleSignIn}
                    className="w-full reading-card bg-[hsl(var(--reading-surface))] hover:bg-[hsl(var(--reading-surface-soft))] text-[hsl(var(--reading-ink))] font-game font-semibold border border-[hsl(var(--reading-border))] rounded-xl py-6"
                  >
                    Sign in with Email
                  </Button>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div className="mt-12 flex justify-between items-center">
          {/* Step dots */}
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-[hsl(var(--reading-accent))]' : i < step ? 'bg-[hsl(var(--reading-accent))]/40' : 'bg-[hsl(var(--reading-ink-muted))]/30'}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {/* Back button */}
            {step > 0 && step < TOTAL_STEPS - 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="px-6 py-6 rounded-full font-game border-[hsl(var(--reading-border))] text-[hsl(var(--reading-ink))] hover:bg-[hsl(var(--reading-surface-soft))]"
              >
                Back
              </Button>
            )}

            {/* Continue button — hidden on signup step since form has its own submit */}
            {step < TOTAL_STEPS - 1 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-6 reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-game"
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}