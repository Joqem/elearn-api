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
        let counter
        const {mine} = req.query
        const limit = req.query.limit === undefined ? 20 : Number(req.query.limit)
        const offset = req.query.offset === undefined ? 0 : Number(req.query.offset)
        if(!Number.isInteger(limit) || limit < 0 || limit >101 || !Number.isInteger(offset) || offset < -1){
            return res.status(400).json({
                error: "Invalid limit or offset"
            })
        }
        if(mine === "true"){
            result = await pool.query("SELECT * FROM courses WHERE created_by = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",[req.user.id,limit,offset])
            counter = await pool.query("SELECT COUNT(*) AS total FROM courses WHERE created_by = $1",[req.user.id])
        }
        else{
            result = await pool.query("SELECT * FROM courses WHERE ispublished = true ORDER BY created_at DESC")
            counter = await pool.query("SELECT COUNT(*) AS total FROM courses WHERE ispublished = true")
        }
        return res.status(200).json({
            data: result.rows,
            total: Number(counter.rows[0].total),
            limit,
            offset
            })
    }
    catch(error){
        res.status(401).json({
            error: "Server Error"
        })
    }
})

export default courseRoute