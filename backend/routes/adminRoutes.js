import express from "express";
import { suspendUser } from "../controllers/adminController.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();
router.post("/suspend", suspendUser);



router.get('/admin-access', verifyToken, authorizeRole(2), (req, res) =>{
    res.json(req.user)
})

router.get('/accountant-access', verifyToken, authorizeRole(0), (req, res) =>{
    res.json(req.user)
})


router.get('/manager', verifyToken, authorizeRole(1), (req, res) =>{
    res.json(req.user)
})

export default router;