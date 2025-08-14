import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdPersonAdd } from "react-icons/io";
import { MdOutlineAddToQueue } from "react-icons/md";
import { BiMessageRoundedDots } from "react-icons/bi";
import { PiConfettiFill } from "react-icons/pi";

const Homepage = () => {
    const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Main Content */}
        <div className="max-w-4xl w-full text-center">
            {/* Heading with responsive text size and flex direction */}
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-semibold flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3'>
                <PiConfettiFill className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10'/> 
                Welcome to ChatBook!
                <PiConfettiFill className='w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10'/> 
            </h1>
            
            {/* Responsive paragraph text */}
            <p className='mt-3 text-base sm:text-lg md:text-xl text-gray-700'>
                You can now Add friends and Create a Channel together with your friends!
            </p>
            
            {/* Responsive button group - stacks on mobile */}
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-5 md:gap-10 mt-4 justify-center'>
                <button 
                    onClick={() => navigate('/add-friend')}
                    className='flex items-center justify-center gap-2 border rounded-2xl p-3 cursor-pointer hover:bg-green-200 transition duration-300 text-sm sm:text-base'
                >
                    <IoMdPersonAdd className='w-4 h-4 sm:w-5 sm:h-5'/>
                    Add Friends
                </button>
                <button 
                    onClick={() => navigate('/create-channel')}
                    className='flex items-center justify-center gap-2 border rounded-2xl p-3 cursor-pointer hover:bg-green-200 transition duration-300 text-sm sm:text-base'
                >
                    <MdOutlineAddToQueue className='w-4 h-4 sm:w-5 sm:h-5'/>
                    Create Channel
                </button>
                <button 
                    onClick={() => navigate('/new-message')}
                    className='flex items-center justify-center gap-2 border rounded-2xl p-3 cursor-pointer hover:bg-green-200 transition duration-300 text-sm sm:text-base'
                >
                    <BiMessageRoundedDots className='w-4 h-4 sm:w-5 sm:h-5'/>
                    New Message
                </button>
            </div>
        </div>

        {/* Quick Access (Development Only) - Responsive positioning */}
        <div className="fixed bottom-4 right-4 z-10">
            <div className="bg-gray-100 p-2 sm:p-3 md:p-4 rounded-lg shadow">
                <p className="text-xs text-gray-600 mb-1 sm:mb-2">Quick Access</p>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                    <button
                        onClick={() => navigate('/profile')}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-600 transition"
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => navigate('/addfriend')}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs cursor-pointer hover:bg-green-600 transition"
                    >
                        Add Friend
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs cursor-pointer hover:bg-red-600 transition"
                    >
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Homepage