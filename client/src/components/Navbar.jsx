import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Compass,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isModerator, logout } = useAuth();
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
    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 tap-target ${
      isActive
        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all tap-target w-full ${
      isActive
        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/60 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with vibrant glowing badge */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center gap-2.5 font-black text-xl tracking-tight text-slate-900 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <Brain className="w-5 h-5 animate-soft-pulse" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg">
              Quiz<span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Craft</span>
            </span>
          </Link>

          {/* Desktop Navigation Links with Interactive Dropdown */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xs">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>

              {/* Practice Modes Dropdown */}
              <div className="relative" ref={practiceDropdownRef}>
                <button
                  type="button"
                  onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 tap-target ${
                    practiceDropdownOpen
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Practice
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${practiceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {practiceDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-2xl p-2 shadow-2xl border border-slate-200/80 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <Link
                      to="/weak-topics"
                      onClick={() => setPracticeDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Weak Topics Blitz</div>
                        <div className="text-[10px] text-slate-400">Target problem topics</div>
                      </div>
                    </Link>

                    <Link
                      to="/quizzes"
                      onClick={() => setPracticeDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Browse All Quizzes</div>
                        <div className="text-[10px] text-slate-400">Public & custom sets</div>
                      </div>
                    </Link>

                    <Link
                      to="/create-quiz"
                      onClick={() => setPracticeDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Create Custom Quiz</div>
                        <div className="text-[10px] text-slate-400">Auto-generate or hand-pick</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <NavLink to="/weak-topics" className={navLinkClass}>
                <Target className="w-4 h-4 text-rose-500" />
                Weak Topics
              </NavLink>

              <NavLink to="/questions" className={navLinkClass}>
                <BookOpen className="w-4 h-4" />
                Question Bank
              </NavLink>

              <NavLink to="/submit" className={navLinkClass}>
                <PlusCircle className="w-4 h-4 text-emerald-500" />
                Submit
              </NavLink>

              <NavLink to="/my-submissions" className={navLinkClass}>
                <FileCheck className="w-4 h-4 text-cyan-500" />
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
                    `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all tap-target ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25'
                        : 'text-purple-700 hover:bg-purple-100/80'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4" />
                  Moderate
                </NavLink>
              )}
            </nav>
          )}

          {/* User profile with Interactive Dropdown */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 bg-white/80 hover:bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all tap-target"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-800 leading-tight max-w-[110px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {isModerator ? (
                        <span className="text-purple-600 font-black">Moderator</span>
                      ) : (
                        <span className="text-indigo-600">Student</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white/95 backdrop-blur-2xl p-3 shadow-2xl border border-slate-200/90 animate-in fade-in slide-in-from-top-2 duration-200 z-50 space-y-2">
                    <div className="p-3 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 rounded-2xl border border-indigo-100/70">
                      <div className="text-xs font-black text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                        <Award className="w-3 h-3" />
                        {user.role} Role
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs font-bold text-slate-700">
                      <Link
                        to="/weak-topics"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
                      >
                        <Target className="w-4 h-4 text-rose-500" />
                        Weak Topics Analysis
                      </Link>
                      <Link
                        to="/my-submissions"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
                      >
                        <FileCheck className="w-4 h-4 text-cyan-500" />
                        My Question Submissions
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
                      >
                        <History className="w-4 h-4 text-slate-500" />
                        Attempt Logs & Reviews
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl w-full transition tap-target"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 tap-target rounded-xl transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-black bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/25 transition tap-target"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="tap-target p-2 rounded-2xl text-slate-700 hover:bg-slate-100 focus:outline-none transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200/90 bg-white/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-1.5 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3 mb-3 rounded-2xl bg-gradient-to-r from-violet-50 via-indigo-50 to-cyan-50 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{user.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role} &bull; {user.email}</div>
                  </div>
                </div>
                {isModerator && (
                  <span className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-md font-black">
                    MOD
                  </span>
                )}
              </div>

              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                Dashboard
              </NavLink>
              <NavLink to="/weak-topics" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <Target className="w-5 h-5 text-rose-500" />
                Weak Topics Analysis
              </NavLink>
              <NavLink to="/quizzes" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <Sparkles className="w-5 h-5 text-amber-500" />
                Quizzes & Practice
              </NavLink>
              <NavLink to="/questions" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Question Bank
              </NavLink>
              <NavLink to="/submit" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                Submit Question
              </NavLink>
              <NavLink to="/my-submissions" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <FileCheck className="w-5 h-5 text-cyan-500" />
                My Submissions
              </NavLink>
              <NavLink to="/history" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <History className="w-5 h-5 text-slate-500" />
                Attempt History
              </NavLink>
              {isModerator && (
                <NavLink to="/moderation" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  Moderation Queue
                </NavLink>
              )}

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 w-full tap-target transition"
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
                className="block w-full text-center py-3 text-slate-800 font-bold rounded-2xl bg-slate-100 tap-target text-sm"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 text-white font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md tap-target text-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
