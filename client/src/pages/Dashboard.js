import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { gsap } from 'gsap';
import { FiBriefcase, FiCalendar, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      // GSAP animations
      gsap.from('.stat-card', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, [loading]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, jobsRes, remindersRes] = await Promise.all([
        jobAPI.getStats(),
        jobAPI.getAll({ sort: 'newest' }),
        jobAPI.getReminders(7),
      ]);

      setStats(statsRes.data);
      setRecentJobs(jobsRes.data.slice(0, 5));
      setUpcomingReminders(remindersRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-black">Dashboard</h1>
        <p className="mt-2 font-medium text-gray-800">Welcome back! Here's your job application overview.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Total Applications</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-200">
              <FiBriefcase className="text-2xl text-primary-700" />
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Interview Scheduled</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.byStatus?.find((s) => s._id === 'Interview Scheduled')?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-lg">
              <FiCalendar className="text-2xl text-yellow-800" />
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Offers Received</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats?.byStatus?.find((s) => s._id === 'Offer Received')?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <FiTrendingUp className="text-2xl text-green-800" />
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Upcoming Reminders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {upcomingReminders.length}
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <FiAlertCircle className="text-2xl text-orange-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs and Reminders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
            <Link to="/jobs" className="text-sm font-bold underline text-primary-700 hover:text-primary-900">
              View All
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="py-8 font-medium text-center text-gray-700">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/edit/${job._id}`}
                  className="block p-4 transition-all border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{job.companyName}</h3>
                      <p className="mt-1 text-sm font-medium text-gray-800">{job.jobTitle}</p>
                      <p className="mt-1 text-xs font-medium text-gray-700">
                        {format(new Date(job.applicationDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Reminders</h2>
            <Link to="/reminders" className="text-sm font-bold underline text-primary-700 hover:text-primary-900">
              View All
            </Link>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="py-8 font-medium text-center text-gray-700">No upcoming reminders</p>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/edit/${job._id}`}
                  className="block p-4 transition-all bg-orange-100 border-2 border-orange-400 rounded-lg hover:border-orange-600 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{job.companyName}</h3>
                      <p className="mt-1 text-sm font-medium text-gray-800">{job.jobTitle}</p>
                      <p className="mt-1 text-xs font-bold text-orange-800">
                        {format(new Date(job.reminderDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

