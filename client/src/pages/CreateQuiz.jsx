import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import {
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  Loader2,
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create a Quiz
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Auto-generate an adaptive quiz by topic and difficulty, or hand-pick specific questions from the question bank
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/80 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setMode('auto')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition tap-target ${
            mode === 'auto'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Auto-Generate
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition tap-target ${
            mode === 'manual'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          Hand-Pick Questions
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Description Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Quiz Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems & Memory Management Sprint"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics or concepts does this test cover?"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Mode 1: Auto-generate Options */}
        {mode === 'auto' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
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
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
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
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Target Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">Mixed (All Difficulties)</option>
                  <option value="easy">Easy (Foundational)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="hard">Hard (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Number of Questions: <span className="text-blue-600">{count}</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full accent-blue-600 mt-2 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>3 questions (Quick check)</span>
                  <span>20 questions (Comprehensive)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Manual Question Picker */}
        {mode === 'manual' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Select Questions</h3>
                <p className="text-xs text-slate-500">
                  Selected: <span className="font-bold text-blue-600">{selectedQuestionIds.length}</span> questions
                </p>
              </div>
            </div>

            {loadingQuestions ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {availableQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q._id);
                  return (
                    <div
                      key={q._id}
                      onClick={() => toggleQuestionSelection(q._id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        isChecked
                          ? 'bg-blue-50/70 border-blue-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 text-blue-600">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 fill-blue-600 text-white" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                            {q.topicDisplay}
                          </span>
                          <DifficultyBadge difficulty={q.difficulty} />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{q.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 tap-target"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Quiz...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Create & Start Quiz
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateQuiz;

