import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { IoNotificationsSharp } from "react-icons/io5";
import Homepage from './component/Homepage';
import Auth from './pre-auth/auth';
import Register from './pre-auth/Register';
import Sidebar from './component/Sidebar';
import PageNotFound from './component/PageNotFound';
import Profile from './pages/Profile';
import AddFriend from './pages/AddFriend';
import { useEffect, useState } from 'react';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  const hideSidebar = location.pathname === '/' || location.pathname === '/register';

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/homepage" replace />;
    }
    return children;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - fixed width and full height */}
      {!hideSidebar && (
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* Main content area - takes remaining space */}
      <div className={`flex-1 overflow-auto ${!hideSidebar ? 'ml-0' : ''}`}> {/* Adjust margin based on sidebar width */}
        <Routes>
          {/* Protected routes */}
          <Route 
            path="/homepage" 
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/addfriend" 
            element={
              <ProtectedRoute>
                <AddFriend/>
              </ProtectedRoute>
            } 
          />

          {/* Public routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* 404 Page Not Found */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;