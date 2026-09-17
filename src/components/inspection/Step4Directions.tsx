"use client";

import React from "react";
import { Compass } from "lucide-react";

interface Step4Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step4Directions({ data, onChange }: Step4Props) {
  const directions: any[] = data.compassDirections || [];

  const getDir = (target: "FLAT" | "BUILDING") => {
    return (
      directions.find((d) => d.target === target) || {
        target,
        north: "",
        south: "",
        east: "",
        west: "",
      }
    );
  };

  const updateDir = (target: "FLAT" | "BUILDING", field: string, val: string) => {
    let updated = [...directions];
    const index = updated.findIndex((d) => d.target === target);

    let item = index >= 0 ? { ...updated[index] } : { target, north: "", south: "", east: "", west: "" };
    item[field] = val;

    if (index >= 0) {
      updated[index] = item;
    } else {
      updated.push(item);
    }

    onChange("compassDirections", updated);
  };

  const flatDir = getDir("FLAT");
  const bldgDir = getDir("BUILDING");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          <span>Step 4: Compass Directions</span>
        </h3>
        <p className="text-xs text-slate-500">Record orientation and facing directions for the flat and building.</p>
      </div>

      <div className="space-y-6 text-xs">
        
        {/* Flat Compass Directions */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Q8. Directions / Orientation of the Flat through Compass</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">North</label>
              <input
                type="text"
                placeholder="Feature / side facing North"
                value={flatDir.north || ""}
                onChange={(e) => updateDir("FLAT", "north", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">South</label>
              <input
                type="text"
                placeholder="Feature / side facing South"
                value={flatDir.south || ""}
                onChange={(e) => updateDir("FLAT", "south", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">East</label>
              <input
                type="text"
                placeholder="Feature / side facing East"
                value={flatDir.east || ""}
                onChange={(e) => updateDir("FLAT", "east", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">West</label>
              <input
                type="text"
                placeholder="Feature / side facing West"
                value={flatDir.west || ""}
                onChange={(e) => updateDir("FLAT", "west", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Building Compass Directions */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Q9. Directions / Orientation of the Building through Compass</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">North</label>
              <input
                type="text"
                placeholder="Feature / side facing North"
                value={bldgDir.north || ""}
                onChange={(e) => updateDir("BUILDING", "north", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">South</label>
              <input
                type="text"
                placeholder="Feature / side facing South"
                value={bldgDir.south || ""}
                onChange={(e) => updateDir("BUILDING", "south", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">East</label>
              <input
                type="text"
                placeholder="Feature / side facing East"
                value={bldgDir.east || ""}
                onChange={(e) => updateDir("BUILDING", "east", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">West</label>
              <input
                type="text"
                placeholder="Feature / side facing West"
                value={bldgDir.west || ""}
                onChange={(e) => updateDir("BUILDING", "west", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
