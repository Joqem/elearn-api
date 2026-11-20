import express from 'express'
import pool from './db/db.js'
import registerRouter from './routes/registerRoute.js'
import authRouter from './routes/authRoute.js'
import meRouter from './routes/meRoute.js'
import courseRoute from './routes/courseRoute.js'
const app = express()
app.use(express.json())


app.use("/api/auth", registerRouter)
app.use("/api/auth", authRouter)
app.use(meRouter)
app.use(courseRoute)


export default app