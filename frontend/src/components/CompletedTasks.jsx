import { useEffect, useState } from "react";
import axios from "axios";

export default function CompletedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not authenticated");

        const response = await axios.get("http://127.0.0.1:8000/api/completed-tasks/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTasks(response.data);
      } catch (err) {
        setError("Failed to fetch completed tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedTasks();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">🎯 Completed Tasks</h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500">No completed tasks yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white shadow-lg rounded-lg p-6 transition-transform hover:scale-105 hover:shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{task.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{task.description}</p>
              <p className="text-sm font-bold text-gray-800">⭐ Points: {task.points}</p>

              {task.app_link && (
                <a
                  href={task.app_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  View App
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
