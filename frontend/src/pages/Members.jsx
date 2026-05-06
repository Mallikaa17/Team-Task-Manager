import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, Users, Edit2, Trash2 } from 'lucide-react';
import api from '../api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('members/');
      setMembers(response.data);
    } catch (err) {
      console.error('Failed to fetch members', err);
      // If 403, might not be admin
      if (err.response?.status === 403) {
        setError('You do not have permission to view this page. Only Admins can manage members.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name === 'phone_number') {
      // Only allow numbers and max length of 10
      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [e.target.name]: value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setError('');

    // Username validation: Alphanumeric, 3-20 characters
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(formData.username)) {
      setError("Username must be 3-20 characters long and contain only letters, numbers, and underscores.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // First and Last Name validation: Letters only
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!nameRegex.test(formData.first_name)) {
      setError("First name must be at least 2 characters long and contain only letters.");
      return;
    }
    if (!nameRegex.test(formData.last_name)) {
      setError("Last name must be at least 2 characters long and contain only letters.");
      return;
    }
    
    // Phone number validation: exactly 10 digits, starting with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      setError("Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.");
      return;
    }

    // Password validation: Minimum 8 characters
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await api.post('members/', {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        password: formData.password
      });
      setIsCreating(false);
      setFormData({
        username: '', email: '', first_name: '', last_name: '', phone_number: '', password: '', confirm_password: ''
      });
      fetchMembers();
    } catch (err) {
      console.error('Failed to create member', err);
      setError('Failed to create member. Ensure username is unique and fields are correct.');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.delete(`members/${id}/`);
        fetchMembers();
      } catch (err) {
        console.error('Failed to delete member', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Members</h1>
        {!error && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            New Member
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-8">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Member</h2>
          <form onSubmit={handleCreateMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" name="username" required pattern="^[a-zA-Z0-9_]{3,20}$" title="3-20 characters long, letters, numbers, and underscores only" value={formData.username} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" name="first_name" required pattern="^[a-zA-Z\s]{2,50}$" title="Only letters and spaces, at least 2 characters" value={formData.first_name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" name="last_name" required pattern="^[a-zA-Z\s]{2,50}$" title="Only letters and spaces, at least 2 characters" value={formData.last_name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="text" name="phone_number" required pattern="^[6-9]\d{9}$" title="Phone number must be exactly 10 digits and start with 6, 7, 8, or 9" value={formData.phone_number} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" required minLength="8" title="Must be at least 8 characters long" value={formData.password} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="password" name="confirm_password" required minLength="8" value={formData.confirm_password} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Create Member</button>
            </div>
          </form>
        </div>
      )}

      {!error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {member.first_name?.[0]}{member.last_name?.[0]}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name} (@{member.username})</p>
                    <p className="text-sm text-gray-500">{member.email} • {member.phone_number}</p>
                  </div>
                </div>
                <div>
                  <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
            {members.length === 0 && (
              <li className="p-12 text-center text-gray-500">No members found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Members;