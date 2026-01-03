const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getStats,
  getReminders,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getJobs)
  .post(createJob);

router.route('/stats')
  .get(getStats);

router.route('/reminders')
  .get(getReminders);

router.route('/:id')
  .get(getJob)
  .put(updateJob)
  .delete(deleteJob);

module.exports = router;

