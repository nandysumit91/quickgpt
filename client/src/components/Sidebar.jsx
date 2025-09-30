import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const { chats, setSelectedChat, theme, setTheme, user, navigate } = useAppContext()
  const [search, setSearch] = useState('')

  return (
    <>
      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <div className={`flex flex-col h-screen min-w-2 p-5 ${theme === 'dark' ? 'bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30' : 'bg-white border-r border-gray-200'} backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-20 ${!isMenuOpen ? 'max-md:-translate-x-full' : 'max-md:translate-x-0'}`}>
      {/* Logo */}
      <img
        src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
        alt="Logo"
        className="w-full max-w-48"
      />

      {/* New Chat Button */}
      <button
        className="flex justify-center items-center w-full py-2 mt-10 
      text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md 
      cursor-pointer"
      >
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* Search Conversations */}
      <div
        className="flex items-center gap-2 p-3 mt-4 border border-gray-400 
     dark:border-white/20 rounded-md"
      >
        <img src={assets.search_icon} className="w-4 not-dark:invert" alt="Search" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversations"
          className="text-xs placeholder:text-gray-400 outline-none bg-transparent w-full"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Recent Chats</p>}

      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          .filter((chat) =>
            chat.messages.length > 0
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <div onClick={()=> {navigate('/'); setSelectedChat(chat); setIsMenuOpen(false)}}
              key={chat._id}
              
              className={`p-2 px-4 ${theme === 'dark' ? 'bg-[#57317C]/10 border-[#80609F]/15' : 'bg-gray-50 border-gray-200'} border rounded-md cursor-pointer flex justify-between group`}
            >
              <div>
                <p className={`truncate w-full ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#B1A6C0]' : 'text-gray-500'}`}>
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>

              {/* Bin Icon (Delete) */}
              <img
                src={assets.bin_icon}
                className="hidden group-hover:block w-4 cursor-pointer not-dark:invert"
                alt="Delete"
              />
            </div>
          ))}
      </div>

          {/* Community Images */}
          <div onClick={()=>{navigate('/community'); setIsMenuOpen(false)}} className={`flex items-center gap-2 p-3 mt-4 border ${theme === 'dark' ? 'border-white/15' : 'border-gray-300'} rounded-md cursor-pointer hover:scale-103 transition-all`}>
            <img src={assets.gallery_icon} className='w-4.5 not-dark:invert' alt="" />
            <div className='flex flex-col text-sm'>
              <p className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Community Images</p>
            </div>
          </div>

          {/* Credit Purchase Option */}
          <div onClick={()=>{navigate('/credits'); setIsMenuOpen(false)}} className={`flex items-center gap-2 p-3 mt-4 border ${theme === 'dark' ? 'border-white/15' : 'border-gray-300'} rounded-md cursor-pointer hover:scale-103 transition-all`}>
            <img src={assets.diamond_icon} className='w-4.5 dark:invert' alt="" />
            <div className='flex flex-col text-sm'>
              <p className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Credits : {user?.credits}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Purchase credits to use quickgpt </p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className={`flex items-center justify-between gap-2 p-3 mt-4 border ${theme === 'dark' ? 'border-white/15' : 'border-gray-300'} rounded-md`}>
            <div className='flex items-center gap-2 text-sm'>
              <img src={assets.theme_icon} className='w-4 not-dark:invert' alt="" />
              <p className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>Dark Mode</p>
            </div>
              <label className='relative inline-flex cursor-pointer'>
                <input onChange={()=> {setTheme(theme === 'dark' ? 'light' : 'dark'); setIsMenuOpen(false)}} type="checkbox" className="sr-only" checked={theme === 'dark'} />
                <div className={`w-9 h-5 rounded-full transition-all relative ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-400'}`}>
                  <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'left-5' : 'left-1'}`}></span>
                </div>
              </label>
          </div>

          {/* User Account */}
          <div className={`flex items-center gap-2 p-3 mt-4 border ${theme === 'dark' ? 'border-white/15' : 'border-gray-300'} rounded-md cursor-pointer group`}>
            <img src={assets.user_icon} className='w-7 rounded-full' alt="" />
            <p className={`flex-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'} truncate`}>{user ? user.name : 'Login your account'}</p>
            {user && <img src={assets.logout_icon} className='h-5 cursor-pointer hidden not-dark:invert group-hover:block'/>}
          </div>

          <img onClick={()=> setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert' alt="" />

      </div>
    </>
  )
}

export default Sidebar
