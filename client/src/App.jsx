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
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
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

