import { Request, Response } from "express";
import { signupSchema } from "../schema/signupSchema"
import bcrypt from "bcrypt";
import userModel from "../models/userModel";
import { signinSchema } from "../schema/signinSchems";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
    const validInput = signupSchema.safeParse(req.body);
    if(!validInput.success){
        const errorMessages = validInput.error.issues.map((issue) => issue.message);
        res.status(400).json({
            message: "signup failed",
            errors: errorMessages,
        })
        return;
    }
    //success
    const {username, password} = validInput.data;
    const hashpassword = await bcrypt.hash(password, 10);

    try{
        const user = await userModel.findOne({username});
        if(user){
            res.status(400).json({message: "User already exists"});
        }else{
            await userModel.create({username, password: hashpassword});
            res.status(201).json({message: "User created successfully"});
        }
    }catch(err){
        console.error("Error during signup:", err);
        res.status(500).json({message: "Internal server error"});
    }
}


export const signin = async (req: Request, res: Response): Promise<void> => {
  const validInput = signinSchema.safeParse(req.body);

  if (!validInput.success) {
    const errorMessages = validInput.error.issues.map(e => e.message);
    res.status(400).json({ message: "Invalid input", errors: errorMessages });
    return;
  }

  const { username, password } = validInput.data;

  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "7d" });

    res.status(200).json({
      message: "User logged in successfully",
      token,
      username: user.username,
    });

  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
