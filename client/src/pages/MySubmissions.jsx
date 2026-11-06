import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CustomDropdown } from '../components/ui/CustomDropdown';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit3,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';

const MySubmissions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/questions/mine', { params });
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pending question?')) return;

    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted successfully');
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.put(`/questions/${editingQuestion._id}`, {
        text: editingQuestion.text,
        options: editingQuestion.options,
        correctIndex: editingQuestion.correctIndex,
        topic: editingQuestion.topic,
        difficulty: editingQuestion.difficulty,
        explanation: editingQuestion.explanation,
      });
      toast.success('Question updated successfully!');
      setEditingQuestion(null);
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update question');
    } finally {
      setSavingEdit(false);
    }
  };

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            My Question Submissions
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-textMuted mt-1">
            Track questions you contributed, review moderator feedback, or update pending items
          </p>
        </div>
        <Link to="/submit">
          <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
            Submit Another
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border pb-2 overflow-x-auto">
        {['', 'pending', 'approved', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`tap-target px-4 py-2 rounded-2xl text-xs font-bold capitalize transition ${
              statusFilter === st
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card'
            }`}
          >
            {st || 'All'} Submissions
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No submissions found"
          description={
            statusFilter
              ? `You don't have any ${statusFilter} questions right now.`
              : "You haven't contributed any questions yet. Help expand the quiz bank!"
          }
          actionLabel="Submit a Question"
          onAction={() => {}}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q) => {
            const canEditOrDelete = q.status === 'pending';

            return (
              <Card key={q._id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={q.status}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </Badge>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>

                    {canEditOrDelete && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingQuestion({ ...q })}
                          className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-card transition tap-target"
                          title="Edit pending submission"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition tap-target"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-400 dark:text-dark-textMuted uppercase tracking-wider mb-1">
                    {q.topicDisplay}
                  </div>
                  <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base mb-3 leading-snug">
                    {q.text}
                  </h3>

                  {/* Options */}
                  <div className="space-y-1.5 mb-4">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 ${
                          i === q.correctIndex
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-brand-mint text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'bg-slate-50 dark:bg-dark-card/60 border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-md bg-white dark:bg-dark-surface border text-[10px] font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Moderator Feedback note if present */}
                  {q.moderatorNote && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs space-y-1 text-amber-900 dark:text-amber-200 mb-3">
                      <div className="font-bold flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-brand-yellow" />
                        Moderator Note:
                      </div>
                      <p>{q.moderatorNote}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-[11px] text-slate-400 dark:text-dark-textMuted">
                  <span>Submitted {new Date(q.createdAt).toLocaleDateString()}</span>
                  {q.reviewedBy && <span>Reviewed by Faculty</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Modal using UI Modal */}
      <Modal
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        title="Edit Pending Question"
        maxWidth="max-w-2xl"
      >
        {editingQuestion && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Question Text
              </label>
              <textarea
                rows={3}
                value={editingQuestion.text}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, text: e.target.value })
                }
                className="w-full p-3 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={editingQuestion.topicDisplay || editingQuestion.topic}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, topic: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <CustomDropdown
                  label="Difficulty"
                  value={editingQuestion.difficulty}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })
                  }
                  options={difficultyOptions}
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Options (Click radio for correct answer)
              </label>
              {editingQuestion.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="modalCorrectOption"
                    checked={editingQuestion.correctIndex === idx}
                    onChange={() =>
                      setEditingQuestion({ ...editingQuestion, correctIndex: idx })
                    }
                    className="accent-brand-mint"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...editingQuestion.options];
                      updated[idx] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, options: updated });
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Explanation
              </label>
              <textarea
                rows={2}
                value={editingQuestion.explanation || ''}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                }
                className="w-full p-3 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditingQuestion(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={savingEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MySubmissions;
