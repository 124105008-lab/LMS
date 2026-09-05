import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import dns from 'node:dns'
import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import User from './modles/User.js'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoutes.js'

dns.setServers(['8.8.8.8', '8.8.4.4'])

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_PUBLIC_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLIC_KEY
}

const app = express()
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
  

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

await connectDB()
await connectCloudinary()

app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhooks)

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API Working' })
})

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
//app.use(clerkMiddleware())

app.use(clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
}))

app.get('/api/test-auth', (req, res) => {
    const auth = getAuth(req)

    console.log("TEST AUTH:", auth)

    res.json({
        userId: auth.userId || null,
        isAuthenticated: auth.isAuthenticated
    })
})


// Educator routes
app.use('/api/educator',express.json(), educatorRouter)

app.use('/api/course',express.json(),courseRouter)

app.get('/api/auth/me', async (req, res) => {
  const auth = getAuth(req)

  if (!auth.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }

  try {
    const user = await clerkClient.users.getUser(auth.userId)

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || null,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        sessionId: auth.sessionId,
      },
    })
  } catch (error) {
    console.error('Error fetching Clerk user:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch current user' })
  }
})

app.post('/api/auth/sync-user', async (req, res) => {
  const auth = getAuth(req)

  if (!auth.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }

  try {
    const user = await clerkClient.users.getUser(auth.userId)
    const userData = {
      _id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || null,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
      imageUrl: user.imageUrl || 'https://via.placeholder.com/150',
    }

    const savedUser = await User.findOneAndUpdate(
      { _id: user.id },
      { $set: userData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({
      success: true,
      message: 'User synced to MongoDB',
      user: savedUser,
    })
  } catch (error) {
    console.error('Sync user error:', error)
    return res.status(500).json({ success: false, message: 'Failed to sync user' })
  }
})

app.post('/api/auth/logout', async (req, res) => {
  const auth = getAuth(req)

  if (!auth.userId) {
    return res.status(401).json({ success: false, message: 'No active session' })
  }

  return res.json({
    success: true,
    message: 'Logout successful. Please sign out from the client with Clerk.',
  })
})
 //Port 
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})