import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
  CheckCircle,
  HelpCircle,
  Loader2,
  TrendingUp,
  Zap,
  Flame,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CountUp } from '../components/ui/CountUp';
import { StatSkeleton } from '../components/ui/Skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isDark } = useTheme();
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
      <div className="space-y-6">
        <div className="h-44 rounded-3xl skeleton-box" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <div className="h-80 rounded-3xl skeleton-box" />
      </div>
    );
  }

  const weakTopics = weakAnalytics?.topics?.filter((t) => t.isWeak) || [];

  return (
    <div className="space-y-8">
      {/* VIBRANT HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-electric text-white shadow-xl shadow-brand-500/20 border border-white/20"
      >
        {/* Glow backdrop bubbles */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-brand-yellow/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-16 w-80 h-80 bg-brand-pink/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 text-white border border-white/25 backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
              Adaptive Mastery Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white leading-tight">
              Ready to practice,{' '}
              <span className="text-brand-yellow underline decoration-wavy decoration-white/40">
                {user?.name}
              </span>
              ?
            </h1>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              Real-time mistake tracking, automated weak topic diagnosis, and community-moderated
              computer science practice.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/quizzes">
              <Button variant="yellow" size="lg" className="shadow-lg">
                🚀 Explore Quizzes
              </Button>
            </Link>
            <Link to="/submit">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-md"
              >
                ✍️ Submit Question
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* PROMINENT WEAK TOPICS PANEL (Differentiating Feature) */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        aria-labelledby="weak-topics-heading"
        className={`p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden ${
          weakTopics.length > 0
            ? 'bg-gradient-to-br from-rose-50/95 via-rose-100/30 to-white dark:from-rose-950/30 dark:via-dark-card dark:to-dark-surface border-rose-300 dark:border-rose-900/60 shadow-xl shadow-rose-500/10'
            : 'bg-gradient-to-br from-emerald-50/95 via-teal-50/30 to-white dark:from-emerald-950/30 dark:via-dark-card dark:to-dark-surface border-emerald-300 dark:border-emerald-900/60 shadow-xl shadow-emerald-500/10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                weakTopics.length > 0
                  ? 'bg-gradient-to-tr from-brand-pink to-rose-600 text-white shadow-rose-500/30 animate-pulse'
                  : 'bg-gradient-to-tr from-brand-mint to-emerald-500 text-slate-900 shadow-emerald-500/30'
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
                <h2
                  id="weak-topics-heading"
                  className="text-xl font-heading font-black text-slate-900 dark:text-white tracking-tight"
                >
                  {weakTopics.length > 0
                    ? `Weak Topics Detected (${weakTopics.length})`
                    : 'All Topics Strong & Proficient!'}
                </h2>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-black bg-brand-pink text-white shadow-xs">
                  Differentiating Feature
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
                {weakTopics.length > 0
                  ? 'Our analytics algorithm detected topics where you repeatedly answer incorrectly (≥ 3 wrong answers or accuracy < 60%). Target these topics to maximize your mastery.'
                  : 'High-five! Your accuracy across all attempted topics is above the 60% threshold with minimal error repetition.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {weakTopics.length > 0 && (
              <Button
                variant="pink"
                onClick={handlePracticeWeakTopics}
                disabled={practicing}
                loading={practicing}
                icon={<Zap className="w-4 h-4" />}
                className="shadow-glow-pink"
              >
                Practice Weak Topics Now
              </Button>
            )}
            <Link to="/weak-topics">
              <Button variant="secondary">Full Analysis &rarr;</Button>
            </Link>
          </div>
        </div>

        {weakTopics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-rose-200/80 dark:border-rose-900/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakTopics.map((topic) => (
              <div
                key={topic.topic}
                className="bg-white/90 dark:bg-dark-card p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm hover:border-brand-pink hover:shadow-md transition flex items-center justify-between"
              >
                <div>
                  <h3 className="font-heading font-black text-slate-900 dark:text-white text-sm tracking-tight">
                    {topic.topicDisplay}
                  </h3>
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                    {topic.incorrectCount} missed &bull; {topic.totalAnswered} answered
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-black text-xs rounded-xl border border-rose-200 dark:border-rose-800">
                    {topic.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* VIBRANT METRIC CARDS WITH COUNT-UP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Attempts */}
        <Card hover className="border-t-4 border-t-brand-500">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-textMuted">
              Total Attempts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            <CountUp end={summary?.totalAttempts || 0} />
          </div>
          <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1 font-medium">
            Completed quiz sessions
          </p>
        </Card>

        {/* Card 2: Average Score */}
        <Card hover className="border-t-4 border-t-brand-electric">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-textMuted">
              Average Score
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-brand-electric flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            <CountUp end={summary?.averageScore || 0} suffix="%" />
          </div>
          <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1 font-medium">
            Across all completed quizzes
          </p>
        </Card>

        {/* Card 3: Personal Best */}
        <Card hover className="border-t-4 border-t-brand-yellow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-textMuted">
              Personal Best
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-brand-yellow flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            <CountUp end={summary?.bestScore || 0} suffix="%" />
          </div>
          <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1 font-medium">
            Personal record high score
          </p>
        </Card>

        {/* Card 4: Questions Answered */}
        <Card hover className="border-t-4 border-t-brand-mint">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-textMuted">
              Questions Evaluated
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-mint flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            <CountUp end={summary?.totalQuestionsAnswered || 0} />
          </div>
          <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1 font-medium">
            Total items evaluated
          </p>
        </Card>
      </div>

      {/* Score History Progression Area Chart */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Score Trajectory Over Time
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-textMuted font-medium">
              Chronological progression across past exam attempts
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-black text-brand-500 dark:text-brand-300 hover:underline flex items-center gap-1.5 transition"
          >
            Review all attempts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {summary?.scoreHistory && summary.scoreHistory.length > 0 ? (
          <div className="h-64 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={summary.scoreHistory}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#312C5E' : '#EDEAFE'}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke={isDark ? '#948EB5' : '#94a3b8'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#312C5E' : '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke={isDark ? '#948EB5' : '#94a3b8'}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#312C5E' : '#e2e8f0' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 dark:bg-dark-surface text-white p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 border border-brand-500/40">
                          <p className="font-extrabold text-slate-200">{data.quizTitle}</p>
                          <p className="text-brand-yellow font-black text-sm">
                            Score: {data.percentage}% ({data.score}/{data.total})
                          </p>
                          <p className="text-slate-400 text-[11px]">{data.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#6C47FF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  dot={{ fill: '#ffffff', stroke: '#6C47FF', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 7, fill: '#FF4D8D', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-dark-textMuted mb-2" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
              No attempts recorded yet
            </p>
            <p className="text-xs text-slate-400 dark:text-dark-textMuted mt-1">
              Take a quiz to see your score trajectory!
            </p>
            <Link to="/quizzes" className="mt-4 inline-block">
              <Button variant="primary" size="sm">
                Take Your First Quiz
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
