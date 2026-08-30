import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import dns from 'node:dns'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'

dns.setServers(['8.8.8.8', '8.8.4.4'])

const app = express()

await connectDB()

app.use(cors())

app.get('/', (req, res) => {
    res.send("API Working")
})

app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhooks)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})