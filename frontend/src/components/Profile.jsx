import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Unauthorized: Please log in first.");
          setLoading(false);
          return;
        }

        // Fetch user details & completed tasks in parallel
        const [userResponse, completedTasksResponse] = await Promise.all([
          axios.get("https://rewards-production.up.railway.app/api/user-profile/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://rewards-production.up.railway.app/api/completed-tasks/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUserData(userResponse.data);
        setCompletedTasks(completedTasksResponse.data);
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-200 shadow-md rounded-lg mt-10 outline-1 outline-gray-500">
      <h2 className="text-2xl font-bold text-gray-800 text-center">User Profile</h2>

      {/* User Info */}
      <div className="mt-6">
        <p className="text-lg">
          <span className="font-semibold">Username:</span> {userData?.username}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Name:</span> {userData?.name}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Total Points Earned:</span> {userData?.total_points}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Total Tasks Completed:</span> {completedTasks.length}
        </p>
      </div>

      {/* Completed Tasks List */}
      <h3 className="text-xl font-semibold text-gray-700 mt-6">Completed Tasks</h3>
      {completedTasks.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {completedTasks.map((task) => (
            <li key={task.id} className="p-3 border rounded-lg bg-gray-100">
              <p className="font-medium">{task.name}</p>
              <p className="text-sm text-gray-600">Points: {task.points}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-3">No completed tasks yet.</p>
      )}
    </div>
  );
};

export default Profile;
