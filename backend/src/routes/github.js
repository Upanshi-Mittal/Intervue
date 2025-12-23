import express from "express";
import User from "../models/User.js";
import axios from "axios";

const router = express.Router();

router.get("/analyze-github/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || !user.githubUsername) {
      return res.status(404).json({ error: "GitHub username not found" });
    }

    const username = user.githubUsername;
    const pythonResponse = await axios.post(
      "http://127.0.0.1:8000/parse-github",{ username } 
    );

    return res.json(pythonResponse.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
