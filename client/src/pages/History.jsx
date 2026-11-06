import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  History as HistoryIcon,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Attempt History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your past test scores, time investments, and question-level outcomes
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Retrieving test logs...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
          <HistoryIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-base text-slate-700">No past attempts found</p>
          <p className="text-xs text-slate-400 mt-1">
            Complete your first quiz to review scores and track improvement here!
          </p>
          <Link
            to="/quizzes"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl tap-target"
          >
            Browse Quizzes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Quiz Title</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6">Percentage</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attempts.map((att) => {
                  const isPassing = att.percentage >= 60;
                  return (
                    <tr key={att._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {att.quiz?.title || 'Practice Quiz'}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(att.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {att.score} / {att.total}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isPassing
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatTimer(att.durationSeconds)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenReview(att._id)}
                          className="tap-target px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review
                        </button>
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
                <div
                  key={att._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {att.quiz?.title || 'Practice Quiz'}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isPassing
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {att.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 py-2 border-y border-slate-100">
                    <div>
                      <span>Score: </span>
                      <strong className="text-slate-800">
                        {att.score} / {att.total}
                      </strong>
                    </div>
                    <div>
                      <span>Time: </span>
                      <strong className="text-slate-800">
                        {formatTimer(att.durationSeconds)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">
                      {new Date(att.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleOpenReview(att._id)}
                      className="tap-target px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review Attempt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 tap-target"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 tap-target"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Attempt Modal */}
      {reviewAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Attempt Review
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {reviewAttempt.quiz?.title || 'Practice Quiz'}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-800">
                    Score: {reviewAttempt.score} / {reviewAttempt.total} ({reviewAttempt.percentage}%)
                  </span>
                  <span>&bull;</span>
                  <span>Duration: {formatTimer(reviewAttempt.durationSeconds)}</span>
                </div>
              </div>
              <button
                onClick={() => setReviewAttempt(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 tap-target"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              {reviewAttempt.answers?.map((ans, i) => {
                const q = ans.question;
                if (!q) {
                  return (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500">
                      Question data unavailable
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    className={`p-5 rounded-2xl border ${
                      ans.isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Question {i + 1}</span>
                      {ans.isCorrect ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-slate-900 text-sm mb-3">{q.text}</p>

                    <div className="space-y-1.5 text-xs">
                      {q.options?.map((opt, optIdx) => {
                        const isChosen = ans.selectedIndex === optIdx;
                        const isCorrectOpt = q.correctIndex === optIdx;

                        let style = 'bg-white border-slate-200 text-slate-600';
                        if (isCorrectOpt) {
                          style = 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold';
                        } else if (isChosen && !ans.isCorrect) {
                          style = 'bg-rose-100 border-rose-300 text-rose-950 font-bold';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}
                          >
                            <span>
                              <strong className="mr-1.5">{String.fromCharCode(65 + optIdx)}.</strong>
                              {opt}
                            </span>
                            {isCorrectOpt && (
                              <span className="text-emerald-700 font-bold text-[10px]">
                                Correct Answer
                              </span>
                            )}
                            {isChosen && !isCorrectOpt && (
                              <span className="text-rose-700 font-bold text-[10px]">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-3 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
                        <strong className="block mb-0.5">Explanation:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setReviewAttempt(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl tap-target"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

