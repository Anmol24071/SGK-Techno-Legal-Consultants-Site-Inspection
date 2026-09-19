"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import Link from "next/link";
import { Users, UserCheck, ClipboardList, Clock, CheckCircle2, AlertCircle, Plus, FileText, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  const { session, status: sessionStatus } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    pendingInspections: 0,
    inProgressInspections: 0,
    completedInspections: 0,
  });

  const [requests, setRequests] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus === "unauthenticated") {
      router.push("/");
      return;
    }

    if (sessionStatus === "authenticated" && session?.user) {
      const user = session.user as any;
      if (user.role !== "ADMIN") {
        if (user.status === "APPROVED") {
          router.push("/employee/dashboard");
        } else if (user.status === "PENDING") {
          router.push("/pending");
        } else {
          router.push("/denied");
        }
      }
    }
  }, [session, sessionStatus, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [reqRes, empRes, inspRes] = await Promise.all([
        fetch("/api/access-requests"),
        fetch("/api/employees"),
        fetch("/api/inspections"),
      ]);

      const reqData = await reqRes.json();
      const empData = await empRes.json();
      const inspData = await inspRes.json();

      const reqList = reqData.requests || [];
      const empList = empData.employees || [];
      const inspList = inspData.inspections || [];

      setRequests(reqList);
      setInspections(inspList);

      const pendingReqs = reqList.filter((r: any) => r.status === "PENDING").length;
      const pendingInsp = inspList.filter((i: any) => i.status === "ASSIGNED").length;
      const inProgressInsp = inspList.filter((i: any) => i.status === "IN_PROGRESS").length;
      const completedInsp = inspList.filter((i: any) => i.status === "SUBMITTED" || i.status === "REVIEWED").length;

      setStats({
        totalEmployees: empList.length,
        pendingRequests: pendingReqs,
        pendingInspections: pendingInsp,
        inProgressInspections: inProgressInsp,
        completedInspections: completedInsp,
      });
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadDashboardData();
    }
  }, [sessionStatus]);

  const handleAccessAction = async (requestId: string, action: "grant" | "deny") => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/access-requests/${requestId}/${action}`, {
        method: "POST",
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center text-sm font-semibold text-slate-400">Verifying session security...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administrator Overview</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage employees, process pending access requests, and monitor property inspections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/inspections?new=true"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow border border-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Inspection</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<Users className="w-5 h-5" />}
            color="emerald"
            description="Approved Inspectors"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={<UserCheck className="w-5 h-5" />}
            color="amber"
            description="Awaiting Approval"
          />
          <StatCard
            title="Assigned / Pending"
            value={stats.pendingInspections}
            icon={<Clock className="w-5 h-5" />}
            color="blue"
            description="Inspections Assigned"
          />
          <StatCard
            title="In-Progress"
            value={stats.inProgressInspections}
            icon={<ClipboardList className="w-5 h-5" />}
            color="purple"
            description="Drafts Saved"
          />
          <StatCard
            title="Completed"
            value={stats.completedInspections}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="cyan"
            description="Reports Submitted"
          />
        </div>

        {/* Pending Access Requests Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Pending Access Requests</h2>
              {stats.pendingRequests > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  {stats.pendingRequests} Action Required
                </span>
              )}
            </div>

            <Link href="/admin/requests" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading requests...</div>
          ) : requests.filter((r) => r.status === "PENDING").length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No pending access requests at this time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">Google Email</th>
                    <th className="p-3">Requested At</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests
                    .filter((r) => r.status === "PENDING")
                    .slice(0, 5)
                    .map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{req.name}</td>
                        <td className="p-3 text-slate-600 font-mono">{req.email}</td>
                        <td className="p-3 text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleAccessAction(req.id, "grant")}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                          >
                            Grant Access
                          </button>
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleAccessAction(req.id, "deny")}
                            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                          >
                            Deny Access
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Inspections Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Site Inspections</h2>
            </div>
            <Link href="/admin/inspections" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading inspections...</div>
          ) : inspections.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
              No site inspections created yet. Click "Create Inspection" above to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-3">Inspection Title</th>
                    <th className="p-3">Building / Site</th>
                    <th className="p-3">Assigned Inspector</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspections.slice(0, 5).map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{insp.title}</td>
                      <td className="p-3 text-slate-600">{insp.buildingName || insp.address || "N/A"}</td>
                      <td className="p-3 text-slate-700">{insp.assignedTo?.name || "Unassigned"}</td>
                      <td className="p-3">
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
                      <td className="p-3 text-right">
                        <Link
                          href={`/employee/inspection/${insp.id}/report`}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-300 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Report</span>
                        </Link>
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
