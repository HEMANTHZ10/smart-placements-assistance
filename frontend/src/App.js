import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PlacementAnalysis from './pages/PlacementAnalysis';
import CompanyRecruitment from './pages/CompanyRecruitment';
import CompanyList from './pages/CompanyList';
import Chatbot from './pages/Chatbot';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardData from './pages/admin/DashboardData';
import CompanyInsightsData from './pages/admin/CompanyInsightsData';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/auth/login" />;
  }
  return children;
};

function App() {
  const getToken = () => localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/auth/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/company-insights"
              element={
                <ProtectedRoute>
                  <CompanyInsightsData />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<PlacementAnalysis />} />
            <Route path="/recruitment" element={<CompanyRecruitment />} />
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;