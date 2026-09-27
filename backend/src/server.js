import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { connectDatabase } from './config/database.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import activityRoutes from './routes/activityRoutes.js'

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

app.use('/api', activityRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

async function startServer() {
  try {
    const connected = await connectDatabase()

    if (!connected) {
      console.error('Server started without a successful database connection.')
    }

    app.listen(PORT, () => {
      console.log(`PlanetPulse API running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Unable to start server:', error.message)
    process.exit(1)
  }
}

startServer()
