import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAuthEnabled } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value: string): boolean {
  return value.length > 0 && EMAIL_REGEX.test(value.trim());
}

/**
 * Converts raw Supabase error messages into friendly, user-readable ones.
 */
function getFriendlyError(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please check your email and confirm your account before signing in.';
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

  // Fall back to the original message if we don't recognise it
  return message;
}

export default function Login() {
  const { user, loading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthEnabled) return <Navigate to="/" replace />;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--reading-bg))]">
        <div className="font-reading-heading text-xl text-[hsl(var(--reading-ink-muted))]">Loading...</div>
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) setError(getFriendlyError(err.message));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await signUp(trimmedEmail, password);
    setSubmitting(false);
    if (err) {
      setError(getFriendlyError(err.message));
    } else {
      setMessage('Check your email to confirm your account.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--reading-bg))]">
      <Card className="reading-card w-full max-w-md border-[hsl(var(--reading-border))] bg-[hsl(var(--reading-surface))]">
        <CardHeader className="text-center">
          <CardTitle className="font-reading-heading text-2xl text-[hsl(var(--reading-ink))]">ReadSelf</CardTitle>
          <CardDescription className="text-[hsl(var(--reading-ink-muted))]">Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="reading-card-soft grid w-full grid-cols-2 rounded-xl p-1.5 mb-4 border border-[hsl(var(--reading-border))] bg-[hsl(var(--reading-surface-soft))]">
              <TabsTrigger
                value="signin"
                className="flex h-full w-full items-center justify-center rounded-lg font-game data-[state=active]:bg-[hsl(var(--reading-accent-soft))] data-[state=active]:text-[hsl(var(--reading-ink))] data-[state=active]:shadow-sm"
                onClick={() => { setError(null); setMessage(null); }}
              >
                Sign in
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex h-full w-full items-center justify-center rounded-lg font-game data-[state=active]:bg-[hsl(var(--reading-accent-soft))] data-[state=active]:text-[hsl(var(--reading-ink))] data-[state=active]:shadow-sm"
                onClick={() => { setError(null); setMessage(null); }}
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium text-[hsl(var(--reading-ink))]">Email</Label>
                  <Input
                    id="email"
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
                  <Label htmlFor="password" className="font-medium text-[hsl(var(--reading-ink))]">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
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
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="w-full reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white font-game border-0"
                  disabled={submitting}
                >
                  {submitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-medium text-[hsl(var(--reading-ink))]">Email</Label>
                  <Input
                    id="signup-email"
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
                  <Label htmlFor="signup-password" className="font-medium text-[hsl(var(--reading-ink))]">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
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
                    {error.includes('already exists') && (
                      <p className="text-sm text-[hsl(var(--reading-ink-muted))]">
                        Already have an account?{' '}
                        <button
                          type="button"
                          className="text-[hsl(var(--reading-accent))] underline font-medium"
                          onClick={() => {
                            setError(null);
                            document.querySelector<HTMLButtonElement>('[value="signin"]')?.click();
                          }}
                        >
                          Sign in instead
                        </button>
                      </p>
                    )}
                  </div>
                )}
                {message && <p className="text-sm text-[hsl(var(--reading-accent))]">{message}</p>}
                <Button
                  type="submit"
                  className="w-full reading-card bg-[hsl(var(--reading-accent))] hover:bg-[hsl(var(--reading-accent))]/90 text-white font-game border-0"
                  disabled={submitting || !email.trim() || !password || password.length < 6}
                >
                  {submitting ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}