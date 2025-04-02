import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Logout from './Logout';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('https://rewards-production.up.railway.app/api/app-tasks/');
        setTasks(response.data);
      } catch (err) {
        setError('Failed to load tasks');
      }
    };

    fetchTasks();
  }, []);

  return (
    <>
    <div>
      <h2>Dashboard - Available Tasks</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tasks.length === 0 ? (
        <p>No tasks available</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <h4>{task.name}</h4>
              <p>{task.description}</p>
              <p><strong>Points:</strong> {task.points}</p>
              {task.app_link && (
                <p>
                  <a href={task.app_link} target="_blank" rel="noopener noreferrer">Download App</a>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
    <Logout />
    </>
  );
};

export default Dashboard;
