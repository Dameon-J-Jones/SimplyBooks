import "dotenv/config";
import express from 'express';
import pool from "./db.js";
import "dotenv/config";
import cors from "cors";
import { hashPassword, comparePassword } from "./PasswordHash.js";





const app = express();
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));



//NEED TO STORE IN DB JUST NEED FOR TESTING
const users=[];




//returns users
app.get("/users", async (req, res) => {
  res.json(users)

});


//adds users to array 
app.post("/create-users", async (req, res) => {

  try {

    const {
      userType,
      firstName,
      lastName,
      username,
      password,
      address,
      city,
      state,
      zip,
      dob,
      securityAnswer
    } = req.body;

    const hashedPassword = await hashPassword(password);

    const user = {
      userType,
      firstName,
      lastName,
      username,
      password: hashedPassword,
      address,
      city,
      state,
      zip,
      dob,
      securityAnswer
    };


    console.log("Hashed:", hashedPassword);

    users.push(user);

    res.status(201).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }

});



//test login creditials 
app.post("/users/login", async (req, res) => {
  const { name, password } = req.body;

  const user = users.find((u) => u.name === name);

  if (!user) {
    return res.status(400).send("Cannot find user");
  }

  try {
    const ok = await comparePassword(password, user.password);

    if (ok) {
      return res.send("Success");
    } else {
      return res.status(401).send("Not Allowed");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send();
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