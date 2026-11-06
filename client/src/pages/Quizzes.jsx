import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  PlusCircle,
  Play,
  HelpCircle,
  Trash2,
  Loader2,
  Clock,
  BookOpen,
} from 'lucide-react';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isModerator } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quizzes');
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      toast.success('Quiz deleted successfully');
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quizzes & Practice Tests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose from peer-created quizzes or generate an instant test customized by topic and difficulty
          </p>
        </div>
        <Link
          to="/create-quiz"
          className="tap-target px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 self-start transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading quiz library...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
          <Sparkles className="w-12 h-12 mx-auto text-amber-400 mb-2" />
          <p className="font-bold text-base text-slate-700">No quizzes available yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Create an auto-generated or hand-picked quiz to start practicing!
          </p>
          <Link
            to="/create-quiz"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl tap-target"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Build a Quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => {
            const isOwner = user && quiz.createdBy && quiz.createdBy._id === user._id;
            const canDelete = isOwner || isModerator;

            return (
              <div
                key={quiz._id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                      {quiz.questionCount} Questions
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                        title="Delete quiz"
                        aria-label="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mb-1.5 leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                    {quiz.description || 'Custom generated practice quiz.'}
                  </p>

                  {/* Topics Covered */}
                  {quiz.topics && quiz.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {quiz.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md capitalize"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    By {quiz.createdBy?.name || 'Faculty / Peer'}
                  </span>
                  <Link
                    to={`/take-quiz/${quiz._id}`}
                    className="tap-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Take Quiz
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quizzes;

