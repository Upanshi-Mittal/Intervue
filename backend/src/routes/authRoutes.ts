import express from "express";
import { login, logout, register } from "../controllers/authController";
import { completeOnboarding } from "../controllers/onboardingroutes";

const authRoutes = express.Router()

authRoutes.post("/login", login)
authRoutes.post("/register", register)
authRoutes.post("/logout", logout);
authRoutes.post("/onboarding",completeOnboarding);

export default authRoutes;


