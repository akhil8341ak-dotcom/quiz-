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
  Zap,
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
        <Loader2 className="w-9 h-9 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-500">Compiling your learning analytics...</p>
      </div>
    );
  }

  const weakTopics = weakAnalytics?.topics?.filter((t) => t.isWeak) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner with modern dark gradient & subtle glow */}
      <div className="relative overflow-hidden p-6 sm:p-9 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl text-white shadow-xl shadow-indigo-950/20 border border-slate-800">
        {/* Ambient background blur circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Smart Revision & Mastery Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Track your revision progress, diagnose knowledge gaps with our automated Weak Topics engine, and master exam concepts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/quizzes"
              className="tap-target px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 active:translate-y-0"
            >
              Browse Quizzes
            </Link>
            <Link
              to="/submit"
              className="tap-target px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/15 backdrop-blur-sm transition"
            >
              Submit Question
            </Link>
          </div>
        </div>
      </div>

      {/* PROMINENT WEAK TOPICS PANEL (Differentiating Feature) */}
      <section
        aria-labelledby="weak-topics-heading"
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
          weakTopics.length > 0
            ? 'bg-gradient-to-br from-rose-50/90 via-rose-50/40 to-white border-rose-200/90 shadow-lg shadow-rose-500/5'
            : 'bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white border-emerald-200/90 shadow-lg shadow-emerald-500/5'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                weakTopics.length > 0
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              {weakTopics.length > 0 ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <CheckCircle className="w-7 h-7" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="weak-topics-heading" className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {weakTopics.length > 0
                    ? `Weak Topics Detected (${weakTopics.length})`
                    : 'All Topics in Good Standing!'}
                </h2>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-black bg-rose-100 text-rose-800 border border-rose-200">
                  Differentiating Feature
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {weakTopics.length > 0
                  ? 'Our analytics identified topics where you repeatedly answer incorrectly (>= 3 wrong answers or accuracy < 60%). Focus revision here to maximize score gains.'
                  : 'Great performance! Your accuracy across all attempted topics meets or exceeds the 60% threshold with low error repetition.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {weakTopics.length > 0 && (
              <button
                onClick={handlePracticeWeakTopics}
                disabled={practicing}
                className="tap-target px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-rose-600/25 flex items-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {practicing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Practice Weak Topics
                  </>
                )}
              </button>
            )}
            <Link
              to="/weak-topics"
              className="tap-target px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl text-xs border border-slate-200/90 shadow-xs transition"
            >
              Full Analysis &rarr;
            </Link>
          </div>
        </div>

        {weakTopics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {weakTopics.map((topic) => (
              <div
                key={topic.topic}
                className="bg-white p-4 rounded-2xl border border-rose-200/90 shadow-sm flex items-center justify-between hover:border-rose-300 transition"
              >
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{topic.topicDisplay}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {topic.incorrectCount} incorrect &bull; {topic.totalAnswered} attempted
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-700 font-black text-xs rounded-xl">
                    {topic.accuracy}% acc
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Summary Cards with elevated design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Attempts</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{summary?.totalAttempts || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Completed quiz sessions</p>
        </div>

        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{summary?.averageScore || 0}%</div>
          <p className="text-xs text-slate-500 mt-1">Across all completed quizzes</p>
        </div>

        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Best Score</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{summary?.bestScore || 0}%</div>
          <p className="text-xs text-slate-500 mt-1">Personal record high</p>
        </div>

        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Questions Answered</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {summary?.totalQuestionsAnswered || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Total items evaluated</p>
        </div>
      </div>

      {/* Score History Line Chart (Recharts) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Score History Over Time</h2>
            <p className="text-xs text-slate-500">Your score percentages recorded chronologically</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
          >
            View attempt logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {summary?.scoreHistory && summary.scoreHistory.length > 0 ? (
          <div className="h-64 sm:h-80 w-full pt-2">
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
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 border border-slate-800">
                          <p className="font-bold text-slate-200">{data.quizTitle}</p>
                          <p className="text-emerald-400 font-black text-sm">
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
                  strokeWidth={3.5}
                  dot={{ fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2.5, r: 4 }}
                  activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm text-slate-700">No attempts recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">Take a quiz to see your score trajectory!</p>
            <Link
              to="/quizzes"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold tap-target shadow-md shadow-blue-500/20"
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
