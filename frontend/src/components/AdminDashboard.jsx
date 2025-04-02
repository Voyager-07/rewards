import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Unauthorized: Please log in as an admin.");

        const response = await axios.get("https://rewards-production.up.railway.app/api/app-tasks/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTasks(response.data);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">⚡ User Submissions </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 flex justify-between">
          <span>{error}</span>
          <button className="text-red-900 font-bold" onClick={() => setError("")}>✖</button>
        </div>
      )}

      <h3 className="text-2xl font-semibold text-gray-800 mb-4">📌 Task List</h3>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-200 shadow-lg rounded-lg p-5 transition-transform hover:scale-105 hover:shadow-xl cursor-pointer outline-1 outline-gray-500"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <h4 className="text-lg font-semibold text-gray-800">{task.name}</h4>
              <p className="text-gray-600 text-sm">{task.description.substring(0, 50)}...</p>
              <p className="text-sm font-bold text-gray-700 mt-2">⭐ Points: {task.points}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
