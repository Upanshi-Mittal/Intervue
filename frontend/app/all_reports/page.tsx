"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  id: string;
  title: string;
  createdAt: string;
};

/* =========================
   DEMO REPORTS (DEFAULT)
========================= */
const DEMO_REPORTS: Report[] = [
  {
    id: "demo-1",
    title: "Sample Interview Report",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Example Candidate Evaluation",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function AllReportsPage() {
  // 🔥 DEFAULT STATE IS DEMO REPORTS
  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        console.log("Fetching reports...");
        const res = await fetch("/api/user/reports", {
          credentials: "include",
        });

        if (!res.ok) return; // silently fall back to demo

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setReports(data);
          setIsDemo(false);
        }
      } catch {
        // ignore → demo stays
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  return (
    <div className="p-6 max-w-3xl min-h-screen mx-auto  text-zinc-100 pt-40">
      <h1 className="text-2xl font-semibold mb-4"> Your Reports</h1>

      {isDemo && !loading && (
        <div className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
          Showing demo reports. Your real reports will appear here once created.
        </div>
      )}

      <ul className="space-y-3">
        {reports.map((report) => (
          <li
            key={report.id}
            className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 hover:bg-zinc-950/50 transition-all cursor-pointer"
          >
            <Link href={`/all_reports/${report.id}`}>
              <div className="font-medium">{report.title}</div>
              <div className="text-sm text-zinc-400">
                {new Date(report.createdAt).toLocaleString()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
