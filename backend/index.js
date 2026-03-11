import "dotenv/config";
import express from 'express';
import pool from "./db.js";
import "dotenv/config";
import cors from "cors";
import { hashPassword, comparePassword } from "./PasswordHash.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

//YOU HAVE NO IDEA HOW LONG THIS TOOK
//THIS SHOULD FIX THESE DAMN SERVER ERROR PROBLEMS
//FOR THE LOVE OF ALL THAT IS HOLY ON THIS BITCH ASS EARTH
const corsOptions = {
  origin: "http://localhost:5173",  // frontend URL
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

//ACTUALLY returns users now
app.get("/users", async (req, res) => {
  try{
    const result = await pool.query(`
      SELECT
        "UName",
        "Email",
        "Phone_Number",
        "address_line1",
        "address_line2",
        "GroupID",
        "status",
        "created_on"
      FROM "User"
      ORDER BY "UName";
      `);

      res.json(result.rows);

  }catch (err){
    console.error("USER LIST ERROR:", err)
    res.status(500).json({ message: "Server error" });
  }
});


//NO MORE ADDING USERS TO ARRAY, THIS SHOULD WRITE TO DB
app.post("/create-users", async (req, res) => {
  try {
    console.log("Received body:", req.body);

    // Map userType to GroupID
    const groupMap = {
      Accountant: 0, //keep these numbers consistent between log-in and saving to database!
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

    // Build full address string
    const address_line1 = address;
    const address_line2 = `${city}, ${state}, ${zip}`;

    // Insert into Postgres
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
        "created_on"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
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
      0 // default status
    ];

    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    console.log("User inserted into DB:", newUser);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("CREATE USER DB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});



//test login creditials 
app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;

  try{
    const result = await pool.query(
      'SELECT * FROM "User" WHERE "UName" = $1',
      [username]
    );

    const user = result.rows[0];

    if (!user){
      return res.status(400).json({ message: "Cannot find user" });
    }

    const ok = await comparePassword(password, user.Password);

    if (!ok){
      return res.status(401).json({ message: "Not Allowed" });
    }

    return res.json({
      message: "Success",
      user: {
        username: user.UName,
        role: user.GroupID
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err)
    return res.status(500).json({ message: "Server error" });
  }
});



pool.connect()
  .then(client => {
    console.log("Connected to Neon database");
    client.release();
  })
  .catch(err => {
    console.error("Neon connection failed", err);
  });

app.listen(3001, () => {
  console.log("Server running on port 3001");
});