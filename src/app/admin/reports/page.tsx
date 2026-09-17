"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { FileText, Search } from "lucide-react";

export default function AdminReportsPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const res = await fetch("/api/inspections");
        const data = await res.json();
        setInspections(data.inspections || []);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filteredInspections = inspections.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.address && i.address.toLowerCase().includes(search.toLowerCase())) ||
      (i.assignedTo?.name && i.assignedTo.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-600" />
              <h1 className="text-2xl font-bold text-slate-900">Inspection Reports Repository</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              View, print, and download completed property inspection reports with physical measurements, sketches, and photos.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, address, inspector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading reports...</div>
          ) : filteredInspections.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-4">Report / Site</th>
                    <th className="p-4">Assigned Inspector</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Photos Uploaded</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{insp.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{insp.address || "No address entered"}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{insp.assignedTo?.name || "Unassigned"}</td>
                      <td className="p-4">
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
                      </td>
                      <td className="p-4 text-slate-600">{insp._count?.sitePhotos || 0} Photos attached</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/employee/inspection/${insp.id}/report`}
                            title="View Inspection Report"
                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            <span>View Report</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
