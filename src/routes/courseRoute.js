import pool from "../db/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { Router } from "express";

const courseRoute = Router()

courseRoute.post("/courses",authMiddleware,async (req,res) =>{
    try{
        const {title, description} = req.body
        const result = await pool.query("INSERT INTO courses(title,description,created_by,ispublished) VALUES ($1,$2,$3,$4) RETURNING *",[title,description,req.user.id,false])
        return res.status(201).json({
            result: result.rows[0]
        })
    }
    catch(error){
        console.log(error)
    }
})

courseRoute.get("/courses",authMiddleware,async (req,res) =>{
    try{
        let result
        const {mine} = req.query
        if(mine === "true"){
            result = await pool.query("SELECT * FROM courses WHERE created_by = $1 ORDER BY created_at DESC",[req.user.id])
        }
        else{
            result = await pool.query("SELECT * FROM courses WHERE ispublished = true ORDER BY created_at DESC")
        }
        return res.status(200).json({
            data: result.rows
            })
    }
    catch(error){
        res.status(401).json({
            error: "Server Error"
        })
    }
})

export default courseRoute