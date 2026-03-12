import pool from "../db.js";
import { comparePassword } from "../PasswordHash.js";

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

    const ok = await comparePassword(password, user.Password);
    if (!ok) return res.status(401).json({ message: "Not Allowed" });

    res.json({
      message: "Success",
      user: {
        username: user.UName,
        role: user.GroupID
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};