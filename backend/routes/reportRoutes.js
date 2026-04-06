import express from "express";
import {getTrialBalance, getIncomeStatement, getBalanceSheet, getRetainedEarnings} from "../conrollers/reportController.js";

const router = express.Router();

router.get("/trial-balance", getTrialBalance);
router.get("/income-statement", getIncomeStatement);
router.get("/balance-sheet", getBalanceSheet);
router.get("/retained-earnings", getRetainedEarnings);

export default router;