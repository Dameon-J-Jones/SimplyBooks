import express from "express";
import { suspendUser } from "../controllers/adminController.js";

const router = express.Router();
router.post("/suspend", suspendUser);

export default router;