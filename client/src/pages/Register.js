import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { gsap } from 'gsap';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      '.register-container',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'opacity,transform', // ensures static opacity after anim
      }
    );
  });

  return () => ctx.revert(); // cleanup on unmount
}, []);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const fillTestData = () => {
    // Generate unique test data with timestamp to avoid duplicate user errors
    const timestamp = Date.now();
    setFormData({
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'test123',
      confirmPassword: 'test123',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-md register-container">
        <div className="card">
          <h1 className="mb-6 text-4xl font-bold text-center text-primary-700">
            JobTracker
          </h1>
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">Register</h2>

          {error && (
            <div className="p-4 mb-4 font-medium text-red-800 border-2 border-red-500 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          {/* Test Data Helper */}
          <div className="p-4 mb-4 bg-blue-100 border-2 border-blue-400 rounded-lg">
            <p className="mb-2 text-sm font-semibold text-gray-800">
              <strong>Validation Requirements:</strong>
            </p>
            <ul className="mb-3 space-y-1 text-sm font-medium text-gray-700">
              <li>• Username: Minimum 3 characters</li>
              <li>• Email: Valid email format</li>
              <li>• Password: Minimum 6 characters</li>
              <li>• Passwords must match</li>
            </ul>
            <button
              type="button"
              onClick={fillTestData}
              className="text-sm font-bold text-blue-700 underline hover:text-blue-900"
            >
              Click to fill valid test data →
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-bold text-gray-800">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="input-field"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-bold text-gray-800">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-bold text-gray-800">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-bold text-gray-800">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="w-full py-3 text-lg btn-primary">
              Register
            </button>
          </form>

          <p className="mt-6 font-medium text-center text-gray-700">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline text-primary-700 hover:text-primary-900">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

