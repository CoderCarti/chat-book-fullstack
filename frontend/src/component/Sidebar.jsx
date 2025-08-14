import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiHash, 
  FiMail, 
  FiLogOut, 
  FiLogIn, 
  FiUser,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
  FiX,
  FiPlus
} from 'react-icons/fi';
import { RiChatSmileLine } from 'react-icons/ri';
import { IoMdPersonAdd } from "react-icons/io";

const Sidebar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);
  const channelsRef = useRef(null);
  const navigate = useNavigate();

  // Close flyouts when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (channelsRef.current && !channelsRef.current.contains(event.target)) {
        setIsChannelsOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-expand/collapse based on hover
  useEffect(() => {
    if (window.innerWidth >= 768) { // Only for desktop
      setIsCollapsed(!isHovered);
    }
  }, [isHovered]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Check screen size - always collapsed on mobile
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleChannels = (e) => {
    e.stopPropagation();
    setIsChannelsOpen(!isChannelsOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button - only shows on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:text-green-500"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <div 
        ref={sidebarRef}
        className={`
          flex flex-col bg-[#f5f5f5] shadow-lg transition-all duration-300 
          ${isCollapsed ? 'w-16 md:w-20' : 'w-64'} 
          fixed md:sticky top-0 h-screen z-40
          ${isMobileMenuOpen ? 'left-0' : '-left-full md:left-0'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <div className="flex items-center">
              <RiChatSmileLine className="text-2xl text-green-500 mr-2" />
              <span className="font-semibold text-lg">ChatBook</span>
            </div>
          )}
          {isCollapsed && (
            <RiChatSmileLine 
              className="text-2xl text-green-500 mx-auto cursor-pointer"  
              onClick={() => setIsCollapsed(!isCollapsed)} 
            />
          )}
          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-500 hover:text-green-500 cursor-pointer hidden md:block"
            >
              «
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink
            to="/homepage"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
            }
            onClick={() => window.innerWidth < 768 && setIsMobileMenuOpen(false)}
          >
            <FiHome className="text-xl" />
            {!isCollapsed && <span className="ml-3">Home</span>}
          </NavLink>

          {/* Channels Section with Flyout */}
          <div className="relative" ref={channelsRef}>
            <button
              onClick={toggleChannels}
              className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-200 transition-colors ${isChannelsOpen ? 'bg-green-100 text-green-600' : 'text-gray-700'}`}
            >
              <div className="flex items-center">
                <FiHash className="text-xl" />
                {!isCollapsed && <span className="ml-3">Channels</span>}
              </div>
              {!isCollapsed && (
                isChannelsOpen ? <FiChevronUp /> : <FiChevronDown />
              )}
            </button>

            {/* Channels Flyout Menu */}
            {(isChannelsOpen || (isCollapsed && isMobileMenuOpen)) && (
              <div className={`
                ${isCollapsed ? 'absolute left-full top-0 ml-1' : 'relative mt-1'}
                bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] z-50
              `}>
                <div className="p-2">
                  <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h3 className="font-medium">CHANNELS</h3>
                    <button className="text-green-500 hover:text-green-700">
                      <FiPlus />
                    </button>
                  </div>
                  <ul className="max-h-[300px] overflow-y-auto">
                    {['general', 'random', 'help'].map((channel, index) => (
                      <li key={index}>
                        <NavLink
                          to={`/channels/${channel}`}
                          className={({ isActive }) => 
                            `flex items-center px-3 py-2 hover:bg-gray-100 rounded ${isActive ? 'text-green-600' : 'text-gray-700'}`
                          }
                          onClick={() => {
                            window.innerWidth < 768 && setIsMobileMenuOpen(false);
                            setIsChannelsOpen(false);
                          }}
                        >
                          <FiHash className="mr-2 text-sm" />
                          {channel}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/messages"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
            }
            onClick={() => window.innerWidth < 768 && setIsMobileMenuOpen(false)}
          >
            <FiMail className="text-xl" />
            {!isCollapsed && <span className="ml-3">Messages</span>}
          </NavLink>

          <NavLink
            to="/add-friend"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
            }
            onClick={() => window.innerWidth < 768 && setIsMobileMenuOpen(false)}
          >
            <IoMdPersonAdd className="text-xl" />
            {!isCollapsed && <span className="ml-3">Add Friend</span>}
          </NavLink>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t">
          {isLoggedIn ? (
            <div className="space-y-1">
              <button
                onClick={toggleProfile}
                className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <FiUser />
                  </div>
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">My Profile</span>
                  )}
                </div>
                {!isCollapsed && (
                  isProfileOpen ? <FiChevronUp /> : <FiChevronDown />
                )}
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && !isCollapsed && (
                <div className="ml-11 pl-2 space-y-1 border-l-2 border-gray-200">
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
                    }
                    onClick={() => window.innerWidth < 768 && setIsMobileMenuOpen(false)}
                  >
                    <FiUser className="text-lg mr-2" />
                    <span>My Profile</span>
                  </NavLink>
                  
                  <NavLink
                    to="/settings"
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
                    }
                    onClick={() => window.innerWidth < 768 && setIsMobileMenuOpen(false)}
                  >
                    <FiSettings className="text-lg mr-2" />
                    <span>Settings</span>
                  </NavLink>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <FiLogOut className="text-lg mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Collapsed view - just the logout button */}
              {isCollapsed && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <FiLogOut className="text-xl" />
                </button>
              )}
            </div>
          ) : (
            <NavLink
              to="/"
              className={({ isActive }) => 
                `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'} ${isCollapsed ? 'justify-center' : ''}`
              }
              onClick={() => window.innerWidth < 768 && setIsMobileMenuOpen(false)}
            >
              <FiLogIn className="text-xl" />
              {!isCollapsed && <span className="ml-3">Login</span>}
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;