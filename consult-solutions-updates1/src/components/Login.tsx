import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
      user {
        id
        email
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($email: String!, $password: String!, $passwordConfirm: String!) {
    register(email: $email, password: $password, passwordConfirm: $passwordConfirm) {
      success
      message
      user {
        id
        email
      }
    }
  }
`;

export default function Login({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password confirmation for registration
      if (isRegister && password !== passwordConfirm) {
        throw new Error('Passwords do not match.');
      }

      const response = await fetch('/graphql/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: isRegister ? REGISTER_MUTATION : LOGIN_MUTATION,
          variables: isRegister 
            ? { email, password, passwordConfirm }
            : { email, password },
        }),
      });

      const payload = await response.json();
      if (payload.errors?.length) {
        throw new Error(payload.errors[0].message || 'Authentication failed.');
      }

      const result = isRegister ? payload.data?.register : payload.data?.login;
      if (!result?.success) {
        throw new Error(result?.message || 'Authentication failed.');
      }

      toast({
        title: 'Success!',
        description: result.message || (isRegister ? 'Registered successfully.' : 'Logged in successfully.'),
      });

      // If onLoginSuccess callback is provided (used in Admin page), call it
      // Otherwise navigate to admin (used as standalone login page)
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      } else {
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Authentication failed.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-[0_30px_60px_-30px_rgba(15,23,42,0.75)]">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
          <CardDescription className="text-slate-300">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                placeholder="admin@netonlimited.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
                placeholder="Enter your password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 shadow-lg shadow-blue-500/30 hover:opacity-95"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            {isRegister && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-slate-800"
                onClick={() => { setIsRegister(false); setPasswordConfirm(''); }}
                disabled={loading}
              >
                Back to Sign In
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}