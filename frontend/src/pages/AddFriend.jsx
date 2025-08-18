import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AddFriend = () => {
  const [friendSuggestions, setFriendSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestedFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://chat-book-server.vercel.app/api/auth/suggested-friends', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFriendSuggestions(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch suggestions');
        setLoading(false);
      }
    };

    fetchSuggestedFriends();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading suggestions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  const handleAddFriend = async (friendId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.post('https://chat-book-server.vercel.app/api/auth/friend-request', 
      { recipientId: friendId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    // Update UI to show request sent
    setFriendSuggestions(prev => 
      prev.map(f => 
        f._id === friendId ? { ...f, requestSent: true } : f
      )
    );
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to send friend request');
  }
};

  return (
    <div className="mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Friend Requests</h1>
        <div className="flex space-x-4 ml-20">
          <button className="px-4 py-2 bg-gray-200 rounded-md font-medium">Suggestions</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium">Friend Requests</button>
        </div>
      </div>

      {/* Friend Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border">
        {friendSuggestions.map((friend, index) => (
          <div key={index} className="border rounded-lg p-4 flex items-center">
            {/* Profile Picture - use actual if available */}
            <div className="w-20 h-20 bg-gray-300 rounded-full mr-4 overflow-hidden">
              {friend.profilePicture ? (
                <img 
                  src={friend.profilePicture} 
                  alt={friend.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Photo
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg">{friend.fullName || friend.username}</h3>
              {friend.city && friend.country && (
                <p className="text-gray-500 text-sm">{friend.city}, {friend.country}</p>
              )}
              
              <div className="flex mt-2 space-x-2">
                <button 
                  className="px-4 py-1 bg-green-400 text-white rounded-md font-medium text-sm"
                  onClick={() => handleAddFriend(friend._id)}
                >
                  Add Friend
                </button>
                <button className="px-4 py-1 bg-gray-200 rounded-md font-medium text-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      <div className="text-center mt-6">
        <button className="px-6 py-2 bg-gray-200 rounded-md font-medium">
          See More
        </button>
      </div>
    </div>
  );
};

export default AddFriend;