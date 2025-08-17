  import React, { useState, useEffect } from "react";
  import Chatbook from "../assets/images/chatbook.png";
  import Google from "../assets/images/google-icon.png";
  import { FaEye, FaEyeSlash } from "react-icons/fa";
  import { useNavigate } from "react-router-dom";
  import { useGoogleLogin } from "@react-oauth/google";
  import axios from "axios";

  const feedbacks = [
    {
      img: "https://via.placeholder.com/300x200?text=Feedback+1",
      text: '"ChatBook has made it so easy to connect with my friends! I love the interface." - Alex M.',
    },
    {
      img: "https://via.placeholder.com/300x200?text=Feedback+2",
      text: '"The group chat feature is fantastic. Highly recommended!" - Sarah L.',
    },
    {
      img: "https://via.placeholder.com/300x200?text=Feedback+3",
      text: '"Ive met so many new people through ChatBook. Its amazing!" - Daniel P.',
    },
  ];

  export default function auth() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSwapped, setIsSwapped] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [isLogin, setIsLogin] = useState(true); // Track if login or signup form
    const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!formData.email || !formData.password) {
    alert("Please fill in both fields");
    return;
  }

  setIsLoading(true); // Start loading
  try {
    console.log("Sending:", { 
      email: formData.email.trim(), 
      password: formData.password 
    });

    const res = await axios.post(
      "https://chat-book-server.vercel.app/api/auth/login",
      {
        email: formData.email.trim(),
        password: formData.password
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      }
    );

    localStorage.setItem("token", res.data.token);
    navigate("/homepage");
    
  } catch (err) {
    console.error("Full error:", err);
    alert(err.response?.data?.message || "Login failed. Check console.");
  } finally {
    setIsLoading(false); // Stop loading in any case
  }
};

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

   const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true); // Start loading
  try {
    const res = await axios.post(
      "https://chat-book-server.vercel.app/api/auth/register", 
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      }
    );
    // Optionally handle successful registration (like auto-login)
  } catch (err) {
    alert(err.response.data.message);
  } finally {
    setIsLoading(false); // Stop loading
  }
};

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    // ✅ Google Login handler
    const loginWithGoogle = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    setIsLoading(true); // Start loading
    try {
      const res = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
      );
      const profile = await res.json();
      console.log("Google Profile:", profile);

      localStorage.setItem("user", JSON.stringify(profile));
      navigate("/homepage");
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  },
  onError: () => {
    console.log("Google Login Failed");
    setIsLoading(false); // Stop loading
  },
});

    const getCardClass = (index) => {
      if (index === currentIndex)
        return "z-20 scale-100 opacity-100 translate-x-0";
      if (index === (currentIndex - 1 + feedbacks.length) % feedbacks.length)
        return "z-10 scale-90 opacity-70 -translate-x-32";
      if (index === (currentIndex + 1) % feedbacks.length)
        return "z-10 scale-90 opacity-70 translate-x-32";
      return "opacity-0 scale-75";
    };

    const renderLoginForm = () => (
      <div className="flex flex-col w-full h-full">
        <div className="flex gap-3 items-center">
          <img src={Chatbook} className="w-10 h-10" alt="Chatbook Logo" />
          <h1 className="font-semibold text-2xl">ChatBook</h1>
        </div>
        <form className="flex flex-col mt-8 lg:mt-20" onSubmit={isLogin ? handleLogin : handleSubmit}>
          <h1 className="font-semibold text-xl">Welcome Back!</h1>
          <p className="font-semibold text-gray-500">
            Sign in to continue chatting!
          </p>

          {/* ✅ Google Login Button */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="border rounded-2xl mt-3 p-3 flex items-center justify-center gap-2 font-semibold hover:bg-amber-200 transition cursor-pointer"
          >
            <img src={Google} className="w-6 h-6" alt="Google" />
            Sign In with Google
          </button>

          <div className="flex items-center mt-3">
            <hr className="flex-1 border-gray-300" />
            <span className="px-2 text-gray-500 text-sm">or</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <label className="mt-2 font-semibold">Email Address</label>
            <input
              name="email"
              type="email"
              className="border rounded-xl p-3 mt-1"
              placeholder="example@gmail.com"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />

            <label className="mt-4 font-semibold">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="border rounded-xl p-3 pr-10 w-full"
                required
                placeholder="*******"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

          <div className="flex justify-between text-sm mt-4">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="cursor-pointer"
              />
              Remember me
            </label>
            <span className="text-blue-500 cursor-pointer">
              Forgot password?
            </span>
          </div>
          <button
          type="submit"
          className="bg-blue-500 text-white rounded-xl p-3 mt-6 hover:bg-blue-600 cursor-pointer flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isLogin ? "Sign In" : "Sign Up"}
        </button>
          <p className="text-sm mt-4 text-center">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => setIsSwapped(true)}
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    );

    const renderSignupForm = () => (
      <div className="flex flex-col w-full h-full">
        <div className="flex gap-3 items-center">
          <img src={Chatbook} className="w-10 h-10" alt="Chatbook Logo" />
          <h1 className="font-semibold text-2xl">ChatBook</h1>
        </div>
        <form className="flex flex-col mt-8" onSubmit={handleSubmit}>
          <h1 className="font-semibold text-xl">Create an Account</h1>
          <p className="font-semibold text-gray-500">Join and start chatting!</p>

          <button
            type="button"
            className="border rounded-2xl mt-3 p-3 flex items-center justify-center gap-2 font-semibold hover:bg-amber-200 transition cursor-pointer"
          >
            <img src={Google} className="w-6 h-6" alt="Google" />
            Sign up with Google
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-1 border-gray-300" />
            <span className="px-2 text-gray-500 text-sm">or</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <label className="mt-2 font-semibold">Full Name</label>
          <input
            name="username"
            type="text"
            className="border rounded-xl p-3 mt-1"
            placeholder="John Doe"
            required
            onChange={handleChange}
            disabled={isLoading}
          />
          <label className="mt-4 font-semibold">Email Address</label>
          <input
            name="email"
            type="email"
            className="border rounded-xl p-3 mt-1"
            placeholder="example@gmail.com"
            required
            onChange={handleChange}
            disabled={isLoading}
          />
          <label className="mt-4 font-semibold">Password</label>
          <input
            name="password"
            type="password"
            className="border rounded-xl p-3 mt-1"
            placeholder="*******"
            required
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-green-500 text-white rounded-xl p-3 mt-6 hover:bg-green-600 cursor-pointer flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Sign Up
          </button>
          <p className="text-sm mt-4 text-center">
            Already have an account?{" "}
            <button
              type="button"
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => setIsSwapped(false)}
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    );

    const renderCarousel = () => (
      <div className="flex w-full h-full items-center justify-center bg-amber-200 relative p-4 rounded-3xl">
        {feedbacks.map((item, idx) => (
          <div
            key={idx}
            className={`absolute flex flex-col items-center justify-center p-4 rounded-xl shadow-lg bg-white transition-all duration-700 ease-in-out transform ${getCardClass(
              idx
            )}`}
            style={{ width: "250px", height: "250px" }}
          >
            <img
              src={item.img}
              alt="Feedback"
              className="w-full h-[120px] object-cover rounded-lg"
            />
            <p className="mt-4 text-gray-700 italic text-center text-sm">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    );

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-300 to-white p-4">
        {/* Main Content - Stacked on mobile, side-by-side on desktop */}
        <div className="relative w-full max-w-6xl lg:h-[750px] bg-gray-200 rounded-3xl overflow-hidden shadow-lg">
          {/* Mobile View - Single Panel */}
          {isMobile ? (
            <div className="w-full h-full p-6">
              {!isSwapped ? renderLoginForm() : renderSignupForm()}
              {/* Show carousel below form on mobile when not swapped */}
              {!isSwapped && (
                <div className="mt-8 h-64">
                  {renderCarousel()}
                </div>
              )}
            </div>
          ) : (
            /* Desktop View - Split Panel */
            <>
              {/* LEFT PANEL */}
              <div
                className={`absolute top-0 left-0 w-full lg:w-1/2 h-full p-6 transition-transform duration-700 ease-in-out ${
                  isSwapped ? "translate-x-full" : "translate-x-0"
                }`}
              >
                {!isSwapped ? renderLoginForm() : renderCarousel()}
              </div>

              {/* RIGHT PANEL */}
              <div
                className={`absolute top-0 right-0 w-full lg:w-1/2 h-full p-6 transition-transform duration-700 ease-in-out ${
                  isSwapped ? "-translate-x-full" : "translate-x-0"
                }`}
              >
                {!isSwapped ? renderCarousel() : renderSignupForm()}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }