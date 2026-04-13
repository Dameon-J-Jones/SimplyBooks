import pool from "../db.js";

export default async function checkPassword(req, res) {
  try {
   

    const { id, email, securityQuestion } = req.body;

    const query = `
      SELECT id, "Email", security_question
      FROM "User"
      WHERE id = $1
    `;

    const dbResponse = await pool.query(query, [id]);
    const data = dbResponse.rows[0];

    // no user found
    if (!data) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // check email
    if (data.Email !== email) {
      console.log("bad email");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // check security answer
    if (data.security_question !== securityQuestion) {
      console.log("bad answer");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    return res.status(200).json({ message: "Valid" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}