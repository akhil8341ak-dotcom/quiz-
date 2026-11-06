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
  Flame,
  Layers,
  Award,
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
        title: `Blitz: ${weakList.map((t) => t.topicDisplay).join(', ')}`,
        description: 'Auto-generated mastery practice targeting topics needing reinforcement.',
        autoGenerate: true,
        topics: targetTopics,
        difficulty: 'all',
        count: Math.min(6, targetTopics.length * 3),
      });

      toast.success('Generated targeted weak-topic blitz quiz!');
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
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <Brain className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-slate-500 mt-4">Compiling learning metrics...</p>
      </div>
    );
  }

  const weakTopics = weakAnalytics?.topics?.filter((t) => t.isWeak) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* VIBRANT HERO BANNER */}
      <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white shadow-2xl shadow-indigo-950/30 border border-violet-800/50">
        {/* Glow particles */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-gradient-to-br from-cyan-500/20 to-violet-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-16 w-80 h-80 bg-gradient-to-tr from-pink-500/15 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-cyan-300 border border-white/15 backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-soft-pulse" />
              Adaptive Mastery Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Ready to revise, <span className="bg-gradient-to-r from-cyan-400 via-indigo-200 to-pink-300 bg-clip-text text-transparent">{user?.name}</span>?
            </h1>
            <p className="text-indigo-200/90 text-sm leading-relaxed font-medium">
              Real-time mistake tracking, automated weak topic diagnosis, and community-moderated computer science practice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/quizzes"
              className="tap-target px-6 py-3 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-black rounded-2xl text-xs shadow-xl shadow-indigo-500/30 transition hover:-translate-y-1 active:translate-y-0 shimmer-effect"
            >
              🚀 Explore Quizzes
            </Link>
            <Link
              to="/submit"
              className="tap-target px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/20 backdrop-blur-md transition hover:-translate-y-0.5"
            >
              ✍️ Submit Question
            </Link>
          </div>
        </div>
      </div>

      {/* PROMINENT WEAK TOPICS PANEL (Differentiating Feature) */}
      <section
        aria-labelledby="weak-topics-heading"
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
          weakTopics.length > 0
            ? 'bg-gradient-to-br from-rose-50/95 via-rose-100/40 to-white border-rose-300/90 shadow-xl shadow-rose-500/10'
            : 'bg-gradient-to-br from-emerald-50/95 via-teal-50/40 to-white border-emerald-300/90 shadow-xl shadow-emerald-500/10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                weakTopics.length > 0
                  ? 'bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-rose-600/35 animate-soft-pulse'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/35'
              }`}
            >
              {weakTopics.length > 0 ? (
                <Flame className="w-8 h-8" />
              ) : (
                <CheckCircle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 id="weak-topics-heading" className="text-xl font-black text-slate-900 tracking-tight">
                  {weakTopics.length > 0
                    ? `Weak Topics Detected (${weakTopics.length})`
                    : 'All Topics Strong & Proficient!'}
                </h2>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-black bg-rose-600 text-white shadow-xs">
                  Differentiating Feature
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
                {weakTopics.length > 0
                  ? 'Our analytics algorithm detected topics where you repeatedly answer incorrectly (>= 3 wrong answers or accuracy < 60%). Target these topics to maximize your score.'
                  : 'High-five! Your accuracy across all attempted topics is above the 60% threshold with minimal error repetition.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {weakTopics.length > 0 && (
              <button
                onClick={handlePracticeWeakTopics}
                disabled={practicing}
                className="tap-target px-5 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black rounded-2xl text-xs shadow-xl shadow-rose-600/30 flex items-center gap-2 transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 shimmer-effect"
              >
                {practicing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Practice Weak Topics Now
                  </>
                )}
              </button>
            )}
            <Link
              to="/weak-topics"
              className="tap-target px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl text-xs border border-slate-200/90 shadow-sm transition"
            >
              Full Analysis &rarr;
            </Link>
          </div>
        </div>

        {weakTopics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-rose-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakTopics.map((topic) => (
              <div
                key={topic.topic}
                className="bg-white/95 p-4 rounded-2xl border border-rose-200 shadow-sm hover:border-rose-400 hover:shadow-md transition flex items-center justify-between"
              >
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight">{topic.topicDisplay}</h3>
                  <div className="text-xs text-rose-600 font-semibold mt-0.5">
                    {topic.incorrectCount} missed &bull; {topic.totalAnswered} total answered
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 font-black text-xs rounded-xl border border-rose-200">
                    {topic.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VIBRANT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Attempts */}
        <div className="glass-card-energetic p-6 relative overflow-hidden border-t-4 border-t-indigo-500">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Attempts</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{summary?.totalAttempts || 0}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Completed quiz sessions</p>
        </div>

        {/* Card 2: Average Score */}
        <div className="glass-card-energetic p-6 relative overflow-hidden border-t-4 border-t-violet-500">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{summary?.averageScore || 0}%</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Across all completed quizzes</p>
        </div>

        {/* Card 3: Best Score */}
        <div className="glass-card-energetic p-6 relative overflow-hidden border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Personal Best</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{summary?.bestScore || 0}%</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Personal record high score</p>
        </div>

        {/* Card 4: Questions Evaluated */}
        <div className="glass-card-energetic p-6 relative overflow-hidden border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Questions Answered</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {summary?.totalQuestionsAnswered || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total items evaluated</p>
        </div>
      </div>

      {/* Score History Line Chart (Recharts) */}
      <section className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Score Trajectory Over Time</h2>
            <p className="text-xs text-slate-500 font-medium">Chronological progression across past exam attempts</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition"
          >
            Review all attempts <ArrowRight className="w-3.5 h-3.5" />
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
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 border border-slate-800">
                          <p className="font-extrabold text-slate-200">{data.quizTitle}</p>
                          <p className="text-cyan-400 font-black text-sm">
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
                  stroke="#6366f1"
                  strokeWidth={4}
                  dot={{ fill: '#ffffff', stroke: '#6366f1', strokeWidth: 3, r: 5 }}
                  activeDot={{ r: 8, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
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
              className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold tap-target shadow-md shadow-indigo-500/20"
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
