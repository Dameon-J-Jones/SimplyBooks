import express from "express";
import { getDashboardRatios } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", getDashboardRatios);

export default router;
