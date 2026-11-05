import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Brain,
  Target,
  Trophy,
  Activity,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [weakAnalytics, setWeakAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practicing, setPracticing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, weakRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/weak-topics'),
      ]);
      setSummary(summaryRes.data);
      setWeakAnalytics(weakRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeWeakTopics = async () => {
    if (!weakAnalytics || !weakAnalytics.topics) return;
    const weakList = weakAnalytics.topics.filter((t) => t.isWeak);
    if (weakList.length === 0) {
      toast.info('No weak topics currently detected! You can practice any topic from the Quizzes page.');
      navigate('/quizzes');
      return;
    }

    setPracticing(true);
    try {
      const targetTopics = weakList.map((t) => t.topic);
      const res = await api.post('/quizzes', {
        title: `Targeted Practice: ${weakList.map((t) => t.topicDisplay).join(', ')}`,
        description: 'Auto-generated mastery practice targeting topics needing reinforcement.',
        autoGenerate: true,
        topics: targetTopics,
        difficulty: 'all',
        count: Math.min(6, targetTopics.length * 3),
      });

      toast.success('Custom weak-topic practice quiz created!');
      navigate(`/take-quiz/${res.data.quiz._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not generate quiz for weak topics.';
      toast.error(msg);
    } finally {
      setPracticing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Compiling learning performance...</p>
      </div>
    );
  }

  const weakTopics = weakAnalytics?.topics?.filter((t) => t.isWeak) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-900/10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Smart Revision Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Track your revision progress, tackle weak spots systematically, and conquer computer science concepts.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/quizzes"
            className="tap-target px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-sm shadow-sm transition"
          >
            Browse Quizzes
          </Link>
          <Link
            to="/submit"
            className="tap-target px-5 py-2.5 bg-blue-800/60 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm border border-blue-400/30 transition"
          >
            Submit Question
          </Link>
        </div>
      </div>

      {/* PROMINENT WEAK TOPICS PANEL (Differentiating Feature) */}
      <section
        aria-labelledby="weak-topics-heading"
        className={`p-6 sm:p-8 rounded-3xl border transition shadow-sm ${
          weakTopics.length > 0
            ? 'bg-rose-50/70 border-rose-200'
            : 'bg-emerald-50/70 border-emerald-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                weakTopics.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {weakTopics.length > 0 ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="weak-topics-heading" className="text-lg font-extrabold text-slate-900">
                  {weakTopics.length > 0
                    ? `Weak Topics Detected (${weakTopics.length})`
                    : 'All Topics In Good Standing!'}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white text-slate-700 border border-slate-200">
                  Differentiating Feature
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                {weakTopics.length > 0
                  ? 'Our analytics identified topics where you repeatedly answer incorrectly (>= 3 wrong answers or accuracy < 60%). Focus revision here to maximize score gains.'
                  : 'Great performance! Your accuracy across attempted topics meets or exceeds the 60% threshold with low error repetition.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {weakTopics.length > 0 && (
              <button
                onClick={handlePracticeWeakTopics}
                disabled={practicing}
                className="tap-target px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md shadow-rose-600/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {practicing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Practice Weak Topics
                  </>
                )}
              </button>
            )}
            <Link
              to="/weak-topics"
              className="tap-target px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 transition"
            >
              Full Analysis &rarr;
            </Link>
          </div>
        </div>

        {weakTopics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakTopics.map((topic) => (
              <div
                key={topic.topic}
                className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{topic.topicDisplay}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {topic.incorrectCount} incorrect out of {topic.totalAnswered} questions
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-700 font-extrabold text-xs rounded-lg">
                    {topic.accuracy}% acc
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Attempts</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{summary?.totalAttempts || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Completed quiz sessions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{summary?.averageScore || 0}%</div>
          <p className="text-xs text-slate-500 mt-1">Across all completed quizzes</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Best Score</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{summary?.bestScore || 0}%</div>
          <p className="text-xs text-slate-500 mt-1">Personal record high</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Questions Answered</span>
            <Brain className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {summary?.totalQuestionsAnswered || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Total items evaluated</p>
        </div>
      </div>

      {/* Score History Line Chart (Recharts) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Score History Over Time</h2>
            <p className="text-sm text-slate-500">Your score percentages chronologically</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View attempt logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {summary?.scoreHistory && summary.scoreHistory.length > 0 ? (
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.scoreHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-200">{data.quizTitle}</p>
                          <p className="text-emerald-400 font-extrabold text-sm">
                            Score: {data.percentage}% ({data.score}/{data.total})
                          </p>
                          <p className="text-slate-400 text-[11px]">{data.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm">No attempts recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">Take a quiz to see your score trajectory!</p>
            <Link
              to="/quizzes"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold tap-target"
            >
              Take Your First Quiz
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
