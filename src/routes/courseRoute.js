import pool from "../db/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { Router } from "express";

const courseRoute = Router()

courseRoute.post("/courses",authMiddleware,async (req,res) =>{
    try{
        const {title, description} = req.body
        const result = await pool.query("INSERT INTO courses(title,description,created_by,ispublished,cardcount) VALUES ($1,$2,$3,$4,$5) RETURNING *",[title,description,req.user.id,false,0])
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

courseRoute.get("/courses/:id",authMiddleware,async (req,res) =>{
    try{
        const idNumber = Number(req.params.id)
        if(!Number.isInteger(idNumber) || idNumber < 0 ){
            res.status(400).json({
                error: "No such course id"
            })
        }
        const result = await pool.query("SELECT * FROM courses WHERE id = $1 AND (ispublished = true or created_by = $2)",[idNumber,req.user.id])
        if(result.rows.length === 0){
            res.status(400).json({
                error: "Course not found"
            })
        }
        return res.status(200).json({
                course: result.rows[0]
            })
    }
    catch(error){

    }
})
courseRoute.delete("/courses/:id",authMiddleware,async (req,res) =>{
    try{
        const idNumber = Number(req.params.id)
        if(!Number.isInteger(idNumber)){
            return res.status(400).json({
                error: "Not valid ID"
            })
        }
        const result = await pool.query("DELETE FROM courses WHERE id = $1 AND created_by = $2",[idNumber,req.user.id])
        if(result.rowCount === 0){
           return res.status(404).json({
            error: "Course not found"
        })
        }
        return res.status(204).json({
            status: "Course deleted"
        })

    }
    catch(error){
        res.status(400).json({
            error: "Error"
        })
    }
    
})
// courseRoute.patch("/courses/:id",authMiddleware,async(res,req) =>{ TODO
//     const idNumber = Number(req.params.id)
//     if(!Number.isInteger(idNumber)){
//             return res.status(400).json({
//                 error: "Not valid ID"
//             })
//         }
//     const {title,description,ispublished} = req.body ?? {}
//     if(title !== undefined && typeof title !== "string" || description !== undefined && typeof description !== "string"|| ispublished !== undefined && typeof ispublished !== "boolean"){
//         res.status(400).json({
//             error: "Entered fields are invalid"
//         })
//     }
//     const courseOwnership = await pool.query("SELECT * FROM courses WHERE id = $1 AND created_by = $2",[idNumber,req.user.id])
//     if(courseOwnership.rows.length === 0){
//         return res.status(400).json({
//             error: "Course not found"
//         })}
//     })
    courseRoute.post("/courses/:id/cards",authMiddleware,async (req,res) =>{
        const client = await pool.connect()
        try{
            const idNumber = Number(req.params.id)
            const {title,content} = req.body
            if (!Number.isInteger(idNumber) || idNumber < -1) {
            return res.status(400).json({
                error: "Invalid ID"
            })
        }
        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof content !== "string"
        ) {
            return res.status(400).json({
                error: "Invalid title or content"
            })
        }
        await client.query("BEGIN")
         const courseResult = await client.query(
            `SELECT id FROM courses
             WHERE id = $1 AND created_by = $2
             FOR UPDATE`,
            [idNumber, req.user.id]
        )

        if (courseResult.rows.length === 0) {
            await client.query("ROLLBACK")

            return res.status(404).json({
                error: "Course not found"
            })
        }
        const positionResult = await client.query(
            `SELECT COALESCE(MAX(position), 0) + 1 AS next_position
             FROM cards
             WHERE course_id = $1`,
            [idNumber]
        )
        const nextPosition = positionResult.rows[0].next_position
        const result = await client.query(
            `INSERT INTO cards (course_id, title, content, position)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [idNumber, title.trim(), content, nextPosition]
        )

        await client.query("COMMIT")

        return res.status(201).json({
            card: result.rows[0]
        })} 
        catch (error) {
        await client.query("ROLLBACK")
        console.log(error)

        return res.status(500).json({
            error: "Server Error"
        })

        } finally {
            client.release()
        }
    })
export default courseRoute