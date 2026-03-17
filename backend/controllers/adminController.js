import pool from "../db.js";

// SUSPEND USER
export const suspendUser = async (req, res) => {
  const { username, suspendedUntil } = req.body;

  try {
    await pool.query(
      `UPDATE "User"
       SET suspended_until = $1
       WHERE "UName" = $2`,
      [suspendedUntil, username]
    );

    res.json({ message: "User suspended successfully" });
  } catch (err) {
    console.error("SUSPEND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};