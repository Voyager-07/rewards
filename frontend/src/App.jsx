import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import AddTask from "./components/AddTasks";
import SubmissionForm from "./components/SubmissionForm";
import AdminDashboard from "./components/AdminDashboard";
import TaskSubmissions from "./components/TaskSubmissions";
import CompletedTasks from "./components/CompletedTasks";
import Profile from "./components/Profile";

const App = () => {
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.warn("No token found! User is not logged in.");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/user-profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data && response.data.name) {
          setUserName(response.data.name);
        } else {
          console.warn("Username not found in API response!");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserName();
  }, []);

  return (
    <Router>
      <div className="flex min-w-fit min-h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header username={userName} />

          {/* Main Content */}
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/add-task" element={<AddTask />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/submissions" element={<CompletedTasks />} />
              <Route path="/tasks/:taskId" element={<TaskSubmissions />} />
              <Route path="/submit" element={<SubmissionForm />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
