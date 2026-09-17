"use client";

import React from "react";
import { Maximize2, MapPin, Plus, Trash2 } from "lucide-react";

interface Step6Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step6CarpetArea({ data, onChange }: Step6Props) {
  const carpetDetail = data.carpetDetail || { carpetArea: "", unit: "sq. ft." };
  const landmarks: any[] = data.landmarks || [];

  const handleCarpetChange = (field: string, val: any) => {
    onChange("carpetDetail", {
      ...carpetDetail,
      [field]: val,
    });
  };

  const addLandmark = () => {
    onChange("landmarks", [
      ...landmarks,
      { name: "", description: "", distance: "" },
    ]);
  };

  const updateLandmark = (index: number, field: string, val: string) => {
    let updated = [...landmarks];
    updated[index] = { ...updated[index], [field]: val };
    onChange("landmarks", updated);
  };

  const removeLandmark = (index: number) => {
    let updated = landmarks.filter((_, i) => i !== index);
    onChange("landmarks", updated);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Maximize2 className="w-5 h-5 text-blue-600" />
          <span>Step 6: Carpet Area & Neighbourhood Landmarks</span>
        </h3>
        <p className="text-xs text-slate-500">Specify total carpet area and key surrounding landmarks.</p>
      </div>

      <div className="space-y-6 text-xs">
        
        {/* Q11. Carpet Area */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs">Q11. Area of the Flat (Carpet Area)</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Carpet Area Value</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 850"
                value={carpetDetail.carpetArea || ""}
                onChange={(e) => handleCarpetChange("carpetArea", e.target.value ? parseFloat(e.target.value) : "")}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Measurement Unit</label>
              <select
                value={carpetDetail.unit || "sq. ft."}
                onChange={(e) => handleCarpetChange("unit", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
              >
                <option value="sq. ft.">sq. ft. (Square Feet - Default)</option>
                <option value="sq. m.">sq. m. (Square Meters)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Q12. Neighbourhood Landmarks */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Q12. Neighbourhood of the Building (Landmarks)</h4>
              <p className="text-[11px] text-slate-500">Add major recognizable landmarks nearby.</p>
            </div>
            <button
              type="button"
              onClick={addLandmark}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>[ + Add Landmark ]</span>
            </button>
          </div>

          {landmarks.length === 0 ? (
            <div className="p-4 bg-white rounded-lg border border-dashed border-slate-300 text-center text-slate-400">
              No landmarks added yet. Click "[ + Add Landmark ]" above to enter landmarks.
            </div>
          ) : (
            <div className="space-y-3">
              {landmarks.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">Landmark #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeLandmark(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Landmark Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Central Park"
                        value={item.name || ""}
                        onChange={(e) => updateLandmark(idx, "name", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Approx Distance</label>
                      <input
                        type="text"
                        placeholder="e.g. 500 m / 1.2 km"
                        value={item.distance || ""}
                        onChange={(e) => updateLandmark(idx, "distance", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Opposite main sector gate"
                        value={item.description || ""}
                        onChange={(e) => updateLandmark(idx, "description", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
