import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";
import express from "express";
import {editUser} from "../controllers/editUserController.js"
const router = express.Router();

router.patch('/', verifyToken, authorizeRole(2), editUser)


export default router


