import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";
import express from "express";


const router = express.Router();

router.get('/accountant-access', verifyToken, authorizeRole("Accountant"), (req, res) =>{
    res.json(req.user)
})