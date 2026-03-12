import express from "express";
import { loginUser } from "../controllers/authuserController.js";

const router = express.Router();

router.post("/", loginUser);

export default router;