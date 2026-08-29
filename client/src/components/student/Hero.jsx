import React from 'react'
import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
  return (
    <div className='flex flex-col items-center justify-center w-full md:pt-36 pt-20
    px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/70' >
        <h1 className='md:text-home-heading-large text-home-heading-small
        relative font-bold text-gray-800 max-w-3xl mx-auto'>Empower your future with the courses designed 
          <span className='text-blue-600'> to fit your choice. </span><img src={assets.sketch} alt="sketch"
          className='md:block hidden absolute -bottom-7 right-0' /></h1>
    
        <p className="hidden md:block text-gray-500 max-w-2xl mx-auto">
         Learn from expert instructors, build real-world skills, and unlock your
          potential with engaging courses designed for your career and future.
         </p>
        <SearchBar />
    </div>
  )
}

export default Hero
