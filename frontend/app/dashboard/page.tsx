import Image from "next/image";
import { Settings, FileText, Play } from "lucide-react";

export default function DashboardProfile() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-50">
      {/* Header */}
      <section className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative h-40 w-40 rounded-full overflow-hidden border">
            <Image
              src="https://avatars.githubusercontent.com/u/1?v=4"
              alt="User avatar"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">Orange</h1>
              <button className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-100 transition">
                Edit profile
              </button>
              <button className="rounded-md border p-2 hover:bg-neutral-100 transition">
                <Settings size={16} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-3 text-sm">
              <span>
                <strong>12</strong> interviews
              </span>
              <span>
                <strong>7</strong> reports
              </span>
              <span>
                <strong>85%</strong> avg score
              </span>
            </div>

            {/* Bio */}
            <p className="mt-3 text-sm text-neutral-600 max-w-md">
              Practice interviews. Get real feedback.  
              No fluff — just signal.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="my-10 border-neutral-200" />

      {/* CTA Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Start Interview */}
        <button className="group relative rounded-xl border p-6 text-left hover:bg-neutral-50 transition">
          <div className="flex items-center gap-3">
            <Play className="" size={20} />
            <h3 className="text-lg font-semibold">
              Start your interview
            </h3>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            Begin a new mock interview session.
          </p>
          <span className="absolute right-6 bottom-6 text-sm opacity-0 group-hover:opacity-100 transition">
            →
          </span>
        </button>

        {/* View Reports */}
        <button className="group relative rounded-xl border p-6 text-left hover:bg-neutral-50 transition">
          <div className="flex items-center gap-3">
            <FileText size={20} />
            <h3 className="text-lg font-semibold">
              View your reports
            </h3>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            Review feedback, scores, and insights.
          </p>
          <span className="absolute right-6 bottom-6 text-sm opacity-0 group-hover:opacity-100 transition">
            →
          </span>
        </button>

        {/* Settings */}
        <button className="group relative rounded-xl border p-6 text-left hover:bg-neutral-50 transition">
          <div className="flex items-center gap-3">
            <Settings size={20} />
            <h3 className="text-lg font-semibold">
              Settings
            </h3>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            Manage preferences and profile.
          </p>
          <span className="absolute right-6 bottom-6 text-sm opacity-0 group-hover:opacity-100 transition">
            →
          </span>
        </button>
      </section>
    </div>
  );
}
