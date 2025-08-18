import { useState, useEffect } from "react";
import { RiPencilFill, RiDeleteBinLine } from "react-icons/ri";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from "../assets/images/gadonski_img.png";

const Profile = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    dateOfBirth: "",
    country: "",
    city: "",
    postalCode: ""
  });

  // Fetch user data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/homepage');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://chat-book-server.vercel.app/api/profile', {
          headers: {
            'x-auth-token': token
          },
          withCredentials: true
        });
        
        const userData = response.data;
        setFormData({
          username: userData.username || userData.fullName || "",
          email: userData.email,
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
          country: userData.country || "",
          city: userData.city || "",
          postalCode: userData.postalCode || ""
        });
        
        setPhoneNumber(userData.phoneNumber || '');
        setProfilePic(userData.profilePicture || defaultAvatar);
      } catch (error) {
        toast.error("Failed to load profile");
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const updatedData = {
        fullName: formData.username,
        phoneNumber,
        profilePicture: profilePic === defaultAvatar ? 'remove' : profilePic,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        city: formData.city,
        postalCode: formData.postalCode
      };

      await axios.put(
        'https://chat-book-server.vercel.app/api/profile', 
        updatedData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      toast.success("Profile updated successfully!");
      setShowModal(false);
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (JPEG, PNG)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setProfilePic(defaultAvatar);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {/* Profile Info */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group w-32 h-32">
          <img
            src={profilePic}
            alt="profile"
            className="w-full h-full rounded-full object-cover border-2 border-gray-200 shadow-sm"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <label className="cursor-pointer p-2 text-white hover:text-green-300">
              <RiPencilFill className="text-xl"/>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
            </label>
            {profilePic !== defaultAvatar && (
              <button 
                onClick={removeProfilePicture}
                className="p-2 text-white hover:text-red-300"
                title="Remove photo"
              >
                <RiDeleteBinLine className="text-xl"/>
              </button>
            )}
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-semibold">{formData.username}</h2>
          <p className="text-sm text-gray-500">
            {formData.city && formData.country ? `${formData.city}, ${formData.country}` : 'Location not set'}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Edit Profile'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Full Name</p>
            <p className="font-medium">{formData.username || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-500">Email Address</p>
            <p className="font-medium">{formData.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone Number</p>
            <p className="font-medium">{phoneNumber || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-500">Date of Birth</p>
            <p className="font-medium">{formData.dateOfBirth || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-500">Postal Code</p>
            <p className="font-medium">{formData.postalCode || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-500">Country and City</p>
            <p className="font-medium">
              {formData.country || formData.city 
                ? `${formData.country || ''}${formData.country && formData.city ? ' - ' : ''}${formData.city || ''}`
                : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <PhoneInput
                  international
                  defaultCountry="PH"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  className="border rounded focus:ring-2 focus:ring-green-100"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;