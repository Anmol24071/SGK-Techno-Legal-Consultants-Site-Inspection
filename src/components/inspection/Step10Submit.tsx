"use client";

import React from "react";
import { Send, CheckCircle2, ShieldCheck } from "lucide-react";

interface Step10Props {
  data: any;
  submitting: boolean;
  onSubmit: () => void;
}

export function Step10Submit({ data, submitting, onSubmit }: Step10Props) {
  return (
    <div className="space-y-6 text-center py-4">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-blue-200">
        <Send className="w-8 h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-xl font-bold text-slate-900">Step 10: Final Inspection Submission</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          You are about to permanently submit this site inspection report for <strong>{data.buildingName || data.title}</strong>.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 max-w-md mx-auto text-left space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Post-Submission Action</span>
        </div>
        <p className="text-blue-800">
          Once submitted, the inspection status will update to <strong>SUBMITTED</strong> and a downloadable PDF inspection report will automatically be generated for SGK Techno-Legal Consultants.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl text-sm transition-all shadow-lg hover:shadow-xl active:translate-y-0.5 inline-flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{submitting ? "Submitting Inspection Report..." : "[ SUBMIT INSPECTION ]"}</span>
        </button>
      </div>
    </div>
  );
}
