"use client";

import React from "react";
import { CheckCircle2, Edit3, MapPin, Building2, Home, Ruler, Compass, Camera, Maximize2, Building, Image } from "lucide-react";

interface Step9Props {
  data: any;
  onGoToStep: (step: number) => void;
}

export function Step9Review({ data, onGoToStep }: Step9Props) {
  const rooms: any[] = data.rooms || [];
  const landmarks: any[] = data.landmarks || [];
  const facilities: any[] = data.nearbyFacilities || [];
  const sketches: any[] = data.sketches || [];
  const sitePhotos: any[] = data.sitePhotos || [];

  const flatDir = (data.compassDirections || []).find((c: any) => c.target === "FLAT") || {};
  const bldgDir = (data.compassDirections || []).find((c: any) => c.target === "BUILDING") || {};
  const flatSketch = sketches.find((s: any) => s.type === "FLAT");
  const bldgSketch = sketches.find((s: any) => s.type === "BUILDING");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>STEP 9 — REVIEW INSPECTION</span>
        </h3>
        <p className="text-xs text-slate-500">
          Review all 11 inspection sections below before proceeding to final submission. Use the [ EDIT ] button on any section to make updates.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        
        {/* 1. Site Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>1. Site Information</span>
            </h4>
            <button onClick={() => onGoToStep(1)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div className="sm:col-span-2"><strong>Q1. Address:</strong> {data.address || "N/A"}</div>
            <div><strong>Q2. Site Coordinator:</strong> {data.siteCoordinator || "N/A"}</div>
            <div><strong>Q3. Inspection Engineer:</strong> {data.engineerName || "N/A"}</div>
          </div>
        </div>

        {/* 2. Building & Flat Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-purple-600" />
              <span>2. Building & Flat Information</span>
            </h4>
            <button onClick={() => onGoToStep(2)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
            <div><strong>Q4. Building Name:</strong> {data.buildingName || "N/A"}</div>
            <div><strong>Q5. Total Floors:</strong> {data.totalFloors || "N/A"}</div>
            <div><strong>Q6. Flat Location Floor:</strong> {data.flatFloor || "N/A"}</div>
          </div>
        </div>

        {/* 3. Physical Measurements */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-blue-600" />
              <span>3. Physical Measurements (Q7)</span>
            </h4>
            <button onClick={() => onGoToStep(3)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          {rooms.length === 0 ? (
            <p className="text-slate-400 italic">No room measurements entered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden bg-white">
                <thead>
                  <tr className="border-b border-slate-200 font-bold text-slate-600 bg-slate-100">
                    <th className="p-2">Room / Component</th>
                    <th className="p-2">Length</th>
                    <th className="p-2">Width</th>
                    <th className="p-2">Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((r, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold">{r.type} {r.roomNumber ? `#${r.roomNumber}` : ""}</td>
                      <td className="p-2">{r.length ? `${r.length} ${r.unit === 'sq. ft.' ? 'ft' : 'm'}` : '-'}</td>
                      <td className="p-2">{r.width ? `${r.width} ${r.unit === 'sq. ft.' ? 'ft' : 'm'}` : '-'}</td>
                      <td className="p-2 font-bold text-blue-900">{r.area ? `${r.area} ${r.unit}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. Directions */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>4. Directions (Q8 & Q9)</span>
            </h4>
            <button onClick={() => onGoToStep(4)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <div>
              <strong>Q8. Flat Directions:</strong> N: {flatDir.north || "-"}, S: {flatDir.south || "-"}, E: {flatDir.east || "-"}, W: {flatDir.west || "-"}
            </div>
            <div>
              <strong>Q9. Building Directions:</strong> N: {bldgDir.north || "-"}, S: {bldgDir.south || "-"}, E: {bldgDir.east || "-"}, W: {bldgDir.west || "-"}
            </div>
          </div>
        </div>

        {/* 5. GPS Location */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>5. GPS Location (Q10)</span>
            </h4>
            <button onClick={() => onGoToStep(5)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          {data.gpsLocation ? (
            <div className="font-mono text-slate-800 font-semibold">
              Latitude: {data.gpsLocation.latitude}, Longitude: {data.gpsLocation.longitude}
            </div>
          ) : (
            <p className="text-amber-700 italic font-semibold">GPS coordinates not captured yet.</p>
          )}
        </div>

        {/* 6. Carpet Area */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <span>6. Carpet Area (Q11)</span>
            </h4>
            <button onClick={() => onGoToStep(6)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          <div className="font-bold text-blue-900 text-sm">
            {data.carpetDetail?.carpetArea ? `${data.carpetDetail.carpetArea} ${data.carpetDetail.unit || 'sq. ft.'}` : "Not recorded"}
          </div>
        </div>

        {/* 7. Landmarks */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              <span>7. Neighbourhood Landmarks (Q12)</span>
            </h4>
            <button onClick={() => onGoToStep(6)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          {landmarks.length === 0 ? (
            <p className="text-slate-400 italic">No landmarks added.</p>
          ) : (
            <div className="space-y-1">
              {landmarks.map((l, idx) => (
                <div key={idx} className="text-slate-700 font-medium">
                  • <strong>{l.name}</strong> {l.distance ? `(${l.distance})` : ""} {l.description ? `- ${l.description}` : ""}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Nearby Facilities */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>8. Nearby Facilities (Q13 - Q23)</span>
            </h4>
            <button onClick={() => onGoToStep(7)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          {facilities.length === 0 ? (
            <p className="text-slate-400 italic">No facility distances recorded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              {facilities.map((f, idx) => (
                <div key={idx}>
                  <strong>{f.facilityLabel}:</strong> {f.placeName ? `${f.placeName} (${f.distance} ${f.unit})` : f.distance ? `${f.distance} ${f.unit}` : "N/A"}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 9. Flat Sketch */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-600" />
              <span>9. Rough Sketch of Flat (Q24)</span>
            </h4>
            <button onClick={() => onGoToStep(8)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          {flatSketch ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Flat Sketch Uploaded</span>
          ) : (
            <span className="text-slate-400 italic">No flat sketch uploaded</span>
          )}
        </div>

        {/* 10. Building Sketch */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-600" />
              <span>10. Rough Sketch of Building (Q25)</span>
            </h4>
            <button onClick={() => onGoToStep(8)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          {bldgSketch ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Building Sketch Uploaded</span>
          ) : (
            <span className="text-slate-400 italic">No building sketch uploaded</span>
          )}
        </div>

        {/* 11. Site Photographs */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-600" />
              <span>11. Site Photographs (Q26)</span>
            </h4>
            <button onClick={() => onGoToStep(8)} className="bg-white border border-slate-300 hover:bg-slate-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              <span>[ EDIT ]</span>
            </button>
          </div>
          <div className="font-bold text-slate-800">
            {sitePhotos.length > 0 ? `✓ ${sitePhotos.length} Site Photographs attached` : "No site photographs attached"}
          </div>
        </div>

      </div>
    </div>
  );
}
