"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers";
import { ShieldCheck, UserCheck, LogOut, Building2, ClipboardList, Users, FileText, CheckCircle2 } from "lucide-react";

export function Navbar() {
  const { session, logout } = useAuth();
  const pathname = usePathname();

  if (!session?.user) return null;

  const user = session.user as any;
  const isAdmin = user.role === "ADMIN";

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <Link href={isAdmin ? "/admin/dashboard" : "/employee/dashboard"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:bg-blue-500 transition-colors">
              SGK
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white group-hover:text-blue-200 transition-colors">
                SGK TECHNO-LEGAL
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Consultants Site Inspection
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    pathname === "/admin/dashboard"
                      ? "bg-slate-800 text-white border-b-2 border-blue-500"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Dashboard
                </Link>

                <Link
                  href="/admin/requests"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    pathname === "/admin/requests"
                      ? "bg-slate-800 text-white border-b-2 border-blue-500"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  Access Requests
                </Link>

                <Link
                  href="/admin/employees"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    pathname === "/admin/employees"
                      ? "bg-slate-800 text-white border-b-2 border-blue-500"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  Employees
                </Link>

                <Link
                  href="/admin/inspections"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    pathname === "/admin/inspections"
                      ? "bg-slate-800 text-white border-b-2 border-blue-500"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                  Inspections
                </Link>

                <Link
                  href="/admin/reports"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    pathname === "/admin/reports"
                      ? "bg-slate-800 text-white border-b-2 border-blue-500"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Reports
                </Link>
              </>
            ) : (
              <Link
                href="/employee/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === "/employee/dashboard"
                    ? "bg-slate-800 text-white border-b-2 border-blue-500"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-400" />
                My Inspections
              </Link>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-100">{user.name}</span>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[11px] text-slate-400">{user.email}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isAdmin ? "bg-purple-950 text-purple-300 border border-purple-800" : "bg-blue-950 text-blue-300 border border-blue-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-rose-900 text-slate-200 hover:text-rose-100 px-3 py-2 rounded-md border border-slate-700 hover:border-rose-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
