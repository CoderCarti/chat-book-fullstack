import { useState, useEffect } from "react";
import { RiPencilFill } from "react-icons/ri";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import defaultAvatar from "../assets/images/gadonski_img.png";

const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [phoneNumber, setPhoneNumber] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    country: "",
    city: "",
    postalCode: ""
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const userData = response.data;
        setFormData({
          fullName: userData.fullName || "",
          email: userData.email,
          phoneNumber: userData.phoneNumber || "",
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
          country: userData.country || "",
          city: userData.city || "",
          postalCode: userData.postalCode || ""
        });
        
        setPhoneNumber(userData.phoneNumber);
        setProfilePic(userData.profilePicture || defaultAvatar);
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to fetch profile data");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedData = {
        ...formData,
        phoneNumber,
        profilePicture: profilePic.startsWith('data:image') ? await uploadImage(profilePic) : profilePic
      };

      await axios.put('/api/auth/profile', updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success("Profile updated successfully!");
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (base64Image) => {
    try {
      const response = await axios.post('/api/upload', { image: base64Image });
      return response.data.url;
    } catch (error) {
      toast.error("Failed to upload image");
      return profilePic; // Return previous image if upload fails
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {/* Profile Info */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={profilePic}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
          />
          <label className="absolute bottom-0 right-0 bg-green-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-green-600">
            <RiPencilFill className="w-3 h-5"/>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
            />
          </label>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-semibold">{formData.fullName}</h2>
          <p className="text-sm text-gray-500">{formData.city}, {formData.country}</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Full Name</p>
            <p className="font-medium">{formData.fullname}</p>
          </div>
          <div>
            <p className="text-gray-500">Email Address</p>
            <p className="font-medium">{formData.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone Number</p>
            <p className="font-medium">{formData.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Date of Birth</p>
            <p className="font-medium">{formData.dob}</p>
          </div>
          <div>
            <p className="text-gray-500">Postal Code</p>
            <p className="font-medium">{formData.postalCode}</p>
          </div>
          <div>
            <p className="text-gray-500">Country and City</p>
            <p className="font-medium">{formData.country} - {formData.city}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* backdrop */}
          <div
            className="absolute inset-0 "
            onClick={() => setShowModal(false)}
          ></div>

          {/* modal */}
          <div className="relative bg-white w-full max-w-lg p-6 rounded-2xl shadow-lg z-10">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Phone Number</label>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={value}
                  onChange={setValue}/>
              </div>
              <div>
                <label className="text-sm text-gray-600">Date of Birth</label>
                <input
                  type="text"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
