import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import {
  History as HistoryIcon,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

const History = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);

  // Review modal
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchAttempts();
  }, [page]);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attempts/mine', { params: { page, limit: 10 } });
      setAttempts(res.data.attempts || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalAttempts(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load past attempts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = async (attemptId) => {
    setLoadingReview(true);
    try {
      const res = await api.get(`/attempts/${attemptId}`);
      setReviewAttempt(res.data.attempt);
    } catch (err) {
      toast.error('Failed to load attempt details');
    } finally {
      setLoadingReview(false);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
          Attempt History
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-textMuted mt-1">
          Review your past test scores, time investments, and question-level outcomes
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : attempts.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No past attempts recorded"
          description="Complete your first quiz to review scores, track improvement, and diagnose weak topics!"
          actionLabel="Browse Quizzes"
          onAction={() => {}}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-dark-card border-b border-slate-200 dark:border-dark-border text-slate-500 dark:text-dark-textMuted font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Quiz Title</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6">Percentage</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border font-medium">
                {attempts.map((att) => {
                  const isPassing = att.percentage >= 60;
                  return (
                    <tr
                      key={att._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-dark-card/60 transition"
                    >
                      <td className="py-4 px-6 font-heading font-bold text-slate-900 dark:text-white">
                        {att.quiz?.title || 'Practice Quiz'}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-dark-textMuted text-xs">
                        {new Date(att.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                        {att.score} / {att.total}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            isPassing
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-dark-textMuted text-xs flex items-center gap-1.5 pt-5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatTimer(att.durationSeconds)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenReview(att._id)}
                          icon={<Eye className="w-3.5 h-3.5 text-brand-500" />}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {attempts.map((att) => {
              const isPassing = att.percentage >= 60;
              return (
                <Card key={att._id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white text-sm">
                      {att.quiz?.title || 'Practice Quiz'}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isPassing
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {att.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-dark-textMuted py-2 border-y border-slate-100 dark:border-dark-border">
                    <div>
                      <span>Score: </span>
                      <strong className="text-slate-800 dark:text-white">
                        {att.score} / {att.total}
                      </strong>
                    </div>
                    <div>
                      <span>Time: </span>
                      <strong className="text-slate-800 dark:text-white">
                        {formatTimer(att.durationSeconds)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 dark:text-dark-textMuted">
                      {new Date(att.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenReview(att._id)}
                      icon={<Eye className="w-3.5 h-3.5 text-brand-500" />}
                    >
                      Review Attempt
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-dark-border">
              <span className="text-xs font-bold text-slate-500 dark:text-dark-textMuted">
                Page {page} of {totalPages} ({totalAttempts} attempts)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Attempt Modal */}
      <Modal
        isOpen={Boolean(reviewAttempt)}
        onClose={() => setReviewAttempt(null)}
        title="Attempt Review"
        maxWidth="max-w-3xl"
      >
        {reviewAttempt && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {reviewAttempt.quiz?.title || 'Practice Quiz'}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-dark-textMuted">
                  <span className="font-bold text-slate-800 dark:text-white">
                    Score: {reviewAttempt.score} / {reviewAttempt.total} ({reviewAttempt.percentage}%)
                  </span>
                  <span>&bull;</span>
                  <span>Duration: {formatTimer(reviewAttempt.durationSeconds)}</span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                  reviewAttempt.percentage >= 60
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                }`}
              >
                {reviewAttempt.percentage >= 60 ? 'Passed' : 'Needs Review'}
              </span>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              {reviewAttempt.answers?.map((ans, i) => {
                const q = ans.question;
                if (!q) {
                  return (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 dark:bg-dark-card rounded-2xl text-xs text-slate-500"
                    >
                      Question data unavailable
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    className={`p-5 rounded-2xl border ${
                      ans.isCorrect
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-dark-textMuted">
                        Question {i + 1}
                      </span>
                      {ans.isCorrect ? (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>

                    <p className="font-heading font-bold text-slate-900 dark:text-white text-sm mb-3">
                      {q.text}
                    </p>

                    <div className="space-y-1.5 text-xs">
                      {q.options?.map((opt, optIdx) => {
                        const isChosen = ans.selectedIndex === optIdx;
                        const isCorrectOpt = q.correctIndex === optIdx;

                        let style =
                          'bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300';
                        if (isCorrectOpt) {
                          style =
                            'bg-emerald-100 dark:bg-emerald-950/60 border-brand-mint text-emerald-950 dark:text-emerald-200 font-bold';
                        } else if (isChosen && !ans.isCorrect) {
                          style =
                            'bg-rose-100 dark:bg-rose-950/60 border-rose-300 text-rose-950 dark:text-rose-200 font-bold';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}
                          >
                            <span>
                              <strong className="mr-1.5">
                                {String.fromCharCode(65 + optIdx)}.
                              </strong>
                              {opt}
                            </span>
                            {isCorrectOpt && (
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                Correct Answer
                              </span>
                            )}
                            {isChosen && !isCorrectOpt && (
                              <span className="text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-3 p-3 bg-brand-50/70 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-xl text-xs text-brand-900 dark:text-brand-200 leading-relaxed">
                        <strong className="block mb-0.5 text-brand-700 dark:text-brand-300">
                          Explanation:
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-right pt-2">
              <Button
                variant="primary"
                onClick={() => setReviewAttempt(null)}
              >
                Close Review
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default History;
