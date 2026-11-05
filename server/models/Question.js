const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: [5, 'Question text must be at least 5 characters'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length >= 2 && val.length <= 6;
        },
        message: 'A question must have between 2 and 6 options',
      },
    },
    correctIndex: {
      type: Number,
      required: [true, 'Correct index is required'],
      validate: {
        validator: function (val) {
          return val >= 0 && val < this.options.length;
        },
        message: 'Correct index must be within the range of available options',
      },
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      lowercase: true,
    },
    topicDisplay: {
      type: String,
      required: [true, 'Topic display name is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty is required'],
    },
    explanation: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    moderationNote: {
      type: String,
      trim: true,
      default: '',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ topic: 1, difficulty: 1, status: 1 });
questionSchema.index({ status: 1, createdAt: -1 });
questionSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);

