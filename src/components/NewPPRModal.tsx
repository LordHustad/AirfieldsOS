import React, { useState } from 'react';
import { AircraftMovement, FuelType } from '../types/airfield';
import { X, Plane, Check, AlertTriangle } from 'lucide-react';

interface NewPPRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPPR: (movement: AircraftMovement) => void;
}

export const NewPPRModal: React.FC<NewPPRModalProps> = ({
  isOpen,
  onClose,
  onAddPPR,
}) => {
  if (!isOpen) return null;

  const [callsign, setCallsign] = useState('');
  const [aircraftType, setAircraftType] = useState('Piper PA-28-161');
  const [mtowKg, setMtowKg] = useState(1055);
  const [pilotName, setPilotName] = useState('');
  const [pilotPhone, setPilotPhone] = useState('');
  const [homeBase, setHomeBase] = useState('EGLD (Denham)');
  const [eta, setEta] = useState('15:30');
  const [fuelNeeded, setFuelNeeded] = useState(0);
  const [fuelType, setFuelType] = useState<FuelType>('AVGAS_100LL');
  const [overnight, setOvernight] = useState(false);
  const [noiseAcknowledged, setNoiseAcknowledged] = useState(true);
  const [pilotNotes, setPilotNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) return;

    const newPprId = `PPR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMov: AircraftMovement = {
      id: `mov-${Date.now()}`,
      callsign: callsign.toUpperCase().trim(),
      aircraftType,
      mtowKg,
      category: 'VISITING_PRIVATE',
      pilotName: pilotName || 'Visiting Pilot',
      pilotPhone: pilotPhone || '+44 7700 900000',
      pilotEmail: `${callsign.toLowerCase().replace(/[^a-z0-9]/g, '')}@pilot.co.uk`,
      homeBase,
      pprNumber: newPprId,
      flightRules: 'VFR',
      pob: 2,
      movementKind: 'FULL_STOP_LANDING',
      status: 'PPR_REQUESTED',
      scheduledTime: eta,
      etaMinutes: 930,
      runway: '24 (Asphalt)',
      parkingBayId: overnight ? 'Hardstanding H2' : 'Grass Tie-down G3',
      touchAndGoCount: 0,
      fuelUpliftLiters: fuelNeeded,
      fuelType: fuelNeeded > 0 ? fuelType : undefined,
      outOfHours: false,
      overnightStay: overnight,
      noiseAbatementAcknowledged: noiseAcknowledged,
      pilotNotes: pilotNotes || 'VFR arrival for aerodrome visit.',
      activeAlerts: !noiseAcknowledged
        ? [
            {
              id: `alt-noise-${Date.now()}`,
              severity: 'WARNING',
              category: 'NOISE_ABATEMENT',
              title: 'Noise Abatement Briefing Incomplete',
              description: 'Pilot has not acknowledged Highfield village noise exclusion procedures.',
              recommendedAction: 'Verify pilot has received aerodrome circuit diagram prior to approval.',
            },
          ]
        : [],
      billingStatus: 'UNBILLED',
    };

    onAddPPR(newMov);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-mono">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-['Chakra_Petch']">
              Submit Prior Permission Required (PPR) Request
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Callsign / Reg *</label>
              <input
                type="text"
                required
                placeholder="e.g. G-HJKM"
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
              <label className="block text-slate-400 mb-1">MTOW (kg)</label>
              <input
                type="number"
                value={mtowKg}
                onChange={(e) => setMtowKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Pilot Name</label>
              <input
                type="text"
                placeholder="Pilot Name"
                value={pilotName}
                onChange={(e) => setPilotName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Contact Telephone</label>
              <input
                type="tel"
                placeholder="+44 7700..."
                value={pilotPhone}
                onChange={(e) => setPilotPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Departure Aerodrome (Origin)</label>
              <input
                type="text"
                value={homeBase}
                onChange={(e) => setHomeBase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Estimated Arrival Time (ETA)</label>
              <input
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Fuel Uplift Required (Litres)</label>
              <input
                type="number"
                min="0"
                value={fuelNeeded}
                onChange={(e) => setFuelNeeded(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="AVGAS_100LL">AVGAS 100LL (£2.18/L)</option>
                <option value="JET_A1">Jet A-1 (£1.18/L)</option>
                <option value="UL91">UL91 Unleaded (£1.98/L)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={overnight}
                onChange={(e) => setOvernight(e.target.checked)}
                className="rounded accent-amber-400"
              />
              <span>Request Overnight Parking (Tie-down / Hangar)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={noiseAcknowledged}
                onChange={(e) => setNoiseAcknowledged(e.target.checked)}
                className="rounded accent-amber-400"
              />
              <span>Pilot has acknowledged Highfield Village Noise Abatement Chart</span>
            </label>
          </div>

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
              <span>Queue into Inbound Decision Panel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
