import express from "express"
import jwt from 'jsonwebtoken'

export default function verifyToken(req, res, next){
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
        res.status(401).json({error:"Invalid or Expired Token"})
    }


    //set token to first part
    const token = tokenParts[1];

    try {
        //uses method to see if token is correct
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        //attatch user info to request
        req.user = decoded;
        
        next();

        
    } catch (error) {
         return res.status(401).json({ error: "Invalid or expired token" });
    }


}