import {Router} from "express"
import pool from "../db/db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const registerRouter = Router()

registerRouter.post("/register", async (req,res) =>{
    const {name,email,password} = req.body
    const emailLow = String(email).toLowerCase()
    try{
        if(!name || !emailLow || !password){
        return res.status(409).json({
            error: "all fields needed"
        })
    }
    const existingMail = await pool.query("SELECT id FROM users WHERE email = $1",[emailLow])
    if(existingMail.rows.length > 0){
        return res.status(409).json({
            error: "This email is already registered"
        })
    }
    const hashpass = await bcrypt.hash(password,12)
    const results = await pool.query("INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email",[name,emailLow,hashpass])
    const user = results.rows[0]
    const jwttoken = jwt.sign({userid: user.id},process.env.jwtsecret,{expiresIn: "24h"})
    res.status(201).json({
        user: results.rows[0],
        token: jwttoken
    })
    }
    catch(error){
        res.status(409).json({
            error: "error on server side"
        })
    }
})

export default registerRouter