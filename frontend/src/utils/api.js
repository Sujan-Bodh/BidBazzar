import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => {
    console.log('API: Calling POST /auth/register with:', userData);
    return api.post('/auth/register', userData);
  },
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Auction API
export const auctionAPI = {
  getAuctions: (params) => api.get('/auctions', { params }),
  getAuctionById: (id) => api.get(`/auctions/${id}`),
  createAuction: (formData) =>
    api.post('/auctions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateAuction: (id, formData) =>
    api.put(`/auctions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAuction: (id) => api.delete(`/auctions/${id}`),
  getUserAuctions: () => api.get('/auctions/user/selling'),
  getWatchedAuctions: () => api.get('/auctions/user/watching'),
  toggleWatch: (id) => api.post(`/auctions/${id}/watch`),
};

// Bid API
export const bidAPI = {
  placeBid: (auctionId, bidData) => api.post(`/bids/${auctionId}`, bidData),
  buyNow: (auctionId) => api.post(`/bids/${auctionId}/buynow`),
  getAuctionBids: (auctionId) => api.get(`/bids/auction/${auctionId}`),
  getUserBids: () => api.get('/bids/user/mybids'),
  getUserWinningBids: () => api.get('/bids/user/winning'),
  getUserWonAuctions: () => api.get('/bids/user/won'),
};

export default api;
