import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js"

const meRouter = Router()

meRouter.get("/me", authMiddleware, (req,res) =>{
        res.status(200).json({
            user: req.user
        })
    })


export default meRouter