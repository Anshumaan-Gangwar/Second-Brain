import express from "express";
import authRoutes from "./routes/authRoutes";
import contentRoutes from "./routes/contentRoutes";
import searchRoutes from "./routes/searchRoutes";
import shareRoutes from "./routes/shareRoutes";

const app = express();
app.use(express.json()); 

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes); 
app.use("/api/search", searchRoutes);
app.use("/api/share", shareRoutes);
export default app;