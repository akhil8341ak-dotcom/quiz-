import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import {
  Brain,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Target,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Gamified Brand Showcase */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 via-brand-pink to-brand-mint text-white items-center justify-center shadow-lg shadow-brand-500/30">
            <Brain className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
              Gamified Learning Bank
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Master topics with{' '}
              <span className="bg-gradient-to-r from-brand-500 via-brand-pink to-brand-electric bg-clip-text text-transparent">
                intelligent practice
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-dark-textMuted leading-relaxed">
              Target revision where it matters most. QuizCraft pinpoints your repeated weak areas
              automatically.
            </p>
          </div>

          {/* Gamified Highlights */}
          <div className="space-y-2.5 pt-2 hidden sm:block text-left">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-dark-surface/60 backdrop-blur-md border border-slate-200/60 dark:border-dark-border shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-brand-pink flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-white block">
                  Weak Topics Blitz
                </span>
                <span className="text-slate-500 dark:text-dark-textMuted text-[11px]">
                  Algorithmic detection of repeated mistakes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-dark-surface/60 backdrop-blur-md border border-slate-200/60 dark:border-dark-border shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-brand-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-white block">
                  Peer Moderation
                </span>
                <span className="text-slate-500 dark:text-dark-textMuted text-[11px]">
                  Curated and quality-verified question bank
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Glass Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 bg-white/85 dark:bg-dark-surface/85 backdrop-blur-2xl p-6 sm:p-9 rounded-3xl shadow-card-soft dark:shadow-card-dark border border-slate-200/80 dark:border-dark-border space-y-6"
        >
          <div>
            <h2 className="text-2xl font-heading font-black text-slate-900 dark:text-white">
              Welcome back! 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1">
              Sign in to continue your quizzes and check your progress
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-textMuted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@quizcraft.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-card border rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-dark-border focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500 font-bold">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-textMuted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-dark-card border rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition ${
                    errors.password
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-dark-border focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 font-bold">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full py-3.5 text-base shadow-glow-primary"
            >
              Sign In to QuizCraft
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-5 border-t border-slate-100 dark:border-dark-border space-y-2.5">
            <div className="text-[11px] font-black text-slate-400 dark:text-dark-textMuted uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-500" />
              1-Click Demo Accounts (Instant Fill)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoFill('student1@quizcraft.com', 'Student@123')}
                className="p-3 text-xs bg-gradient-to-br from-indigo-50/80 to-blue-50/50 dark:from-dark-card dark:to-dark-cardHover hover:border-brand-400 rounded-2xl text-left transition border border-slate-200 dark:border-dark-border shadow-xs group"
              >
                <span className="block font-black text-brand-600 dark:text-brand-300 group-hover:underline">
                  Student Demo
                </span>
                <span className="text-[11px] text-slate-500 dark:text-dark-textMuted">
                  Has Weak Topics Blitz
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('moderator@quizcraft.com', 'Moderator@123')}
                className="p-3 text-xs bg-gradient-to-br from-purple-50/80 to-pink-50/50 dark:from-dark-card dark:to-dark-cardHover hover:border-brand-pink rounded-2xl text-left transition border border-slate-200 dark:border-dark-border shadow-xs group"
              >
                <span className="block font-black text-brand-pink dark:text-pink-400 group-hover:underline">
                  Moderator Demo
                </span>
                <span className="text-[11px] text-slate-500 dark:text-dark-textMuted">
                  Has Queue Access
                </span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 dark:text-dark-textMuted">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-extrabold text-brand-500 hover:text-brand-600 underline"
            >
              Create free student account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
