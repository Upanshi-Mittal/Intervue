"use client"
import Image from "next/image";
import { Settings, FileText, Play } from "lucide-react";
import { useUser } from '../../hooks/useUser';
import Link from "next/link";
export default function DashboardProfile() {
  const { data: user, isLoading, error } = useUser();

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error loading user: {error.message}</div>;
  }

  if (!user || !user.name) {
    return <div>No user data available</div>;
  }

  console.log('DashboardProfile user data:', user);
   

  return (
    <div className="max-w-4xl min-h-screen mx-auto px-6 pt-50">
      {/* Header */}
      <section className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative h-40 w-40 rounded-full overflow-hidden border">
            <Image
              src="https://imgs.search.brave.com/5LcPZHHABtFumbI-buPjW-U0buNcqE-R2eKKeh6vWgQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjE3/MTM4MjYzMy92ZWN0/b3IvdXNlci1wcm9m/aWxlLWljb24tYW5v/bnltb3VzLXBlcnNv/bi1zeW1ib2wtYmxh/bmstYXZhdGFyLWdy/YXBoaWMtdmVjdG9y/LWlsbHVzdHJhdGlv/bi5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9WndPRjZOZk9S/MHpoWUM0NHhPWDA2/cnlJUEFVaER2QWFq/clBzYVo2djEtdz0"
              alt="User avatar"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              <button  className="cursor-not-allowed! rounded-md h-full border px-3 py-1 text-sm hover:bg-neutral-100/20 transition">
                Edit profile
              </button>
              <button className="cursor-not-allowed! rounded-md border p-2 hover:bg-neutral-100/20 transition">
                <Settings size={16} />
              </button>
            </div>

            {/* Stats (real data) */}
            <div className="flex gap-6 mt-3 text-sm">
              <span>
                <strong>{user.interviews ?? 0}</strong> interviews
              </span>
              <span>
                <strong>{user.reports ?? 0}</strong> reports
              </span>
              <span>
                <strong>
                  {typeof user.averageScore === 'number'
                    ? `${Math.round((user.averageScore || 0) * 10)}%`
                    : '—'}
                </strong>
                {' '}avg score
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
       <Link href="/interview"><button  className="group relative rounded-xl border p-6 text-left hover:bg-neutral-50/10 transition">
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
        </button></Link> 

        {/* View Reports */}
        <Link href="/all_reports"><button className="group relative rounded-xl border p-6 text-left hover:bg-neutral-50/10 transition">
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
        </button></Link>

        <button className="cursor-not-allowed! group relative rounded-xl border p-6 text-left hover:bg-neutral-50/10 transition">
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
