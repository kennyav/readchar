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
  console.log(msg);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-game text-xl text-[#6C6C70]">Loading...</div>
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="game-panel w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-game text-2xl">ReadSelf</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="game-panel grid w-full grid-cols-2 rounded-xl p-1 mb-4">
              <TabsTrigger
                value="signin"
                className="rounded-lg font-game data-[state=active]:bg-[#9B7EBD] data-[state=active]:text-white"
                onClick={() => { setError(null); setMessage(null); }}
              >
                Sign in
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg font-game data-[state=active]:bg-[#9B7EBD] data-[state=active]:text-white"
                onClick={() => { setError(null); setMessage(null); }}
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="font-game"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="font-game pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6C6C70] hover:text-[#2C2C2E] p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="game-panel w-full bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white font-game border-2 border-[#7a6a9a]"
                  disabled={submitting}
                >
                  {submitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="font-game"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
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
                      className="font-game pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6C6C70] hover:text-[#2C2C2E] p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="space-y-1">
                    <p className="text-sm text-red-600">{error}</p>
                    {/* If the email already exists, offer a shortcut to switch to sign in */}
                    {error.includes('already exists') && (
                      <p className="text-sm text-[#6C6C70]">
                        Already have an account?{' '}
                        <button
                          type="button"
                          className="text-[#9B7EBD] underline font-medium"
                          onClick={() => {
                            setError(null);
                            // Switch to sign in tab by targeting the trigger
                            document.querySelector<HTMLButtonElement>('[value="signin"]')?.click();
                          }}
                        >
                          Sign in instead
                        </button>
                      </p>
                    )}
                  </div>
                )}
                {message && <p className="text-sm text-green-600">{message}</p>}
                <Button
                  type="submit"
                  className="game-panel w-full bg-[#9B7EBD] hover:bg-[#8B6EAD] text-white font-game border-2 border-[#7a6a9a]"
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