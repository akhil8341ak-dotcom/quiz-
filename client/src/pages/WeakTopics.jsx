import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Target,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  Sparkles,
  Info,
  Flame,
  Zap,
} from 'lucide-react';

const WeakTopics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practicingTopic, setPracticingTopic] = useState(null);

  const toast = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWeakTopics();
  }, []);

  const fetchWeakTopics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/weak-topics');
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load weak topics analytics');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeTopic = async (topicKey, topicDisplay) => {
    setPracticingTopic(topicKey);
    try {
      const res = await api.post('/quizzes', {
        title: `Targeted Practice: ${topicDisplay}`,
        description: `Reinforcement quiz focusing on ${topicDisplay}.`,
        autoGenerate: true,
        topics: [topicKey],
        difficulty: 'all',
        count: 5,
      });

      toast.success(`Generated targeted quiz for ${topicDisplay}!`);
      navigate(`/take-quiz/${res.data.quiz._id}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        `Not enough questions in ${topicDisplay} for auto-generating a quiz.`;
      toast.error(msg);
    } finally {
      setPracticingTopic(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-3xl skeleton-box" />
        <div className="h-80 rounded-3xl skeleton-box" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl skeleton-box" />
          <div className="h-64 rounded-3xl skeleton-box" />
          <div className="h-64 rounded-3xl skeleton-box" />
        </div>
      </div>
    );
  }

  const topics = data?.topics || [];
  const mostMissed = data?.mostMissedQuestions || [];
  const weakCount = data?.weakTopicsCount || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-black rounded-full flex items-center gap-1.5 shadow-xs border border-rose-200 dark:border-rose-900/60">
            <Target className="w-3.5 h-3.5 text-brand-pink" />
            Core Differentiating Feature
          </span>
          <span className="text-xs text-slate-500 dark:text-dark-textMuted font-semibold">
            Algorithmic Weakness Detection
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
          Weak Topics Analysis
        </h1>
        <p className="text-sm text-slate-600 dark:text-dark-textMuted mt-1 max-w-2xl leading-relaxed">
          QuizCraft monitors each answer you submit and aggregates error frequencies by topic.
          Topics with repeated wrong answers are algorithmically highlighted for targeted
          reinforcement.
        </p>
      </div>

      {/* Algorithm explanation alert */}
      <Card className="p-5 bg-gradient-to-r from-blue-50/90 to-indigo-50/60 dark:from-dark-card dark:to-dark-cardHover border border-blue-200/90 dark:border-dark-border flex items-start gap-4 text-xs">
        <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-brand-electric rounded-2xl shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <span className="font-extrabold text-sm block text-slate-900 dark:text-white">
            How the Weakness Detection Formula Works:
          </span>
          <div className="text-slate-600 dark:text-dark-textMuted leading-relaxed">
            A topic is flagged as{' '}
            <span className="font-bold text-brand-pink dark:text-rose-400">"Weak"</span> if either
            condition is met:
            <ul className="list-disc list-inside mt-1.5 space-y-1 font-semibold text-slate-700 dark:text-slate-200">
              <li>
                You have <strong>3 or more incorrect answers</strong> in that topic (
                <code className="bg-white/80 dark:bg-dark-surface px-1.5 py-0.5 rounded border border-blue-200 dark:border-dark-border">
                  incorrectCount &gt;= 3
                </code>
                ), OR
              </li>
              <li>
                You have answered at least <strong>4 questions</strong> with an overall accuracy under{' '}
                <strong>60%</strong> (
                <code className="bg-white/80 dark:bg-dark-surface px-1.5 py-0.5 rounded border border-blue-200 dark:border-dark-border">
                  totalAnswered &gt;= 4 && accuracy &lt; 60%
                </code>
                ).
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Accuracy Chart per Topic (Recharts Bar Chart) */}
      {topics.length > 0 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Topic Accuracy Comparison (%)
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-textMuted">
              Coral/pink bars indicate topics flagged as weak. Mint indicates mastery (≥ 80%).
            </p>
          </div>

          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#312C5E' : '#EDEAFE'}
                  vertical={false}
                />
                <XAxis
                  dataKey="topicDisplay"
                  stroke={isDark ? '#948EB5' : '#64748b'}
                  fontSize={12}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 100]}
                  stroke={isDark ? '#948EB5' : '#94a3b8'}
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const t = payload[0].payload;
                      return (
                        <div className="bg-slate-900 dark:bg-dark-surface text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1 border border-brand-500/40">
                          <p className="font-bold text-slate-100">{t.topicDisplay}</p>
                          <p className="font-black text-sm text-brand-yellow">
                            Accuracy: {t.accuracy}%
                          </p>
                          <p className="text-slate-300">
                            {t.correctCount} correct / {t.incorrectCount} incorrect ({t.totalAnswered}{' '}
                            total)
                          </p>
                          {t.isWeak && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-pink text-white font-black text-[10px] rounded-lg">
                              Flagged as Weak Topic
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {topics.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isWeak
                          ? '#FF4D8D'
                          : entry.accuracy >= 80
                          ? '#14D9B0'
                          : '#3B82F6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Evaluated Topics Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Evaluated Topics</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300">
              {topics.length} total
            </span>
          </h2>
        </div>

        {topics.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">
            <HelpCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-dark-textMuted mb-2" />
            <p className="font-bold text-base text-slate-700 dark:text-slate-200">
              No topic data available yet
            </p>
            <p className="text-xs text-slate-400 dark:text-dark-textMuted mt-1">
              Take a quiz to begin accumulating topic performance data!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((item) => {
              const isWeak = item.isWeak;
              return (
                <Card
                  key={item.topic}
                  hover
                  className={`flex flex-col justify-between ${
                    isWeak
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-md shadow-rose-500/5'
                      : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-heading font-black text-slate-900 dark:text-white text-base tracking-tight">
                          {item.topicDisplay}
                        </h3>
                        <div className="text-xs text-slate-500 dark:text-dark-textMuted mt-0.5 font-medium">
                          {item.totalAnswered} questions attempted
                        </div>
                      </div>
                      {isWeak ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-pink text-white font-black text-xs rounded-xl shadow-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Weak
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Proficient
                        </span>
                      )}
                    </div>

                    {/* Accuracy Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>Accuracy</span>
                        <span
                          className={
                            isWeak
                              ? 'text-brand-pink font-black'
                              : 'text-slate-900 dark:text-white'
                          }
                        >
                          {item.accuracy}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200/80 dark:bg-dark-card rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isWeak
                              ? 'bg-brand-pink'
                              : item.accuracy >= 80
                              ? 'bg-brand-mint'
                              : 'bg-brand-electric'
                          }`}
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2.5 px-3 bg-white/80 dark:bg-dark-card/80 rounded-2xl border border-slate-200/70 dark:border-dark-border mb-5">
                      <div>
                        <span className="text-slate-400 dark:text-dark-textMuted block text-[11px] font-bold">
                          Correct
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {item.correctCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-dark-textMuted block text-[11px] font-bold">
                          Incorrect
                        </span>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400">
                          {item.incorrectCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* One-click practice this topic button */}
                  <Button
                    onClick={() => handlePracticeTopic(item.topic, item.topicDisplay)}
                    disabled={practicingTopic === item.topic}
                    loading={practicingTopic === item.topic}
                    variant={isWeak ? 'pink' : 'primary'}
                    icon={<Zap className="w-3.5 h-3.5" />}
                    className="w-full"
                  >
                    Practice This Topic
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Questions You Keep Missing (Top 5 repeatedly missed) */}
      {mostMissed.length > 0 && (
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-brand-yellow rounded-2xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-black text-slate-900 dark:text-white tracking-tight">
                Questions You Keep Missing
              </h2>
              <p className="text-xs text-slate-500 dark:text-dark-textMuted font-medium">
                Top questions answered incorrectly more than once across your attempts
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mostMissed.map((q) => (
              <div
                key={q.questionId}
                className="p-5 rounded-2xl border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-lg">
                      Missed {q.timesMissed} {q.timesMissed === 1 ? 'time' : 'times'}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-dark-card px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-dark-border">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {q.text}
                  </p>
                </div>

                <Button
                  variant="yellow"
                  size="sm"
                  onClick={() => handlePracticeTopic(q.topic, q.topicDisplay)}
                  className="shrink-0"
                >
                  Reinforce Topic
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeakTopics;
