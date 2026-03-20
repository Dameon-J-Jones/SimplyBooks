import express from "express";
import { createAccount } from "../controllers/accountController.js";
import { getAccounts } from "../controllers/accountController.js";
import { getAccountById } from "../controllers/accountController.js";
import { updateAccount } from "../controllers/accountController.js";
import { deactivateAccount } from "../controllers/accountController.js";

const router = express.Router();

router.post("/", createAccount);
router.get("/", getAccounts);
router.get("/:id", getAccountById);
router.put("/:id", updateAccount);
router.put("/:id/deactivate", deactivateAccount);

export default router;