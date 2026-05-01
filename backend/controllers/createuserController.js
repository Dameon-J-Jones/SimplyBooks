import pool from "../db.js";
import { hashPassword } from "../PasswordHash.js";
import { sendEmail } from "../sendEmails.js";
// GET all users
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        "UName",
        "Email",
        "Phone_Number",
        "address_line1",
        "address_line2",
        "GroupID",
        "status",
        "created_on",
        "profile_pic"
      FROM "User"
      ORDER BY "UName";
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("USER LIST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE a new user
export const createUser = async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const groupMap = {
      Accountant: 0,
      Manager: 1,
      Administrator: 2
    };

    const {
      firstName,
      lastName,
      username,
      email,
      password,
      address,
      city,
      state,
      zip,
      phone,
      dob,
      securityAnswer,
      userType
    } = req.body;

    if (!password) throw new Error("No password provided");

    const hashedPassword = await hashPassword(password);

    const address_line1 = address;
    const address_line2 = `${city}, ${state}, ${zip}`;

    const query = `
      INSERT INTO "User" (
        "Email",
        "UName",
        "Phone_Number",
        "Password",
        "address_line1",
        "address_line2",
        "date_of_birth",
        "GroupID",
        "status",
        "security_question",
        "created_on"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const values = [
      email,
      username,
      phone,
      hashedPassword,
      address_line1,
      address_line2,
      dob,
      groupMap[userType],
      0,
      securityAnswer
    ];

    const result = await pool.query(query, values);

    await sendEmail({
      to: "boomtownboss11@gmail.com", //need to do an admin or all of them
      subject: "New account has been created",
      text: `Hello, user ${username} was just created, please approve or deny on the app!`,
      html: `
        <h2>Account Created</h2>
        <p>${username} was created.</p>
        <a href="/UserList">CLICK HERE TO APPORVE OR DENY USER</a>
      `,
    });


    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE USER DB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};