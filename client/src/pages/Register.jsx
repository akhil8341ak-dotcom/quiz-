import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import {
  Brain,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please provide a valid email';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters long';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      toast.success(`Account created! Welcome to QuizCraft, ${user.name}`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Benefits Showcase */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-mint via-brand-electric to-brand-500 text-white items-center justify-center shadow-lg shadow-brand-mint/30">
            <Brain className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
              100% Free For Students
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Create your{' '}
              <span className="bg-gradient-to-r from-brand-mint via-brand-electric to-brand-500 bg-clip-text text-transparent">
                practice account
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-dark-textMuted leading-relaxed">
              Join students collaborating on peer-reviewed questions, practicing custom sets, and
              eliminating study blind spots.
            </p>
          </div>

          <div className="space-y-3 pt-2 hidden sm:block text-left">
            {[
              'Instant targeted blitz quizzes on your weak topics',
              'Contribute peer questions and earn creator status',
              'Detailed attempt logs with question explanations',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Glass Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 bg-white/85 dark:bg-dark-surface/85 backdrop-blur-2xl p-6 sm:p-9 rounded-3xl shadow-card-soft dark:shadow-card-dark border border-slate-200/80 dark:border-dark-border space-y-6"
        >
          <div>
            <h2 className="text-2xl font-heading font-black text-slate-900 dark:text-white">
              Get Started 🚀
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1">
              Public registration automatically provisions a student learner account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-textMuted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-card border rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition ${
                    errors.name
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-dark-border focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-rose-500 font-bold">{errors.name}</p>
              )}
            </div>

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
                  placeholder="alex@university.edu"
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
                Password (min 8 chars)
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
              variant="mint"
              className="w-full py-3.5 text-base shadow-glow-mint"
            >
              Create Student Account
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-dark-textMuted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-extrabold text-brand-500 hover:text-brand-600 underline"
            >
              Sign In here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
