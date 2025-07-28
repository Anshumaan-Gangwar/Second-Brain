import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import contentRoutes from "./routes/contentRoutes";
import searchRoutes from "./routes/searchRoutes";
import shareRoutes from "./routes/shareRoutes";

const app = express();

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5175", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());    

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes); 
app.use("/api/search", searchRoutes);
app.use("/api/share", shareRoutes);
export default app;