import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND}/api`;

const instance = axios.create({ baseURL: API });

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("ak_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
