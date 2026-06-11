import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"

const Entertainment = lazy(() => import('./pages/Entertainment'));
const Religion = lazy(() => import('./pages/Religion'));
const Sports = lazy(() => import('./pages/Sports'));
const Lifestyle = lazy(() => import('./pages/Lifestyle'));
const Business = lazy(() => import('./pages/Business'));
const Technology = lazy(() => import('./pages/Technology'));
const SingleArticle = lazy(() => import('./pages/SingleArticle'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Epaper = lazy(() => import('./pages/Epaper'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Search = lazy(() => import('./pages/Search'));
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
  const [globalSeo, setGlobalSeo] = useState(null);
  const [pageSeoList, setPageSeoList] = useState([]);

  useEffect(() => {
    // Token auto-refresh logic
    const refreshToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        const res = await fetch(__API_URL__ + '/api/auth/refresh', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            localStorage.setItem('adminToken', data.token);
          }
        } else if (res.status === 401) {
          // If refresh fails due to expiration, log out
          localStorage.removeItem('adminToken');
          // Optional: window.location.href = '/admin/login';
        }
      } catch (err) {
        console.error('Failed to refresh token', err);
      }
    };

    refreshToken();
    // Refresh every 12 hours (43200000 ms)
    const intervalId = setInterval(refreshToken, 43200000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Fetch Global SEO once
    const fetchSeoData = async () => {
      try {
        const res = await fetch(__API_URL__ + '/api/seo');
        const data = await res.json();
        setGlobalSeo(data);
      } catch (err) {
        console.error('Failed to fetch global SEO', err);
      }
      try {
        const res = await fetch(__API_URL__ + '/api/seo/pages');
        const data = await res.json();
        setPageSeoList(data);
      } catch (err) {
        console.error('Failed to fetch page SEOs', err);
      }
    };
    
    // Delay SEO fetch by 2 seconds so it doesn't compete with LCP images
    setTimeout(fetchSeoData, 2000);
  }, []);

  useEffect(() => {
    // Apply global SEO if not on single article page and not in admin
    if (!isAdmin && !location.pathname.startsWith('/news/') && (globalSeo || pageSeoList.length > 0)) {
      const currentPageSeo = pageSeoList.find(p => p.pageUrl === location.pathname);

      document.title = currentPageSeo?.metaTitle || globalSeo?.siteTitle || 'HBN24 News';

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = "description";
          document.head.appendChild(metaDesc);
      }
      metaDesc.content = currentPageSeo?.metaDescription || globalSeo?.metaDescription || '';

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = "keywords";
          document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = currentPageSeo?.metaKeywords || globalSeo?.metaKeywords || '';

      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
          metaRobots = document.createElement('meta');
          metaRobots.name = "robots";
          document.head.appendChild(metaRobots);
      }
      metaRobots.content = currentPageSeo?.robots || globalSeo?.robots || 'index, follow';

      // Insert Google Analytics script if present
      if (globalSeo?.googleAnalyticsId) {
        if (!document.getElementById('ga-script')) {
          const script1 = document.createElement('script');
          script1.id = 'ga-script';
          script1.async = true;
          script1.src = `https://www.googletagmanager.com/gtag/js?id=${globalSeo.googleAnalyticsId}`;
          document.head.appendChild(script1);

          const script2 = document.createElement('script');
          script2.id = 'ga-inline';
          script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${globalSeo.googleAnalyticsId}', { page_path: '${location.pathname}' });
          `;
          document.head.appendChild(script2);
        } else if (window.gtag) {
          // If script is already injected, just send the pageview for the new route
          window.gtag('config', globalSeo.googleAnalyticsId, {
            page_path: location.pathname
          });
        }
      }
    }
  }, [location.pathname, globalSeo, pageSeoList, isAdmin]);

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-gray-100' : 'bg-white'}`}>
      {!isAdmin && <Navbar />}
      <main id="main-content" className="flex-grow">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/entertainment" element={<Entertainment />} />
            <Route path="/religion" element={<Religion />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/lifestyle" element={<Lifestyle />} />
            <Route path="/business" element={<Business />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="/epaper" element={<Epaper />} />
            <Route path="/search" element={<Search />} />
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
        </Suspense>
      </main>
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
