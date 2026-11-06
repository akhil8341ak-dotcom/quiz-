import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Sparkles,
  PlusCircle,
  Play,
  Trash2,
  BookOpen,
  Zap,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-brand-500 block mb-1">
            Practice Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            Quizzes & Practice Tests
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-textMuted mt-1">
            Choose from peer-created quizzes or generate an instant test customized by topic and difficulty
          </p>
        </div>
        <Link to="/create-quiz">
          <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
            Create New Quiz
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No quizzes available yet"
          description="Create an auto-generated or hand-picked quiz to start practicing and testing your knowledge!"
          actionLabel="Build a Quiz"
          onAction={() => navigate('/create-quiz')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isOwner = user && quiz.createdBy && quiz.createdBy._id === user._id;
            const canDelete = isOwner || isModerator;

            return (
              <Card
                key={quiz._id}
                hover
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-black bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-500/20 dark:to-indigo-500/20 text-brand-600 dark:text-brand-300 border border-brand-200/60 dark:border-brand-500/30 px-3 py-1 rounded-xl shadow-xs">
                      {quiz.questionCount} Questions
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition tap-target"
                        title="Delete quiz"
                        aria-label="Delete quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="font-heading font-black text-slate-900 dark:text-white text-base mb-1.5 leading-snug tracking-tight">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-dark-textMuted line-clamp-2 mb-4 font-medium">
                    {quiz.description || 'Custom generated practice quiz.'}
                  </p>

                  {/* Topics Covered */}
                  {quiz.topics && quiz.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {quiz.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg capitalize border border-slate-200/60 dark:border-dark-border"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-dark-textMuted font-medium truncate max-w-[140px]">
                    By {quiz.createdBy?.name || 'Faculty / Peer'}
                  </span>
                  <Link to={`/take-quiz/${quiz._id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      Take Quiz
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
