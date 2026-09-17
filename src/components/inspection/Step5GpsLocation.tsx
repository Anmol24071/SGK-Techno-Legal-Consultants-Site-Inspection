"use client";

import React, { useState } from "react";
import { Navigation, MapPin, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";

interface Step5Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step5GpsLocation({ data, onChange }: Step5Props) {
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const gpsLocation = data.gpsLocation || null;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser or device.");
      return;
    }

    setLoadingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        onChange("gpsLocation", {
          latitude: lat,
          longitude: lng,
          capturedAt: new Date().toISOString(),
        });
        setLoadingGps(false);
      },
      (error) => {
        setLoadingGps(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError("Location permission denied. Please enable Location access in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError("Location information unavailable. Ensure GPS is enabled on your device.");
            break;
          case error.TIMEOUT:
            setGpsError("Location request timed out. Please try again.");
            break;
          default:
            setGpsError("An unknown error occurred while retrieving GPS coordinates.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-600" />
          <span>Step 5: GPS / Google Maps Live Location</span>
        </h3>
        <p className="text-xs text-slate-500">Capture exact physical site coordinates using your device's GPS hardware.</p>
      </div>

      <div className="space-y-4 text-xs">
        
        {/* Get Current Location Action Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-lg text-center">
          <div className="w-14 h-14 bg-blue-600/30 border border-blue-500/50 rounded-full flex items-center justify-center mx-auto text-blue-400">
            <Navigation className={`w-7 h-7 ${loadingGps ? "animate-spin" : ""}`} />
          </div>

          <div>
            <h4 className="font-bold text-base text-white">Capture Device GPS Coordinates</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click below while standing on site to log live latitude and longitude.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={loadingGps}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl inline-flex items-center gap-2 transition-all shadow-lg active:translate-y-0.5"
          >
            <Navigation className="w-4 h-4" />
            <span>{loadingGps ? "Acquiring GPS Signal..." : "[ GET CURRENT LOCATION ]"}</span>
          </button>

          {gpsError && (
            <div className="bg-rose-950/80 border border-rose-700 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2 max-w-md mx-auto">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Display Captured Coordinates */}
        {gpsLocation && gpsLocation.latitude && gpsLocation.longitude && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>GPS Location Captured</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${gpsLocation.latitude},${gpsLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <span className="text-slate-500 font-semibold block text-[11px]">LATITUDE</span>
                <span className="text-lg font-mono font-bold text-slate-900">{gpsLocation.latitude}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <span className="text-slate-500 font-semibold block text-[11px]">LONGITUDE</span>
                <span className="text-lg font-mono font-bold text-slate-900">{gpsLocation.longitude}</span>
              </div>
            </div>

            {/* Embedded Map Visual Box */}
            <div className="rounded-xl overflow-hidden border border-emerald-300 h-48 bg-slate-200 relative flex items-center justify-center">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${gpsLocation.latitude},${gpsLocation.longitude}&z=16&output=embed`}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
