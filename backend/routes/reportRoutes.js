import express from "express";
import {getTrialBalance, getIncomeStatement, emailReport, getBalanceSheet, getRetainedEarnings} from "../controllers/reportController.js";

const router = express.Router();

router.get("/trial-balance", getTrialBalance);
router.get("/income-statement", getIncomeStatement);
router.get("/balance-sheet", getBalanceSheet);
router.get("/retained-earnings", getRetainedEarnings);
router.post("/email", emailReport);
 
export default router;