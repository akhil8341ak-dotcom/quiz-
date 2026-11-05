import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DifficultyBadge from '../components/DifficultyBadge';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Sparkles,
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
  const [result, setResult] = useState(null); // when submitted, shows graded feedback

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

      toast.success('Quiz submitted and graded successfully!');
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
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Preparing test questions...</p>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Quiz has no questions</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          This quiz doesn't contain any active questions right now.
        </p>
        <Link to="/quizzes" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold tap-target">
          Return to Quizzes
        </Link>
      </div>
    );
  }

  // =========================================================================
  // VIEW: RESULT / GRADED FEEDBACK PAGE
  // =========================================================================
  if (result) {
    const { attempt, results } = result;
    const isPassing = attempt.percentage >= 60;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
        {/* Score Banner */}
        <div
          className={`p-6 sm:p-8 rounded-3xl text-center shadow-lg ${
            isPassing
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-700/20'
              : 'bg-gradient-to-br from-rose-600 to-amber-700 text-white shadow-rose-700/20'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-amber-300" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-white/80">
            Quiz Completed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-1">{quiz.title}</h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
            <div className="bg-black/20 px-4 py-2 rounded-2xl">
              <span className="block text-2xl font-black">{attempt.percentage}%</span>
              <span className="text-xs text-white/80">
                Score ({attempt.score} of {attempt.total})
              </span>
            </div>
            <div className="bg-black/20 px-4 py-2 rounded-2xl">
              <span className="block text-2xl font-black">{formatTimer(attempt.durationSeconds)}</span>
              <span className="text-xs text-white/80">Time Spent</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/weak-topics"
              className="tap-target px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold rounded-xl text-xs shadow-md transition"
            >
              Check Weak Topics Analysis &rarr;
            </Link>
            <Link
              to="/quizzes"
              className="tap-target px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs backdrop-blur-sm transition"
            >
              Practice Another Quiz
            </Link>
          </div>
        </div>

        {/* Detailed per-question answer breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">Question-by-Question Review</h2>

          <div className="space-y-4">
            {results.map((q, idx) => (
              <div
                key={q.questionId}
                className={`p-6 rounded-3xl border transition ${
                  q.isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {q.topicDisplay}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>

                  {q.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct (+1)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                      <XCircle className="w-4 h-4 text-rose-600" /> Incorrect (0)
                    </span>
                  )}
                </div>

                <p className="text-base font-bold text-slate-900 my-3">{q.text}</p>

                {/* Options List with outcome indicators */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = q.selectedIndex === optIdx;
                    const isTheCorrectOption = q.correctIndex === optIdx;

                    let optStyle = 'bg-white border-slate-200 text-slate-700';
                    if (isTheCorrectOption) {
                      optStyle = 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold';
                    } else if (isSelected && !q.isCorrect) {
                      optStyle = 'bg-rose-100/80 border-rose-400 text-rose-950 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-white border font-bold flex items-center justify-center text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        <div>
                          {isTheCorrectOption && (
                            <span className="text-emerald-700 font-extrabold text-[11px]">
                              &bull; Correct Answer
                            </span>
                          )}
                          {isSelected && !isTheCorrectOption && (
                            <span className="text-rose-700 font-extrabold text-[11px]">
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
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-950 leading-relaxed">
                    <span className="font-bold block mb-0.5 text-blue-900">Explanation & Reasoning:</span>
                    {q.explanation}
                  </div>
                )}
              </div>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Quiz Top bar: Title, Timer, Progress */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Assessment
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {quiz.title}
            </h1>
          </div>

          {/* Live Timer */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-xl text-slate-700 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>
              Question <strong className="text-slate-900">{currentIndex + 1}</strong> of {totalQ}
            </span>
            <span>
              {answeredCount} of {totalQ} answered ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${(currentIndex + 1) / totalQ * 100}%` }}
            />
          </div>
        </div>

        {/* Question Jumper Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          {quiz.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q._id] !== undefined;
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={q._id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
            {currentQ.topicDisplay}
          </span>
          <DifficultyBadge difficulty={currentQ.difficulty} />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
          {currentQ.text}
        </h2>

        {/* Option Selection Radio Tiles */}
        <div className="space-y-3">
          {currentQ.options.map((optionText, optIdx) => {
            const isSelected = selectedAnswers[currentQ._id] === optIdx;

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectOption(currentQ._id, optIdx)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3.5 tap-target ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className={`text-sm ${isSelected ? 'font-bold text-blue-950' : 'text-slate-800'}`}>
                  {optionText}
                </span>
              </div>
            );
          })}
        </div>

        {/* Navigation / Submit Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
            disabled={currentIndex === 0}
            className="tap-target px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < totalQ - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.min(totalQ - 1, idx + 1))}
                className="tap-target px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitAttempt}
                disabled={submitting}
                className="tap-target px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Grading Quiz...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit & Grade
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
