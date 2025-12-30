import express from "express";
import { requireAuth } from "../middleware/auth";
import {
  getAllReports,
  getReportById,
  createReport,
  deleteReport,
} from "../controllers/reportController";

const reportRoutes = express.Router();

// All routes require authentication
reportRoutes.use(requireAuth);

// Get all reports for the current user
reportRoutes.get("/", getAllReports);

// Get specific report by ID
reportRoutes.get("/:reportId", getReportById);

// Create a new report
reportRoutes.post("/", createReport);

// Delete a report
reportRoutes.delete("/:reportId", deleteReport);

export default reportRoutes;
