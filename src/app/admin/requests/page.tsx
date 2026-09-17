"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { UserCheck, CheckCircle2, XCircle, Search, Filter } from "lucide-react";

export default function AdminAccessRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/access-requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to load access requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleAction = async (id: string, action: "grant" | "deny") => {
    setActionLoading(id);
    const targetReq = requests.find((r) => r.id === id);
    try {
      const res = await fetch(`/api/access-requests/${id}/${action}`, {
        method: "POST",
      });
      if (res.ok) {
        await loadRequests();
        const actionText = action === "grant" ? "Approved & Access Granted" : "Access Denied";
        setNotification({
          type: "success",
          message: `${actionText} for ${targetReq?.name || "user"} (${targetReq?.email})! An automated notification email has been sent to ${targetReq?.email}.`,
        });
      } else {
        const err = await res.json();
        setNotification({
          type: "error",
          message: err.error || "Failed to update request status.",
        });
      }
    } catch (err) {
      console.error("Action error:", err);
      setNotification({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filter === "ALL" || r.status === filter;
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Title */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl font-bold text-slate-900">Employee Access Requests</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Approve or deny employee login access. Automated email notifications will be sent to the user's Google email upon action.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="APPROVED">Approved Only</option>
              <option value="DENIED">Denied Only</option>
              <option value="REVOKED">Revoked Only</option>
            </select>
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

        {/* Access Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">No matching access requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-4">User</th>
                    <th className="p-4">Google Email</th>
                    <th className="p-4">Request Date</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        {req.image ? (
                          <img src={req.image} alt={req.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                            {req.name.charAt(0)}
                          </div>
                        )}
                        <span>{req.name}</span>
                      </td>

                      <td className="p-4 font-mono text-slate-600">{req.email}</td>
                      <td className="p-4 text-slate-500">{new Date(req.requestDate).toLocaleString()}</td>
                      <td className="p-4 text-slate-500">
                        {req.user?.lastLoginAt ? new Date(req.user.lastLoginAt).toLocaleString() : "Never"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                            req.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : req.status === "DENIED" || req.status === "REVOKED"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {req.status === "PENDING" && (
                          <>
                            <button
                              disabled={actionLoading === req.id}
                              onClick={() => handleAction(req.id, "grant")}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              GRANT ACCESS
                            </button>
                            <button
                              disabled={actionLoading === req.id}
                              onClick={() => handleAction(req.id, "deny")}
                              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              DENY ACCESS
                            </button>
                          </>
                        )}
                        {req.status === "APPROVED" && (
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleAction(req.id, "deny")}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors border border-rose-300"
                          >
                            Revoke Access
                          </button>
                        )}
                        {req.status === "DENIED" && (
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleAction(req.id, "grant")}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors border border-emerald-300"
                          >
                            Grant Access
                          </button>
                        )}
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
