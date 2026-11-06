import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './ui/Avatar';
import {
  Brain,
  LayoutDashboard,
  Target,
  BookOpen,
  PlusCircle,
  FileCheck,
  ShieldCheck,
  History,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Zap,
  Flame,
  Award,
  Sun,
  Moon,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isModerator, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const practiceDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (practiceDropdownRef.current && !practiceDropdownRef.current.contains(event.target)) {
        setPracticeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all tap-target ${
      isActive
        ? 'bg-gradient-to-r from-brand-500 to-brand-electric text-white shadow-md shadow-brand-500/30'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all tap-target w-full ${
      isActive
        ? 'bg-gradient-to-r from-brand-500 to-brand-electric text-white shadow-lg shadow-brand-500/25'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-bg/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-dark-border/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with vibrant glowing badge */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center gap-2.5 font-heading font-black text-xl tracking-tight text-slate-900 dark:text-white group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 via-brand-electric to-brand-mint text-white flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-lg">
              Quiz<span className="bg-gradient-to-r from-brand-500 via-brand-pink to-brand-electric bg-clip-text text-transparent">Craft</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/80 dark:bg-dark-surface/90 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-dark-border shadow-xs">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>

              {/* Practice Modes Dropdown */}
              <div className="relative" ref={practiceDropdownRef}>
                <button
                  type="button"
                  onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all tap-target ${
                    practiceDropdownOpen
                      ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-dark-card/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-brand-yellow" />
                  Practice
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      practiceDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {practiceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-60 rounded-3xl bg-white dark:bg-dark-surface p-2 shadow-2xl border border-slate-200/80 dark:border-dark-border z-50"
                    >
                      <Link
                        to="/weak-topics"
                        onClick={() => setPracticeDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-brand-pink flex items-center justify-center flex-shrink-0">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Weak Topics Blitz</div>
                          <div className="text-[10px] text-slate-400 dark:text-dark-textMuted">
                            Target problem areas
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/quizzes"
                        onClick={() => setPracticeDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-brand-500/10 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-300 transition"
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Browse All Quizzes</div>
                          <div className="text-[10px] text-slate-400 dark:text-dark-textMuted">
                            Curated practice sets
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/create-quiz"
                        onClick={() => setPracticeDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-200 hover:text-brand-electric dark:hover:text-blue-400 transition"
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-brand-electric flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Create Custom Quiz</div>
                          <div className="text-[10px] text-slate-400 dark:text-dark-textMuted">
                            Hand-pick or auto-generate
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink to="/weak-topics" className={navLinkClass}>
                <Target className="w-4 h-4 text-brand-pink" />
                Weak Topics
              </NavLink>

              <NavLink to="/questions" className={navLinkClass}>
                <BookOpen className="w-4 h-4" />
                Question Bank
              </NavLink>

              <NavLink to="/submit" className={navLinkClass}>
                <PlusCircle className="w-4 h-4 text-brand-mint" />
                Submit
              </NavLink>

              <NavLink to="/my-submissions" className={navLinkClass}>
                <FileCheck className="w-4 h-4 text-brand-electric" />
                Submissions
              </NavLink>

              <NavLink to="/history" className={navLinkClass}>
                <History className="w-4 h-4" />
                History
              </NavLink>

              {isModerator && (
                <NavLink
                  to="/moderation"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all tap-target ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-brand-pink text-white shadow-md shadow-purple-500/25'
                        : 'text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4" />
                  Moderate
                </NavLink>
              )}
            </nav>
          )}

          {/* Right Action Icons: Dark Mode Toggle & User Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border text-slate-600 dark:text-brand-yellow hover:text-slate-900 dark:hover:text-yellow-300 transition-colors tap-target"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-dark-card rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-xs hover:shadow-md transition-all tap-target"
                >
                  <Avatar name={user.name} role={user.role} size="sm" />
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight max-w-[110px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      {isModerator ? (
                        <span className="text-brand-pink font-black">Moderator</span>
                      ) : (
                        <span className="text-brand-500 dark:text-brand-400">Student</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-3xl bg-white dark:bg-dark-surface p-3 shadow-2xl border border-slate-200/90 dark:border-dark-border z-50 space-y-2"
                    >
                      <div className="p-3 bg-gradient-to-br from-brand-50/80 to-purple-50/50 dark:from-dark-card dark:to-dark-cardHover rounded-2xl border border-brand-100/70 dark:border-dark-border">
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-dark-textMuted truncate">
                          {user.email}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-500 text-white shadow-xs">
                          <Award className="w-3 h-3" />
                          {user.role}
                        </div>
                      </div>

                      <div className="space-y-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Link
                          to="/weak-topics"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card transition"
                        >
                          <Target className="w-4 h-4 text-brand-pink" />
                          Weak Topics Blitz
                        </Link>
                        <Link
                          to="/my-submissions"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card transition"
                        >
                          <FileCheck className="w-4 h-4 text-brand-electric" />
                          My Question Submissions
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card transition"
                        >
                          <History className="w-4 h-4 text-slate-400" />
                          Attempt Logs & Reviews
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-dark-border">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl w-full transition tap-target"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white tap-target rounded-2xl transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-black bg-gradient-to-r from-brand-500 to-brand-electric hover:brightness-105 text-white rounded-2xl shadow-md shadow-brand-500/25 transition tap-target"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Dark Mode Toggle + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-brand-yellow tap-target"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="tap-target p-2 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card focus:outline-none transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-slate-200/90 dark:border-dark-border bg-white/95 dark:bg-dark-surface/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-1.5 shadow-2xl overflow-hidden"
          >
            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 mb-3 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 dark:from-dark-card dark:to-dark-cardHover border border-brand-100 dark:border-dark-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} role={user.role} size="md" />
                    <div>
                      <div className="font-black text-slate-900 dark:text-white text-sm">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-dark-textMuted capitalize">
                        {user.role} &bull; {user.email}
                      </div>
                    </div>
                  </div>
                  {isModerator && (
                    <span className="px-2 py-0.5 text-[10px] bg-brand-pink text-white rounded-lg font-black">
                      MOD
                    </span>
                  )}
                </div>

                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <LayoutDashboard className="w-5 h-5 text-brand-500" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/weak-topics"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Target className="w-5 h-5 text-brand-pink" />
                  Weak Topics Analysis
                </NavLink>
                <NavLink
                  to="/quizzes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Sparkles className="w-5 h-5 text-brand-yellow" />
                  Quizzes & Practice
                </NavLink>
                <NavLink
                  to="/questions"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <BookOpen className="w-5 h-5 text-brand-500" />
                  Question Bank
                </NavLink>
                <NavLink
                  to="/submit"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <PlusCircle className="w-5 h-5 text-brand-mint" />
                  Submit Question
                </NavLink>
                <NavLink
                  to="/my-submissions"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <FileCheck className="w-5 h-5 text-brand-electric" />
                  My Submissions
                </NavLink>
                <NavLink
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <History className="w-5 h-5 text-slate-400" />
                  Attempt History
                </NavLink>
                {isModerator && (
                  <NavLink
                    to="/moderation"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    <ShieldCheck className="w-5 h-5 text-brand-pink" />
                    Moderation Queue
                  </NavLink>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-dark-border">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 w-full tap-target transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-3 text-slate-800 dark:text-white font-bold rounded-2xl bg-slate-100 dark:bg-dark-card tap-target text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-3 text-white font-bold rounded-2xl bg-gradient-to-r from-brand-500 to-brand-electric shadow-md tap-target text-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
