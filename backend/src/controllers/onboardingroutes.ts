import { Request, Response } from "express";
import User from "../models/User";

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      role,
      experience,
      tech_stack,
      goal,
      interview_style
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        role,
        experience,
        techStack: tech_stack,
        goal,
        interviewStyle: interview_style,
        onboardingCompleted: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        onboardingCompleted: user.onboardingCompleted,
        user
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Onboarding failed" });
  }
};
