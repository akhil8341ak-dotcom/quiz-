import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

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

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
            {/* Aurora Ambient Background */}
            <div className="aurora-bg" />
            
            {/* Floating ambient glow accents */}
            <div className="fixed top-12 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-float -z-10" />
            <div className="fixed bottom-24 right-1/4 w-[30rem] h-[30rem] bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-float -z-10" style={{ animationDelay: '-6s' }} />
            <div className="fixed top-1/2 right-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-float -z-10" style={{ animationDelay: '-3s' }} />

            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Student / General Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/weak-topics"
                  element={
                    <ProtectedRoute>
                      <WeakTopics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes"
                  element={
                    <ProtectedRoute>
                      <Quizzes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-quiz"
                  element={
                    <ProtectedRoute>
                      <CreateQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/take-quiz/:id"
                  element={
                    <ProtectedRoute>
                      <TakeQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/questions"
                  element={
                    <ProtectedRoute>
                      <QuestionBank />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/submit"
                  element={
                    <ProtectedRoute>
                      <SubmitQuestion />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-submissions"
                  element={
                    <ProtectedRoute>
                      <MySubmissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />

                {/* Moderator Exclusive Route */}
                <Route
                  path="/moderation"
                  element={
                    <ProtectedRoute requiredRole="moderator">
                      <ModerationQueue />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
