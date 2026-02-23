import "dotenv/config";
import express from "express";
import pool from "./db.js";

const app = express();

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