import express from "express";
import { getDashboardRatios } from "../controllers/dashboardController";

const router = express.Router();

router.get("/", getDashboardRatios);

export default router;