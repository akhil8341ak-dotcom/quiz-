import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Brain, Lock, Mail, ArrowRight, Loader2, KeyRound, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white items-center justify-center shadow-xl shadow-blue-500/25 ring-4 ring-blue-500/10 mb-2">
            <Brain className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign in to QuizCraft
          </h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Peer-created practice question bank with algorithmic weak topics analysis
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-9 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student1@quizcraft.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 font-bold">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition ${
                    errors.password
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-bold">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 tap-target"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons for Professor/Reviewer */}
          <div className="pt-5 border-t border-slate-100 space-y-2.5">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              1-Click Demo Accounts (Instant Fill)
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoFill('student1@quizcraft.com', 'Student@123')}
                className="p-3 text-xs bg-gradient-to-br from-blue-50/80 to-indigo-50/50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl text-left transition border border-blue-200/70 shadow-xs"
              >
                <span className="block font-black text-blue-950">Student Demo</span>
                <span className="text-[11px] text-blue-700 font-bold">Has Weak Topics</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('moderator@quizcraft.com', 'Moderator@123')}
                className="p-3 text-xs bg-gradient-to-br from-purple-50/80 to-violet-50/50 hover:from-purple-100 hover:to-violet-100 rounded-2xl text-left transition border border-purple-200/70 shadow-xs"
              >
                <span className="block font-black text-purple-950">Moderator Demo</span>
                <span className="text-[11px] text-purple-700 font-bold">Queue Access</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500">
          New to QuizCraft?{' '}
          <Link to="/register" className="font-extrabold text-blue-600 hover:text-blue-700 underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
