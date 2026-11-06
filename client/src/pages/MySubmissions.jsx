import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit3,
  Loader2,
  PlusCircle,
  X,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track questions you contributed, review moderator feedback, or update pending items
          </p>
        </div>
        <Link
          to="/submit"
          className="tap-target px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 self-start transition"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Another
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['', 'pending', 'approved', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`tap-target px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
              statusFilter === st
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st || 'All'} Submissions
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading your questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
          <FileCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-base text-slate-700">No submissions found</p>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter
              ? `You don't have any ${statusFilter} questions right now.`
              : 'You haven’t submitted any questions yet. Contribute your first question!'}
          </p>
          <Link
            to="/submit"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl tap-target"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Submit a Question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isPending = q.status === 'pending';
            const isApproved = q.status === 'approved';
            const isRejected = q.status === 'rejected';

            return (
              <div
                key={q._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Chip */}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-500" /> Pending Review
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Approved
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-500" /> Rejected
                      </span>
                    )}

                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{q.text}</h3>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border ${
                          q.correctIndex === i
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="font-bold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {q.correctIndex === i && (
                          <span className="ml-1 text-[10px] text-emerald-700 font-bold">(Correct)</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Moderator Note */}
                  {q.moderationNote && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-purple-900">Moderator Note:</span>{' '}
                        <span>{q.moderationNote}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions for Pending questions */}
                {isPending && (
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingQuestion({ ...q })}
                      className="tap-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="tap-target px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Pending Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Pending Question</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  rows={2}
                  value={editingQuestion.text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, text: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                      name="modalCorrectRadio"
                      checked={editingQuestion.correctIndex === i}
                      onChange={() =>
                        setEditingQuestion({ ...editingQuestion, correctIndex: i })
                      }
                      className="cursor-pointer"
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
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubmissions;

