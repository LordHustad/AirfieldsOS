import React from 'react';
import { Stand, Resource, Flight } from '../types/airport';
import { Plane, Fuel, AlertOctagon, CheckCircle2, Navigation } from 'lucide-react';

interface ApronMapProps {
  stands: Stand[];
  flights: Flight[];
  resources: Resource[];
  selectedFlightId: string | null;
  onSelectFlight: (flightId: string) => void;
  onSelectStand: (standId: string) => void;
}

export const ApronMap: React.FC<ApronMapProps> = ({
  stands,
  flights,
  resources,
  selectedFlightId,
  onSelectFlight,
  onSelectStand,
}) => {
  const f17 = resources.find((r) => r.id === 'F17');
  const f12 = resources.find((r) => r.id === 'F12');
  const isF17Broken = f17?.availability === 'BROKEN_DOWN';
  const isF12Reassigned = f12?.assignedFlightId === 'BA123';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-['Chakra_Petch']">
            Apron Dynamic Surface Map • Terminal 1 Ramp
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Nominal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Caution / Turnaround
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Equipment Fault
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[16/9] min-h-[300px] bg-slate-950 rounded-lg border border-slate-800/80 p-2 overflow-hidden select-none">
        {/* Apron Markings & Taxiway Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Pier A Building */}
          <rect x="5%" y="4%" width="90%" height="8%" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
          <text x="50%" y="9%" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
            PIER A CONCOURSE — DOMESTIC & SHENGEN GATES
          </text>

          {/* Taxiways */}
          <line x1="5%" y1="52%" x2="95%" y2="52%" stroke="#475569" strokeWidth="2" strokeDasharray="6 4" />
          <line x1="5%" y1="54%" x2="95%" y2="54%" stroke="#f59e0b" strokeWidth="1.2" />
          <text x="7%" y="50%" fill="#94a3b8" fontSize="9" fontFamily="monospace">
            TAXIWAY ALPHA (A)
          </text>

          {/* Pier B Concourse */}
          <rect x="15%" y="86%" width="70%" height="8%" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
          <text x="50%" y="91%" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
            PIER B CONCOURSE — INTERNATIONAL WIDEBODY
          </text>

          {/* Dispatch Reassignment Vector when F12 is routed to A12 */}
          {isF12Reassigned && (
            <path
              d="M 680 180 Q 550 220 440 180"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Stands Container */}
        <div className="relative w-full h-full flex flex-col justify-between py-6 px-4">
          {/* Top Row: Pier A Stands (A11, A12, A13) */}
          <div className="grid grid-cols-3 gap-4 h-[42%]">
            {stands.slice(0, 3).map((stand) => {
              const flight = flights.find((f) => f.id === stand.assignedFlightId);
              const isTargetA12 = stand.id === 'A12';
              const isSelected = flight && flight.id === selectedFlightId;

              return (
                <div
                  key={stand.id}
                  id={`stand-node-${stand.id}`}
                  onClick={() => {
                    onSelectStand(stand.id);
                    if (flight) onSelectFlight(flight.id);
                  }}
                  className={`relative rounded-lg p-2.5 flex flex-col justify-between transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                      : isTargetA12 && isF17Broken && !isF12Reassigned
                      ? 'border-red-500/80 bg-red-950/30 animate-pulse'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  {/* Stand Header Tag */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-amber-400 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800">
                      {stand.id}
                    </span>
                    <span className="text-[10px] text-slate-400">{stand.maxAircraftSize}</span>
                  </div>

                  {/* Docked Aircraft Visual */}
                  {flight ? (
                    <div className="my-1 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                        <Plane className="w-5 h-5 -rotate-45 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-slate-100">
                            {flight.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {flight.aircraftType}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {flight.nextDestination} • ETD {flight.etd}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-xs font-mono text-slate-500 my-auto">
                      STAND OPEN
                    </div>
                  )}

                  {/* GSE Assets Positioned on Stand */}
                  <div className="flex items-center gap-1 text-[10px] font-mono pt-1 border-t border-slate-800/80">
                    {/* Fuel Truck Indicator */}
                    {isTargetA12 ? (
                      <span
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                          isF17Broken
                            ? isF12Reassigned
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800 animate-bounce'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Fuel className="w-3 h-3" />
                        {isF12Reassigned ? 'F12 REASSIGNED' : isF17Broken ? 'F17 BROKEN' : 'F17 DOCKED'}
                      </span>
                    ) : (
                      <span className="text-slate-400">GSE: 3 Units</span>
                    )}

                    {isTargetA12 && isF17Broken && !isF12Reassigned && (
                      <span className="ml-auto text-red-400 flex items-center gap-0.5 text-[10px] font-bold">
                        <AlertOctagon className="w-3 h-3" /> Turnaround Stall
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Row: Pier B Stands (B21, B22) */}
          <div className="grid grid-cols-2 gap-6 h-[42%] max-w-2xl mx-auto w-full">
            {stands.slice(3, 5).map((stand) => {
              const flight = flights.find((f) => f.id === stand.assignedFlightId);
              const isSelected = flight && flight.id === selectedFlightId;

              return (
                <div
                  key={stand.id}
                  id={`stand-node-${stand.id}`}
                  onClick={() => {
                    onSelectStand(stand.id);
                    if (flight) onSelectFlight(flight.id);
                  }}
                  className={`relative rounded-lg p-2.5 flex flex-col justify-between transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-amber-400 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800">
                      {stand.id}
                    </span>
                    <span className="text-[10px] text-sky-400 font-mono">HEAVY WIDEBODY</span>
                  </div>

                  {flight ? (
                    <div className="my-1 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                        <Plane className="w-5 h-5 -rotate-45 text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-slate-100">
                            {flight.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {flight.aircraftType}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {flight.nextDestination} • ETD {flight.etd}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-xs font-mono text-slate-500 my-auto">
                      STAND OPEN
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-800/80 text-slate-400">
                    <span>Bowser: {stand.id === 'B21' ? 'F11 (Ready)' : 'Hydrant'}</span>
                    <span>GPU Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
