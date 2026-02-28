import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-dvh bg-cream flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm"
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <h1 className="heading text-4xl text-ink mb-1">WanderDrop</h1>
          <p className="font-instrument text-dusk text-sm">
            Let the unknown choose your next adventure
          </p>
        </div>

        {/* Auth form card */}
        <div className="bg-parchment rounded-3xl p-6 shadow-warm">
          {/* Toggle */}
          <div className="flex bg-sand/50 rounded-2xl p-1 mb-6">
            {(['Login', 'Sign Up'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setIsLogin(tab === 'Login');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl font-instrument font-medium text-sm transition-all ${
                  (tab === 'Login') === isLogin
                    ? 'bg-cream text-ink shadow-warm-sm'
                    : 'text-dusk'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-cream border border-sand rounded-xl font-instrument text-ink placeholder:text-dusk/40 focus:outline-none focus:ring-2 focus:ring-clay/30 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-cream border border-sand rounded-xl font-instrument text-ink placeholder:text-dusk/40 focus:outline-none focus:ring-2 focus:ring-clay/30 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm font-instrument bg-red-50 px-3 py-2 rounded-xl"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-clay text-cream font-instrument font-semibold rounded-2xl shadow-warm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
