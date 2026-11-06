import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CustomDropdown } from '../components/ui/CustomDropdown';
import {
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  Play,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

const CreateQuiz = () => {
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Auto-generate state
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState('all');
  const [count, setCount] = useState(5);

  // Manual pick state
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (mode === 'manual' && availableQuestions.length === 0) {
      fetchManualQuestions();
    }
  }, [mode]);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/topics');
      setTopics(res.data.topics || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchManualQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await api.get('/questions?limit=50');
      setAvailableQuestions(res.data.questions || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load available questions for manual selection');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const toggleTopic = (topicKey) => {
    if (selectedTopics.includes(topicKey)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topicKey));
    } else {
      setSelectedTopics([...selectedTopics, topicKey]);
    }
  };

  const toggleQuestionSelection = (qId) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== qId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    setSubmitting(true);
    try {
      let payload;
      if (mode === 'auto') {
        payload = {
          title: title.trim(),
          description: description.trim(),
          autoGenerate: true,
          topics: selectedTopics.length > 0 ? selectedTopics : undefined,
          difficulty: difficulty,
          count: Number(count),
        };
      } else {
        if (selectedQuestionIds.length === 0) {
          toast.error('Please select at least 1 question for your quiz');
          setSubmitting(false);
          return;
        }
        payload = {
          title: title.trim(),
          description: description.trim(),
          autoGenerate: false,
          questionIds: selectedQuestionIds,
        };
      }

      const res = await api.post('/quizzes', payload);
      toast.success('Quiz created successfully!');
      navigate(`/take-quiz/${res.data.quiz._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create quiz';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyOptions = [
    { value: 'all', label: 'Mixed (All Difficulties)' },
    { value: 'easy', label: 'Easy (Foundational)' },
    { value: 'medium', label: 'Medium (Standard)' },
    { value: 'hard', label: 'Hard (Advanced)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
          Create a Quiz
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-textMuted mt-1">
          Auto-generate an adaptive quiz by topic and difficulty, or hand-pick specific questions from the question bank
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/70 dark:bg-dark-card rounded-2xl max-w-md border border-slate-200 dark:border-dark-border">
        <button
          type="button"
          onClick={() => setMode('auto')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition tap-target ${
            mode === 'auto'
              ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-300 shadow-sm'
              : 'text-slate-600 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-brand-yellow" />
          Auto-Generate
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition tap-target ${
            mode === 'manual'
              ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-300 shadow-sm'
              : 'text-slate-600 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-brand-electric" />
          Hand-Pick Questions
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Description Card */}
        <Card className="p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Quiz Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems & Memory Management Sprint"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics or concepts does this test cover?"
              className="w-full p-3.5 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </Card>

        {/* Mode 1: Auto-generate Options */}
        {mode === 'auto' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                Select Topics (Optional — Leave blank to sample across all topics)
              </label>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => {
                  const isSelected = selectedTopics.includes(t.topic);
                  return (
                    <button
                      type="button"
                      key={t.topic}
                      onClick={() => toggleTopic(t.topic)}
                      className={`tap-target px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                        isSelected
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-dark-card hover:bg-slate-100 dark:hover:bg-dark-cardHover text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-border'
                      }`}
                    >
                      {t.topicDisplay} ({t.total})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <CustomDropdown
                  label="Target Difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  options={difficultyOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Number of Questions: <span className="text-brand-500">{count}</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full h-2 bg-slate-200 dark:bg-dark-card rounded-lg appearance-none cursor-pointer accent-brand-500 mt-3"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-dark-textMuted mt-1 font-semibold">
                  <span>3 min</span>
                  <span>10 standard</span>
                  <span>20 marathon</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Mode 2: Manual Selection Table */}
        {mode === 'manual' && (
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                  Choose Questions from Bank
                </h3>
                <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                  Selected: {selectedQuestionIds.length} questions
                </p>
              </div>

              {availableQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedQuestionIds.length === availableQuestions.length) {
                      setSelectedQuestionIds([]);
                    } else {
                      setSelectedQuestionIds(availableQuestions.map((q) => q._id));
                    }
                  }}
                  className="text-xs font-bold text-brand-500 hover:underline tap-target"
                >
                  {selectedQuestionIds.length === availableQuestions.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              )}
            </div>

            {loadingQuestions ? (
              <div className="py-12 text-center text-slate-500">
                <span className="text-xs font-bold">Loading available questions...</span>
              </div>
            ) : availableQuestions.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No approved questions found in the bank.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {availableQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q._id);
                  return (
                    <div
                      key={q._id}
                      onClick={() => toggleQuestionSelection(q._id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-brand-50/70 dark:bg-brand-500/20 border-brand-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-dark-card border-slate-200 dark:border-dark-border hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="pt-0.5 text-brand-500">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-brand-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold bg-white dark:bg-dark-surface px-2 py-0.5 rounded-md border text-slate-600 dark:text-slate-300">
                            {q.topicDisplay}
                          </span>
                          <DifficultyBadge difficulty={q.difficulty} />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-snug">
                          {q.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        <Button
          type="submit"
          disabled={submitting}
          loading={submitting}
          size="lg"
          icon={<Play className="w-5 h-5 fill-current" />}
          className="w-full"
        >
          Generate & Start Quiz
        </Button>
      </form>
    </div>
  );
};

export default CreateQuiz;
