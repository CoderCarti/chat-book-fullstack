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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);
  const channelsRef = useRef(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsCollapsed(!isHovered);
    }
  }, [isHovered]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
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

  const handleMobileClick = (callback) => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
    if (callback) callback();
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="p-3 rounded-md bg-white shadow-md text-gray-700 hover:text-green-500"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

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
              aria-label="Collapse sidebar"
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
              `flex items-center p-4 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
            }
            onClick={() => handleMobileClick()}
          >
            <FiHome className="text-xl min-w-[24px]" />
            {!isCollapsed && <span className="ml-4">Home</span>}
          </NavLink>

          {/* Improved Channels Section */}
           <div className="relative" ref={channelsRef}>
            <button
              onClick={toggleChannels}
              className={`flex items-center justify-between w-full p-4 rounded-lg hover:bg-gray-200 transition-colors ${isChannelsOpen ? 'bg-green-100 text-green-600' : 'text-gray-700'}`}
              aria-expanded={isChannelsOpen}
            >
              <div className="flex items-center">
                <FiHash className="text-xl min-w-[24px]" />
                {!isCollapsed && <span className="ml-4">Channels</span>}
              </div>
              {!isCollapsed && (
                isChannelsOpen ? <FiChevronUp /> : <FiChevronDown />
              )}
            </button>

            {/* Right-extending dropdown */}
            {(isChannelsOpen || (isCollapsed && isMobileMenuOpen)) && (
              <div className={`
                absolute left-full top-0 ml-1
                bg-white rounded-lg shadow-lg border border-gray-200 z-50
                ${isMobileMenuOpen ? 'w-[calc(100vw-5rem)] max-w-md' : 'w-64'}
                ${isCollapsed && !isMobileMenuOpen ? '' : 'md:left-0 md:ml-0'}
              `}>
                <div className="p-2">
                  <div className="flex justify-between items-center px-3 py-2 border-b">
                    <h3 className="font-medium">CHANNELS</h3>
                    <button 
                      className="text-green-500 hover:text-green-700 p-2"
                      aria-label="Add channel"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <ul className="max-h-[300px] overflow-y-auto">
                    {['general', 'random', 'help'].map((channel, index) => (
                      <li key={index}>
                        <NavLink
                          to={`/channels/${channel}`}
                          className={({ isActive }) => 
                            `flex items-center px-4 py-3 hover:bg-gray-100 rounded ${isActive ? 'text-green-600' : 'text-gray-700'}`
                          }
                          onClick={() => handleMobileClick(() => setIsChannelsOpen(false))}
                        >
                          <FiHash className="mr-3 text-sm" />
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
              `flex items-center p-4 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
            }
            onClick={() => handleMobileClick()}
          >
            <FiMail className="text-xl min-w-[24px]" />
            {!isCollapsed && <span className="ml-4">Messages</span>}
          </NavLink>

          <NavLink
            to="/add-friend"
            className={({ isActive }) => 
              `flex items-center p-4 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
            }
            onClick={() => handleMobileClick()}
          >
            <IoMdPersonAdd className="text-xl min-w-[24px]" />
            {!isCollapsed && <span className="ml-4">Add Friend</span>}
          </NavLink>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t">
          {isLoggedIn ? (
            <div className="space-y-1">
              <button
                onClick={toggleProfile}
                className={`flex items-center justify-between w-full p-4 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
                aria-expanded={isProfileOpen}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <FiUser />
                  </div>
                  {!isCollapsed && (
                    <span className="ml-4 font-medium">My Profile</span>
                  )}
                </div>
                {!isCollapsed && (
                  isProfileOpen ? <FiChevronUp /> : <FiChevronDown />
                )}
              </button>

              {isProfileOpen && !isCollapsed && (
                <div className="ml-11 pl-2 space-y-1 border-l-2 border-gray-200">
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => 
                      `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
                    }
                    onClick={() => handleMobileClick()}
                  >
                    <FiUser className="text-lg mr-3" />
                    <span>My Profile</span>
                  </NavLink>
                  
                  <NavLink
                    to="/settings"
                    className={({ isActive }) => 
                      `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'}`
                    }
                    onClick={() => handleMobileClick()}
                  >
                    <FiSettings className="text-lg mr-3" />
                    <span>Settings</span>
                  </NavLink>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <FiLogOut className="text-lg mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {isCollapsed && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full p-4 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <FiLogOut className="text-xl" />
                </button>
              )}
            </div>
          ) : (
            <NavLink
              to="/"
              className={({ isActive }) => 
                `flex items-center p-4 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-700'} ${isCollapsed ? 'justify-center' : ''}`
              }
              onClick={() => handleMobileClick()}
            >
              <FiLogIn className="text-xl min-w-[24px]" />
              {!isCollapsed && <span className="ml-4">Login</span>}
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;