import express from "express";
import { auth } from "../middleware/auth";
const router = express.Router();
import { search } from "../controllers/searchController";

router.put("/", auth, search);

export default router;