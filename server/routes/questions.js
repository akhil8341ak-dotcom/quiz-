const express = require('express');
const { z } = require('zod');
const Question = require('../models/Question');
const { protect, requireRole } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// Validation schemas
const createQuestionSchema = z
  .object({
    text: z.string().trim().min(5, 'Question text must be at least 5 characters'),
    options: z
      .array(z.string().trim().min(1, 'Option text cannot be empty'))
      .min(2, 'At least 2 options are required')
      .max(6, 'At most 6 options are allowed'),
    correctIndex: z.number().int().min(0, 'Correct index must be non-negative'),
    topic: z.string().trim().min(2, 'Topic must be at least 2 characters'),
    difficulty: z.enum(['easy', 'medium', 'hard'], {
      errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard' }),
    }),
    explanation: z.string().trim().optional().default(''),
  })
  .refine((data) => data.correctIndex < data.options.length, {
    message: 'Correct index must be within the bounds of provided options',
    path: ['correctIndex'],
  });

const updateQuestionSchema = z
  .object({
    text: z.string().trim().min(5, 'Question text must be at least 5 characters').optional(),
    options: z
      .array(z.string().trim().min(1, 'Option text cannot be empty'))
      .min(2, 'At least 2 options are required')
      .max(6, 'At most 6 options are allowed')
      .optional(),
    correctIndex: z.number().int().min(0).optional(),
    topic: z.string().trim().min(2).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    explanation: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.options && data.correctIndex !== undefined) {
        return data.correctIndex < data.options.length;
      }
      return true;
    },
    {
      message: 'Correct index must be within the bounds of provided options',
      path: ['correctIndex'],
    }
  );

const moderateSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status must be approved or rejected' }),
  }),
  note: z.string().trim().optional().default(''),
});

// @route   POST /api/questions
// @desc    Submit a question (student: pending, moderator: auto-approved)
// @access  Private (student or moderator)
router.post(
  '/',
  protect,
  validate(createQuestionSchema),
  asyncHandler(async (req, res) => {
    const { text, options, correctIndex, topic, difficulty, explanation } = req.body;
    const isMod = req.user.role === 'moderator';

    const question = await Question.create({
      text,
      options,
      correctIndex,
      topic: topic.trim().toLowerCase(),
      topicDisplay: topic.trim(),
      difficulty,
      explanation: explanation || '',
      createdBy: req.user._id,
      status: isMod ? 'approved' : 'pending',
      moderationNote: isMod ? 'Auto-approved by moderator' : '',
      moderatedBy: isMod ? req.user._id : null,
      moderatedAt: isMod ? new Date() : null,
    });

    const populated = await Question.findById(question._id)
      .populate('createdBy', 'name email role')
      .populate('moderatedBy', 'name email');

    res.status(201).json({
      message: isMod
        ? 'Question created and auto-approved'
        : 'Question submitted successfully and is pending review',
      question: populated,
    });
  })
);

// @route   GET /api/questions/mine
// @desc    Get user's own submissions with status & moderation note
// @access  Private
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { createdBy: req.user._id };

    if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('moderatedBy', 'name email'),
      Question.countDocuments(filter),
    ]);

    res.json({
      questions,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  })
);

// @route   GET /api/questions/pending
// @desc    Get pending questions for moderation
// @access  Private (moderator only)
router.get(
  '/pending',
  protect,
  requireRole('moderator'),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.find({ status: 'pending' })
        .sort({ createdAt: 1 }) // oldest first for queue
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role'),
      Question.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      questions,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  })
);

// @route   GET /api/questions
// @desc    Get questions (approved by default; query: topic, difficulty, search, page, limit)
// @access  Private or Public (moderators may specify status)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    // Check optional token if sent in Authorization header
    let isModerator = false;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quizcraft_super_secret_jwt_key_2026');
        if (decoded.role === 'moderator') {
          isModerator = true;
        }
      } catch (e) {
        // Ignore token errors for public list
      }
    }

    if (isModerator && req.query.status) {
      if (req.query.status !== 'all') {
        filter.status = req.query.status;
      }
    } else {
      filter.status = 'approved';
    }

    if (req.query.topic) {
      filter.topic = req.query.topic.trim().toLowerCase();
    }

    if (req.query.difficulty && ['easy', 'medium', 'hard'].includes(req.query.difficulty)) {
      filter.difficulty = req.query.difficulty;
    }

    if (req.query.search) {
      const sanitized = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.text = { $regex: sanitized, $options: 'i' };
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role'),
      Question.countDocuments(filter),
    ]);

    res.json({
      questions,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  })
);

// @route   PATCH /api/questions/:id/moderate
// @desc    Approve or reject a question with a note
// @access  Private (moderator only)
router.patch(
  '/:id/moderate',
  protect,
  requireRole('moderator'),
  validate(moderateSchema),
  asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { status, note } = req.body;
    question.status = status;
    question.moderationNote = note || '';
    question.moderatedBy = req.user._id;
    question.moderatedAt = new Date();

    await question.save();

    const populated = await Question.findById(question._id)
      .populate('createdBy', 'name email role')
      .populate('moderatedBy', 'name email');

    res.json({
      message: `Question ${status} successfully`,
      question: populated,
    });
  })
);

// @route   PUT /api/questions/:id
// @desc    Edit a question (owner while pending, or moderator)
// @access  Private
router.put(
  '/:id',
  protect,
  validate(updateQuestionSchema),
  asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isOwner = question.createdBy.toString() === req.user._id.toString();
    const isModerator = req.user.role === 'moderator';

    if (!isModerator && (!isOwner || question.status !== 'pending')) {
      return res.status(403).json({
        message: 'You can only edit your own pending questions. Approved/rejected questions cannot be modified by students.',
      });
    }

    const { text, options, correctIndex, topic, difficulty, explanation } = req.body;

    if (text !== undefined) question.text = text;
    if (options !== undefined) question.options = options;
    if (correctIndex !== undefined) question.correctIndex = correctIndex;
    if (topic !== undefined) {
      question.topic = topic.trim().toLowerCase();
      question.topicDisplay = topic.trim();
    }
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (explanation !== undefined) question.explanation = explanation;

    // Validate correctIndex against final options length
    if (question.correctIndex >= question.options.length) {
      return res.status(400).json({
        message: 'Correct index is out of bounds for the current options',
      });
    }

    // If edited by owner, keep/reset status to pending
    if (!isModerator) {
      question.status = 'pending';
      question.moderationNote = '';
    }

    await question.save();

    const populated = await Question.findById(question._id)
      .populate('createdBy', 'name email role')
      .populate('moderatedBy', 'name email');

    res.json({
      message: 'Question updated successfully',
      question: populated,
    });
  })
);

// @route   DELETE /api/questions/:id
// @desc    Delete a question (owner while pending, or moderator)
// @access  Private
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isOwner = question.createdBy.toString() === req.user._id.toString();
    const isModerator = req.user.role === 'moderator';

    if (!isModerator && (!isOwner || question.status !== 'pending')) {
      return res.status(403).json({
        message: 'You can only delete your own pending questions.',
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: 'Question deleted successfully' });
  })
);

module.exports = router;

