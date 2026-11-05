const express = require('express');
const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// ============================================================================
// WEAK TOPICS THRESHOLDS CONFIGURATION
// A topic is categorized as "weak" when a learner exhibits repeated difficulties:
// 1. Minimum Incorrect Threshold: 3 or more total incorrect answers in the topic
//    OR
// 2. Minimum Volume & Accuracy Threshold: At least 4 questions answered with an accuracy below 60%
// ============================================================================
const WEAK_INCORRECT_MIN_THRESHOLD = 3;
const WEAK_TOTAL_MIN_THRESHOLD = 4;
const WEAK_ACCURACY_MAX_THRESHOLD = 60; // in percent ( < 60% )

// @route   GET /api/analytics/weak-topics
// @desc    Analyze current user's attempts to identify weak topics & most missed questions
// @access  Private
router.get(
  '/weak-topics',
  protect,
  asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Aggregate answers by topic
    const topicStats = await Attempt.aggregate([
      { $match: { user: userId } },
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$answers.topic',
          topicDisplay: { $first: '$answers.topicDisplay' },
          totalAnswered: { $sum: 1 },
          correctCount: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
          incorrectCount: { $sum: { $cond: ['$answers.isCorrect', 0, 1] } },
          missedQuestions: {
            $push: {
              $cond: ['$answers.isCorrect', '$$REMOVE', '$answers.question'],
            },
          },
        },
      },
    ]);

    // Format and calculate weakness metrics
    const analyzedTopics = topicStats.map((item) => {
      const totalAnswered = item.totalAnswered;
      const correctCount = item.correctCount;
      const incorrectCount = item.incorrectCount;
      const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

      // Count distinct questions missed more than once
      const missedFreqMap = {};
      if (Array.isArray(item.missedQuestions)) {
        item.missedQuestions.forEach((qId) => {
          if (qId) {
            const strId = qId.toString();
            missedFreqMap[strId] = (missedFreqMap[strId] || 0) + 1;
          }
        });
      }

      const repeatedMisses = Object.values(missedFreqMap).filter((count) => count >= 2).length;

      // Weak topic formula: incorrectCount >= 3 OR (totalAnswered >= 4 AND accuracy < 60%)
      const isWeak =
        incorrectCount >= WEAK_INCORRECT_MIN_THRESHOLD ||
        (totalAnswered >= WEAK_TOTAL_MIN_THRESHOLD && accuracy < WEAK_ACCURACY_MAX_THRESHOLD);

      return {
        topic: item._id,
        topicDisplay: item.topicDisplay || item._id,
        totalAnswered,
        correctCount,
        incorrectCount,
        accuracy,
        distinctMissedMultipleTimes: repeatedMisses,
        isWeak,
      };
    });

    // Sort by worst performance first:
    // 1. Weak topics first
    // 2. Lowest accuracy first
    // 3. Highest incorrect count first
    analyzedTopics.sort((a, b) => {
      if (a.isWeak !== b.isWeak) {
        return a.isWeak ? -1 : 1;
      }
      if (a.accuracy !== b.accuracy) {
        return a.accuracy - b.accuracy;
      }
      return b.incorrectCount - a.incorrectCount;
    });

    // 2. Identify Top 5 specific questions the user has missed most often
    const topMissedAgg = await Attempt.aggregate([
      { $match: { user: userId } },
      { $unwind: '$answers' },
      { $match: { 'answers.isCorrect': false } },
      {
        $group: {
          _id: '$answers.question',
          timesMissed: { $sum: 1 },
          topic: { $first: '$answers.topic' },
          topicDisplay: { $first: '$answers.topicDisplay' },
        },
      },
      { $sort: { timesMissed: -1 } },
      { $limit: 5 },
    ]);

    // Populate question text and difficulty for top missed questions
    const questionIds = topMissedAgg.map((item) => item._id);
    const questionsInfo = await Question.find({ _id: { $in: questionIds } }).select(
      'text difficulty options explanation'
    );
    const questionMap = new Map();
    questionsInfo.forEach((q) => questionMap.set(q._id.toString(), q));

    const mostMissedQuestions = topMissedAgg.map((item) => {
      const q = questionMap.get(item._id.toString());
      return {
        questionId: item._id,
        timesMissed: item.timesMissed,
        topic: item.topic,
        topicDisplay: item.topicDisplay,
        text: q ? q.text : 'Question no longer available',
        difficulty: q ? q.difficulty : 'medium',
      };
    });

    res.json({
      thresholds: {
        weakIncorrectMin: WEAK_INCORRECT_MIN_THRESHOLD,
        weakTotalMin: WEAK_TOTAL_MIN_THRESHOLD,
        weakAccuracyMax: WEAK_ACCURACY_MAX_THRESHOLD,
      },
      topics: analyzedTopics,
      weakTopicsCount: analyzedTopics.filter((t) => t.isWeak).length,
      mostMissedQuestions,
    });
  })
);

// @route   GET /api/analytics/summary
// @desc    Overall performance summary, score history series for charts
// @access  Private
router.get(
  '/summary',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const attempts = await Attempt.find({ user: userId })
      .sort({ createdAt: 1 }) // chronological for chart
      .populate('quiz', 'title');

    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return res.json({
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestionsAnswered: 0,
        scoreHistory: [],
      });
    }

    let totalScoreSum = 0;
    let bestScore = 0;
    let totalQuestionsAnswered = 0;

    const scoreHistory = attempts.map((att, index) => {
      totalScoreSum += att.percentage;
      if (att.percentage > bestScore) {
        bestScore = att.percentage;
      }
      totalQuestionsAnswered += att.total;

      const dateStr = new Date(att.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      return {
        attemptNumber: index + 1,
        attemptId: att._id,
        date: dateStr,
        fullDate: att.createdAt,
        quizTitle: att.quiz ? att.quiz.title : 'Practice Quiz',
        percentage: att.percentage,
        score: att.score,
        total: att.total,
      };
    });

    const averageScore = Math.round(totalScoreSum / totalAttempts);

    res.json({
      totalAttempts,
      averageScore,
      bestScore,
      totalQuestionsAnswered,
      scoreHistory,
    });
  })
);

module.exports = router;

