import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WeakTopics from './pages/WeakTopics';
import QuestionBank from './pages/QuestionBank';
import SubmitQuestion from './pages/SubmitQuestion';
import MySubmissions from './pages/MySubmissions';
import ModerationQueue from './pages/ModerationQueue';
import Quizzes from './pages/Quizzes';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import History from './pages/History';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />

        {/* Protected Student / General Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/weak-topics"
          element={
            <ProtectedRoute>
              <PageTransition>
                <WeakTopics />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Quizzes />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute>
              <PageTransition>
                <CreateQuiz />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/take-quiz/:id"
          element={
            <ProtectedRoute>
              <PageTransition>
                <TakeQuiz />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <ProtectedRoute>
              <PageTransition>
                <QuestionBank />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <PageTransition>
                <SubmitQuestion />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute>
              <PageTransition>
                <MySubmissions />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <PageTransition>
                <History />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Moderator Exclusive Route */}
        <Route
          path="/moderation"
          element={
            <ProtectedRoute requiredRole="moderator">
              <PageTransition>
                <ModerationQueue />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <div className="relative min-h-screen flex flex-col font-sans transition-colors duration-200">
              {/* Playful gamified background blobs */}
              <div className="game-blob-bg">
                <div className="game-blob w-[500px] h-[500px] bg-brand-500 top-[-150px] left-[-150px]" />
                <div className="game-blob w-[450px] h-[450px] bg-brand-pink bottom-[-100px] right-[-100px]" />
                <div className="game-blob w-[400px] h-[400px] bg-brand-mint top-[30%] right-[5%]" />
                <div className="game-blob w-[350px] h-[350px] bg-brand-yellow bottom-[20%] left-[10%]" />
              </div>

              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <AnimatedRoutes />
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
