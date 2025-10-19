import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const HttpService = (baseUrl: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 100000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      
      const token = localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `${token}`;
      }

      return config; 
    },
    (error) => {
      
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      // This is a great pattern for convenience
      return response.data;
    },
    (error) => {
      // Handle response errors (e.g., 401 Unauthorized, 404 Not Found)
      // You could add logic here to redirect to login on a 401 error.
      return Promise.reject(error);
    }
  );

  return instance;
};

// This part remains the same
const ApiGateway = HttpService(process.env.NEXT_PUBLIC_API_GATEWAY as string);
export { HttpService, ApiGateway };
