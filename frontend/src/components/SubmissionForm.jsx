import { useEffect, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const SubmissionForm = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedFile, setSelectedFile] = useState({});
  const [expandedTask, setExpandedTask] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPendingTasks = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Unauthorized: Please log in first.");
          return;
        }
        const response = await axios.get("http://localhost:8000/api/pending-tasks/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || "Failed to load pending tasks");
      }
    };
    fetchPendingTasks();
  }, []);

  const handleDrop = (acceptedFiles, taskId) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile((prev) => ({ ...prev, [taskId]: acceptedFiles[0] }));
      setError("");

      // Keep the task expanded after file upload
      if (expandedTask !== taskId) {
        setExpandedTask(taskId);
      }
    }
  };

  const handleSubmit = async (taskId) => {
    const file = selectedFile[taskId];
    if (!file) {
      setError("Please upload a screenshot.");
      return;
    }

    const formData = new FormData();
    formData.append("task", taskId);
    formData.append("screenshot", file);

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post("http://localhost:8000/api/submissions/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(`Submission for Task ${taskId} uploaded successfully!`);
      setSelectedFile((prev) => ({ ...prev, [taskId]: null }));

      // Keep expanded after submission
      setExpandedTask(taskId);

      // Remove the submitted task from the list
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || `Failed to upload submission for Task ${taskId}`);
    }
  };

  return (
    <div className="p-6 bg-gray-100 items-center justify-center">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Pending Tasks</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      {tasks.length === 0 ? (
        <p className="text-center text-gray-500">No pending tasks available.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto w-full">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-200 border border-gray-300 rounded-lg p-4 shadow-md cursor-pointer transition-all duration-300 hover:bg-gray-300"
              onClick={() => {
                if (expandedTask !== task.id) {
                  setExpandedTask(task.id);
                }
              }}
            >
              {/* Task Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 flex items-center justify-center rounded-md text-white font-bold text-lg">
                    {task.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">{task.name}</h3>
                    <p className="text-blue-600 text-sm underline">View in Detail</p>
                  </div>
                </div>
                <span className="bg-teal-400 text-white px-3 py-1 rounded-md font-medium">
                  {task.points} POINTS
                </span>
              </div>

              {/* Expandable Dropzone Section */}
              {expandedTask === task.id && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300">
                  <p className="text-gray-600 text-sm">{task.description}</p>

                  {task.app_link && (
                    <a
                      href={task.app_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-blue-600 underline block"
                    >
                      Visit App
                    </a>
                  )}

                  {/* Dropzone */}
                  <Dropzone taskId={task.id} onDrop={handleDrop} selectedFile={selectedFile[task.id]} />

                  <button
                    onClick={() => handleSubmit(task.id)}
                    className="mt-4 px-5 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    Submit Screenshot
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dropzone = ({ taskId, onDrop, selectedFile }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, taskId),
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    multiple: false, // Restrict to one file at a time
  });

  return (
    <div
      {...getRootProps()}
      className="mt-3 w-full p-20 border-2 border-dotted border-gray-400 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300 text-center"
    >
      <input {...getInputProps()} />
      {selectedFile ? (
        <p className="text-green-600 font-medium">{selectedFile.name}</p>
      ) : (
        <p className="text-gray-600">Drag & drop or click to upload a screenshot (PNG, JPG, GIF, WEBP)</p>
      )}
    </div>
  );
};

export default SubmissionForm;
