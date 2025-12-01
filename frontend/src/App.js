import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AuctionList from './components/auctions/AuctionList';
import AuctionDetail from './components/auctions/AuctionDetail';
import CreateAuction from './components/auctions/CreateAuction';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AuctionList />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-auction"
              element={
                <PrivateRoute>
                  <CreateAuction />
                </PrivateRoute>
              }
            />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
