"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, Play, Building2, MapPin, Calendar, FileText } from "lucide-react";

export default function EmployeeDashboardPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignedInspections() {
      try {
        setLoading(true);
        const res = await fetch("/api/inspections");
        const data = await res.json();
        setInspections(data.inspections || []);
      } catch (err) {
        console.error("Failed to load employee inspections:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignedInspections();
  }, []);

  const pendingCount = inspections.filter((i) => i.status === "ASSIGNED").length;
  const inProgressCount = inspections.filter((i) => i.status === "IN_PROGRESS").length;
  const completedCount = inspections.filter((i) => i.status === "SUBMITTED" || i.status === "REVIEWED").length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Site Inspector Workspace</h1>
            <p className="text-xs text-slate-500 mt-1">
              Select an assigned site inspection to conduct measurements, capture GPS locations, and upload photos.
            </p>
          </div>
        </div>

        {/* Inspector Stat Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard title="Total Assigned" value={inspections.length} icon={<ClipboardList className="w-5 h-5" />} color="blue" />
          <StatCard title="Pending" value={pendingCount} icon={<Clock className="w-5 h-5" />} color="amber" />
          <StatCard title="In-Progress" value={inProgressCount} icon={<Play className="w-5 h-5" />} color="purple" />
          <StatCard title="Completed" value={completedCount} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        </div>

        {/* Assigned Inspections Grid (Mobile-First Cards) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Assigned Inspections</span>
          </h2>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border">Loading your assigned inspections...</div>
          ) : inspections.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
              No site inspections currently assigned to you.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inspections.map((insp) => (
                <div key={insp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">ID: {insp.id.substring(0, 8)}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          insp.status === "SUBMITTED" || insp.status === "REVIEWED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : insp.status === "IN_PROGRESS"
                            ? "bg-purple-100 text-purple-800 border border-purple-300"
                            : "bg-blue-100 text-blue-800 border border-blue-300"
                        }`}
                      >
                        {insp.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">{insp.title}</h3>

                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{insp.address || "Address pending"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned: {new Date(insp.assignedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Primary Mobile-First Action Button */}
                  <div className="pt-2">
                    {insp.status === "SUBMITTED" || insp.status === "REVIEWED" ? (
                      <Link
                        href={`/employee/inspection/${insp.id}/report`}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>View Inspection Report</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/employee/inspection/${insp.id}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-lg shadow-blue-500/20 active:translate-y-0.5"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{insp.status === "IN_PROGRESS" ? "Continue Inspection" : "Start Inspection"}</span>
                      </Link>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
