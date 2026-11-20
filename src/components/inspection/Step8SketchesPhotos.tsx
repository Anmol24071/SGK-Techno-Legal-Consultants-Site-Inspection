"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, Trash2, Plus, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import { compressImage, dataUrlToFile } from "@/lib/image-utils";

interface Step8Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step8SketchesPhotos({ data, onChange }: Step8Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const sketches: any[] = data.sketches || [];
  const sitePhotos: any[] = data.sitePhotos || [];

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const getSketch = (type: "FLAT" | "BUILDING") => {
    return sketches.find((s) => s.type === type) || null;
  };

  /**
   * Robust file processing:
   * 1. Compresses large photos on the client side using HTML5 canvas (<100ms)
   * 2. Attempts upload to /api/uploads
   * 3. If /api/uploads fails or server is serverless/read-only, seamlessly falls back to compressed data URL!
   */
  const processAndUploadFile = async (file: File): Promise<string> => {
    try {
      // 1. Client-side compression (reduces 10MB to ~150KB)
      const compressedDataUrl = await compressImage(file, 1600, 1600, 0.75);

      try {
        const compressedFile = dataUrlToFile(compressedDataUrl, file.name || "photo.jpg");
        const formData = new FormData();
        formData.append("file", compressedFile);

        const res = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        if (res.ok && result.url) {
          return result.url;
        }
      } catch (networkErr) {
        console.warn("Server upload attempt failed, using compressed Data URL directly:", networkErr);
      }

      // Seamless fallback: use compressed Data URL directly
      return compressedDataUrl;
    } catch (err) {
      console.error("Image processing error:", err);
      // Last resort: read file directly
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSingleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress("Processing and compressing image...");

    try {
      const url = await processAndUploadFile(file);
      callback(url);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to process image. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      e.target.value = ""; // Reset input so same file can be re-selected
    }
  };

  const handleMultiplePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newPhotos = [...sitePhotos];

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Processing image ${i + 1} of ${files.length}...`);
        const url = await processAndUploadFile(files[i]);
        newPhotos.push({
          fileUrl: url,
          caption: "",
          uploadedAt: new Date().toISOString(),
        });
      }
      onChange("sitePhotos", newPhotos);
    } catch (err) {
      console.error("Error processing photos:", err);
      alert("Error attaching some photos.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      e.target.value = ""; // Reset
    }
  };

  const setSketch = (type: "FLAT" | "BUILDING", url: string) => {
    let updated = sketches.filter((s) => s.type !== type);
    if (url) {
      updated.push({ type, fileUrl: url, uploadedAt: new Date().toISOString() });
    }
    onChange("sketches", updated);
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
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>Step 9: Rough Sketches & Site Photographs</span>
          </h3>
          <p className="text-xs text-slate-500">
            Upload or capture site sketches and high-resolution site photographs. Images are automatically optimized and attached.
          </p>
        </div>

        {uploading && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{uploadProgress || "Uploading..."}</span>
          </div>
        )}
      </div>

      <div className="space-y-6 text-xs">
        
        {/* Q25. Flat Sketch */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs">Q25. Rough Sketch of the Flat</h4>
            {flatSketch && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Attached
              </span>
            )}
          </div>

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
              <span className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP files (camera or file picker)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleSingleFileUpload(e, (url) => setSketch("FLAT", url))}
              />
            </label>
          )}
        </div>

        {/* Q26. Building Sketch */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs">Q26. Rough Sketch of the Building</h4>
            {buildingSketch && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Attached
              </span>
            )}
          </div>

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
            <label className="border-2 border-dashed border-slate-300 hover:border-purple-500 bg-white rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-colors space-y-2">
              <Upload className="w-8 h-8 text-purple-600" />
              <span className="font-bold text-slate-900">Upload or Capture Building Sketch</span>
              <span className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP files (camera or file picker)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleSingleFileUpload(e, (url) => setSketch("BUILDING", url))}
              />
            </label>
          )}
        </div>

        {/* Q27. Attach Site Photos */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-xs">Q27. Attach Site Photos with Neighbourhood</h4>
                <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  {sitePhotos.length} Attached
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Capture multiple photos of rooms, building exterior, and surrounding area.</p>
            </div>

            {/* Dual Action Buttons: Camera and Gallery */}
            <div className="flex items-center gap-2">
              {/* Take Photo with Camera */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleMultiplePhotosUpload}
              />

              {/* Upload from Gallery / Files */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading}
                className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Files</span>
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMultiplePhotosUpload}
              />
            </div>
          </div>

          {sitePhotos.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-slate-500 font-medium">
                No site photographs attached yet.
              </div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Click <strong>"Take Photo"</strong> to use your camera or <strong>"Choose Files"</strong> to pick from your device gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sitePhotos.map((photo, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img src={photo.fileUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSitePhoto(idx)}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-lg transition-colors shadow"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      #{idx + 1}
                    </span>
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
