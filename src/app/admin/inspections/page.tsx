"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { ClipboardList, Plus, FileText, Search, UserCheck, X, Edit3 } from "lucide-react";

function AdminInspectionsContent() {
  const searchParams = useSearchParams();
  const [inspections, setInspections] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Inspection Form State
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    siteCoordinator: "",
    engineerName: "",
    buildingName: "",
    totalFloors: "",
    flatFloor: "",
    assignedToId: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [inspRes, empRes] = await Promise.all([
        fetch("/api/inspections"),
        fetch("/api/employees?includeAdmins=true"),
      ]);
      const inspData = await inspRes.json();
      const empData = await empRes.json();
      setInspections(inspData.inspections || []);
      const approvedEmps = (empData.employees || []).filter((e: any) => e.status === "APPROVED");
      setEmployees(approvedEmps);
      if (approvedEmps.length > 0) {
        setFormData((prev) => ({ ...prev, assignedToId: approvedEmps[0].id }));
      }
    } catch (err) {
      console.error("Failed to load inspections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (searchParams.get("new") === "true") {
      setShowModal(true);
    }
  }, [searchParams]);

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          address: "",
          siteCoordinator: "",
          engineerName: "",
          buildingName: "",
          totalFloors: "",
          flatFloor: "",
          assignedToId: employees[0]?.id || "",
        });
        await loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create inspection");
      }
    } catch (err) {
      console.error("Error creating inspection:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-900">Site Inspections Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create new property site assignments, track inspector progress, and view generated reports.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow border border-blue-700 transition-colors text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Inspection</span>
        </button>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading site inspections...</div>
        ) : inspections.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No inspections created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-4">Inspection ID</th>
                  <th className="p-4">Title / Site</th>
                  <th className="p-4">Building Name</th>
                  <th className="p-4">Assigned Inspector</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-slate-500 font-bold">{insp.id.substring(0, 8)}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{insp.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{insp.address || "No address entered"}</div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{insp.buildingName || "N/A"}</td>
                    <td className="p-4 text-slate-700 font-semibold">{insp.assignedTo?.name || "Unassigned"}</td>
                    <td className="p-4 text-slate-500">{new Date(insp.assignedDate).toLocaleDateString()}</td>
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/employee/inspection/${insp.id}`}
                          title="Fill / Edit Questionnaire"
                          className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Fill / Edit</span>
                        </Link>
                        {insp.status === "SUBMITTED" || insp.status === "REVIEWED" ? (
                          <Link
                            href={`/employee/inspection/${insp.id}/report`}
                            title="View Final Report"
                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            <span>View Report</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/employee/inspection/${insp.id}/report`}
                            title="Preview Draft Report"
                            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-1.5 rounded-xl transition-all text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>Preview Draft</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create New Inspection */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 my-8 border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Create & Assign New Inspection</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Title / Case Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Residency Flat 402 Inspection"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign to Approved Inspector *</label>
                <select
                  required
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs font-medium"
                >
                  {employees.length === 0 ? (
                    <option value="">No approved employees available</option>
                  ) : (
                    employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.email}) {emp.role === "ADMIN" ? "[ ADMIN (Self) ]" : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Site Address / Location Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Enter street, area, city, pin code or property notes..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The assigned Site Inspector will record all detailed site parameters (Building Name, Floor counts, Measurements, GPS, Sketches & Photos) directly on site.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.assignedToId}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  {submitting ? "Creating..." : "Assign Inspection"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </main>
  );
}

export default function AdminInspectionsPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading inspections...</div>}>
        <AdminInspectionsContent />
      </Suspense>
    </div>
  );
}
