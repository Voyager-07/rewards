import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // Clear the token
    localStorage.removeItem('authToken'); // Clear the token
    localStorage.removeItem('refreshToken'); // Clear the token
    navigate('/login'); // Redirect to login page
  };

  return (
    <button onClick={handleLogout} style={{ margin: '20px', padding: '10px', backgroundColor: 'red', color: 'white' }}>
      Logout
    </button>
  );
};

export default Logout;
