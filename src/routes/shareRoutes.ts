import express from "express";
const router = express.Router();
import {auth} from "../middleware/auth";
import { getBrain, shareBrain } from "../controllers/shareController";

router.post("/", auth, shareBrain);
router.get("/:shareLink", auth, getBrain);

export default router;