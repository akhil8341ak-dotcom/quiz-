const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      minlength: [3, 'Quiz title must be at least 3 characters'],
      maxlength: [100, 'Quiz title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
    ],
    filters: {
      topic: { type: String, default: null },
      difficulty: { type: String, default: null },
      count: { type: Number, default: null },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);

