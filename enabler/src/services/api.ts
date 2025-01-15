import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const createSession = async (payload: any) => {
  const response = await axios.post(`${API_URL}/create`, payload);
  return response.data;
};