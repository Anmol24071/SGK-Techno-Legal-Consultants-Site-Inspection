"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MultiStepForm } from "@/components/inspection/MultiStepForm";
import { AlertCircle } from "lucide-react";

export function InspectionClientWrapper() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInspection() {
      try {
        setLoading(true);
        const res = await fetch(`/api/inspections/${id}`);
        const data = await res.json();

        if (res.ok && data.inspection) {
          setInspection(data.inspection);
        } else {
          setError(data.error || "Inspection not found or access denied.");
        }
      } catch (err) {
        console.error("Failed to load inspection:", err);
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadInspection();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border">
            Loading inspection questionnaire...
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Access Restricted</span>
            </div>
            <p className="text-xs">{error}</p>
            <button
              onClick={() => router.push("/employee/dashboard")}
              className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-xl"
            >
              Back to Dashboard
            </button>
          </div>
        ) : inspection ? (
          <MultiStepForm inspectionId={id} initialData={inspection} />
        ) : null}
      </main>
    </div>
  );
}
