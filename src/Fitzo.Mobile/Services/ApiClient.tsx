import axios from 'axios';
import Constants from 'expo-constants';

const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (!localhost) {
        return 'http://172.20.10.2:5123';
    }

    return `http://${localhost}:5123`;
};

export const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
      if (error.response && error.response.status === 401) {
          console.log("Global 401 interceptor");
      }
      return Promise.reject(error);
  }
);

export default apiClient;