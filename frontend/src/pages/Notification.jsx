// components/Notification.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const Notification = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Socket.io setup
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-user', userId);

    newSocket.on('new-notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleAcceptFriend = async (senderId, notificationId) => {
    try {
      await axios.post('/api/auth/handle-friend-request', {
        senderId,
        action: 'accept'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      handleMarkAsRead(notificationId);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Similar handler for decline...

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-h-screen overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
          <h3 className="font-bold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`p-4 ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
              >
                <div className="flex items-start">
                  <img 
                    src={notification.sender.profilePicture || '/default-avatar.png'} 
                    alt={notification.sender.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    
                    {notification.type === 'friend_request' && (
                      <div className="flex mt-2 space-x-2">
                        <button 
                          onClick={() => handleAcceptFriend(notification.sender._id, notification._id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleDeclineFriend(notification.sender._id, notification._id)}
                          className="px-3 py-1 bg-gray-200 rounded text-xs"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="text-xs text-blue-500"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;