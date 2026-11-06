import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CustomDropdown } from '../components/ui/CustomDropdown';
import {
  PlusCircle,
  Trash2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Eye,
  Info,
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

  const difficultyOptions = [
    { value: 'easy', label: 'Easy (Foundational Concepts)' },
    { value: 'medium', label: 'Medium (Standard Implementation)' },
    { value: 'hard', label: 'Hard (Advanced Edge Cases)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
          Submit a Question
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-textMuted mt-1">
          {isModerator
            ? 'Moderator submissions are automatically approved into the live public bank.'
            : 'Submitted questions enter the peer moderation queue to ensure high quality.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Submission Form */}
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Which algorithmic paradigm does Dijkstra's shortest path algorithm use?"
                  className={`w-full p-3.5 bg-slate-50 dark:bg-dark-card border rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition ${
                    errors.text
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-dark-border focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
                {errors.text && (
                  <p className="mt-1 text-xs text-rose-500 font-bold">{errors.text}</p>
                )}
              </div>

              {/* Topic and Difficulty Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Topic Input with suggestions */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Topic <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="topic-suggestions"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-card border rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition ${
                      errors.topic
                        ? 'border-rose-400 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-dark-border focus:border-brand-500 focus:ring-brand-500/20'
                    }`}
                  />
                  <datalist id="topic-suggestions">
                    {existingTopics.map((t) => (
                      <option key={t.topic} value={t.topicDisplay} />
                    ))}
                  </datalist>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-dark-textMuted">
                    Pick an existing topic or type a new one
                  </p>
                  {errors.topic && (
                    <p className="mt-1 text-xs text-rose-500 font-bold">{errors.topic}</p>
                  )}
                </div>

                {/* Custom Difficulty Select */}
                <div>
                  <CustomDropdown
                    label="Difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    options={difficultyOptions}
                  />
                </div>
              </div>

              {/* Options with Radio Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      Multiple-Choice Options (2 to 6) <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                      Select the radio button next to the correct answer.
                    </p>
                  </div>
                  {options.length < 6 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addOption}
                      icon={<PlusCircle className="w-4 h-4 text-brand-500" />}
                    >
                      Add Option
                    </Button>
                  )}
                </div>

                {errors.options && (
                  <p className="text-xs text-rose-500 font-bold">{errors.options}</p>
                )}

                <div className="space-y-2.5">
                  {options.map((opt, idx) => {
                    const isSelected = correctIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-brand-mint shadow-sm'
                            : 'bg-slate-50 dark:bg-dark-card border-slate-200 dark:border-dark-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          id={`opt-radio-${idx}`}
                          checked={isSelected}
                          onChange={() => setCorrectIndex(idx)}
                          className="w-4 h-4 text-brand-mint focus:ring-brand-mint cursor-pointer accent-emerald-500"
                        />
                        <label
                          htmlFor={`opt-radio-${idx}`}
                          className={`w-7 h-7 rounded-xl font-black flex items-center justify-center text-xs shrink-0 cursor-pointer transition ${
                            isSelected
                              ? 'bg-brand-mint text-emerald-950 shadow-sm'
                              : 'bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </label>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                          className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition tap-target"
                            aria-label="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Explanation (Optional, but highly recommended)
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Why is this answer correct? Provide context or reasoning..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <p className="mt-1 text-[11px] text-slate-400 dark:text-dark-textMuted">
                  Shown to learners after completing their quiz attempts.
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                loading={submitting}
                variant={isModerator ? 'primary' : 'mint'}
                size="lg"
                icon={<PlusCircle className="w-5 h-5" />}
                className="w-full"
              >
                {isModerator ? 'Publish to Question Bank' : 'Submit for Moderation'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-4 sticky top-24">
          <Card className="p-5 border-dashed border-2">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 dark:text-dark-textMuted uppercase tracking-wider">
              <Eye className="w-4 h-4 text-brand-500" />
              Live Learner Preview
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300">
                  {topic || 'Topic Name'}
                </span>
                <DifficultyBadge difficulty={difficulty} />
              </div>

              <p className="font-heading font-bold text-sm text-slate-900 dark:text-white min-h-[40px]">
                {text || 'Your question text will appear here...'}
              </p>

              <div className="space-y-1.5 pt-1">
                {options.map((opt, i) => (
                  <div
                    key={i}
                    className={`text-xs p-2 rounded-xl border flex items-center gap-2 ${
                      correctIndex === i
                        ? 'border-brand-mint bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-100 dark:border-dark-border text-slate-500 dark:text-dark-textMuted'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-white dark:bg-dark-surface border flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="truncate">{opt || `Option ${String.fromCharCode(65 + i)}`}</span>
                  </div>
                ))}
              </div>

              {explanation && (
                <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-[11px] text-brand-900 dark:text-brand-200">
                  <strong>Explanation:</strong> {explanation}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuestion;
