// import axios from 'axios';
// import API_CONFIG, { getApiUrl } from '../config/api';

// // Create axios instance with default config
// const apiClient = axios.create({
//   baseURL: API_CONFIG.BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Dashboard API calls
// export const dashboardService = {
//   getPlacementData: () => 
//     apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.GET_PLACEMENT_DATA),
  
//   getCompanyData: () => 
//     apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.GET_COMPANY_DATA),
  
//   addPlacementData: (data) => 
//     apiClient.post(API_CONFIG.ENDPOINTS.DASHBOARD.ADD_PLACEMENT_DATA, data),
  
//   addCompanyData: (data) => 
//     apiClient.post(API_CONFIG.ENDPOINTS.DASHBOARD.ADD_COMPANY_DATA, data),
  
//   deletePlacementData: (params) => 
//     apiClient.delete(API_CONFIG.ENDPOINTS.DASHBOARD.DELETE_PLACEMENT_DATA, { params }),
  
//   deleteCompanyData: (params) => 
//     apiClient.delete(API_CONFIG.ENDPOINTS.DASHBOARD.DELETE_COMPANY_DATA, { params })
// };

// // Add interceptors for handling tokens, errors, etc.
// apiClient.interceptors.request.use(
//   (config) => {
//     // You can add auth token here
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle common errors here
//     if (error.response?.status === 401) {
//       // Handle unauthorized access
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient; 


import axios from 'axios';
import API_CONFIG, { getApiUrl } from '../config/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API calls
export const dashboardService = {
  getPlacementData: () => 
    apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.GET_PLACEMENT_DATA),
  
  getCompanyData: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`/dashboard/get-company-data?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company data');
    }
    return response.json();
  },
  
  addPlacementData: (data) => 
    apiClient.post(API_CONFIG.ENDPOINTS.DASHBOARD.ADD_PLACEMENT_DATA, data),
  
  addCompanyData: (data) => 
    apiClient.post(API_CONFIG.ENDPOINTS.DASHBOARD.ADD_COMPANY_DATA, data),
  
  deletePlacementData: (params) => 
    apiClient.delete(API_CONFIG.ENDPOINTS.DASHBOARD.DELETE_PLACEMENT_DATA, { params }),
  
  deleteCompanyData: (params) => 
    apiClient.delete(API_CONFIG.ENDPOINTS.DASHBOARD.DELETE_COMPANY_DATA, { params })
};

// Add interceptors for handling tokens, errors, etc.
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Company Insights API calls
export const companyInsightsService = {
  getCompanyInsights: async (companyName = null) => {
    const queryParams = new URLSearchParams();
    if (companyName) {
      queryParams.append('company_name', companyName);
    }
    const response = await fetch(`/company-insights/get-company-insights-data?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch company insights data');
    }
    return response.json();
  }
};

export default apiClient; 