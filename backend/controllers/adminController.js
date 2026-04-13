import pool from "../db.js";
import { sendEmail } from "../sendEmails.js";

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

export const updateStatus = async (req,res) => {
  try{
    const {decision, username} = req.body;
console.log(decision + "     "+ username)
  if(decision === "approved"){
    await pool.query(`
      UPDATE "User"
      SET status = 1
      WHERE "UName" = $1 
      `,[username])
      // get user info
const result = await pool.query(
  `
    SELECT "UName", id, "Email"
    FROM "User"
    WHERE "UName" = $1
  `,
  [username]
);

const userInfo = result.rows[0];

if (!userInfo) {
  return res.status(404).json({ message: "User not found" });
}

// build message
const message = `Hello, your account has been created, here is your username and id
Id: ${userInfo.id}
Username: ${userInfo.UName}`;

// send email
await sendEmail({
  to: userInfo.Email,
  subject: "Account Approved",
  text: message,
  html: `
    <p>Your account has been approved.</p>
    <p><strong>ID:</strong> ${userInfo.id}</p>
    <p><strong>Username:</strong> ${userInfo.UName}</p>
    <a href="http://localhost:5173/login">CLICK HERE TO LOGIN</a>
  `,
});
      
    return  res.status(200).json({message:"Approved!"})
  }
  
else if (decision === "reject") {
      await pool.query(
        `
        DELETE FROM "User"
        WHERE "UName" = $1
        `,
        [username]
      );

      return res.status(200).json({ message: "User deleted!" });
    } 

    
    else {
      return res.status(400).json({ message: "Invalid decision" });
    }


  
  } catch(e){
      res.status(500)
  }
  
}