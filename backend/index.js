import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import createRoutes from "./routes/createRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:5173",
 // methods: ["GET","POST","PUT","DELETE","OPTIONS"],
 // allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};
app.use(cors(corsOptions));

// Routes
app.use("/users", createRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes)











app.get("/test", (req, res) => {
  res.send("server works");
});

// Connect to DB and start server
pool.connect()
  .then(client => { console.log("Connected to Neon database"); client.release(); })
  .catch(err => console.error("Neon connection failed", err));

app.listen(3001, () => console.log("Server running on port 3001"));