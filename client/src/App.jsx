import React, { useEffect } from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import Home from './pages/student/Home'
import CoursesList from './pages/student/CoursesList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollments from './pages/student/MyEnrollments'
import Player from './pages/student/Player'
import Loading from './components/student/Loading'
import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import Navbar from './components/student/Navbar'
import 'quill/dist/quill.snow.css'

const App = () => {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const isEducatorRoute = useMatch('/educator/*')

  useEffect(() => {
    const syncUserToMongo = async () => {
      if (!isSignedIn || !user) return

      try {
        const token = await getToken()

        await fetch('http://localhost:5000/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        })
      } catch (error) {
        console.error('Error syncing user to MongoDB:', error)
      }
    }

    syncUserToMongo()
  }, [getToken, isSignedIn, user])

  return (
    <div className ='text-default min-h-screen bg-white'>
      {!isEducatorRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/course-list' element={ <CoursesList />}/>
        <Route path='/course-list/:input' element={ <CoursesList />}/>
        <Route path='/course/:id' element={<CourseDetails />} />
        <Route path='/my-enrollments' element={<MyEnrollments />} />
        <Route path='/player/:courseId' element={<Player />} />
        <Route path='/loading/:path' element={<Loading />}/>
        <Route path ='/educator' element={<Educator />}>
             <Route path='/educator' element={<Dashboard/>} />
             <Route path='add-course' element={<AddCourse/>} />
             <Route path='my-courses' element={<MyCourses />} />
             <Route path='student-enrolled' element={<StudentsEnrolled />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App