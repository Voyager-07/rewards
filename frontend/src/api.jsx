import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (username, password) => {
  try {
    const response = await API.post('/login/', { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Login failed';
  }
};
