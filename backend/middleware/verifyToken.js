import express from "express"
import jwt from 'jsonwebtoken'
import pool from "../db.js"

export default async function verifyToken(req, res, next){
    const authHeader = req.headers.authorization;

     //see if header exisits
    if(!authHeader){
        return res.status(401).json({error:"No token provided"});
    }

    //format to split bearer and token into an array of 2 
    const tokenParts = authHeader.split(' ');

    //check if tokensParts is size of 2 and included bearer
    if(tokenParts.length !== 2 || tokenParts[0] !== 'Bearer')
    {
       return res.status(401).json({error:"Invalid or Expired Token"})
    }


    //set token to first part
    const token = tokenParts[1];

    try {
        //uses method to see if token is correct
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       


         // get user id from token (adjust if needed)
    const userId = decoded.user || decoded.id;

    // query DB for status
    const result = await pool.query(
        `SELECT status AS status FROM "User" WHERE id = $1`,
        [userId]
    );

    const user = result.rows[0];

    // if user not found
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // check status
    if (user.status === 0) {
        return res.status(403).json({
            message: "Account is inactive. Wait for approval"
        });
    }
    


        //attatch user info to request
        req.user = decoded;
        
        next();

        
    } catch (error) {
        console.error("verifyToken error:", error);
         return res.status(401).json({ error: "Invalid or expired token" });
    }


}