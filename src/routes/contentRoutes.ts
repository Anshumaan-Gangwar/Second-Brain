import express from "express";
const router = express.Router();
import {auth} from "../middleware/auth";
import { addContent, deleteContent, getContent } from "../controllers/contentController";

router.post("/", auth, addContent);
router.get("/", auth, getContent);
router.delete("/:contentId", auth, deleteContent);

export default router;