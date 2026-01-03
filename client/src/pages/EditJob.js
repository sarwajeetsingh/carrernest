import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { gsap } from 'gsap';
import { FiArrowLeft } from 'react-icons/fi';

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJob();
  }, [id]);

  useEffect(() => {
  if (!formData) return;

  const ctx = gsap.context(() => {
    gsap.fromTo(
      '.form-container',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'opacity,transform', // 👈 makes opacity static
      }
    );
  });

  return () => ctx.revert(); // 👈 cleanup old animations
}, [formData]);


  const loadJob = async () => {
    try {
      const res = await jobAPI.getOne(id);
      const job = res.data;
      
      // Format dates for input fields
      setFormData({
        ...job,
        applicationDate: job.applicationDate
          ? new Date(job.applicationDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        reminderDate: job.reminderDate
          ? new Date(job.reminderDate).toISOString().split('T')[0]
          : '',
        salaryRange: job.salaryRange || {
          min: '',
          max: '',
          currency: 'USD',
        },
      });
    } catch (error) {
      console.error('Error loading job:', error);
      setError('Failed to load job application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('salaryRange.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        salaryRange: {
          ...formData.salaryRange,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Clean up salary range if empty
      const salaryRange = formData.salaryRange.min || formData.salaryRange.max
        ? {
            min: formData.salaryRange.min ? Number(formData.salaryRange.min) : undefined,
            max: formData.salaryRange.max ? Number(formData.salaryRange.max) : undefined,
            currency: formData.salaryRange.currency,
          }
        : undefined;

      const jobData = {
        ...formData,
        salaryRange,
        applicationDate: formData.applicationDate || new Date().toISOString(),
        reminderDate: formData.reminderDate || undefined,
      };

      await jobAPI.update(id, jobData);
      navigate('/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      setError(error.response?.data?.message || 'Failed to update job application');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="py-12 text-center card">
        <p className="font-bold text-gray-800">Job application not found</p>
        <button onClick={() => navigate('/jobs')} className="mt-4 btn-primary">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center mb-4 text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft className="mr-2" />
        Back to Jobs
      </button>

      <div className="form-container">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Edit Job Application</h1>

        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 card">
          {/* Required Fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="companyName" className="block mb-2 text-sm font-bold text-gray-900">
                Company Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="block mb-2 text-sm font-bold text-gray-900">
                Job Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="jobDescription" className="block mb-2 text-sm font-bold text-gray-900">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription || ''}
              onChange={handleChange}
              rows="4"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="applicationDate" className="block mb-2 text-sm font-bold text-gray-900">
                Application Date
              </label>
              <input
                type="date"
                id="applicationDate"
                name="applicationDate"
                value={formData.applicationDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="applicationMethod" className="block mb-2 text-sm font-bold text-gray-900">
                Application Method
              </label>
              <select
                id="applicationMethod"
                name="applicationMethod"
                value={formData.applicationMethod}
                onChange={handleChange}
                className="input-field"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Company Website">Company Website</option>
                <option value="Referral">Referral</option>
                <option value="Job Board">Job Board</option>
                <option value="Email">Email</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block mb-2 text-sm font-bold text-gray-900">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Applied">Applied</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Completed">Interview Completed</option>
              <option value="Offer Received">Offer Received</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-900">Salary Range (Optional)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  name="salaryRange.min"
                  value={formData.salaryRange.min || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="salaryRange.max"
                  value={formData.salaryRange.max || ''}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Max"
                />
              </div>
              <div>
                <select
                  name="salaryRange.currency"
                  value={formData.salaryRange.currency}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="jobUrl" className="block mb-2 text-sm font-bold text-gray-900">
              Job URL
            </label>
            <input
              type="url"
              id="jobUrl"
              name="jobUrl"
              value={formData.jobUrl || ''}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="reminderDate" className="block mb-2 text-sm font-bold text-gray-900">
              Reminder Date (Optional)
            </label>
            <input
              type="date"
              id="reminderDate"
              name="reminderDate"
              value={formData.reminderDate}
              onChange={handleChange}
              className="input-field"
            />
            <p className="mt-1 text-xs text-gray-500">Set a reminder for follow-up</p>
          </div>

          <div>
            <label htmlFor="notes" className="block mb-2 text-sm font-bold text-gray-900">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows="4"
              className="input-field"
            />
          </div>

          <div className="flex items-center justify-end pt-4 space-x-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;

