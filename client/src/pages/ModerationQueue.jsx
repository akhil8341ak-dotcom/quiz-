import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import {
  ShieldCheck,
  Check,
  X,
  Edit3,
  MessageSquare,
  Loader2,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-extrabold rounded-md uppercase tracking-wider">
              Moderator Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Moderation Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review student submissions, edit for clarity or accuracy, and approve or reject with notes
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-purple-700">{questions.length}</span>
          <span className="block text-xs font-semibold text-slate-500">Pending Review</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading pending questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
          <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
          <p className="font-bold text-base text-slate-800">Queue is completely empty!</p>
          <p className="text-xs text-slate-400 mt-1">
            All submitted questions have been reviewed and moderated. Great job!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => {
            const isActing = actingId === q._id;

            return (
              <div
                key={q._id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                    <span className="text-xs text-slate-400">
                      Submitted by <strong className="text-slate-700">{q.createdBy?.name}</strong> (
                      {q.createdBy?.email})
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingQuestion({ ...q })}
                    className="tap-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Inline Edit
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-base">{q.text}</h3>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border ${
                          q.correctIndex === i
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {q.correctIndex === i && (
                          <span className="ml-2 text-emerald-700 font-extrabold text-[11px]">
                            &bull; Correct Answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="p-3 bg-blue-50/60 rounded-xl text-xs text-blue-900 border border-blue-100">
                      <span className="font-bold">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>

                {/* Moderation note input & action buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <MessageSquare className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={modNote[q._id] || ''}
                      onChange={(e) =>
                        setModNote({ ...modNote, [q._id]: e.target.value })
                      }
                      placeholder="Add an optional feedback note for the submitter..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleModerate(q._id, 'rejected')}
                      disabled={isActing}
                      className="tap-target px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleModerate(q._id, 'approved')}
                      disabled={isActing}
                      className="tap-target px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Moderator Inline Edit
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  rows={2}
                  value={editingQuestion.text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, text: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={editingQuestion.topicDisplay || editingQuestion.topic}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, topic: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Options & Correct Answer</label>
                {editingQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="modEditRadio"
                      checked={editingQuestion.correctIndex === i}
                      onChange={() =>
                        setEditingQuestion({ ...editingQuestion, correctIndex: i })
                      }
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save & Close'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
