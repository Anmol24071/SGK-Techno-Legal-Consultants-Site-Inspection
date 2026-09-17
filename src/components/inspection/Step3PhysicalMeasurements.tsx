"use client";

import React, { useEffect, useState } from "react";
import { Ruler, Plus, Trash2, Calculator, Info } from "lucide-react";

interface RoomItem {
  id?: string;
  type: "LIVING" | "BEDROOM" | "PASSAGE" | "KITCHEN" | "BALCONY" | "WASHROOM";
  roomNumber?: number;
  length?: number;
  width?: number;
  area?: number;
  manualOverride?: boolean;
  unit: string;
}

interface Step3Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function Step3PhysicalMeasurements({ data, onChange }: Step3Props) {
  const [unit, setUnit] = useState<string>("sq. ft.");

  // Quantities for dynamic rooms
  const [numBedrooms, setNumBedrooms] = useState<number>(2);
  const [numBalconies, setNumBalconies] = useState<number>(1);
  const [numWashrooms, setNumWashrooms] = useState<number>(2);

  const rooms: RoomItem[] = data.rooms || [];

  // Helper to find or initialize a room
  const getRoom = (type: string, number?: number): RoomItem => {
    const found = rooms.find((r) => r.type === type && (number ? r.roomNumber === number : true));
    return (
      found || {
        type: type as any,
        roomNumber: number,
        length: undefined,
        width: undefined,
        area: undefined,
        manualOverride: false,
        unit,
      }
    );
  };

  // Sync bedrooms quantity
  useEffect(() => {
    const currentBedrooms = rooms.filter((r) => r.type === "BEDROOM");
    if (currentBedrooms.length > 0) {
      setNumBedrooms(currentBedrooms.length);
    }
    const currentBalconies = rooms.filter((r) => r.type === "BALCONY");
    if (currentBalconies.length > 0) {
      setNumBalconies(currentBalconies.length);
    }
    const currentWashrooms = rooms.filter((r) => r.type === "WASHROOM");
    if (currentWashrooms.length > 0) {
      setNumWashrooms(currentWashrooms.length);
    }
  }, []);

  const updateRoomData = (type: string, roomNumber: number | undefined, field: string, val: any) => {
    let updatedRooms = [...rooms];
    const index = updatedRooms.findIndex(
      (r) => r.type === type && (roomNumber !== undefined ? r.roomNumber === roomNumber : true)
    );

    let targetRoom: RoomItem = index >= 0 ? { ...updatedRooms[index] } : { type: type as any, roomNumber, unit };

    if (field === "length") {
      targetRoom.length = val ? parseFloat(val) : undefined;
    } else if (field === "width") {
      targetRoom.width = val ? parseFloat(val) : undefined;
    } else if (field === "area") {
      targetRoom.area = val ? parseFloat(val) : undefined;
    } else if (field === "manualOverride") {
      targetRoom.manualOverride = Boolean(val);
    }

    // Auto calculate Area = Length * Width if not manual override
    if (!targetRoom.manualOverride && targetRoom.length !== undefined && targetRoom.width !== undefined) {
      targetRoom.area = parseFloat((targetRoom.length * targetRoom.width).toFixed(2));
    }

    if (index >= 0) {
      updatedRooms[index] = targetRoom;
    } else {
      updatedRooms.push(targetRoom);
    }

    onChange("rooms", updatedRooms);
  };

  const handleNumBedroomsChange = (newCount: number) => {
    const count = Math.max(0, newCount);
    setNumBedrooms(count);

    let updatedRooms = rooms.filter((r) => r.type !== "BEDROOM");
    for (let i = 1; i <= count; i++) {
      const existing = rooms.find((r) => r.type === "BEDROOM" && r.roomNumber === i);
      updatedRooms.push(existing || { type: "BEDROOM", roomNumber: i, unit });
    }
    onChange("rooms", updatedRooms);
  };

  const handleNumBalconiesChange = (newCount: number) => {
    const count = Math.max(0, newCount);
    setNumBalconies(count);

    let updatedRooms = rooms.filter((r) => r.type !== "BALCONY");
    for (let i = 1; i <= count; i++) {
      const existing = rooms.find((r) => r.type === "BALCONY" && r.roomNumber === i);
      updatedRooms.push(existing || { type: "BALCONY", roomNumber: i, unit });
    }
    onChange("rooms", updatedRooms);
  };

  const handleNumWashroomsChange = (newCount: number) => {
    const count = Math.max(0, newCount);
    setNumWashrooms(count);

    let updatedRooms = rooms.filter((r) => r.type !== "WASHROOM");
    for (let i = 1; i <= count; i++) {
      const existing = rooms.find((r) => r.type === "WASHROOM" && r.roomNumber === i);
      updatedRooms.push(existing || { type: "WASHROOM", roomNumber: i, unit });
    }
    onChange("rooms", updatedRooms);
  };

