import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  PlusCircle,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Info,
  Sparkles,
} from 'lucide-react';

const SubmitQuestion = () => {
  const { isModerator } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [existingTopics, setExistingTopics] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/topics');
      setExistingTopics(res.data.topics || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (indexToRemove) => {
    if (options.length <= 2) {
      toast.warning('A question must have at least 2 options.');
      return;
    }
    const updated = options.filter((_, idx) => idx !== indexToRemove);
    setOptions(updated);
    if (correctIndex === indexToRemove) {
      setCorrectIndex(0);
    } else if (correctIndex > indexToRemove) {
      setCorrectIndex(correctIndex - 1);
    }
  };

  const validate = () => {
    const errs = {};
    if (!text.trim() || text.trim().length < 5) {
      errs.text = 'Question text must be at least 5 characters long';
    }
    if (!topic.trim()) {
      errs.topic = 'Please provide or select a topic';
    }
    const emptyOptionIndex = options.findIndex((opt) => !opt.trim());
    if (emptyOptionIndex !== -1) {
      errs.options = `Option ${String.fromCharCode(65 + emptyOptionIndex)} cannot be empty`;
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      errs.correctIndex = 'Please select a valid correct option';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        text: text.trim(),
        topic: topic.trim(),
        difficulty,
        options: options.map((o) => o.trim()),
        correctIndex,
        explanation: explanation.trim(),
      };

      const res = await api.post('/questions', payload);
      toast.success(res.data.message || 'Question submitted successfully!');

      if (isModerator) {
        navigate('/questions');
      } else {
        navigate('/my-submissions');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit question';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit a Question
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isModerator
            ? 'Moderator submissions are automatically approved into the public bank.'
            : 'Submitted questions enter the moderation queue to ensure high quality.'}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Question Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Which algorithmic paradigm does Dijkstra's shortest path algorithm use?"
              className={`w-full p-3.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                errors.text
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
              }`}
            />
            {errors.text && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.text}</p>}
          </div>

          {/* Topic and Difficulty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Topic Input with suggestions */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Topic <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="topic-suggestions"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Operating Systems"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                  errors.topic
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              <datalist id="topic-suggestions">
                {existingTopics.map((t) => (
                  <option key={t.topic} value={t.topicDisplay} />
                ))}
              </datalist>
              <p className="mt-1 text-[11px] text-slate-400">
                Pick an existing topic or type a new one
              </p>
              {errors.topic && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.topic}</p>}
            </div>

            {/* Difficulty select */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Difficulty <span className="text-rose-500">*</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="easy">Easy (Foundational)</option>
                <option value="medium">Medium (Standard Conceptual)</option>
                <option value="hard">Hard (Advanced / In-depth)</option>
              </select>
            </div>
          </div>

          {/* Options with Radio Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-slate-800">
                  Multiple-Choice Options (2 to 6) <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500">
                  Select the radio button next to the correct answer.
                </p>
              </div>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 tap-target"
                >
                  <PlusCircle className="w-4 h-4" /> Add Option
                </button>
              )}
            </div>

            {errors.options && (
              <p className="text-xs text-rose-600 font-semibold">{errors.options}</p>
            )}

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                    correctIndex === idx
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="correctOptionRadio"
                    id={`opt-radio-${idx}`}
                    checked={correctIndex === idx}
                    onChange={() => setCorrectIndex(idx)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`opt-radio-${idx}`}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0 cursor-pointer"
                  >
                    {String.fromCharCode(65 + idx)}
                  </label>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition tap-target"
                      aria-label="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Explanation (Optional, but highly recommended)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Why is this answer correct? Provide context or reasoning..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Shown to learners after completing their quiz attempts.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 tap-target"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Question...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                {isModerator ? 'Publish to Question Bank' : 'Submit for Moderation'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuestion;

