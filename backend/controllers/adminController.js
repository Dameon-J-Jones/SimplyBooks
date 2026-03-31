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
      
      res.status(200).json({message:"Approved!"})
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