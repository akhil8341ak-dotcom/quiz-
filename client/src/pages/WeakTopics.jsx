import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
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
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';

const WeakTopics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practicingTopic, setPracticingTopic] = useState(null);

  const toast = useToast();
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
      const msg = err.response?.data?.message || `Not enough questions in ${topicDisplay} for auto-generating a quiz.`;
      toast.error(msg);
    } finally {
      setPracticingTopic(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-9 h-9 text-rose-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-500">Analyzing answer distributions & error rates...</p>
      </div>
    );
  }

  const topics = data?.topics || [];
  const mostMissed = data?.mostMissedQuestions || [];
  const weakCount = data?.weakTopicsCount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-full flex items-center gap-1.5 shadow-xs">
            <Target className="w-3.5 h-3.5 text-rose-600" />
            Core Differentiating Feature
          </span>
          <span className="text-xs text-slate-500 font-semibold">Algorithmic Weakness Detection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Weak Topics Analysis
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          QuizCraft monitors each answer you submit and aggregates error frequencies by topic. Topics with repeated wrong answers are algorithmically highlighted for targeted reinforcement.
        </p>
      </div>

      {/* Algorithm explanation alert */}
      <div className="p-5 bg-gradient-to-r from-blue-50/90 to-indigo-50/60 border border-blue-200/90 rounded-3xl flex items-start gap-4 text-xs text-blue-900 shadow-sm">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-2xl flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <span className="font-extrabold text-sm block text-blue-950">How the Weakness Detection Formula Works:</span>
          <span className="block text-blue-900 leading-relaxed">
            A topic is flagged as <span className="font-bold text-rose-700">"Weak"</span> if either condition is met:
            <ul className="list-disc list-inside mt-1.5 space-y-1 font-semibold text-blue-900">
              <li>You have <strong>3 or more incorrect answers</strong> in that topic (<code className="bg-white/80 px-1.5 py-0.5 rounded border border-blue-200">incorrectCount &gt;= 3</code>), OR</li>
              <li>You have answered at least <strong>4 questions</strong> with an overall accuracy under <strong>60%</strong> (<code className="bg-white/80 px-1.5 py-0.5 rounded border border-blue-200">totalAnswered &gt;= 4 && accuracy &lt; 60%</code>).</li>
            </ul>
          </span>
        </div>
      </div>

      {/* Accuracy Chart per Topic (Recharts Bar Chart) */}
      {topics.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Topic Accuracy Comparison (%)</h2>
            <p className="text-xs text-slate-500">
              Red bars indicate topics flagged as weak. Green/blue indicate mastery.
            </p>
          </div>

          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="topicDisplay"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const t = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1 border border-slate-800">
                          <p className="font-bold text-slate-100">{t.topicDisplay}</p>
                          <p className="font-black text-sm">Accuracy: {t.accuracy}%</p>
                          <p className="text-slate-300">
                            {t.correctCount} correct / {t.incorrectCount} incorrect ({t.totalAnswered} total)
                          </p>
                          {t.isWeak && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-md">
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
                      fill={entry.isWeak ? '#e11d48' : entry.accuracy >= 80 ? '#10b981' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Flagged Weak Topics Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Evaluated Topics</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-slate-100 text-slate-700">
              {topics.length} total
            </span>
          </h2>
        </div>

        {topics.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
            <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-base text-slate-700">No topic data available yet</p>
            <p className="text-xs text-slate-400 mt-1">Take a quiz to begin accumulating topic performance data!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((item) => {
              const isWeak = item.isWeak;
              return (
                <div
                  key={item.topic}
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                    isWeak
                      ? 'bg-rose-50/60 border-rose-300 shadow-md shadow-rose-500/5'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-black text-slate-900 text-base tracking-tight">{item.topicDisplay}</h3>
                        <div className="text-xs text-slate-500 mt-0.5 font-medium">
                          {item.totalAnswered} questions attempted
                        </div>
                      </div>
                      {isWeak ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Weak
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Proficient
                        </span>
                      )}
                    </div>

                    {/* Accuracy Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Accuracy</span>
                        <span className={isWeak ? 'text-rose-700 font-black' : 'text-slate-900'}>
                          {item.accuracy}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200/90 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isWeak
                              ? 'bg-rose-600'
                              : item.accuracy >= 80
                              ? 'bg-emerald-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2.5 px-3 bg-white/90 rounded-2xl border border-slate-200/80 mb-5">
                      <div>
                        <span className="text-slate-400 block text-[11px] font-bold">Correct</span>
                        <span className="font-extrabold text-emerald-700">{item.correctCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px] font-bold">Incorrect</span>
                        <span className="font-extrabold text-rose-600">{item.incorrectCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* One-click practice this topic */}
                  <button
                    onClick={() => handlePracticeTopic(item.topic, item.topicDisplay)}
                    disabled={practicingTopic === item.topic}
                    className={`w-full py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition tap-target ${
                      isWeak
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {practicingTopic === item.topic ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        Practice This Topic
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Questions You Keep Missing (Top 5 repeatedly missed) */}
      {mostMissed.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Questions You Keep Missing</h2>
              <p className="text-xs text-slate-500 font-medium">
                Top questions answered incorrectly more than once across your attempts
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mostMissed.map((q) => (
              <div
                key={q.questionId}
                className="p-5 rounded-2xl border border-amber-200/90 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-lg">
                      Missed {q.timesMissed} {q.timesMissed === 1 ? 'time' : 'times'}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{q.text}</p>
                </div>

                <button
                  onClick={() => handlePracticeTopic(q.topic, q.topicDisplay)}
                  className="tap-target px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold self-start sm:self-center flex-shrink-0 transition shadow-sm"
                >
                  Reinforce Topic
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default WeakTopics;