  const renderRoomRow = (title: string, type: string, roomNumber?: number) => {
    const room = getRoom(type, roomNumber);

    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-blue-600" />
            <span>{title}</span>
          </h4>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={room.manualOverride || false}
              onChange={(e) => updateRoomData(type, roomNumber, "manualOverride", e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Manual Area Override (Irregular shape)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Length ({unit === "sq. ft." ? "ft" : "m"})</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 14.5"
              value={room.length ?? ""}
              onChange={(e) => updateRoomData(type, roomNumber, "length", e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Width ({unit === "sq. ft." ? "ft" : "m"})</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 12.0"
              value={room.width ?? ""}
              onChange={(e) => updateRoomData(type, roomNumber, "width", e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Total Area ({unit}) {room.manualOverride ? "(Manual)" : "(Auto)"}
            </label>
            <input
              type="number"
              step="0.01"
              disabled={!room.manualOverride}
              placeholder="Area"
              value={room.area ?? ""}
              onChange={(e) => updateRoomData(type, roomNumber, "area", e.target.value)}
              className={`w-full border rounded-lg p-2 text-xs font-bold ${
                room.manualOverride ? "bg-white border-amber-400 text-amber-900" : "bg-slate-100 border-slate-300 text-blue-900"
              }`}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Step Header */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <span>Step 3: Physical Measurement of the Flat</span>
          </h3>
          <p className="text-xs text-slate-500">
            Enter physical dimensions for living room, kitchen, passage, and dynamic bedrooms, balconies, and washrooms. Area calculates automatically as Length × Width.
          </p>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <span className="text-[11px] font-bold text-slate-600 px-2">Unit:</span>
          <button
            type="button"
            onClick={() => setUnit("sq. ft.")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              unit === "sq. ft." ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            sq. ft.
          </button>
          <button
            type="button"
            onClick={() => setUnit("sq. m.")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              unit === "sq. m." ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            sq. m.
          </button>
        </div>
      </div>

      {/* Primary Static Room A */}
      <div className="space-y-4">
        {renderRoomRow("A. Area of Living Room / Hall", "LIVING")}
      </div>

      {/* Dynamic Bedrooms Section (B & C) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl">
          <span className="font-bold text-xs">B. Number of Bedrooms:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNumBedroomsChange(numBedrooms - 1)}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-white flex items-center justify-center border border-slate-700"
            >
              -
            </button>
            <span className="font-bold text-sm w-6 text-center">{numBedrooms}</span>
            <button
              type="button"
              onClick={() => handleNumBedroomsChange(numBedrooms + 1)}
              className="w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white flex items-center justify-center shadow"
            >
              +
            </button>
          </div>
        </div>

        {Array.from({ length: numBedrooms }, (_, i) => i + 1).map((num) =>
          renderRoomRow(`C. Area of Bedroom ${num}`, "BEDROOM", num)
        )}
      </div>

      {/* Primary Static Rooms D & E */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        {renderRoomRow("D. Area of Passage", "PASSAGE")}
        {renderRoomRow("E. Area of Kitchen", "KITCHEN")}
      </div>

      {/* Dynamic Balconies Section (F & G) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl">
          <span className="font-bold text-xs">F. Number of Balconies:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNumBalconiesChange(numBalconies - 1)}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-white flex items-center justify-center border border-slate-700"
            >
              -
            </button>
            <span className="font-bold text-sm w-6 text-center">{numBalconies}</span>
            <button
              type="button"
              onClick={() => handleNumBalconiesChange(numBalconies + 1)}
              className="w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white flex items-center justify-center shadow"
            >
              +
            </button>
          </div>
        </div>

        {Array.from({ length: numBalconies }, (_, i) => i + 1).map((num) =>
          renderRoomRow(`G. Area of Balcony ${num}`, "BALCONY", num)
        )}
      </div>

      {/* Dynamic Washrooms Section (H & I) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl">
          <span className="font-bold text-xs">H. Number of Washrooms:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleNumWashroomsChange(numWashrooms - 1)}
              className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-white flex items-center justify-center border border-slate-700"
            >
              -
            </button>
            <span className="font-bold text-sm w-6 text-center">{numWashrooms}</span>
            <button
              type="button"
              onClick={() => handleNumWashroomsChange(numWashrooms + 1)}
              className="w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white flex items-center justify-center shadow"
            >
              +
            </button>
          </div>
        </div>

        {Array.from({ length: numWashrooms }, (_, i) => i + 1).map((num) =>
          renderRoomRow(`I. Area of Washroom ${num}`, "WASHROOM", num)
        )}
      </div>

    </div>
  );
}
