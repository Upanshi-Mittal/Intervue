"use client";

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

// ---------- Demo Report Data ----------

const DEMO_REPORT: InterviewReport = {
  id: "sample-001",
  candidateName: "Sarah Chen",
  role: "Senior Frontend Engineer",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  overallScore: 8.2,
  sections: [
    {
      title: "Technical & Cognitive",
      weight: 0.35,
      metrics: [
        {
          label: "Problem understanding time",
          score: { value: 8, confidence: "high" },
          notes: "Asked clarifying questions upfront",
        },
        {
          label: "Solution correctness",
          score: { value: 9, confidence: "high" },
          notes: "Handled all edge cases correctly",
        },
        {
          label: "Edge-case handling",
          score: { value: 8, confidence: "high" },
          notes: "Proactively considered null/undefined",
        },
        {
          label: "Algorithmic complexity awareness",
          score: { value: 8, confidence: "medium" },
          notes: "Discussed O(n) vs O(n²) tradeoffs",
        },
        {
          label: "Code quality / readability",
          score: { value: 9, confidence: "high" },
          notes: "Clean naming conventions, well-structured",
        },
        {
          label: "Debugging effectiveness",
          score: { value: 7, confidence: "medium" },
          notes: "Could have been faster with console debugging",
        },
      ],
    },
    {
      title: "Problem-Solving Process",
      weight: 0.25,
      metrics: [
        {
          label: "Logical step sequencing",
          score: { value: 9, confidence: "high" },
          notes: "Clear, methodical approach",
        },
        {
          label: "Backtracking frequency",
          score: { value: 8, confidence: "medium" },
          notes: "Only revised approach once (good sign)",
        },
        {
          label: "Error recovery speed",
          score: { value: 8, confidence: "medium" },
          notes: "Quickly caught and fixed mistake",
        },
        {
          label: "Decomposition ability",
          score: { value: 9, confidence: "high" },
          notes: "Broke problem into manageable pieces",
        },
      ],
    },
    {
      title: "Communication & Conversation",
      weight: 0.2,
      metrics: [
        {
          label: "Explanation clarity",
          score: { value: 8, confidence: "high" },
          notes: "Clear, articulate explanations",
        },
        {
          label: "Clarification questions count",
          score: { value: 9, confidence: "high" },
          notes: "Asked 5+ clarifying questions",
        },
        {
          label: "Response completeness",
          score: { value: 9, confidence: "high" },
          notes: "Thorough answers, no vagueness",
        },
        {
          label: "Answer latency",
          score: { value: 7, confidence: "medium" },
          notes: "Occasionally needed a moment to think",
        },
      ],
    },
    {
      title: "Stress & Consistency",
      weight: 0.1,
      metrics: [
        {
          label: "Performance drop over time",
          score: { value: 8, confidence: "medium" },
          notes: "Stayed sharp throughout 60min interview",
        },
        {
          label: "Error rate under pressure",
          score: { value: 8, confidence: "medium" },
          notes: "Only 1 typo, immediately caught",
        },
        {
          label: "Response latency variance",
          score: { value: 8, confidence: "medium" },
          notes: "Consistent pacing throughout",
        },
      ],
    },
    {
      title: "Learning & Adaptability",
      weight: 0.1,
      metrics: [
        {
          label: "Improvement after feedback",
          score: { value: 9, confidence: "high" },
          notes: "Immediately incorporated suggestion",
        },
        {
          label: "Mistake repetition rate",
          score: { value: 9, confidence: "high" },
          notes: "Never made the same mistake twice",
        },
        {
          label: "Concept transfer within session",
          score: { value: 8, confidence: "high" },
          notes: "Applied learned patterns to new problems",
        },
      ],
    },
  ],
};

// ---------- Helpers ----------

function confidenceColor(level: Score["confidence"]) {
  if (level === "high") return "text-emerald-400";
  if (level === "medium") return "text-yellow-400";
  return "text-zinc-400";
}

// ==================================================
// UI — Sample Report View
// ==================================================

export default function SampleReportPage() {
  const report = DEMO_REPORT;

  return (
    <div className="min-h-screen  px-6 py-10 pt-40">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <Link
          href="/"
          className="text-zinc-400 hover:text-zinc-200 mb-6 inline-block text-sm"
        >
          ← Back to Home
        </Link>

        {/* Demo Badge */}
        <div className="m-6 inline-block rounded-full bg-blue-500/20 border border-blue-500/30 px-4 py-2">
          <span className="text-blue-300 text-xs font-semibold">SAMPLE REPORT</span>
        </div>

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
          <div className="mt-4 w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 via-emerald-400 to-blue-400 h-2 rounded-full"
              style={{ width: `${(report.overallScore / 10) * 100}%` }}
            />
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
                    className="flex items-start justify-between px-6 py-4"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-zinc-300">
                        {metric.label}
                      </span>
                      {metric.notes && (
                        <p className="text-xs text-zinc-500 mt-1.5 font-light italic">
                          {metric.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 ml-4 flex-shrink-0">
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

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center"
        >
          <h3 className="text-xl font-semibold mb-3">Ready to get your report?</h3>
          <p className="text-zinc-400 mb-6">
            This is a sample. Start an interview session to get your own detailed evaluation.
          </p>
          <Link href="/interview">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-100 transition-colors"
            >
              Start Interview
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
