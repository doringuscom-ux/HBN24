import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Entertainment from "./pages/Entertainment"
import Religion from "./pages/Religion"
import Sports from "./pages/Sports"
import Lifestyle from "./pages/Lifestyle"
import Business from "./pages/Business"
import Technology from "./pages/Technology"
import SingleArticle from "./pages/SingleArticle"
import AdminDashboard from "./pages/AdminDashboard"
import AdminLogin from "./pages/AdminLogin"
import Footer from "./components/Footer"
import Epaper from "./pages/Epaper"
import NotFound from "./pages/NotFound"
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-gray-100' : 'bg-white'}`}>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/entertainment" element={<Entertainment />} />
        <Route path="/religion" element={<Religion />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/lifestyle" element={<Lifestyle />} />
        <Route path="/business" element={<Business />} />
        <Route path="/technology" element={<Technology />} />
        <Route path="/epaper" element={<Epaper />} />
        <Route path="/news/:id" element={<SingleArticle />} />
        <Route 
          path="/admin/login" 
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
