import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { gsap } from 'gsap';
import { FiCalendar, FiClock, FiExternalLink } from 'react-icons/fi';
import { format, differenceInDays, isPast, isToday, isTomorrow } from 'date-fns';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(30);

  useEffect(() => {
    loadReminders();
  }, [daysFilter]);

  useEffect(() => {
    if (!loading) {
      // GSAP animations
      gsap.from('.reminder-card', {
        opacity: 0,
        x: -20,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
      });
    }
  }, [loading, reminders]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getReminders(daysFilter);
      setReminders(res.data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReminderLabel = (date) => {
    if (isPast(new Date(date)) && !isToday(new Date(date))) {
      return 'Overdue';
    }
    if (isToday(new Date(date))) {
      return 'Today';
    }
    if (isTomorrow(new Date(date))) {
      return 'Tomorrow';
    }
    const days = differenceInDays(new Date(date), new Date());
    return `In ${days} days`;
  };

  const getReminderColor = (date) => {
    if (isPast(new Date(date)) && !isToday(new Date(date))) {
      return 'bg-red-50 border-red-200';
    }
    if (isToday(new Date(date))) {
      return 'bg-orange-50 border-orange-200';
    }
    if (isTomorrow(new Date(date))) {
      return 'bg-yellow-50 border-yellow-200';
    }
    return 'bg-blue-50 border-blue-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: 'bg-blue-200 text-blue-900',
      'Interview Scheduled': 'bg-yellow-200 text-yellow-900',
      'Interview Completed': 'bg-purple-200 text-purple-900',
      'Offer Received': 'bg-green-200 text-green-900',
      Rejected: 'bg-red-200 text-red-900',
      Withdrawn: 'bg-gray-200 text-gray-900',
      'On Hold': 'bg-orange-200 text-orange-900',
    };
    return colors[status] || 'bg-gray-200 text-gray-900';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-800 mt-2 font-medium">Track your upcoming follow-ups and important dates</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(e.target.value)}
            className="input-field"
          >
            <option value="7">Next 7 days</option>
            <option value="14">Next 14 days</option>
            <option value="30">Next 30 days</option>
            <option value="60">Next 60 days</option>
            <option value="90">Next 90 days</option>
          </select>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="card text-center py-12">
          <FiCalendar className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-gray-800 text-lg mb-2 font-bold">No reminders found</p>
          <p className="text-gray-700 text-sm mb-4 font-medium">
            Set reminder dates on your job applications to track follow-ups
          </p>
          <Link to="/jobs/add" className="btn-primary inline-flex items-center">
            Add Job Application
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((job) => (
            <div
              key={job._id}
              className={`reminder-card card border-2 ${getReminderColor(job.reminderDate)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiClock className="text-primary-700" />
                    <span className="font-bold text-sm text-gray-900">
                      {getReminderLabel(job.reminderDate)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {job.companyName}
                  </h3>
                  <p className="text-gray-800 mb-2 font-semibold">{job.jobTitle}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-800">
                    <span className="flex items-center font-medium">
                      <FiCalendar className="mr-1" />
                      {format(new Date(job.reminderDate), 'MMM dd, yyyy')}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  {job.notes && (
                    <p className="text-sm text-gray-800 mt-3 italic font-medium">"{job.notes}"</p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-700 hover:text-primary-900"
                    >
                      <FiExternalLink size={20} />
                    </a>
                  )}
                  <Link
                    to={`/jobs/edit/${job._id}`}
                    className="text-primary-700 hover:text-primary-900 text-sm font-bold"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reminders;

