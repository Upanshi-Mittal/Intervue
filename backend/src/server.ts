import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import connectDB from "./utils/connectDB";

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from the backend server!");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
