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
  BookOpen,
  Zap,
  Flame,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
            Practice Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quizzes & Practice Tests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose from peer-created quizzes or generate an instant test customized by topic and difficulty
          </p>
        </div>
        <Link
          to="/create-quiz"
          className="tap-target px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2 self-start transition hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Loading quiz bank...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white/90 p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
          <Sparkles className="w-12 h-12 mx-auto text-amber-400 mb-2" />
          <p className="font-bold text-base text-slate-700">No quizzes available yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Create an auto-generated or hand-picked quiz to start practicing!
          </p>
          <Link
            to="/create-quiz"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-xl tap-target shadow-md shadow-indigo-500/20"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Build a Quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isOwner = user && quiz.createdBy && quiz.createdBy._id === user._id;
            const canDelete = isOwner || isModerator;

            return (
              <div
                key={quiz._id}
                className="glass-card-energetic p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-black bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200/60 px-3 py-1 rounded-xl shadow-xs">
                      {quiz.questionCount} Questions
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition"
                        title="Delete quiz"
                        aria-label="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="font-black text-slate-900 text-base mb-1.5 leading-snug tracking-tight">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">
                    {quiz.description || 'Custom generated practice quiz.'}
                  </p>

                  {/* Topics Covered */}
                  {quiz.topics && quiz.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {quiz.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg capitalize border border-slate-200/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                    By {quiz.createdBy?.name || 'Faculty / Peer'}
                  </span>
                  <Link
                    to={`/take-quiz/${quiz._id}`}
                    className="tap-target px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 transition hover:-translate-y-0.5 active:translate-y-0"
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
