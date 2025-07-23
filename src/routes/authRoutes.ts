import { signin, signup } from "../controllers/authController";
import express from "express";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
export default router;