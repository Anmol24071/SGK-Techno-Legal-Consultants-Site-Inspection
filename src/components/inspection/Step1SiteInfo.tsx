"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Building2 } from "lucide-react";

interface Step1Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step1SiteInfo({ data, onChange }: Step1Props) {
  const { data: session } = useSession();

  // Auto-populate Engineer Name with logged-in user if empty
  useEffect(() => {
    if (!data.engineerName && session?.user?.name) {
      onChange("engineerName", session.user.name);
    }
  }, [session, data.engineerName, onChange]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>STEP 1 — SITE INFORMATION</span>
        </h3>
        <p className="text-xs text-slate-500">Provide basic site address, coordinator, and assigned inspection engineer details.</p>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Q1. Full Address of the Site *</label>
          <textarea
            rows={3}
            required
            placeholder="Enter complete physical address of property..."
            value={data.address || ""}
            onChange={(e) => onChange("address", e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Q2. Site Co-ordinator Name</label>
            <input
              type="text"
              placeholder="e.g. Suresh Patil"
              value={data.siteCoordinator || ""}
              onChange={(e) => onChange("siteCoordinator", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Q3. Name of the Site Inspection Engineer</label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar"
              value={data.engineerName || ""}
              onChange={(e) => onChange("engineerName", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-blue-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
