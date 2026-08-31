import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
  const { navigate, isEducator } = useContext(AppContext)
  const location = useLocation()
  const isCourseListPage = location.pathname.includes('/course-list')

  const { openSignIn, signOut } = useClerk()
  const { user } = useUser()

  const handleLogout = async () => {
    await signOut({ redirectUrl: '/' })
  }

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14
    lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? 'bg-white' :
      'bg-cyan-100/70'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className='w-28 lg:w-32
          lg:w-32-cursor-pointer' />
      <div className='hidden md:flex items-center gap-5 text-gray-500'>
        <div className='flex items-center gap-5'>
          {user && (
            <>
              <button onClick={() => { navigate('/educator') }}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
              <Link to='/my-enrollments'>My Enrollments</Link>
            </>
          )}
        </div>
        {user ? (
          <div className='flex items-center gap-3'>
            <button onClick={handleLogout} className='bg-red-500 text-white px-3 py-2 rounded-full text-sm'>Logout</button>
            <UserButton />
          </div>
        ) : (
          <button onClick={() => openSignIn()} className='bg-blue-600 text-white px-5 py-2 rounded-full'>Create Account</button>
        )}
      </div>

      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
          {user && (
            <>
              <button onClick={() => { navigate('/educator') }}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
              <Link to='/my-enrollments'>My Enrollments</Link>
            </>
          )}
        </div>
        {user ? (
          <div className='flex items-center gap-2'>
            <button onClick={handleLogout} className='bg-red-500 text-white px-2 py-1 rounded-full text-xs'>Logout</button>
            <UserButton />
          </div>
        ) : (
          <button onClick={() => openSignIn()}><img src={assets.user_icon} alt="" /></button>
        )}
      </div>
    </div>
  )
}

export default Navbar