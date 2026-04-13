import pool from "../db.js";
import bcrypt from "bcrypt";
import {passwordCheck} from "../PasswordCheck.js";
import { hashPassword } from "../PasswordHash.js";



export default async function changePassword(req, res) {
  try {
        
    const { id, password } = req.body;
     //MAKE SURE NOT NULL
    if (!id || !password) {
      return res.status(400).json({ message: "Missing id or password" });
    }

    
    const passwordError = passwordCheck(password);
    if (!passwordError) {
      return res.status(400).json({ message: "Password has wrong forma" });
    }
   
    const findUserQuery = `
      SELECT id, "Password"
      FROM "User"
      WHERE id = $1
    `;


    const userResult = await pool.query(findUserQuery, [id]);
    const user = userResult.rows[0];
    console.log(user);
    console.log(password + "  " + id);
    
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const samePassword = await bcrypt.compare(password, user.Password);

    if (samePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }
     

    console.log("THIS IS PASSWORD LINE BEFORE BCRYPT" + password)
    const hashedPassword = await hashPassword(password);

    const updateQuery = `
      UPDATE "User"
      SET "Password" = $1
      WHERE id = $2
    `;

    await pool.query(updateQuery, [hashedPassword, id]);

    return res.status(200).json({ message: "Password successfully updated" })
 }
  
  
  catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({
      message: err.message || "Server error",
    });
    
  }
}