import express from "express";
import { login, register } from "../controllers/authController";
import { completeOnboarding } from "../controllers/onboardingroutes";

const authRoutes = express.Router()

authRoutes.post("/login", login)
authRoutes.post("/register", register)
authRoutes.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.status(200).json({ message: "Logged out successfully" });
});
authRoutes.post("/onboarding",completeOnboarding);

export default authRoutes;


