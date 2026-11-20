"use client";

import React, { useEffect, useMemo } from "react";
import { IndianRupee, Calculator, CheckCircle2, Info, Building, RefreshCw } from "lucide-react";

interface Step8Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

/**
 * Converts a number into Indian Currency Words (e.g. 4500000 -> "Forty Five Lakh Rupees")
 */
function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function formatGroup(n: number): string {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  const rounded = Math.round(num);
  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remainder = rounded % 1000;

  let res = "";
  if (crore > 0) res += formatGroup(crore) + " Crore ";
  if (lakh > 0) res += formatGroup(lakh) + " Lakh ";
  if (thousand > 0) res += formatGroup(thousand) + " Thousand ";
  if (remainder > 0) res += formatGroup(remainder);

  return res.trim() + " Rupees Only";
}

export function Step8RateValuation({ data, onChange }: Step8Props) {
  // Determine square feet of the flat:
  // 1. If builtUpArea is already explicitly set, use that.
  // 2. Otherwise default to carpetDetail.carpetArea (entered in Step 6).
  // 3. Otherwise default to sum of room areas from Step 3.
  const carpetArea = data.carpetDetail?.carpetArea ? Number(data.carpetDetail.carpetArea) : 0;
  const roomsTotalArea = useMemo(() => {
    return (data.rooms || []).reduce((acc: number, r: any) => acc + (Number(r.area) || 0), 0);
  }, [data.rooms]);

  const defaultArea = carpetArea > 0 ? carpetArea : roomsTotalArea > 0 ? roomsTotalArea : 0;
  const currentArea = data.builtUpArea !== undefined && data.builtUpArea !== null && data.builtUpArea !== "" 
    ? Number(data.builtUpArea) 
    : defaultArea;

  const currentRate = data.ratePerSqFt !== undefined && data.ratePerSqFt !== null && data.ratePerSqFt !== ""
    ? Number(data.ratePerSqFt)
    : "";

  // Auto-initialize builtUpArea if not already initialized and defaultArea > 0
  useEffect(() => {
    if ((data.builtUpArea === undefined || data.builtUpArea === null || data.builtUpArea === "") && defaultArea > 0) {
      onChange("builtUpArea", defaultArea);
    }
  }, [defaultArea]);

  // Recalculate totalRate whenever area or rate changes
  const handleAreaChange = (val: string) => {
    const numArea = val === "" ? "" : parseFloat(val);
    onChange("builtUpArea", numArea);

    if (numArea !== "" && currentRate !== "" && !isNaN(Number(numArea)) && !isNaN(Number(currentRate))) {
      const total = Math.round(Number(numArea) * Number(currentRate));
      onChange("totalRate", total);
    } else {
      onChange("totalRate", null);
    }
  };

  const handleRateChange = (val: string) => {
    const numRate = val === "" ? "" : parseFloat(val);
    onChange("ratePerSqFt", numRate);

    const activeArea = currentArea || 0;
    if (numRate !== "" && activeArea > 0 && !isNaN(Number(numRate))) {
      const total = Math.round(activeArea * Number(numRate));
      onChange("totalRate", total);
    } else {
      onChange("totalRate", null);
    }
  };

  const syncWithCarpetArea = () => {
    if (carpetArea > 0) {
      handleAreaChange(carpetArea.toString());
    } else if (roomsTotalArea > 0) {
      handleAreaChange(roomsTotalArea.toString());
    }
  };

  const calculatedTotal = (typeof currentArea === "number" && currentArea > 0 && typeof currentRate === "number" && currentRate > 0)
    ? Math.round(currentArea * currentRate)
    : (data.totalRate ? Number(data.totalRate) : null);

  const amountInWords = calculatedTotal ? numberToIndianWords(calculatedTotal) : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-blue-600" />
            <span>Step 8: Rate per Square Feet Built Up & Total Rate</span>
          </h3>
          <p className="text-xs text-slate-500">
            Enter the rate per square foot for built-up area. The valuation will be calculated automatically by multiplying with the flat's square footage.
          </p>
        </div>

        <span className="self-start sm:self-auto bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold px-3 py-1 rounded-full">
          Q24. Property Valuation
        </span>
      </div>

      <div className="space-y-6 text-xs">
        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Square Feet of the Flat */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Area of Flat (Built Up / Carpet)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pulled from previous steps (editable if built-up loading applies)
                </p>
              </div>

              {(carpetArea > 0 || roomsTotalArea > 0) && (
                <button
                  type="button"
                  onClick={syncWithCarpetArea}
                  title="Reset to Carpet Area"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Area</span>
                </button>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Square Feet (sq. ft.)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 850"
                  value={currentArea || ""}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-16"
                />
                <span className="absolute right-3 top-3 text-slate-400 font-bold text-xs pointer-events-none">
                  sq. ft.
                </span>
              </div>
            </div>

            {/* Context Badge */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-[11px] space-y-1 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Step 6 Carpet Area:</span>
                <strong className="text-slate-800 font-mono">
                  {carpetArea > 0 ? `${carpetArea} sq. ft.` : "Not entered"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Step 3 Room Measurements Sum:</span>
                <strong className="text-slate-800 font-mono">
                  {roomsTotalArea > 0 ? `${roomsTotalArea.toFixed(2)} sq. ft.` : "Not entered"}
                </strong>
              </div>
            </div>
          </div>

          {/* 2. Rate per Square Feet Built Up */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Rate per Square Feet Built Up</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Enter prevailing market rate or guideline valuation rate per sq. ft.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rate (₹ per sq. ft.)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-sm pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 5000"
                  value={currentRate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 pl-8 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-20"
                />
                <span className="absolute right-3 top-3 text-slate-400 font-bold text-xs pointer-events-none">
                  / sq. ft.
                </span>
              </div>
            </div>

            {currentRate && !isNaN(Number(currentRate)) && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-[11px] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Rate entered: ₹ {Number(currentRate).toLocaleString("en-IN")} per sq. ft.</span>
              </div>
            )}
          </div>

        </div>

        {/* 3. Real-Time Valuation Summary Box */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-sm tracking-wide text-white">
                Total Property Valuation & Calculation Breakdown
              </h4>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
              Auto-Multiplied
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                Square Feet of Flat
              </span>
              <span className="text-lg font-bold text-white mt-1 block">
                {currentArea > 0 ? `${currentArea} sq. ft.` : "0 sq. ft."}
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                Rate per Sq. Ft. Built Up
              </span>
              <span className="text-lg font-bold text-blue-300 mt-1 block">
                {currentRate ? `₹ ${Number(currentRate).toLocaleString("en-IN")}` : "₹ 0"}
              </span>
            </div>

            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4">
              <span className="text-emerald-300 block text-[10px] font-bold uppercase tracking-wider">
                Total Rate / Valuation
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {calculatedTotal ? `₹ ${calculatedTotal.toLocaleString("en-IN")}` : "₹ 0"}
              </span>
            </div>
          </div>

          {amountInWords && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                Total Rate in Words:
              </span>
              <p className="font-semibold text-emerald-300 text-sm italic">
                "{amountInWords}"
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-white/10">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              Formula applied: <strong>Total Rate = {currentArea || 0} sq. ft. × ₹ {currentRate || 0} / sq. ft. = ₹ {calculatedTotal ? calculatedTotal.toLocaleString("en-IN") : "0"}</strong>. This value will be rendered in the official Inspection Report and exportable Word document.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
