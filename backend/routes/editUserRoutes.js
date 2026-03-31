import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";
import express from "express";
import {editUser} from "../controllers/editUserController.js"
import { updateStatus } from "../controllers/adminController.js";

const router = express.Router();

router.patch('/', verifyToken, authorizeRole(2), editUser)

router.patch('/status', verifyToken, authorizeRole(2), updateStatus)

export default router


