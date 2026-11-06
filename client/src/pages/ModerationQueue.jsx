import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Check,
  X,
  Edit3,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';

const ModerationQueue = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [modNote, setModNote] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions/pending');
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending questions');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, status) => {
    setActingId(id);
    const note = modNote[id] || '';
    try {
      await api.patch(`/questions/${id}/moderate`, { status, note });
      toast.success(`Question marked as ${status}!`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Moderation action failed');
    } finally {
      setActingId(null);
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
      setQuestions((prev) =>
        prev.map((q) => (q._id === editingQuestion._id ? res.data.question : q))
      );
      setEditingQuestion(null);
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
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-black rounded-full uppercase tracking-wider border border-purple-200 dark:border-purple-800">
              Moderator Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            Moderation Queue
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-textMuted mt-1">
            Review student submissions, edit for clarity or accuracy, and approve or reject with feedback
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-heading font-black text-brand-pink">
            {questions.length}
          </span>
          <span className="block text-xs font-bold text-slate-500 dark:text-dark-textMuted">
            Pending Questions
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title="Moderation queue is empty!"
          description="All student submitted questions have been reviewed and moderated. Excellent work maintaining bank quality!"
        />
      ) : (
        <div className="space-y-6">
          {questions.map((q) => {
            const isActing = actingId === q._id;

            return (
              <Card key={q._id} className="p-6 sm:p-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-dark-border pb-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 rounded-xl text-xs font-bold">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                    <span className="text-xs text-slate-400 dark:text-dark-textMuted">
                      Submitted by <strong className="text-slate-700 dark:text-slate-300">{q.submittedBy?.name || 'Anonymous Student'}</strong> ({q.submittedBy?.email || 'N/A'})
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingQuestion({ ...q })}
                    icon={<Edit3 className="w-3.5 h-3.5 text-brand-500" />}
                  >
                    Edit Before Review
                  </Button>
                </div>

                {/* Question Text */}
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-relaxed">
                  {q.text}
                </h3>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, idx) => {
                    const isCorrect = idx === q.correctIndex;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2.5 transition ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-brand-mint text-emerald-900 dark:text-emerald-300 font-bold'
                            : 'bg-slate-50 dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? 'bg-brand-mint text-emerald-950 shadow-sm'
                              : 'bg-white dark:bg-dark-surface border text-slate-500 dark:text-dark-textMuted'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="truncate">{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] uppercase font-black tracking-wider ml-auto text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-200/80 dark:border-dark-border text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white block mb-0.5">
                      Provided Explanation:
                    </strong>
                    {q.explanation}
                  </div>
                )}

                {/* Moderator Decision Controls */}
                <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <MessageSquare className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={modNote[q._id] || ''}
                      onChange={(e) =>
                        setModNote({ ...modNote, [q._id]: e.target.value })
                      }
                      placeholder="Add an optional moderator feedback note for student..."
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isActing}
                      loading={isActing}
                      onClick={() => handleModerate(q._id, 'rejected')}
                      icon={<X className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="mint"
                      size="sm"
                      disabled={isActing}
                      loading={isActing}
                      onClick={() => handleModerate(q._id, 'approved')}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Approve & Publish
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Question Modal */}
      <Modal
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        title="Edit Submission Before Deciding"
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
                Options (Click radio to mark correct answer)
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

export default ModerationQueue;
