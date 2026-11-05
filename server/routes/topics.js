const express = require('express');
const Question = require('../models/Question');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// @route   GET /api/topics
// @desc    Get distinct approved topics with counts per difficulty
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const topics = await Question.aggregate([
      {
        $match: { status: 'approved' },
      },
      {
        $group: {
          _id: '$topic',
          topic: { $first: '$topic' },
          topicDisplay: { $first: '$topicDisplay' },
          total: { $sum: 1 },
          easy: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] },
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] },
          },
          hard: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] },
          },
        },
      },
      {
        $sort: { total: -1, topicDisplay: 1 },
      },
      {
        $project: {
          _id: 0,
          topic: 1,
          topicDisplay: 1,
          total: 1,
          easy: 1,
          medium: 1,
          hard: 1,
        },
      },
    ]);

    res.json({ topics });
  })
);

module.exports = router;

