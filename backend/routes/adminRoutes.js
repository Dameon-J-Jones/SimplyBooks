import express from "express";
import { suspendUser } from "../controllers/adminController.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();
router.post("/suspend", suspendUser);



router.get('/admin-access', verifyToken, authorizeRole(2), (req, res) =>{
    res.json(req.user)
})

export default router;