const express = require('express');
const { z } = require('zod');
const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: objectIdSchema,
      selectedIndex: z.number().int(),
    })
  ),
  durationSeconds: z.number().int().min(0).optional().default(0),
});

const submitAttemptHandler = asyncHandler(async (req, res) => {
  const quizId = req.params.id;
  const { answers, durationSeconds } = req.body;

  const quiz = await Quiz.findById(quizId).populate('questions');
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  // Map quiz questions by ID for fast grading
  const questionMap = new Map();
  quiz.questions.forEach((q) => {
    questionMap.set(q._id.toString(), q);
  });

  let score = 0;
  const total = quiz.questions.length;
  const gradedAnswers = [];
  const detailedResults = [];

  // Map user answers
  const userAnswersMap = new Map();
  answers.forEach((ans) => {
    userAnswersMap.set(ans.questionId.toString(), ans.selectedIndex);
  });

  // Grade every question in the quiz
  for (const question of quiz.questions) {
    const qIdStr = question._id.toString();
    const selectedIndex = userAnswersMap.has(qIdStr) ? userAnswersMap.get(qIdStr) : -1;
    const isCorrect = selectedIndex === question.correctIndex;

    if (isCorrect) {
      score += 1;
    }

    // Snapshot stored in database
    gradedAnswers.push({
      question: question._id,
      selectedIndex,
      isCorrect,
      topic: question.topic,
      topicDisplay: question.topicDisplay || question.topic,
    });

    // Detailed feedback returned to client
    detailedResults.push({
      questionId: question._id,
      text: question.text,
      options: question.options,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      explanation: question.explanation || '',
      topic: question.topic,
      topicDisplay: question.topicDisplay || question.topic,
      difficulty: question.difficulty,
    });
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const attempt = await Attempt.create({
    user: req.user._id,
    quiz: quiz._id,
    answers: gradedAnswers,
    score,
    total,
    percentage,
    durationSeconds: durationSeconds || 0,
  });

  res.status(201).json({
    message: 'Attempt evaluated and recorded successfully',
    attempt: {
      _id: attempt._id,
      quiz: quiz._id,
      quizTitle: quiz.title,
      score,
      total,
      percentage,
      durationSeconds: attempt.durationSeconds,
      createdAt: attempt.createdAt,
    },
    results: detailedResults,
  });
});

// Support POST /api/attempts/:id
router.post('/:id', protect, validate(submitAttemptSchema), submitAttemptHandler);

// @route   GET /api/attempts/mine
// @desc    Get current user's past attempts (paginated, newest first)
// @access  Private
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    const [attempts, total] = await Promise.all([
      Attempt.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('quiz', 'title description filters'),
      Attempt.countDocuments(filter),
    ]);

    res.json({
      attempts,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  })
);

// @route   GET /api/attempts/:id
// @desc    Get single attempt review with full question details and explanations
// @access  Private (owner only)
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const attempt = await Attempt.findById(req.params.id)
      .populate('quiz', 'title description filters')
      .populate('answers.question');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.user.toString() !== req.user._id.toString() && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'You can only view your own quiz attempts.' });
    }

    res.json({ attempt });
  })
);

module.exports = {
  router,
  submitAttemptHandler,
  submitAttemptSchema,
};
