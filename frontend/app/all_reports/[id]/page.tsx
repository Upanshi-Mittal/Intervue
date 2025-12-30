"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";

// ==================================================
// Report Structure (Interview-based Evaluation)
// ==================================================

// ---------- Core Types ----------

type Score = {
  value: number; // 0–10
  confidence: "low" | "medium" | "high";
};

type Metric = {
  label: string;
  score: Score;
  notes?: string;
};

type Section = {
  title: string;
  weight: number; // relative importance
  metrics: Metric[];
};

type InterviewReport = {
  id: string;
  candidateName: string;
  role: string;
  createdAt: string;
  overallScore: number; // weighted aggregate
  sections: Section[];
};

// ---------- Helpers ----------

function confidenceColor(level: Score["confidence"]) {
  if (level === "high") return "text-emerald-400";
  if (level === "medium") return "text-yellow-400";
  return "text-zinc-400";
}

// ==================================================
// UI — Interview Report View (Vercel-style)
// ==================================================

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!reportId) return;

      try {
        const res = await fetch(`/me/report/${reportId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          setError("Failed to load report");
          return;
        }

        const data = await res.json();
        setReport(data);
      } catch (err) {
        setError("Error loading report");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  if (loading)
    return (
      <div className="min-h-screen pt-40 text-zinc-100 px-6 py-10 flex items-center justify-center">
        <p className="text-zinc-400">Loading report...</p>
      </div>
    );

  if (error || !report)
    return (
      <div className="min-h-screen pt-40 text-zinc-100 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/all_reports"
            className="text-zinc-400 hover:text-zinc-200 mb-6 inline-block"
          >
            ← Back to Reports
          </Link>
          <p className="text-red-400">{error || "Report not found"}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-zinc-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <Link
          href="/all_reports"
          className="text-zinc-400 hover:text-zinc-200 mb-6 inline-block text-sm"
        >
          ← Back to Reports
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-semibold tracking-tight">
            Interview Evaluation Report
          </h1>
          <p className="text-zinc-400 mt-2">
            {report.candidateName} · {report.role}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {new Date(report.createdAt).toLocaleString()}
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12 rounded-xl border border-zinc-800 bg-zinc-950 p-6"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Overall Score</span>
            <span className="text-4xl font-semibold">
              {report.overallScore.toFixed(1)} / 10
            </span>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {report.sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <div className="border-b border-zinc-800 px-6 py-4">
                <h2 className="font-medium tracking-tight">
                  {section.title}
                </h2>
                <p className="text-xs text-zinc-500">
                  Weight {Math.round(section.weight * 100)}%
                </p>
              </div>

              <div className="divide-y divide-zinc-800">
                {section.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-zinc-300">
                        {metric.label}
                      </span>
                      {metric.notes && (
                        <p className="text-xs text-zinc-500 mt-1">
                          {metric.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-sm font-medium">
                        {metric.score.value}/10
                      </span>
                      <span
                        className={`text-xs ${confidenceColor(
                          metric.score.confidence
                        )}`}
                      >
                        {metric.score.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
