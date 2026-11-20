import { Router } from "express";
import bcrypt from "bcrypt"
import pool from "../db/db.js"
import jwt from "jsonwebtoken"

const authRouter = Router()

authRouter.post("/login", async (req,res) =>{
    const {email,password} = req.body ?? {}
    try{
        const userResult = await pool.query("SELECT id, email, password FROM users WHERE email = $1",[email])
        const user = userResult.rows[0]
            if(userResult.rows.length === 1 && await bcrypt.compare(password,user.password)){
                const token = jwt.sign({userid: user.id},process.env.jwtsecret,{expiresIn: "24h"})
                return res.status(201).json({
                    result: "Access granted",
                    token
                })}
            else{
                return res.status(409).json({
                    result: "Access rejected"
                })
            }    
    }
    catch(error){
        console.log(error)
        res.status(409).json({
            status: error
        })
    }
})

export default authRouter