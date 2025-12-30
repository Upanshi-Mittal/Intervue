import { Request, Response } from "express";
import mongoose from "mongoose";
import Report from "../models/Report";
import User from "../models/User";

/* -------------------- GET ALL REPORTS -------------------- */
export const getAllReports = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const reports = await Report.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('_id candidateName role overallScore createdAt');

    return res.status(200).json(
      reports.map((report) => ({
        id: report._id,
        title: `${report.candidateName} - ${report.role}`,
        candidateName: report.candidateName,
        role: report.role,
        overallScore: report.overallScore,
        createdAt: report.createdAt,
      }))
    );
  } catch (error) {
    console.error("Get all reports error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

/* -------------------- GET SPECIFIC REPORT -------------------- */
export const getReportById = async (req: Request, res: Response) => {
  try {
    console.log('[reportController] getReportById called, params:', req.params);
    console.log('[reportController] getReportById user:', req.user);
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { reportId } = req.params;

    // Validate ObjectId to avoid Mongoose CastError for non-object ids (e.g. demo-1)
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      console.log('[reportController] Invalid reportId format:', reportId);
      return res.status(400).json({ message: 'Invalid report id' });
    }

    const report = await Report.findOne({
      _id: reportId,
      userId: req.user.userId,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({
      id: report._id,
      candidateName: report.candidateName,
      role: report.role,
      overallScore: report.overallScore,
      sections: report.sections,
      createdAt: report.createdAt,
    });
  } catch (error) {
    console.error("Get report by ID error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

/* -------------------- CREATE REPORT -------------------- */
export const createReport = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { candidateName, role, overallScore, sections } = req.body;

    if (!candidateName || !role || overallScore === undefined || !sections) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const report = await Report.create({
      userId: req.user.userId,
      candidateName,
      role,
      overallScore,
      sections,
    });

    // Update user analytics: increment reports & interviews, update averageScore
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).select('interviews averageScore reports');

      if (user) {
        const prevInterviews = (user.interviews || 0);
        const prevAvg = (user.averageScore || 0);
        const newInterviews = prevInterviews + 1;
        const newAvg = ((prevAvg * prevInterviews) + Number(overallScore)) / newInterviews;

        await User.findByIdAndUpdate(userId, {
          $inc: { reports: 1, interviews: 1 },
          $set: { averageScore: newAvg },
        });
        console.log('[reportController] Updated user analytics for', userId, { newInterviews, newAvg });
      } else {
        console.log('[reportController] User not found when updating analytics:', req.user.userId);
      }
    } catch (uErr) {
      console.error('Error updating user analytics:', uErr);
    }

    return res.status(201).json({
      message: "Report created successfully",
      report: {
        id: report._id,
        candidateName: report.candidateName,
        role: report.role,
        overallScore: report.overallScore,
        sections: report.sections,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

/* -------------------- DELETE REPORT -------------------- */
export const deleteReport = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      console.log('[reportController] Invalid reportId format for delete:', reportId);
      return res.status(400).json({ message: 'Invalid report id' });
    }

    const report = await Report.findOneAndDelete({
      _id: reportId,
      userId: req.user.userId,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Delete report error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
