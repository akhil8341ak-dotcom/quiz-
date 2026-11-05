import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import {
  Search,
  Filter,
  PlusCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Eye,
  EyeOff,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Moderated Question Bank
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse peer-created, moderator-approved questions across topics and difficulties
          </p>
        </div>
        <Link
          to="/submit"
          className="tap-target px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 self-start transition"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Question
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search question text..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Topic Filter */}
          <div className="relative">
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 capitalize"
            >
              <option value="">All Topics ({topics.length})</option>
              {topics.map((t) => (
                <option key={t.topic} value={t.topic}>
                  {t.topicDisplay} ({t.total})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(selectedTopic || selectedDifficulty || search) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex-wrap">
            <span>Filters active:</span>
            {selectedTopic && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
                Topic: {selectedTopic}
              </span>
            )}
            {selectedDifficulty && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold capitalize">
                Difficulty: {selectedDifficulty}
              </span>
            )}
            {search && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
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
              className="text-rose-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Question Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
          <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-base text-slate-700">No approved questions found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search parameters or submit a new question for moderation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {questions.map((q) => {
            const isRevealed = revealedExplanations[q._id];
            return (
              <div
                key={q._id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug mb-4">
                    {q.text}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-1.5 mb-4">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className="text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{opt}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation reveal button */}
                <div className="pt-3 border-t border-slate-100">
                  {q.explanation && (
                    <>
                      <button
                        onClick={() => toggleExplanation(q._id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide explanation
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Show explanation
                          </>
                        )}
                      </button>
                      {isRevealed && (
                        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed animate-in fade-in">
                          {q.explanation}
                        </div>
                      )}
                    </>
                  )}
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Submitted by {q.createdBy?.name || 'Peer'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            Showing page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> ({total} questions)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none tap-target"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none tap-target"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
