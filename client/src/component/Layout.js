import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
  FiHome,
  FiBriefcase,
  FiPlusCircle,
  FiBell,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { gsap } from 'gsap';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.page-content',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'opacity,transform', 
        }
      );
    });

    return () => ctx.revert(); 
  }, [location]);

  const handleLogout = () => logout();

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/jobs', icon: FiBriefcase, label: 'Jobs' },
    { path: '/jobs/add', icon: FiPlusCircle, label: 'Add Job' },
    { path: '/reminders', icon: FiBell, label: 'Reminders' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
                CareerNest
              </Link>
            </div>

            {/* DESKTOP NAV */}
            <div className="items-center hidden space-x-1 md:flex">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-2" />
                    {label}
                  </Link>
                );
              })}

              <div className="flex items-center pl-4 ml-4 border-l border-gray-300">
                <span className="mr-4 text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center font-medium text-red-600 hover:text-red-700"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE NAV */}
        {mobileMenuOpen && (
          <div className="bg-white border-t border-gray-200 md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-2" />
                    {label}
                  </Link>
                );
              })}

              <div className="px-4 py-2 border-t border-gray-200">
                <span className="block mb-2 text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center font-medium text-red-600 hover:text-red-700"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="opacity-100 page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
