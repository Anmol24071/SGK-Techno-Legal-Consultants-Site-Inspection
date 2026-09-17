"use client";

import { useAuth } from "@/app/providers";
import { Clock, LogOut, ShieldAlert, Mail } from "lucide-react";

export default function PendingPage() {
  const { session, logout } = useAuth();
  const user = session?.user as any;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        
        <div className="w-16 h-16 bg-amber-900/40 border border-amber-600/40 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Access Request Pending</h1>

        <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-4 my-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-medium text-xs">
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Request Submitted for Approval</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your access request has been sent to the administrator. You will receive an email once your access has been approved or denied.
          </p>
          {user?.email && (
            <div className="text-[11px] text-slate-400 border-t border-amber-900/50 pt-2 mt-2">
              Signed in as: <strong className="text-slate-200">{user.email}</strong>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

      </div>
    </main>
  );
}
