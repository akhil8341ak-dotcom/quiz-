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
  User,
  Sparkles,
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
    `inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition tap-target ${
      isActive
        ? 'bg-blue-50 text-blue-700 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition tap-target w-full ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-slate-900 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Brain className="w-5 h-5" />
            </div>
            <span>
              Quiz<span className="text-blue-600">Craft</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1">
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
                    `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition tap-target ${
                      isActive
                        ? 'bg-purple-100 text-purple-800'
                        : 'text-purple-700 hover:bg-purple-50'
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
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize flex items-center justify-end gap-1">
                    {isModerator ? (
                      <span className="px-1.5 py-0.2 text-[10px] bg-purple-100 text-purple-700 rounded-md font-bold">
                        MODERATOR
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">Student</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="tap-target p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 tap-target rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition tap-target"
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
              className="tap-target p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-3 mb-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{user.role} &bull; {user.email}</div>
                </div>
                {isModerator && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-md font-bold">
                    MOD
                  </span>
                )}
              </div>

              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <LayoutDashboard className="w-5 h-5" />
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
                <BookOpen className="w-5 h-5" />
                Question Bank
              </NavLink>
              <NavLink to="/submit" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <PlusCircle className="w-5 h-5" />
                Submit Question
              </NavLink>
              <NavLink to="/my-submissions" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <FileCheck className="w-5 h-5" />
                My Submissions
              </NavLink>
              <NavLink to="/history" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                <History className="w-5 h-5" />
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
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50 w-full tap-target"
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
                className="block w-full text-center py-3 text-slate-800 font-semibold rounded-xl bg-slate-100 tap-target"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 text-white font-semibold rounded-xl bg-blue-600 tap-target"
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
