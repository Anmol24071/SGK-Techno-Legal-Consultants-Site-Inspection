"use client";

import { useAuth } from "@/app/providers";
import { ShieldX, LogOut } from "lucide-react";

export default function DeniedPage() {
  const { session, logout } = useAuth();
  const user = session?.user as any;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        
        <div className="w-16 h-16 bg-rose-950/60 border border-rose-600/40 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Access Denied</h1>

        <div className="bg-rose-950/40 border border-rose-900/40 rounded-xl p-4 my-6 text-left space-y-2">
          <p className="text-xs text-rose-200 leading-relaxed">
            Your access request for SGK Techno-Legal Consultants has been denied or revoked.
          </p>
          <p className="text-xs text-slate-400">
            If you believe this was done in error, please contact the administrator.
          </p>
          {user?.email && (
            <div className="text-[11px] text-slate-400 border-t border-rose-900/50 pt-2 mt-2">
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
