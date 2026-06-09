import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const loginUser = async (employeeId, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    employeeId,
    password,
  });

  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};