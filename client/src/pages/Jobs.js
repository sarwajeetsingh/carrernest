import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { gsap } from 'gsap';
import { FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { format } from 'date-fns';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadJobs();
  }, [statusFilter, sortBy]);

  useEffect(() => {
  if (loading) return;

  const ctx = gsap.context(() => {
    gsap.fromTo(
      '.job-card',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,transform', // 👈 ensures static opacity
      }
    );
  });

  return () => ctx.revert(); // 👈 cleanup animation
}, [loading, jobs]);


  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAll({ status: statusFilter, sort: sortBy });
      setJobs(res.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await jobAPI.delete(id);
        loadJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job application');
      }
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

  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      job.companyName.toLowerCase().includes(searchLower) ||
      job.jobTitle.toLowerCase().includes(searchLower) ||
      (job.jobDescription && job.jobDescription.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Job Applications</h1>
          <p className="mt-2 font-medium text-gray-800">Manage and track all your job applications</p>
        </div>
        <Link
          to="/jobs/add"
          className="flex items-center justify-center mt-4 sm:mt-0 btn-primary"
        >
          <FiPlus className="mr-2" />
          Add New Job
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 appearance-none input-field"
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Completed">Interview Completed</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="company">Company Name</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="py-12 text-center card">
          <p className="mb-4 text-lg font-bold text-gray-800">No job applications found</p>
          <Link to="/jobs/add" className="inline-flex items-center btn-primary">
            <FiPlus className="mr-2" />
            Add Your First Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <div key={job._id} className="transition-shadow border-2 border-gray-200 job-card card hover:shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{job.companyName}</h3>
                  <p className="mt-1 font-semibold text-gray-800">{job.jobTitle}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>
              </div>

              <div className="mb-4 space-y-2 text-sm text-gray-800">
                <p>
                  <span className="font-bold">Applied:</span>{' '}
                  {format(new Date(job.applicationDate), 'MMM dd, yyyy')}
                </p>
                <p>
                  <span className="font-bold">Method:</span> {job.applicationMethod}
                </p>
                {job.reminderDate && (
                  <p className="font-bold text-orange-800">
                    <span className="font-bold">Reminder:</span>{' '}
                    {format(new Date(job.reminderDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>

              {job.jobUrl && (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center mb-4 text-sm font-bold text-primary-700 hover:text-primary-900"
                >
                  <FiExternalLink className="mr-1" />
                  View Job Posting
                </a>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
                <Link
                  to={`/jobs/edit/${job._id}`}
                  className="flex items-center font-bold text-primary-700 hover:text-primary-900"
                >
                  <FiEdit className="mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="flex items-center font-bold text-red-700 hover:text-red-900"
                >
                  <FiTrash2 className="mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;

