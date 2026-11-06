import React, { useState } from 'react';
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
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isModerator, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 tap-target ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all tap-target w-full ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center gap-2.5 font-black text-xl tracking-tight text-slate-900 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg">
              Quiz<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Craft</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xs">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/weak-topics" className={navLinkClass}>
                <Target className="w-4 h-4 text-rose-500" />
                Weak Topics
              </NavLink>
              <NavLink to="/quizzes" className={navLinkClass}>
                <Sparkles className="w-4 h-4 text-amber-500" />
                Quizzes
              </NavLink>
              <NavLink to="/questions" className={navLinkClass}>
                <BookOpen className="w-4 h-4" />
                Question Bank
              </NavLink>
              <NavLink to="/submit" className={navLinkClass}>
                <PlusCircle className="w-4 h-4" />
                Submit
              </NavLink>
              <NavLink to="/my-submissions" className={navLinkClass}>
                <FileCheck className="w-4 h-4" />
                My Submissions
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
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
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

          {/* User profile & actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      {isModerator ? (
                        <span className="text-purple-700 font-extrabold tracking-wide uppercase">
                          Moderator
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Student</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="tap-target p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition tap-target"
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
              <div className="px-4 py-3 mb-3 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">{user.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role} &bull; {user.email}</div>
                  </div>
                </div>
                {isModerator && (
                  <span className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-md font-extrabold">
                    MOD
                  </span>
                )}
              </div>

              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
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
                className="block w-full text-center py-3 text-white font-bold rounded-2xl bg-blue-600 shadow-md shadow-blue-500/25 tap-target text-sm"
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
