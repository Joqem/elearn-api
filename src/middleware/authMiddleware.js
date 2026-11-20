import jwt from "jsonwebtoken";
import pool from "../db/db.js";

const authMiddleware = async (req,res,next) =>{
    try{
        const authHeader = req.headers.authorization
        if(!authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                error: "Token required"
            })
        }
        const token = authHeader.split(" ")[1]
        const decodedToken = jwt.verify(token,process.env.jwtsecret)
        const userInfo = await pool.query("SELECT id,name,email FROM users WHERE id = $1",[decodedToken.userid])
        if(userInfo.rows.length === 0){
            return res.status(401).json({
                error: "User doesn't exists"
            })
        }
       req.user = userInfo.rows[0]
       next()
    }
    catch(error){
        return res.status(401).json({
            error: "token doesn't exist or ended"
        })

    }
}
export default authMiddleware