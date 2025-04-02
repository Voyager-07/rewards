import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function TaskSubmissions() {
  const { taskId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageModal, setImageModal] = useState(null); // Full-screen preview
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Unauthorized: Please log in as an admin.");

        const response = await axios.get(
          `https://rewards-production.up.railway.app/api/submissions/task/${taskId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSubmissions(response.data);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || "Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [taskId]);

  const handleVerify = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        `https://rewards-production.up.railway.app/api/submissions/verify/${id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("✅ Submission verified successfully!");
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, approved: true } : sub))
      );
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "❌ Failed to verify submission.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
        📄 Task Submissions (Task {taskId})
      </h2>

      {/* Error & Success Messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 flex justify-between">
          <span>{error}</span>
          <button className="text-red-900 font-bold" onClick={() => setError("")}>✖</button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 flex justify-between">
          <span>{success}</span>
          <button className="text-green-900 font-bold" onClick={() => setSuccess("")}>✖</button>
        </div>
      )}

      {/* Loading & No Data */}
      {loading ? (
        <p className="text-center text-gray-600">Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p className="text-center text-gray-500">No submissions available for this task.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden  outline-1 outline-gray-500">
          {/* Grid Header */}
          <div className="grid grid-cols-4 bg-gray-800 text-white font-semibold py-3 px-6 text-center ">
            <div className="flex items-center justify-center">👤 Username</div>
            <div className="flex items-center justify-center">✅ Approved</div>
            <div className="flex items-center justify-center">📸 Screenshot</div>
            <div className="flex items-center justify-center">🔍 Action</div>
          </div>

          {/* Grid Rows */}
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className={`grid grid-cols-4 text-center py-4 px-6 ${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
              }`}
            >
              {/* Username */}
              <div className="flex items-center justify-center">{submission.user.username}</div>

              {/* Approved Status */}
              <div className="flex items-center justify-center">
                <span
                  className={`text-lg ${
                    submission.approved ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {submission.approved ? "✅ Yes" : "❌ No"}
                </span>
              </div>

              {/* Screenshot */}
              <div className="flex items-center justify-center">
                {submission.screenshot_url ? (
                  <img
                    src={submission.screenshot_url}
                    alt="Submission Screenshot"
                    className="h-10 w-10 rounded-md cursor-pointer hover:scale-110 transition"
                    onClick={() => setImageModal(submission.screenshot_url)}
                  />
                ) : (
                  <span className="text-red-500 text-xl">❌</span>
                )}
              </div>

              {/* Verify Button */}
              <div className="flex items-center justify-center">
                {!submission.approved && (
                  <button
                    onClick={() => handleVerify(submission.id)}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    ✅ Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition block mx-auto"
      >
        Back to Dashboard
      </button>

      {/* Full-Screen Image Preview */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={() => setImageModal(null)}
        >
          <img src={imageModal} alt="Full Screenshot" className="max-w-full max-h-full rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
}
