"use client";

import React, { useState } from "react";
import { Building, RefreshCw, AlertTriangle, Edit3, Compass } from "lucide-react";

interface Step7Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

const FACILITIES_CONFIG = [
  { key: "railway_station", question: "Q13. Nearest Railway Station", label: "Railway Station", icon: "🚆", placeholder: "e.g. Kalyan Junction" },
  { key: "bus_stop", question: "Q14. Nearest Bus Stop", label: "Bus Stop", icon: "🚌", placeholder: "e.g. Khadakpada Bus Stop" },
  { key: "market", question: "Q15. Nearest Market", label: "Market", icon: "🛒", placeholder: "e.g. D-Mart / Local Market" },
  { key: "shopping_mall", question: "Q16. Nearest Shopping Mall", label: "Shopping Mall", icon: "🛍️", placeholder: "e.g. Sarvoday Mall" },
  { key: "cinema_hall", label: "Nearest Cinema Hall", question: "Q17. Nearest Cinema Hall", icon: "🎬", placeholder: "e.g. Cinemax / SM5 Multiplex" },
  { key: "school", question: "Q18. Nearest School", label: "School", icon: "🏫", placeholder: "e.g. Don Bosco School" },
  { key: "college", question: "Q19. Nearest College", label: "College", icon: "🎓", placeholder: "e.g. Birla College" },
  { key: "hospital", question: "Q20. Nearest Hospital", label: "Hospital", icon: "🏥", placeholder: "e.g. Fortis Hospital Kalyan" },
  { key: "govt_office", question: "Q21. Distance from Government Office", label: "Government Office", icon: "🏢", placeholder: "e.g. KDMC Municipal Office" },
  { key: "police_station", question: "Q22. Distance from Police Station", label: "Police Station", icon: "👮", placeholder: "e.g. Khadakpada Police Station" },
  { key: "auto_stand", question: "Q23. Distance from Auto Stand", label: "Auto Stand", icon: "🛺", placeholder: "e.g. Khadakpada Auto Stand" },
];

export function Step7NearbyFacilities({ data, onChange }: Step7Props) {
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const gps = data.gpsLocation;
  const facilities: any[] = data.nearbyFacilities || [];

  const getFacilityData = (key: string, label: string) => {
    return (
      facilities.find((f: any) => f.facilityKey === key) || {
        facilityKey: key,
        facilityLabel: label,
        placeName: "",
        placeId: null,
        address: "",
        latitude: null,
        longitude: null,
        distance: null,
        distanceText: "",
        unit: "km",
        selectionMethod: "MANUAL",
      }
    );
  };

  const updateFacility = (key: string, label: string, updates: Partial<any>) => {
    let updated = [...facilities];
    const index = updated.findIndex((f: any) => f.facilityKey === key);

    let item =
      index >= 0
        ? { ...updated[index] }
        : {
            facilityKey: key,
            facilityLabel: label,
            placeName: "",
            placeId: null,
            address: "",
            latitude: null,
            longitude: null,
            distance: null,
            distanceText: "",
            unit: "km",
            selectionMethod: "MANUAL",
          };

    item = {
      ...item,
      ...updates,
      selectionMethod: "MANUAL",
    };

    if (index >= 0) {
      updated[index] = item;
    } else {
      updated.push(item);
    }

    onChange("nearbyFacilities", updated);
  };

  const handleAutoSearch = async () => {
    if (!gps || !gps.latitude || !gps.longitude) {
      setSearchError("Please capture GPS Location in Step 5 before auto-detecting facilities.");
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/places/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: gps.latitude,
          longitude: gps.longitude,
        }),
      });

      const result = await res.json();

      if (res.ok && result.facilities) {
        onChange("nearbyFacilities", result.facilities);
      } else {
        setSearchError(result.error || "Failed to auto-detect nearby facilities.");
      }
    } catch (err: any) {
      console.error("Auto-detect error:", err);
      setSearchError("Network error while auto-detecting facilities.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            <span>STEP 7 — NEARBY FACILITIES</span>
          </h3>
          <p className="text-xs text-slate-500">
            Record nearby public infrastructure details, estimated distances, and location references.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoSearch}
          disabled={searching || !gps}
          className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${searching ? "animate-spin" : ""}`} />
          <span>{searching ? "Detecting Places..." : "Auto-Detect Places (Optional)"}</span>
        </button>
      </div>

      {searchError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-3 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Manual Input Grid (Q13 - Q23) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {FACILITIES_CONFIG.map((fac) => {
          const item = getFacilityData(fac.key, fac.label);

          return (
            <div
              key={fac.key}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 space-y-3 shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="text-xl">{fac.icon}</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{fac.question}</h4>
                  <span className="text-[10px] text-slate-500 block">{fac.label}</span>
                </div>
              </div>

              <div className="space-y-3">
                
                {/* Place Name Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Facility / Place Name *
                  </label>
                  <input
                    type="text"
                    placeholder={fac.placeholder}
                    value={item.placeName || ""}
                    onChange={(e) => updateFacility(fac.key, fac.label, { placeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Distance & Unit Input */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Distance Value</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 1.5"
                      value={item.distance ?? ""}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : null;
                        const unitStr = item.unit || "km";
                        updateFacility(fac.key, fac.label, {
                          distance: val,
                          distanceText: val !== null ? `${val} ${unitStr}` : "",
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit</label>
                    <select
                      value={item.unit || "km"}
                      onChange={(e) => {
                        const unitStr = e.target.value;
                        updateFacility(fac.key, fac.label, {
                          unit: unitStr,
                          distanceText: item.distance !== null && item.distance !== undefined ? `${item.distance} ${unitStr}` : "",
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-800"
                    >
                      <option value="km">km</option>
                      <option value="m">meters</option>
                    </select>
                  </div>
                </div>

                {/* Address / Location Notes Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Address / Landmark Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kalyan West, Station Road"
                    value={item.address || ""}
                    onChange={(e) => updateFacility(fac.key, fac.label, { address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Map Overview */}
      {gps && gps.latitude && gps.longitude && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs flex items-center gap-2 text-white">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Inspection Site Location Reference Map</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              📍 Center: {gps.latitude}, {gps.longitude}
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-700 h-64 bg-slate-800 relative">
            <iframe
              title="Nearby Facilities Map Reference"
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://maps.google.com/maps?q=${gps.latitude},${gps.longitude}&z=14&output=embed`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
