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
        const response = await axios.get(
          'https://chat-book-server.vercel.app/api/auth/suggested-friends',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
    return <div className="text-center py-10 text-gray-500">Loading suggestions...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  const handleAddFriend = async (friendId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://chat-book-server.vercel.app/api/auth/friend-request',
        { recipientId: friendId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFriendSuggestions((prev) =>
        prev.map((f) =>
          f._id === friendId ? { ...f, requestSent: true } : f
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send friend request');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Find Friends</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition">
            Suggestions
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium transition">
            Friend Requests
          </button>
        </div>
      </div>

      {/* Friend Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {friendSuggestions.map((friend, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col items-center text-center"
          >
            {/* Profile Picture */}
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden mb-4">
              {friend.profilePicture ? (
                <img
                  src={friend.profilePicture}
                  alt={friend.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Photo
                </div>
              )}
            </div>

            <h3 className="font-semibold text-lg">
              {friend.fullName || friend.username}
            </h3>
            {friend.city && friend.country && (
              <p className="text-gray-500 text-sm mb-3">
                {friend.city}, {friend.country}
              </p>
            )}

            {/* Buttons */}
            <div className="flex space-x-2 mt-auto">
              <button
                disabled={friend.requestSent}
                className={`px-4 py-1 rounded-md font-medium text-sm transition ${
                  friend.requestSent
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                onClick={() => handleAddFriend(friend._id)}
              >
                {friend.requestSent ? 'Request Sent' : 'Add Friend'}
              </button>
              <button className="px-4 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md font-medium text-sm transition">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      {friendSuggestions.length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default AddFriend;
