"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Users, Search, Plus, UserPlus, X, CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Employee Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "DENIED" | "REVOKED") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await loadEmployees();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or revoke access for employee "${name}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (res.ok) {
        alert(result.message || "Employee deleted/revoked.");
        await loadEmployees();
      } else {
        alert(result.error || "Failed to delete employee.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        const addedEmail = formData.email;
        const addedName = formData.name;
        setFormData({ name: "", email: "" });
        await loadEmployees();
        setNotification({
          type: "success",
          message: `Employee "${addedName}" added & approved! A notification email has been sent to ${addedEmail}.`,
        });
      } else {
        const err = await res.json();
        setNotification({
          type: "error",
          message: err.error || "Failed to add employee",
        });
      }
    } catch (err) {
      console.error("Failed to add employee:", err);
      setNotification({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Add new site inspectors, manage active permissions, or delete/revoke employee access.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>[ + Add Employee ]</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-rose-50 text-rose-900 border-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-5 h-5 ${notification.type === "success" ? "text-emerald-600" : "text-rose-600"}`} />
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Directory Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border">
            No employees found. Click "[ + Add Employee ]" to create an employee account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {emp.image ? (
                      <img src={emp.image} alt={emp.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-lg">
                        {emp.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{emp.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{emp.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-700 font-bold uppercase px-2 py-0.5 rounded border border-slate-300">
                        {emp.role}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                      emp.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : emp.status === "REVOKED"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 text-slate-600 border border-slate-200">
                  <div className="flex justify-between">
                    <span>Assigned Inspections:</span>
                    <strong className="text-slate-900">{emp._count?.assignedInspections || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Login:</span>
                    <span className="text-slate-500">{emp.lastLoginAt ? new Date(emp.lastLoginAt).toLocaleDateString() : "Never"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {emp.status === "APPROVED" ? (
                    <button
                      disabled={actionLoading === emp.id}
                      onClick={() => handleUpdateStatus(emp.id, "REVOKED")}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
                    >
                      Revoke Access
                    </button>
                  ) : (
                    <button
                      disabled={actionLoading === emp.id}
                      onClick={() => handleUpdateStatus(emp.id, "APPROVED")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors shadow-sm"
                    >
                      Re-Activate
                    </button>
                  )}

                  <button
                    disabled={actionLoading === emp.id}
                    onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                    title="Delete Employee Account"
                    className="bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 border border-slate-300 p-2 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Modal: Add / Invite Employee */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-slate-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span>Add New Site Inspector</span>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Google Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.patil@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    When this employee signs in with Google using this email, they will automatically receive immediate access to the Employee Dashboard.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.name || !formData.email}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl shadow"
                  >
                    {submitting ? "Adding..." : "Add & Approve Employee"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
