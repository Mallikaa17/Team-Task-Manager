import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Users } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-white space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="font-bold text-xl">Team Task Manager</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                {localStorage.getItem('role') === 'admin' && (
                  <Link to="/members" className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Members
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-indigo-100 hover:text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;