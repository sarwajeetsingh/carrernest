const mongoose = require('mongoose');
const Job = require('../models/Job');

// @desc    Get all jobs for user
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
  try {
    const { status, sort } = req.query;
    let query = { userId: req.user._id };

    // Filter by status if provided
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'company') {
      sortOption = { companyName: 1 };
    }

    const jobs = await Job.find(query).sort(sortOption);
    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Make sure job belongs to user
    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      jobDescription,
      applicationDate,
      applicationMethod,
      status,
      salaryRange,
      jobUrl,
      notes,
      reminderDate,
    } = req.body;

    // Validation
    if (!companyName || !jobTitle) {
      return res.status(400).json({ message: 'Company name and job title are required' });
    }

    const job = await Job.create({
      userId: req.user._id,
      companyName,
      jobTitle,
      jobDescription,
      applicationDate: applicationDate || new Date(),
      applicationMethod,
      status: status || 'Applied',
      salaryRange,
      jobUrl,
      notes,
      reminderDate,
      statusHistory: [{
        status: status || 'Applied',
        date: new Date(),
      }],
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Make sure job belongs to user
    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update job
    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Make sure job belongs to user
    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job removed' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Job.countDocuments({ userId });
    const byStatus = await Job.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const upcomingReminders = await Job.find({
      userId,
      reminderDate: { $gte: new Date() },
    })
      .sort({ reminderDate: 1 })
      .limit(5);

    res.json({
      total,
      byStatus,
      upcomingReminders,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get upcoming reminders
// @route   GET /api/jobs/reminders
// @access  Private
exports.getReminders = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const reminders = await Job.find({
      userId: req.user._id,
      reminderDate: {
        $gte: new Date(),
        $lte: futureDate,
      },
    })
      .sort({ reminderDate: 1 });

    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

