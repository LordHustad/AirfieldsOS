import React, { useState } from 'react';
import { ATSULogEntry, AircraftMovement, MovementKind } from '../types/airfield';
import { X, Radio, Check, Plane, Fuel } from 'lucide-react';
import { getBaseLandingFee } from '../utils/feeCalculator';

interface LogMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (entry: Omit<ATSULogEntry, 'id' | 'logSequence'>, fuelLiters?: number) => void;
  nextSeqNumber: number;
}

const COMMON_AIRCRAFT = [
  { type: 'PA-28-161 Warrior', mtow: 1055 },
  { type: 'Cessna 172SP Skyhawk', mtow: 1157 },
  { type: 'Cirrus SR22T G6', mtow: 1633 },
  { type: 'Diamond DA42 Twin Star', mtow: 1999 },
  { type: 'Piper PA-18 Super Cub', mtow: 794 },
  { type: 'Robin DR400/180', mtow: 1000 },
  { type: 'Pilatus PC-12/47E', mtow: 4740 },
  { type: 'Flight Design CT2K (Microlight)', mtow: 450 },
];

export const LogMovementModal: React.FC<LogMovementModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  nextSeqNumber,
}) => {
  if (!isOpen) return null;

  const [callsign, setCallsign] = useState('');
  const [aircraftType, setAircraftType] = useState('PA-28-161 Warrior');
  const [mtowKg, setMtowKg] = useState(1055);
  const [pilotName, setPilotName] = useState('');
  const [movementType, setMovementType] = useState<'ARR' | 'DEP' | 'T&G' | 'TRANSIT'>('ARR');
  const [flightRules, setFlightRules] = useState<'VFR' | 'IFR'>('VFR');
  const [runway, setRunway] = useState('24');
  const [pob, setPob] = useState(1);
  const [routeFrom, setRouteFrom] = useState('EGTF');
  const [routeTo, setRouteTo] = useState('EGMS');
  const [touchAndGoCompleted, setTouchAndGoCompleted] = useState(0);
  const [radioRemarks, setRadioRemarks] = useState('');
  const [fuelUpliftLiters, setFuelUpliftLiters] = useState(0);

  const handleSelectCommonType = (type: string, mtow: number) => {
    setAircraftType(type);
    setMtowKg(mtow);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) return;

    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
    const timestampUtc = `${utcHours}:${utcMins} UTC`;

    // Compute base fee
    const baseFee = getBaseLandingFee(mtowKg);
    const circuitFee = touchAndGoCompleted * 10;
    const computedFee = movementType === 'DEP' || movementType === 'TRANSIT' ? 0 : baseFee + circuitFee;

    onSaveLog(
      {
        timestampUtc,
        timestampMinutes: now.getUTCHours() * 60 + now.getUTCMinutes(),
        callsign: callsign.toUpperCase().trim(),
        aircraftType,
        mtowKg,
        pilotName: pilotName || 'Visiting Pilot',
        movementType,
        flightRules,
        runway,
        pob,
        routeFrom: routeFrom.toUpperCase(),
        routeTo: routeTo.toUpperCase(),
        atsuServiceProvided: 'A/G Radio',
        touchAndGoCompleted,
        radioLogRemarks:
          radioRemarks || `Reported ${runway} in use, QNH 1018 passed. Movement logged.`,
        feeCalculatedGbp: computedFee,
        paymentMethod: 'INVOICED',
      },
      fuelUpliftLiters
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-['Chakra_Petch']">
              Log ATSU Radio & Flight Movement (Seq #{nextSeqNumber})
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Quick preset selector for common GA aircraft */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-bold">Quick Aircraft Preset:</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_AIRCRAFT.map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => handleSelectCommonType(item.type, item.mtow)}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    aircraftType === item.type
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.type} ({item.mtow}kg)
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Aircraft Callsign / Reg *</label>
              <input
                type="text"
                required
                placeholder="e.g. G-BTAW or N452X"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 uppercase font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Aircraft Type</label>
              <input
                type="text"
                value={aircraftType}
                onChange={(e) => setAircraftType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">MTOW Weight (kg)</label>
              <input
                type="number"
                value={mtowKg}
                onChange={(e) => setMtowKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Pilot in Command (PIC)</label>
              <input
                type="text"
                placeholder="Pilot Name"
                value={pilotName}
                onChange={(e) => setPilotName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Movement Type</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="ARR">ARR (Full Stop Arrival)</option>
                <option value="DEP">DEP (Departure)</option>
                <option value="T&G">T&G (Circuit / Touch & Go)</option>
                <option value="TRANSIT">TRANSIT (Overhead Transit)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Runway In Use</label>
              <select
                value={runway}
                onChange={(e) => setRunway(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="24">24 (Asphalt 880m)</option>
                <option value="24G">24G (Grass Strip)</option>
                <option value="06">06 (Asphalt)</option>
                <option value="06G">06G (Grass)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Persons on Board</label>
              <input
                type="number"
                min="1"
                max="19"
                value={pob}
                onChange={(e) => setPob(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Origin (ICAO)</label>
              <input
                type="text"
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 uppercase focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Destination (ICAO)</label>
              <input
                type="text"
                value={routeTo}
                onChange={(e) => setRouteTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 uppercase focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">T&G Circuits (if any)</label>
              <input
                type="number"
                min="0"
                max="12"
                value={touchAndGoCompleted}
                onChange={(e) => setTouchAndGoCompleted(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Radio Log Remarks (Statutory Text)</label>
            <input
              type="text"
              placeholder="e.g. Joined overhead 2000ft, deadside descent, landed 14:18. Taxied to Apron H2."
              value={radioRemarks}
              onChange={(e) => setRadioRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Fuel Uplift (Litres, Optional)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={fuelUpliftLiters}
              onChange={(e) => setFuelUpliftLiters(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Record Statutory Log & Compute Fee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
