import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Homepage from './component/Homepage';
import Auth from './pre-auth/auth';
import Register from './pre-auth/Register';
import Sidebar from './component/Sidebar';
import PageNotFound from './component/PageNotFound';
import Profile from './pages/Profile';
import AddFriend from './pages/AddFriend';
import Notifications from './pages/Notification'; // New component
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authStatus = !!token;
    setIsAuthenticated(authStatus);

    if (authStatus) {
      // Initialize socket connection
      const newSocket = io('https://chat-book-server.vercel.app', {
        withCredentials: true,
        transports: ['websocket']
      });
      setSocket(newSocket);

      // Fetch initial unread count
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get(
            'https://chat-book-server.vercel.app/api/notifications/unread-count',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true
            }
          );
          setUnreadCount(response.data?.count || 0);
        } catch (error) {
          console.error('Error fetching unread count:', error);
          setUnreadCount(0);
        }
      };

      fetchUnreadCount();

      // Setup socket listeners
      newSocket.on('new-notification', () => {
        setUnreadCount(prev => prev + 1);
      });

      // Join user's room
      // Join user's room
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload?.id;
        if (userId) {
          newSocket.emit('join-user', userId);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      return () => {
        newSocket.disconnect();
      };
    }
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

  const handleNotificationClick = () => {
    // Reset count when notifications are viewed
    setUnreadCount(0);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - fixed width and full height */}
      {!hideSidebar && (
        <div className="flex-shrink-0">
          <Sidebar unreadCount={unreadCount} />
        </div>
      )}

      {/* Main content area - takes remaining space */}
      <div className={`flex-1 overflow-auto ${!hideSidebar ? 'ml-0' : ''}`}>
        <Routes>
          {/* Protected routes */}
          <Route 
            path="/homepage" 
            element={
              <ProtectedRoute>
                <Homepage socket={socket} />
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
                <AddFriend socket={socket} />
              </ProtectedRoute>
            } 
          />

          {/* New Notifications Route */}
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications 
                  onView={handleNotificationClick} 
                  socket={socket}
                />
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