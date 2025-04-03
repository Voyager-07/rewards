import { FaHome, FaUser, FaTasks, FaSignOutAlt, FaPlus, FaSignInAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.is_admin);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="w-64 min-h-screen bg-gray-200 p-4 pt-16">
      <ul className="space-y-4">
        <SidebarItem icon={<FaHome />} text="Home" path="/" location={location} />
        {isAdmin ? (
          <>
            <SidebarItem icon={<FaPlus />} text="Add Apps" path="/add-task" location={location} />
            <SidebarItem icon={<FaTasks />} text="Submissions" path="/dashboard" location={location} />
          </>
        ) : (
          <>
            <SidebarItem icon={<FaUser />} text="Profile" path="/profile" location={location} />
            <SidebarItem icon={<FaTasks />} text="Tasks" path="/submit" location={location} />
          </>
        )}
        {isAuthenticated ? (
          <SidebarItem icon={<FaSignOutAlt />} text="Logout" onClick={handleLogout} />
        ) : (
          <SidebarItem icon={<FaSignInAlt />} text="Login" path="/login" location={location} />
        )}
      </ul>
    </div>
  );
};

const SidebarItem = ({ icon, text, path, location, onClick }) => {
  const navigate = useNavigate();
  const isActive = path && location.pathname === path;

  return (
    <li
      className={`flex items-center px-4 py-3 text-lg rounded cursor-pointer transition-colors ${
        isActive ? "bg-violet-600 text-white" : "text-gray-700 hover:bg-violet-300"
      }`}
      onClick={() => (onClick ? onClick() : navigate(path))}
    >
      <span className="mr-3 text-xl">{icon}</span>
      {text}
    </li>
  );
};

export default Sidebar;
