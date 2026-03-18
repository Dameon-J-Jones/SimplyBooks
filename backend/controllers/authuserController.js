import pool from "../db.js";
import { comparePassword } from "../PasswordHash.js";
import jwt from "jsonwebtoken";
import "dotenv/config";


// LOGIN
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM "User" WHERE "UName" = $1',
      [username]
    );

    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "Cannot find user" });

    // check admin suspension FIRST
    if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
      return res.status(403).json({
        message: `Account suspended until ${user.suspended_until}`
      });
    }

    //check lockout for cooldown on password attempts/admin lockout
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      return res.status(403).json({ message: "Account temporarily locked. Please contact an administrator."})
    }

    const ok = await comparePassword(password, user.Password);

    if (!ok){
      const attempts = user.failed_attempts + 1;

      if (attempts >= 3){
        await pool.query(
          `UPDATE "User"
          SET failed_attempts = 0,
            lockout_until = NOW() + INTERVAL '30 minutes'
          WHERE "UName" = $1`,
          [username]
        );

        return res.status(403).json({ message: "Account locked for 30 minutes." });
      }

      await pool.query(
        `UPDATE "User"
        SET failed_attempts = $1
        WHERE "UName" = $2`,
      [attempts, username]
    );

    return res.status(401).json({ message: "Incorrect password" });
    } 

    await pool.query(
      `UPDATE "User"
       SET failed_attempts = 0,
           lockout_until = NULL
       WHERE "UName" = $1`,
      [username]
    );

    //create "payload" for jwt token
    const payload = { 
      user: user.id,
      username: username,
      role: user.role,
    }

    //create/sign token to be stored in localstorage on front end
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h'});



    return res.json({
      message: "Login successful",
      token: token,
      
      //returns data on user through auth Accountant, admin , manager files
      /*
      user: {
        username: user.UName,
        role: user.GroupID,
        profilePic: user.profile_pic
      }
        */
    });
    
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};