import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import connectDB from "./utils/connectDB";
import { requireAuth } from "./middleware/auth";
import { getAllReports, getReportById } from "./controllers/reportController";

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(
  cors({
    origin:  "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

app.get("/", (req, res) => {
  res.send("Hello from the backend server!");
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

// User reports endpoints
app.get("/api/user/reports", requireAuth, getAllReports);
app.get("/api/user/report/:id", requireAuth, (req, res) => {
  // Map :id to :reportId for the controller
  req.params.reportId = req.params.id;
  return getReportById(req, res);
});

app.get("/api/user/me", requireAuth, async (req, res) => {
  try {
    console.log('[/api/user/me] Cookies received:', req.cookies);
    console.log('[/api/user/me] User from token:', req.user);
    
    if (!req.user) {
      console.log("User not authenticated");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const User = require("./models/User").default;
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data in the expected format
    return res.json({
      id: user._id.toString(),
      name: user.username || user.name,
      email: user.email,
      github: user.github || null,
      onboardingCompleted: user.onboardingCompleted || false,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


