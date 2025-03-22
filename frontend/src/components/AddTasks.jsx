import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddTask = () => {
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    points: 0,
    app_link: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Unauthorized: Please log in first.');
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:8000/api/app-tasks/', taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('✅ Task added successfully!');
      setTaskData({ name: '', description: '', points: 0, app_link: '' });

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('⚠️ Session expired. Please log in again.');
        localStorage.removeItem('accessToken');
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || '❌ Failed to add task. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">➕ Add New Task</h2>

        {error && <p className="text-red-600 text-center mb-2">{error}</p>}
        {success && <p className="text-green-600 text-center mb-2">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 font-medium">Task Name</label>
            <input
              type="text"
              name="name"
              value={taskData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Description</label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Points</label>
            <input
              type="number"
              name="points"
              value={taskData.points}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">App Link (Optional)</label>
            <input
              type="url"
              name="app_link"
              value={taskData.app_link}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            ➕ Add Task
          </button>
        </form>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-indigo-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AddTask;
