import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CountUp } from '../components/ui/CountUp';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  Zap,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qId]: selectedIndex }
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  // Timer interval
  useEffect(() => {
    if (!quiz || result) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, result]);

  // Fire confetti upon good score
  useEffect(() => {
    if (result && result.attempt && result.attempt.percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6C47FF', '#3B82F6', '#FF4D8D', '#FFC83D', '#14D9B0'],
      });
    }
  }, [result]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${id}`);
      setQuiz(res.data.quiz);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load quiz');
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSubmitAttempt = async () => {
    if (!quiz) return;

    const totalQuestions = quiz.questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < totalQuestions) {
      const proceed = window.confirm(
        `You have answered ${answeredCount} of ${totalQuestions} questions. Unanswered questions will be marked incorrect. Submit now?`
      );
      if (!proceed) return;
    }

    setSubmitting(true);
    try {
      const answersPayload = quiz.questions.map((q) => ({
        questionId: q._id,
        selectedIndex: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : -1,
      }));

      const res = await api.post(`/quizzes/${quiz._id}/attempts`, {
        answers: answersPayload,
        durationSeconds: secondsElapsed,
      });

      toast.success('Quiz evaluated and graded successfully!');
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit quiz';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-9 h-9 text-brand-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-500 dark:text-dark-textMuted">
          Preparing examination environment...
        </p>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="max-w-md mx-auto my-12 p-8 text-center">
        <AlertCircle className="w-10 h-10 text-brand-yellow mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quiz has no questions</h2>
        <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1 mb-6">
          This quiz does not contain any questions right now.
        </p>
        <Link to="/quizzes">
          <Button variant="primary">Return to Quizzes</Button>
        </Link>
      </Card>
    );
  }

  // =========================================================================
  // VIEW: RESULT / GRADED FEEDBACK PAGE
  // =========================================================================
  if (result) {
    const { attempt, results } = result;
    const isPassing = attempt.percentage >= 60;

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Score Banner with Gamified Ring / Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`relative overflow-hidden p-6 sm:p-10 rounded-3xl text-center shadow-2xl border ${
            isPassing
              ? 'bg-gradient-to-br from-brand-mint via-emerald-600 to-teal-800 text-slate-950 border-emerald-400/30'
              : 'bg-gradient-to-br from-brand-pink via-rose-600 to-red-800 text-white border-rose-400/30'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Trophy className="w-8 h-8 text-brand-yellow" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest opacity-90 block">
            Assessment Completed
          </span>
          <h1 className="text-2xl sm:text-4xl font-heading font-black mt-1 tracking-tight">
            {quiz.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-bold">
            <div className="bg-black/25 text-white px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
              <span className="block text-4xl font-heading font-black">
                <CountUp end={attempt.percentage} suffix="%" />
              </span>
              <span className="text-xs text-white/80">
                Score: {attempt.score} of {attempt.total}
              </span>
            </div>
            <div className="bg-black/25 text-white px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
              <span className="block text-4xl font-heading font-black font-mono">
                {formatTimer(attempt.durationSeconds)}
              </span>
              <span className="text-xs text-white/80">Time Spent</span>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/weak-topics">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg border-white/40"
              >
                View Weak Topics Analysis &rarr;
              </Button>
            </Link>
            <Link to="/quizzes">
              <Button
                variant="secondary"
                className="bg-black/20 hover:bg-black/30 text-white border-white/20 backdrop-blur-sm"
              >
                Practice Another Quiz
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Detailed per-question answer breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            Question-by-Question Review
          </h2>

          <div className="space-y-4">
            {results.map((q, idx) => (
              <Card
                key={q.questionId}
                className={`p-6 border transition-all ${
                  q.isCorrect
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-dark-card px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-dark-border">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>

                  {q.isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/60 px-3 py-1 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct (+1)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/60 px-3 py-1 rounded-xl">
                      <XCircle className="w-4 h-4 text-rose-600" /> Incorrect (0)
                    </span>
                  )}
                </div>

                <p className="text-base font-heading font-bold text-slate-900 dark:text-white my-3 leading-snug">
                  {q.text}
                </p>

                {/* Options List with outcome indicators */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = q.selectedIndex === optIdx;
                    const isTheCorrectOption = q.correctIndex === optIdx;

                    let optStyle =
                      'bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300';
                    if (isTheCorrectOption) {
                      optStyle =
                        'bg-emerald-100 dark:bg-emerald-950/60 border-brand-mint text-emerald-950 dark:text-emerald-200 font-bold shadow-xs';
                    } else if (isSelected && !q.isCorrect) {
                      optStyle =
                        'bg-rose-100 dark:bg-rose-950/60 border-rose-400 text-rose-950 dark:text-rose-200 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border font-bold flex items-center justify-center text-[10px] text-slate-700 dark:text-slate-200">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        <div>
                          {isTheCorrectOption && (
                            <span className="text-emerald-700 dark:text-emerald-300 font-black text-[11px]">
                              &bull; Correct Answer
                            </span>
                          )}
                          {isSelected && !isTheCorrectOption && (
                            <span className="text-rose-700 dark:text-rose-300 font-black text-[11px]">
                              &bull; Your Selection
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-4 bg-brand-50/70 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-2xl text-xs text-brand-900 dark:text-brand-200 leading-relaxed">
                    <span className="font-extrabold block mb-0.5 text-brand-700 dark:text-brand-300">
                      Explanation & Pedagogical Reasoning:
                    </span>
                    {q.explanation}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: TAKING THE QUIZ (LIVE EXAM)
  // =========================================================================
  const currentQ = quiz.questions[currentIndex];
  const totalQ = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQ) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Top bar: Title, Timer, Progress */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-500 block">
              Active Assessment
            </span>
            <h1 className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-white leading-snug tracking-tight">
              {quiz.title}
            </h1>
          </div>

          {/* Live Timer with pulse */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-bold text-xs shadow-sm transition-colors ${
              secondsElapsed > 600
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-900 dark:bg-dark-card text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-brand-yellow" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-dark-textMuted mb-1.5">
            <span>
              Question <strong className="text-slate-900 dark:text-white">{currentIndex + 1}</strong> of{' '}
              {totalQ}
            </span>
            <span>
              {answeredCount} of {totalQ} answered ({progressPercent}%)
            </span>
          </div>
          <ProgressBar value={currentIndex + 1} max={totalQ} color="primary" />
        </div>

        {/* Question Jumper Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-dark-border">
          {quiz.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q._id] !== undefined;
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={q._id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 ring-2 ring-brand-500 ring-offset-2'
                    : isAnswered
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-cardHover'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Current Question Card with Framer Motion slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-dark-border pb-3">
              <span className="text-xs font-bold bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-xl">
                {currentQ.topicDisplay}
              </span>
              <DifficultyBadge difficulty={currentQ.difficulty} />
            </div>

            <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 dark:text-white leading-relaxed">
              {currentQ.text}
            </h2>

            {/* Option Selection Radio Tiles */}
            <div className="space-y-3">
              {currentQ.options.map((optionText, optIdx) => {
                const isSelected = selectedAnswers[currentQ._id] === optIdx;

                return (
                  <motion.div
                    key={optIdx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectOption(currentQ._id, optIdx)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 tap-target ${
                      isSelected
                        ? 'bg-brand-50/90 dark:bg-brand-500/20 border-brand-500 shadow-md shadow-brand-500/15'
                        : 'bg-slate-50/70 dark:bg-dark-card border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span
                      className={`text-sm ${
                        isSelected
                          ? 'font-bold text-brand-700 dark:text-brand-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {optionText}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation / Submit Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-dark-border flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                disabled={currentIndex === 0}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentIndex < totalQ - 1 ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentIndex((idx) => Math.min(totalQ - 1, idx + 1))}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    variant="mint"
                    size="md"
                    onClick={handleSubmitAttempt}
                    disabled={submitting}
                    loading={submitting}
                    icon={<Send className="w-4 h-4" />}
                    className="shadow-glow-mint"
                  >
                    Submit & Grade
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TakeQuiz;
