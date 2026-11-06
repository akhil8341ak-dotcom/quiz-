import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CustomDropdown } from '../components/ui/CustomDropdown';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Search,
  Filter,
  PlusCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [revealedExplanations, setRevealedExplanations] = useState({});

  const toast = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [page, selectedTopic, selectedDifficulty, search]);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/topics');
      setTopics(res.data.topics || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedTopic) params.topic = selectedTopic;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res = await api.get('/questions', { params });
      setQuestions(res.data.questions || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleExplanation = (id) => {
    setRevealedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const topicOptions = [
    { value: '', label: `All Topics (${topics.length})` },
    ...topics.map((t) => ({
      value: t.topic,
      label: `${t.topicDisplay} (${t.total})`,
    })),
  ];

  const difficultyOptions = [
    { value: '', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy (Foundational)' },
    { value: 'medium', label: 'Medium (Standard)' },
    { value: 'hard', label: 'Hard (Advanced)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 text-xs font-black rounded-full flex items-center gap-1.5 border border-brand-200 dark:border-brand-500/30">
              <BookOpen className="w-3.5 h-3.5 text-brand-500" />
              Community Knowledge Base
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            Moderated Question Bank
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-textMuted mt-1">
            Browse peer-created, moderator-approved questions across topics and difficulties
          </p>
        </div>
        <Link to="/submit">
          <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
            Submit Question
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar with Animated Custom Dropdowns */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-textMuted" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search question text..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          {/* Custom Topic Dropdown */}
          <CustomDropdown
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setPage(1);
            }}
            options={topicOptions}
            searchable={topics.length > 5}
            placeholder="Filter by topic"
          />

          {/* Custom Difficulty Dropdown */}
          <CustomDropdown
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            options={difficultyOptions}
            placeholder="Filter by difficulty"
          />
        </div>

        {/* Active Filter Badges */}
        {(selectedTopic || selectedDifficulty || search) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-dark-border text-xs text-slate-500 dark:text-dark-textMuted flex-wrap">
            <span>Filters active:</span>
            {selectedTopic && (
              <span className="px-2.5 py-0.5 bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 rounded-full font-bold">
                Topic: {selectedTopic}
              </span>
            )}
            {selectedDifficulty && (
              <span className="px-2.5 py-0.5 bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 rounded-full font-bold capitalize">
                Difficulty: {selectedDifficulty}
              </span>
            )}
            {search && (
              <span className="px-2.5 py-0.5 bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 rounded-full font-bold">
                "{search}"
              </span>
            )}
            <button
              onClick={() => {
                setSelectedTopic('');
                setSelectedDifficulty('');
                setSearch('');
                setPage(1);
              }}
              className="text-brand-pink hover:underline font-bold ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </Card>

      {/* Question Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No questions found"
          description="Try relaxing your search terms or filters, or be the first to contribute a question to this topic!"
          actionLabel="Submit a Question"
          onAction={() => {}}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((q) => {
            const isExplanationOpen = revealedExplanations[q._id];

            return (
              <Card
                key={q._id}
                hover
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-dark-border">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>

                  <p className="font-heading font-bold text-slate-900 dark:text-white text-sm mb-4 leading-relaxed">
                    {q.text}
                  </p>

                  {/* Options List */}
                  <div className="space-y-1.5 mb-4">
                    {q.options.map((opt, idx) => {
                      const isCorrect = idx === q.correctIndex;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold'
                              : 'bg-slate-50 dark:bg-dark-card/60 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-dark-border/40'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isCorrect
                                ? 'bg-brand-mint text-emerald-950'
                                : 'bg-white dark:bg-dark-surface text-slate-500 dark:text-dark-textMuted border border-slate-200 dark:border-dark-border'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 truncate">{opt}</span>
                          {isCorrect && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer with Explanation reveal toggle */}
                <div className="pt-3 border-t border-slate-100 dark:border-dark-border">
                  {q.explanation ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleExplanation(q._id)}
                        className="text-xs font-bold text-brand-500 hover:text-brand-600 dark:text-brand-300 flex items-center gap-1.5 transition"
                      >
                        {isExplanationOpen ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide explanation
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> View explanation
                          </>
                        )}
                      </button>

                      <AnimatePresence>
                        {isExplanationOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2.5 p-3 rounded-2xl bg-brand-50/70 dark:bg-brand-500/10 border border-brand-200/60 dark:border-brand-500/30 text-xs text-brand-900 dark:text-brand-200 overflow-hidden leading-relaxed"
                          >
                            <span className="font-bold block mb-0.5 text-brand-700 dark:text-brand-300">
                              Reasoning / Explanation:
                            </span>
                            {q.explanation}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-dark-textMuted italic">
                      No explanation provided
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-dark-border">
          <span className="text-xs font-bold text-slate-500 dark:text-dark-textMuted">
            Showing Page {page} of {totalPages} ({total} questions)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
