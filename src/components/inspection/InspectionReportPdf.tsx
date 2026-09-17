"use client";

import React from "react";
import { Printer, Download, MapPin, Building2, Calendar, User, FileText, ExternalLink, CheckCircle2 } from "lucide-react";

interface InspectionReportPdfProps {
  inspection: any;
}

export function InspectionReportPdf({ inspection }: InspectionReportPdfProps) {
  const handlePrint = () => {
    window.print();
  };

  const rooms: any[] = inspection.rooms || [];
  const compassDirections: any[] = inspection.compassDirections || [];
  const landmarks: any[] = inspection.landmarks || [];
  const nearbyFacilities: any[] = inspection.nearbyFacilities || [];
  const sketches: any[] = inspection.sketches || [];
  const sitePhotos: any[] = inspection.sitePhotos || [];
  const gps = inspection.gpsLocation;

  const flatDir = compassDirections.find((c) => c.target === "FLAT") || {};
  const bldgDir = compassDirections.find((c) => c.target === "BUILDING") || {};
  const flatSketch = sketches.find((s) => s.type === "FLAT");
  const bldgSketch = sketches.find((s) => s.type === "BUILDING");

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-900 text-sm">Site Inspection Report</h2>
          <p className="text-xs text-slate-500">Official document ready for printing or exporting as PDF.</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/inspections/${inspection.id}/word`}
            download
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Word Report (.docx)</span>
          </a>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div id="report-document" className="bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-md space-y-8 text-slate-900 font-sans">
        
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          {inspection.status !== "SUBMITTED" && inspection.status !== "REVIEWED" && (
            <div className="bg-amber-100 border border-amber-400 text-amber-900 font-extrabold text-xs px-4 py-2 rounded-xl uppercase mb-4 tracking-wider">
              ⚠️ DRAFT PREVIEW — INSPECTION NOT FINALIZED / SUBMITTED YET
            </div>
          )}
          <div className="inline-block bg-blue-900 text-white font-black text-xl px-4 py-1 rounded">
            SGK TECHNO-LEGAL CONSULTANTS
          </div>
          <h1 className="text-2xl font-black tracking-wider text-slate-900 uppercase">
            SITE INSPECTION REPORT
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Property & Physical Measurement Verification
          </p>
        </div>

        {/* Metadata Summary Box */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Inspection ID</span>
            <strong className="font-mono text-sm text-slate-900">{inspection.id}</strong>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Assigned Inspector / Engineer</span>
            <strong className="text-sm text-slate-900">{inspection.engineerName || inspection.assignedTo?.name || "N/A"}</strong>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Inspection Status</span>
            <span className="inline-block font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded text-[10px] uppercase">
              {inspection.status}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-bold">Date & Time</span>
            <strong className="text-slate-900">{new Date(inspection.updatedAt).toLocaleString()}</strong>
          </div>
        </div>

        {/* 1. Site Information */}
        <div className="space-y-3 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 border-b border-blue-900/20 pb-1">
            1. Site & Property Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800">
            <div><strong>Building Name:</strong> {inspection.buildingName || "N/A"}</div>
            <div><strong>Site Coordinator:</strong> {inspection.siteCoordinator || "N/A"}</div>
            <div><strong>Total Building Floors:</strong> {inspection.totalFloors || "N/A"}</div>
            <div><strong>Flat Location (Floor):</strong> {inspection.flatFloor || "N/A"}</div>
            <div className="sm:col-span-2"><strong>Full Site Address:</strong> {inspection.address || "N/A"}</div>
          </div>
        </div>

        {/* 2. Physical Measurements */}
        <div className="space-y-3 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 border-b border-blue-900/20 pb-1">
            2. Physical Measurement Matrix
          </h2>

          {rooms.length === 0 ? (
            <p className="text-slate-500 italic">No physical measurements recorded.</p>
          ) : (
            <table className="w-full border-collapse border border-slate-300 text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-2">Room / Component</th>
                  <th className="border border-slate-300 p-2">Length</th>
                  <th className="border border-slate-300 p-2">Width</th>
                  <th className="border border-slate-300 p-2">Calculated Area</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 font-bold">
                      {room.type} {room.roomNumber ? `#${room.roomNumber}` : ""}
                    </td>
                    <td className="border border-slate-300 p-2">
                      {room.length ? `${room.length} ${room.unit === 'sq. ft.' ? 'ft' : 'm'}` : "-"}
                    </td>
                    <td className="border border-slate-300 p-2">
                      {room.width ? `${room.width} ${room.unit === 'sq. ft.' ? 'ft' : 'm'}` : "-"}
                    </td>
                    <td className="border border-slate-300 p-2 font-bold text-blue-900">
                      {room.area ? `${room.area} ${room.unit}` : "-"} {room.manualOverride ? "(Manual Override)" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {inspection.carpetDetail && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg font-bold text-blue-900 flex justify-between">
              <span>TOTAL CARPET AREA OF FLAT:</span>
              <span>{inspection.carpetDetail.carpetArea} {inspection.carpetDetail.unit}</span>
            </div>
          )}
        </div>

        {/* 3. Directions */}
        <div className="space-y-3 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 border-b border-blue-900/20 pb-1">
            3. Compass Directions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
              <strong className="block font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1">Flat Orientation</strong>
              <div><strong>North:</strong> {flatDir.north || "N/A"}</div>
              <div><strong>South:</strong> {flatDir.south || "N/A"}</div>
              <div><strong>East:</strong> {flatDir.east || "N/A"}</div>
              <div><strong>West:</strong> {flatDir.west || "N/A"}</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
              <strong className="block font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1">Building Orientation</strong>
              <div><strong>North:</strong> {bldgDir.north || "N/A"}</div>
              <div><strong>South:</strong> {bldgDir.south || "N/A"}</div>
              <div><strong>East:</strong> {bldgDir.east || "N/A"}</div>
              <div><strong>West:</strong> {bldgDir.west || "N/A"}</div>
            </div>
          </div>
        </div>

        {/* 4. GPS Location */}
        {gps && (
          <div className="space-y-3 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 border-b border-blue-900/20 pb-1">
              4. GPS Geolocation Reference
            </h2>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px]">CAPTURED COORDINATES</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  Latitude: {gps.latitude}, Longitude: {gps.longitude}
                </span>
              </div>
              <a
                href={`https://maps.google.com/?q=${gps.latitude},${gps.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="no-print inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
              >
                <span>Google Maps Reference</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* 5. Landmarks & Facilities */}
        <div className="space-y-3 text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 border-b border-blue-900/20 pb-1">
            5. Nearby Public Facilities & Landmarks
          </h2>

          {nearbyFacilities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {nearbyFacilities.map((fac, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                  <span className="font-bold text-slate-900 block">{fac.facilityLabel}</span>
                  <span className="text-slate-600">{fac.placeName ? `${fac.placeName} - ` : ""}{fac.distance} {fac.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Rough Sketches */}
        {sketches.length > 0 && (
          <div className="space-y-3 text-xs page-break">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 border-b border-blue-900/20 pb-1">
              6. Rough Sketches
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flatSketch && (
                <div className="border border-slate-300 rounded-xl p-3 bg-white text-center space-y-2">
                  <span className="font-bold text-slate-900 block">Flat Rough Sketch</span>
                  <img src={flatSketch.fileUrl} alt="Flat Sketch" className="max-h-64 mx-auto object-contain border rounded" />
                </div>
              )}
              {bldgSketch && (
                <div className="border border-slate-300 rounded-xl p-3 bg-white text-center space-y-2">
                  <span className="font-bold text-slate-900 block">Building Rough Sketch</span>
                  <img src={bldgSketch.fileUrl} alt="Building Sketch" className="max-h-64 mx-auto object-contain border rounded" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. Attached Site Photographs */}
        {sitePhotos.length > 0 && (
          <div className="space-y-3 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 border-b border-blue-900/20 pb-1">
              7. Attached Site Photographs ({sitePhotos.length} Images)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sitePhotos.map((photo, idx) => (
                <div key={idx} className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 p-2 space-y-1 text-center">
                  <img src={photo.fileUrl} alt={`Site Photo ${idx + 1}`} className="h-36 w-full object-cover rounded" />
                  {photo.caption && <span className="text-[10px] text-slate-600 block line-clamp-2 italic">{photo.caption}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Sign-off Footer */}
        <div className="border-t-2 border-slate-900 pt-8 grid grid-cols-2 gap-8 text-xs text-slate-700">
          <div>
            <p className="font-bold text-slate-900">Inspected & Prepared By:</p>
            <p className="mt-8 border-t border-slate-400 pt-1 font-semibold">{inspection.engineerName || inspection.assignedTo?.name}</p>
            <p className="text-[10px] text-slate-500">Site Inspection Engineer</p>
          </div>

          <div className="text-right">
            <p className="font-bold text-slate-900">Authorized Signature:</p>
            <p className="mt-8 border-t border-slate-400 pt-1 font-semibold">SGK TECHNO-LEGAL CONSULTANTS</p>
            <p className="text-[10px] text-slate-500">Chief Valuer / Technical Auditor</p>
          </div>
        </div>

      </div>
    </div>
  );
}
