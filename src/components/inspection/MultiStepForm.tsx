"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Step1SiteInfo } from "./Step1SiteInfo";
import { Step2BuildingInfo } from "./Step2BuildingInfo";
import { Step3PhysicalMeasurements } from "./Step3PhysicalMeasurements";
import { Step4Directions } from "./Step4Directions";
import { Step5GpsLocation } from "./Step5GpsLocation";
import { Step6CarpetArea } from "./Step6CarpetArea";
import { Step7NearbyFacilities } from "./Step7NearbyFacilities";
import { Step8SketchesPhotos } from "./Step8SketchesPhotos";
import { Step9Review } from "./Step9Review";
import { Step10Submit } from "./Step10Submit";
import { Save, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface MultiStepFormProps {
  inspectionId: string;
  initialData: any;
}

const STEP_TITLES = [
  "Site Information",
  "Building Info",
  "Measurements",
  "Directions",
  "GPS Location",
  "Carpet & Landmarks",
  "Nearby Facilities",
  "Sketches & Photos",
  "Review",
  "Submit",
];

export function MultiStepForm({ inspectionId, initialData }: MultiStepFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveDraft = async (showFeedback = true) => {
    setSavingDraft(true);
    setDraftMessage(null);

    try {
      const payload = {
        ...formData,
        status: formData.status === "ASSIGNED" ? "IN_PROGRESS" : formData.status,
      };

      const res = await fetch(`/api/inspections/${inspectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (showFeedback) {
          setDraftMessage("Draft saved successfully!");
          setTimeout(() => setDraftMessage(null), 3000);
        }
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleNext = async () => {
    await saveDraft(false);
    if (currentStep < 10) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitFinal = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: "SUBMITTED",
      };

      const res = await fetch(`/api/inspections/${inspectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/employee/inspection/${inspectionId}/report`);
      } else {
        alert("Submission failed. Please check form details.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = Math.round((currentStep / 10) * 100);

  return (
    <div className="space-y-6">
      
      {/* Multi-step Header & Progress Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Step {currentStep} of 10: {STEP_TITLES[currentStep - 1]}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">{formData.title}</h2>
          </div>

          <button
            type="button"
            onClick={() => saveDraft(true)}
            disabled={savingDraft}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-slate-300 self-start sm:self-auto shadow-sm"
          >
            <Save className="w-4 h-4 text-blue-600" />
            <span>{savingDraft ? "Saving Draft..." : "[ SAVE DRAFT ]"}</span>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-500">
            <span>Progress Indicator</span>
            <span className="text-blue-600 font-extrabold">{progressPercentage}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Numbers Nav Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-1 scrollbar-none">
          {STEP_TITLES.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={stepNum}
                onClick={() => {
                  saveDraft(false);
                  setCurrentStep(stepNum);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-sm"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{stepNum}.</span>
                <span className="hidden md:inline">{title}</span>
              </button>
            );
          })}
        </div>

        {draftMessage && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{draftMessage}</span>
          </div>
        )}

      </div>

      {/* Active Step Content Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[400px]">
        {currentStep === 1 && <Step1SiteInfo data={formData} onChange={handleFieldChange} />}
        {currentStep === 2 && <Step2BuildingInfo data={formData} onChange={handleFieldChange} />}
        {currentStep === 3 && <Step3PhysicalMeasurements data={formData} onChange={handleFieldChange} />}
        {currentStep === 4 && <Step4Directions data={formData} onChange={handleFieldChange} />}
        {currentStep === 5 && <Step5GpsLocation data={formData} onChange={handleFieldChange} />}
        {currentStep === 6 && <Step6CarpetArea data={formData} onChange={handleFieldChange} />}
        {currentStep === 7 && <Step7NearbyFacilities data={formData} onChange={handleFieldChange} />}
        {currentStep === 8 && <Step8SketchesPhotos data={formData} onChange={handleFieldChange} />}
        {currentStep === 9 && <Step9Review data={formData} onGoToStep={(s) => setCurrentStep(s)} />}
        {currentStep === 10 && <Step10Submit data={formData} submitting={submitting} onSubmit={handleSubmitFinal} />}
      </div>

      {/* Bottom Sticky Action Bar (Mobile First) */}
      <div className="sticky bottom-4 bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-2xl flex items-center justify-between gap-4 z-30">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold py-3 px-5 rounded-xl text-xs flex items-center gap-2 transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-bold text-slate-400 hidden sm:inline">
          Step {currentStep} of 10
        </span>

        {currentStep < 10 ? (
          <button
            type="button"
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:translate-y-0.5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitFinal}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Inspection</span>
          </button>
        )}
      </div>

    </div>
  );
}
