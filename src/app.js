import express from 'express'
import pool from './db/db.js'
import router from './routes/registerRoute.js'
import authRouter from './routes/authRoute.js'
const app = express()
app.use(express.json())

app.get('/hello', (req,res) => {
    res.json({
        message: 'hello'
    })
})
app.use("/api/auth", router)
app.use("/api/auth", authRouter)

app.get('/time', (req,res) => {
    const now = new Date()
    res.json({
        localTime: now.toLocaleTimeString()
    })
})
app.get("/api/health", async(req,res) =>{
    try{
        await pool.query("SELECT 1")
        return res.status(200).json({
            status: "ok"
        })
    }
    catch(error){
        console.error(error)
        res.status(503).json({
            status: "Error"
        })
    }
})

export default app