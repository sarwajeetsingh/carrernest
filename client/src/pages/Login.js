import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { gsap } from 'gsap';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      '.login-container',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'opacity,transform', // 👈 ensures opacity stays 1
      }
    );
  });

  return () => ctx.revert(); // 👈 cleanup on unmount
}, []);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-md login-container">
        <div className="card">
          <h1 className="mb-6 text-4xl font-bold text-center text-primary-700">
            JobTracker
          </h1>
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">Login</h2>

          {error && (
            <div className="p-4 mb-4 font-medium text-red-800 border-2 border-red-500 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="w-full py-3 text-lg btn-primary">
              Login
            </button>
          </form>

          <p className="mt-6 font-medium text-center text-gray-700">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold underline text-primary-700 hover:text-primary-900">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

