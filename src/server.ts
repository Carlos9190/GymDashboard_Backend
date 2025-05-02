import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { corsConfig } from "./config/cors"
import { connectDB } from "./config/db"
import authRoutes from "./routes/authRoutes"

dotenv.config()
connectDB()

const app = express()
app.use(cors(corsConfig))

// Routes
app.get('/', (req, res) => {
    res.send('Hello world')
})
app.use('/api/auth', authRoutes)

export default app