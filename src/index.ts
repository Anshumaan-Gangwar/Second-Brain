import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import { connectDB } from "./config/db";
const app = express();
const PORT = process.env.PORT || 3000;
const startServer = async() => {
    try{
        await connectDB();
        app.listen(PORT, ()=>{
            console.log("Sever is running on port", PORT);
        })
    }catch(err){
        console.error("Error starting server:", err);
        process.exit(1); // Exit the process with failure
    }
    console.log(process.env.PORT);

}

app.get("/", (req, res) => {
    res.send("hi there");
})

startServer();