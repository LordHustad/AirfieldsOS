import React, { useState } from 'react';
import { AircraftMovement, OperationalAlert, AirfieldWeather } from '../types/airfield';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wind,
  Plane,
  Volume2,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  Clock,
} from 'lucide-react';

interface DecisionPanelViewProps {
  movements: AircraftMovement[];
  weather: AirfieldWeather;
  onApprovePPR: (movementId: string) => void;
  onRejectPPR: (movementId: string) => void;
  onResolveAlert: (movementId: string, alertId: string) => void;
  onAssignRunway: (movementId: string, runway: string) => void;
}

export const DecisionPanelView: React.FC<DecisionPanelViewProps> = ({
  movements,
  weather,
  onApprovePPR,
  onRejectPPR,
  onResolveAlert,
  onAssignRunway,
}) => {
  // Movements with active operational alerts or pending PPR
  const pendingMovements = movements.filter(
    (m) => m.activeAlerts.length > 0 || m.status === 'PPR_REQUESTED' || m.status === 'OVERHEAD_JOIN'
  );

  const [selectedMovementId, setSelectedMovementId] = useState<string>(
    pendingMovements[0]?.id || movements[1]?.id || movements[0]?.id
  );

  const activeMovement = movements.find((m) => m.id === selectedMovementId) || movements[0];

  return (
    <div className="space-y-6 font-mono">
      {/* Human-in-the-Loop Safety Banner for GA Airfield GM */}
      <div className="p-3.5 rounded-xl bg-zinc-950 text-white border border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-300" />
          <span>
            AERODROME MANAGER DECISION SYSTEM: AI Pre-Checks VFR Constraints ➔ Human GM Authorizes PPR & Clearances
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 px-2.5 py-0.5 rounded text-zinc-300">
          UK CAA Aerodrome Operations Safety Directive
        </span>
      </div>

      {/* Main Split: Movement Selector Tabs & Decision Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Aircraft Requiring Decision */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Queue Requiring GM Authorization ({pendingMovements.length})
            </h3>
          </div>

          <div className="space-y-2">
            {pendingMovements.map((mov) => {
              const isSelected = mov.id === selectedMovementId;
              const hasCritical = mov.activeAlerts.some((a) => a.severity === 'CRITICAL');
              const hasWarning = mov.activeAlerts.some((a) => a.severity === 'WARNING');

              return (
                <div
                  key={mov.id}
                  onClick={() => setSelectedMovementId(mov.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-zinc-950 bg-zinc-100 text-zinc-950 shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-950 text-xs">{mov.callsign}</span>
                      <span className="text-[10px] text-zinc-500">({mov.aircraftType})</span>
                    </div>

                    {hasWarning || hasCritical ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300">
                        <AlertTriangle className="w-2.5 h-2.5 text-zinc-700" />
                        {mov.activeAlerts.length} Alert
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                        {mov.status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-zinc-600 truncate">
                    {mov.pilotName} • {mov.homeBase}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 pt-1 border-t border-zinc-100">
                    <span>ETA: {mov.scheduledTime}</span>
                    <span>MTOW: {mov.mtowKg}kg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (Span 2): Comprehensive Decision Workbench Card */}
        {activeMovement && (
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 relative overflow-hidden shadow-xs">
            {/* Workbench Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                  <Plane className="w-6 h-6 -rotate-45" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold tracking-wide text-zinc-950">
                      {activeMovement.callsign} — {activeMovement.aircraftType}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                      MTOW {activeMovement.mtowKg} KG
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    Pilot: {activeMovement.pilotName} ({activeMovement.pilotPhone}) • From: {activeMovement.homeBase} • Flight Rules: {activeMovement.flightRules}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Scheduled: {activeMovement.scheduledTime}</span>
              </div>
            </div>

            {/* Operational Factor Checks (Crosswind, Circuit, Noise, Weight) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
              {/* Runway & Wind Suitability */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
                  Wind / Crosswind
                </span>
                <span className="text-zinc-950 font-bold text-sm block">
                  {weather.crosswindKnots}kt Crosswind
                </span>
                <span className="text-[10px] text-zinc-500">
                  RWY {weather.activeRunway} nominal
                </span>
              </div>

              {/* Circuit Capacity */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
                  Circuit Density
                </span>
                <span className="text-zinc-950 font-bold text-sm block">
                  2 Aircraft Active
                </span>
                <span className="text-[10px] text-zinc-500">Max 5 capacity</span>
              </div>

              {/* Noise Abatement Status */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
                  Noise Protocol
                </span>
                <span className="font-bold text-sm block text-zinc-950">
                  {activeMovement.noiseAbatementAcknowledged ? 'Briefed & Signed' : 'Pending Briefing'}
                </span>
                <span className="text-[10px] text-zinc-500">Highfield village</span>
              </div>

              {/* Parking Allocation */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
                  Parking Assigned
                </span>
                <span className="text-zinc-950 font-bold text-sm block truncate">
                  {activeMovement.parkingBayId}
                </span>
                <span className="text-[10px] text-zinc-500">Tie-down ready</span>
              </div>
            </div>

            {/* Active Operational Alerts & AI Recommendations */}
            {activeMovement.activeAlerts.length > 0 ? (
              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-zinc-700" />
                  <span>Aerodrome Operational Alerts ({activeMovement.activeAlerts.length})</span>
                </div>

                {activeMovement.activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-950">{alert.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                        {alert.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{alert.description}</p>
                    <div className="p-2.5 rounded-lg bg-white border border-zinc-200 text-[11px] text-zinc-800 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Recommended GM Action:</strong> {alert.recommendedAction}
                      </div>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onResolveAlert(activeMovement.id, alert.id)}
                        className="px-3 py-1 rounded bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-700" />
                        <span>Acknowledge & Clear Alert</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-6 flex items-center gap-3 text-xs text-zinc-900">
                <CheckCircle2 className="w-5 h-5 text-zinc-700" />
                <span>
                  All aerodrome VFR constraints satisfied. Flight cleared for standard entry into pattern.
                </span>
              </div>
            )}

            {/* Runway Assignment Switcher */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-6 text-xs">
              <div className="text-zinc-600 uppercase tracking-wider mb-2 font-bold">
                Runway Assignment Choice:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => onAssignRunway(activeMovement.id, '24 (Asphalt)')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    activeMovement.runway.includes('Asphalt')
                      ? 'bg-zinc-950 border-zinc-950 text-white font-bold'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">RWY 24 (Asphalt • 880m)</div>
                  <div className={`text-[10px] mt-0.5 ${activeMovement.runway.includes('Asphalt') ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    Standard paved strip. Headwind 12.8kt.
                  </div>
                </button>

                <button
                  onClick={() => onAssignRunway(activeMovement.id, '24G (Grass)')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    activeMovement.runway.includes('Grass')
                      ? 'bg-zinc-950 border-zinc-950 text-white font-bold'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">RWY 24G (Grass • 720m)</div>
                  <div className={`text-[10px] mt-0.5 ${activeMovement.runway.includes('Grass') ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    Parallel grass strip. Preferred for taildraggers & vintage.
                  </div>
                </button>
              </div>
            </div>

            {/* Primary Action Buttons: [APPROVE PPR], [REJECT] */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => onRejectPPR(activeMovement.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-900 text-xs font-medium transition-colors"
              >
                <XCircle className="w-4 h-4 text-zinc-600" />
                <span>Refuse PPR / Divert</span>
              </button>

              <button
                onClick={() => onApprovePPR(activeMovement.id)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Approve PPR & Log Clearance</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
