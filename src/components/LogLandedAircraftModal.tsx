import React, { useState } from 'react';
import { AircraftMovement, Runway, ParkingBay, AirfieldFeeSchedule } from '../types/airfield';
import { X, PlaneLanding, Check } from 'lucide-react';
import { getBaseLandingFee } from '../utils/feeCalculator';

interface LogLandedAircraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  runways: Runway[];
  parkingBays: ParkingBay[];
  feeSchedule?: AirfieldFeeSchedule;
  onSaveLandedAircraft: (movement: AircraftMovement) => void;
}

export const LogLandedAircraftModal: React.FC<LogLandedAircraftModalProps> = ({
  isOpen,
  onClose,
  runways,
  parkingBays,
  feeSchedule,
  onSaveLandedAircraft,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
  const currentTime = `${utcHours}:${utcMins}`;

  const [callsign, setCallsign] = useState('');
  const [aircraftType, setAircraftType] = useState('PA-28-161 Warrior');
  const [mtowKg, setMtowKg] = useState(1055);
  const [pilotName, setPilotName] = useState('');
  const [pilotPhone, setPilotPhone] = useState('');
  const [homeBase, setHomeBase] = useState('EGTO');
  const [touchdownTime, setTouchdownTime] = useState(currentTime);
  const [runway, setRunway] = useState(runways[0]?.designation || '24');
  const [parkingStand, setParkingStand] = useState(parkingBays[0]?.name || 'Apron H1');
  const [touchAndGoCount, setTouchAndGoCount] = useState(0);
  const [fuelUpliftLiters, setFuelUpliftLiters] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) return;

    const newMov: AircraftMovement = {
      id: `mov-${Date.now()}`,
      callsign: callsign.toUpperCase().trim(),
      aircraftType,
      mtowKg,
      category: 'VISITING_PRIVATE',
      pilotName: pilotName || 'Walk-in Visiting Pilot',
      pilotPhone: pilotPhone || '+44 7700 900123',
      pilotEmail: `${callsign.toLowerCase().replace(/[^a-z0-9]/g, '')}@pilot.co.uk`,
      homeBase: homeBase.toUpperCase(),
      pprNumber: `WALKIN-${Math.floor(1000 + Math.random() * 9000)}`,
      flightRules: 'VFR',
      pob: 1,
      movementKind: 'FULL_STOP_LANDING',
      status: 'LANDED_TAXIED',
      scheduledTime: touchdownTime,
      actualTime: touchdownTime,
      etaMinutes: now.getUTCHours() * 60 + now.getUTCMinutes(),
      runway,
      parkingBayId: parkingStand,
      touchAndGoCount,
      fuelUpliftLiters,
      fuelType: fuelUpliftLiters > 0 ? 'AVGAS_100LL' : undefined,
      outOfHours: false,
      overnightStay: false,
      noiseAbatementAcknowledged: true,
      pilotNotes: notes || 'Unplanned / Walk-in arrival recorded directly by airfield operator.',
      activeAlerts: [],
      billingStatus: 'UNBILLED',
    };

    onSaveLandedAircraft(newMov);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-mono">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/75">
          <div className="flex items-center gap-2">
            <PlaneLanding className="w-5 h-5 text-zinc-950" />
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Log Landed Aircraft (Touchdown Record)
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-zinc-500 text-[11px]">
            Record an aircraft that has already landed (walk-in arrivals, diversions, or unlogged flights). This immediately creates a movement record, assigns a parking bay, and queues billing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Callsign / Reg *</label>
              <input
                type="text"
                required
                placeholder="e.g. G-OCLK"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 uppercase font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Aircraft Type</label>
              <input
                type="text"
                value={aircraftType}
                onChange={(e) => setAircraftType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">MTOW (kg)</label>
              <input
                type="number"
                value={mtowKg}
                onChange={(e) => setMtowKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Actual Touchdown Time (UTC)</label>
              <input
                type="text"
                value={touchdownTime}
                onChange={(e) => setTouchdownTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Runway Used</label>
              <select
                value={runway}
                onChange={(e) => setRunway(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              >
                {runways.map((r) => (
                  <option key={r.id} value={r.designation}>
                    {r.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Allocated Stand</label>
              <select
                value={parkingStand}
                onChange={(e) => setParkingStand(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              >
                {parkingBays.map((bay) => (
                  <option key={bay.id} value={bay.name}>
                    {bay.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Pilot in Command (PIC)</label>
              <input
                type="text"
                placeholder="Pilot Name"
                value={pilotName}
                onChange={(e) => setPilotName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Origin Aerodrome</label>
              <input
                type="text"
                value={homeBase}
                onChange={(e) => setHomeBase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 uppercase focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Fuel Uplift (Liters)</label>
              <input
                type="number"
                min="0"
                value={fuelUpliftLiters}
                onChange={(e) => setFuelUpliftLiters(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-600 mb-1 font-medium">Operator Notes / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Landed smoothly, taxied to fuel pump, parking for 2 hours."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-medium uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Record Landed Airplane in Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
