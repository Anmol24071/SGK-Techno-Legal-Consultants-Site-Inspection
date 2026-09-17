"use client";

import React, { useState } from "react";
import { Camera, Upload, Image as ImageIcon, Trash2, Plus, CheckCircle2 } from "lucide-react";

interface Step8Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step8SketchesPhotos({ data, onChange }: Step8Props) {
  const [uploading, setUploading] = useState(false);

  const sketches: any[] = data.sketches || [];
  const sitePhotos: any[] = data.sitePhotos || [];

  const getSketch = (type: "FLAT" | "BUILDING") => {
    return sketches.find((s) => s.type === type) || null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok && result.url) {
        callback(result.url);
      } else {
        alert(result.error || "Image upload failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const setSketch = (type: "FLAT" | "BUILDING", url: string) => {
    let updated = sketches.filter((s) => s.type !== type);
    if (url) {
      updated.push({ type, fileUrl: url, uploadedAt: new Date().toISOString() });
    }
    onChange("sketches", updated);
  };

  const addSitePhoto = (url: string) => {
    const newPhoto = {
      fileUrl: url,
      caption: "",
      uploadedAt: new Date().toISOString(),
    };
    onChange("sitePhotos", [...sitePhotos, newPhoto]);
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    let updated = [...sitePhotos];
    updated[index] = { ...updated[index], caption };
    onChange("sitePhotos", updated);
  };

  const removeSitePhoto = (index: number) => {
    let updated = sitePhotos.filter((_, i) => i !== index);
    onChange("sitePhotos", updated);
  };

  const flatSketch = getSketch("FLAT");
  const buildingSketch = getSketch("BUILDING");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <span>Step 8: Rough Sketches & Site Photographs</span>
        </h3>
        <p className="text-xs text-slate-500">Upload or capture site sketches and high-resolution site photographs.</p>
      </div>

      <div className="space-y-6 text-xs">
        
        {/* Q24. Flat Sketch */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs">Q24. Rough Sketch of the Flat</h4>

          {flatSketch ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white max-w-sm">
                <img src={flatSketch.fileUrl} alt="Flat Sketch" className="w-full h-48 object-contain" />
              </div>
              <button
                type="button"
                onClick={() => setSketch("FLAT", "")}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Flat Sketch</span>
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-colors space-y-2">
              <Upload className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-slate-900">Upload or Capture Flat Sketch</span>
              <span className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP files up to 15MB</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileUpload(e, (url) => setSketch("FLAT", url))}
              />
            </label>
          )}
        </div>

        {/* Q25. Building Sketch */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs">Q25. Rough Sketch of the Building</h4>

          {buildingSketch ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white max-w-sm">
                <img src={buildingSketch.fileUrl} alt="Building Sketch" className="w-full h-48 object-contain" />
              </div>
              <button
                type="button"
                onClick={() => setSketch("BUILDING", "")}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Building Sketch</span>
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-colors space-y-2">
              <Upload className="w-8 h-8 text-purple-600" />
              <span className="font-bold text-slate-900">Upload or Capture Building Sketch</span>
              <span className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP files up to 15MB</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileUpload(e, (url) => setSketch("BUILDING", url))}
              />
            </label>
          )}
        </div>

        {/* Q26. Attach Site Photos */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Q26. Attach Site Photos with Neighbourhood</h4>
              <p className="text-[11px] text-slate-500">Capture multiple photos of rooms, building exterior, and surrounding area.</p>
            </div>

            <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-colors">
              <Camera className="w-4 h-4" />
              <span>[ Take / Upload Photo ]</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileUpload(e, (url) => addSitePhoto(url))}
              />
            </label>
          </div>

          {sitePhotos.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
              No site photographs attached yet. Click "[ Take / Upload Photo ]" to attach photos.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sitePhotos.map((photo, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="h-40 bg-slate-100 overflow-hidden relative">
                    <img src={photo.fileUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSitePhoto(idx)}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3">
                    <input
                      type="text"
                      placeholder="Optional photo caption/description..."
                      value={photo.caption || ""}
                      onChange={(e) => updatePhotoCaption(idx, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
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
