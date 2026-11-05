const express = require('express');
const { z } = require('zod');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/error');
const { submitAttemptHandler, submitAttemptSchema } = require('./attempts');

const router = express.Router();

const createQuizSchema = z.object({
  title: z.string().trim().min(3, 'Quiz title must be at least 3 characters').max(100),
  description: z.string().trim().optional().default(''),
  isPublic: z.boolean().optional().default(true),
  autoGenerate: z.boolean().optional().default(false),
  questionIds: z.array(objectIdSchema).optional(),
  topics: z.union([z.string(), z.array(z.string())]).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'all']).optional(),
  count: z.number().int().min(1, 'Count must be at least 1').max(50, 'Count cannot exceed 50').optional(),
});

// @route   POST /api/quizzes
// @desc    Create a quiz (manual list of question IDs OR auto-generate by topic/difficulty/count)
// @access  Private
router.post(
  '/',
  protect,
  validate(createQuizSchema),
  asyncHandler(async (req, res) => {
    const { title, description, isPublic, autoGenerate, questionIds, topics, difficulty, count } = req.body;

    let selectedQuestionIds = [];
    let appliedFilters = {};

    if (autoGenerate) {
      const matchCriteria = { status: 'approved' };

      // Handle topics filter
      if (topics) {
        const topicList = Array.isArray(topics)
          ? topics.map((t) => t.trim().toLowerCase()).filter(Boolean)
          : [topics.trim().toLowerCase()];
        if (topicList.length > 0) {
          matchCriteria.topic = { $in: topicList };
          appliedFilters.topic = topicList.join(', ');
        }
      }

      // Handle difficulty filter
      if (difficulty && difficulty !== 'all') {
        matchCriteria.difficulty = difficulty;
        appliedFilters.difficulty = difficulty;
      }

      const requestedCount = count || 5;
      appliedFilters.count = requestedCount;

      // Count matching approved questions
      const matchingCount = await Question.countDocuments(matchCriteria);
      if (matchingCount === 0) {
        return res.status(400).json({
          message: 'No approved questions match the selected criteria. Try selecting different topics or difficulties.',
        });
      }

      if (matchingCount < requestedCount) {
        return res.status(400).json({
          message: `Not enough approved questions matching criteria. Requested ${requestedCount}, but only ${matchingCount} are available.`,
        });
      }

      // Random sample
      const sampledQuestions = await Question.aggregate([
        { $match: matchCriteria },
        { $sample: { size: requestedCount } },
        { $project: { _id: 1 } },
      ]);

      selectedQuestionIds = sampledQuestions.map((q) => q._id);
    } else {
      // Manual list of question IDs
      if (!questionIds || questionIds.length === 0) {
        return res.status(400).json({
          message: 'Please provide at least one question ID or enable auto-generate.',
        });
      }

      // Verify that all provided question IDs exist and are approved
      const validQuestions = await Question.find({
        _id: { $in: questionIds },
        status: 'approved',
      }).select('_id');

      if (validQuestions.length !== questionIds.length) {
        return res.status(400).json({
          message: 'One or more selected questions are either invalid, non-existent, or not approved.',
        });
      }

      selectedQuestionIds = questionIds;
    }

    const quiz = await Quiz.create({
      title,
      description: description || '',
      createdBy: req.user._id,
      questions: selectedQuestionIds,
      filters: appliedFilters,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    const populated = await Quiz.findById(quiz._id)
      .populate('createdBy', 'name email')
      .populate('questions', 'text options topic topicDisplay difficulty');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: populated,
    });
  })
);

// @route   GET /api/quizzes
// @desc    Get quizzes (public ones + own created)
// @access  Public / Optional Auth
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    let currentUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quizcraft_super_secret_jwt_key_2026');
        currentUserId = decoded.id;
      } catch (e) {
        // Continue unauthenticated
      }
    }

    const filter = currentUserId
      ? { $or: [{ isPublic: true }, { createdBy: currentUserId }] }
      : { isPublic: true };

    if (req.query.search) {
      const sanitized = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: sanitized, $options: 'i' };
    }

    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role')
        .populate('questions', '_id topic difficulty'),
      Quiz.countDocuments(filter),
    ]);

    // Format output with question count and topic summary
    const formatted = quizzes.map((q) => {
      const topicsSet = new Set(q.questions.map((item) => item.topic));
      return {
        _id: q._id,
        title: q.title,
        description: q.description,
        createdBy: q.createdBy,
        isPublic: q.isPublic,
        questionCount: q.questions.length,
        topics: Array.from(topicsSet),
        filters: q.filters,
        createdAt: q.createdAt,
      };
    });

    res.json({
      quizzes: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  })
);

// @route   GET /api/quizzes/:id
// @desc    Get quiz details for taking (DO NOT return correctIndex or explanation!)
// @access  Public / Optional Auth
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('questions', 'text options topic topicDisplay difficulty');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // SANITIZATION: Never return correctIndex or explanation when taking a quiz!
    const sanitizedQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      topic: q.topic,
      topicDisplay: q.topicDisplay,
      difficulty: q.difficulty,
    }));

    res.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        createdBy: quiz.createdBy,
        isPublic: quiz.isPublic,
        filters: quiz.filters,
        createdAt: quiz.createdAt,
        questions: sanitizedQuestions,
      },
    });
  })
);

// @route   DELETE /api/quizzes/:id
// @desc    Delete quiz (owner or moderator)
// @access  Private
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const isOwner = quiz.createdBy.toString() === req.user._id.toString();
    const isModerator = req.user.role === 'moderator';

    if (!isOwner && !isModerator) {
      return res.status(403).json({ message: 'You do not have permission to delete this quiz.' });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quiz deleted successfully' });
  })
);

// @route   POST /api/quizzes/:id/attempts
// @desc    Submit attempt for quiz, evaluate on server
// @access  Private
router.post('/:id/attempts', protect, validate(submitAttemptSchema), submitAttemptHandler);

module.exports = router;

