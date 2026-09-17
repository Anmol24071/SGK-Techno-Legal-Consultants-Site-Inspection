"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { InspectionReportPdf } from "@/components/inspection/InspectionReportPdf";
import { AlertCircle } from "lucide-react";

export function ReportClientWrapper() {
  const params = useParams();
  const id = params.id as string;

  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await fetch(`/api/inspections/${id}`);
        const data = await res.json();

        if (res.ok && data.inspection) {
          setInspection(data.inspection);
        } else {
          setError(data.error || "Report not found or access denied.");
        }
      } catch (err) {
        console.error("Failed to load report:", err);
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadReport();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border">
            Loading inspection report...
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Access Restricted</span>
            </div>
            <p className="text-xs">{error}</p>
          </div>
        ) : inspection ? (
          <InspectionReportPdf inspection={inspection} />
        ) : null}
      </main>
    </div>
  );
}
