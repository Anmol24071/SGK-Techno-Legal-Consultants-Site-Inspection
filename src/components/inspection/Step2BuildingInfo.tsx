"use client";

import React from "react";
import { Home } from "lucide-react";

interface Step2Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step2BuildingInfo({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-purple-600" />
          <span>STEP 2 — BUILDING & FLAT INFORMATION</span>
        </h3>
        <p className="text-xs text-slate-500">Record building name, floor counts, and flat location floor number.</p>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Q4. Name of the Building *</label>
          <input
            type="text"
            required
            placeholder="e.g. Skyline Residency Tower A"
            value={data.buildingName || ""}
            onChange={(e) => onChange("buildingName", e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Q5. Number of Floors</label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 14"
              value={data.totalFloors || ""}
              onChange={(e) => onChange("totalFloors", e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Q6. Location of the Flat — Which Floor?</label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 4 (4th Floor)"
              value={data.flatFloor || ""}
              onChange={(e) => onChange("flatFloor", e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
