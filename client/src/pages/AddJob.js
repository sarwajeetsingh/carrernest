import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { gsap } from 'gsap';
import { FiArrowLeft } from 'react-icons/fi';

const AddJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    applicationDate: new Date().toISOString().split('T')[0],
    applicationMethod: 'Company Website',
    status: 'Applied',
    salaryRange: {
      min: '',
      max: '',
      currency: 'USD',
    },
    jobUrl: '',
    notes: '',
    reminderDate: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // FIXED GSAP ANIMATION
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.form-container',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'opacity,transform', 
        }
      );
    });

    return () => ctx.revert(); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('salaryRange.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.companyName || !formData.jobTitle) {
      setError('Company name and job title are required');
      setLoading(false);
      return;
    }

    try {
      const salaryRange =
        formData.salaryRange.min || formData.salaryRange.max
          ? {
              min: formData.salaryRange.min
                ? Number(formData.salaryRange.min)
                : undefined,
              max: formData.salaryRange.max
                ? Number(formData.salaryRange.max)
                : undefined,
              currency: formData.salaryRange.currency,
            }
          : undefined;

      const jobData = {
        ...formData,
        salaryRange,
        applicationDate: formData.applicationDate || new Date().toISOString(),
        reminderDate: formData.reminderDate || undefined,
      };

      await jobAPI.create(jobData);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center mb-4 font-bold text-gray-800 hover:text-gray-900"
      >
        <FiArrowLeft className="mr-2" />
        Back to Jobs
      </button>

      {/* FORM CONTAINER */}
      <div className="opacity-100 form-container">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">
          Add New Job Application
        </h1>

        {error && (
          <div className="p-4 mb-4 font-bold text-red-900 border-2 border-red-500 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 card">
          {/* REQUIRED FIELDS */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-900">
                Company Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-gray-900">
                Job Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end pt-4 space-x-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Job Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
