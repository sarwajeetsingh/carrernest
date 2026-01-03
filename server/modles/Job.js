const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
}, { _id: false });

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  jobDescription: {
    type: String,
    trim: true,
  },
  applicationDate: {
    type: Date,
    required: [true, 'Application date is required'],
    default: Date.now,
  },
  applicationMethod: {
    type: String,
    enum: ['LinkedIn', 'Company Website', 'Referral', 'Job Board', 'Email', 'Other'],
    default: 'Company Website',
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview Scheduled', 'Interview Completed', 'Offer Received', 'Rejected', 'Withdrawn', 'On Hold'],
    default: 'Applied',
  },
  salaryRange: {
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  jobUrl: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  reminderDate: {
    type: Date,
  },
  statusHistory: [statusHistorySchema],
}, {
  timestamps: true,
});

// Add to status history when status changes
jobSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
    });
  }
  next();
});

// Index for faster queries
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, reminderDate: 1 });

module.exports = mongoose.model('Job', jobSchema);

