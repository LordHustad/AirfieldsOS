import React, { useState } from 'react';
import {
  Runway,
  ParkingBay,
  AircraftMovement,
  AirfieldWeather,
  FuelStorageTank,
} from '../types/airfield';
import { AerodromeMap } from './AerodromeMap';
import {
  Plane,
  AlertTriangle,
  Fuel,
  Users,
  Clock,
  Radio,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  FileText,
  Send,
  Droplet,
} from 'lucide-react';
import { calculateFlightFees } from '../utils/feeCalculator';

interface ControlCentreViewProps {
  runways: Runway[];
  parkingBays: ParkingBay[];
  movements: AircraftMovement[];
  weather: AirfieldWeather;
  fuelTanks: FuelStorageTank[];
  selectedMovementId: string | null;
  onSelectMovement: (id: string) => void;
  onOpenDecisionPanel: () => void;
  onGenerateInvoice: (movement: AircraftMovement) => void;
  onQuickFuelUplift: (movementId: string, liters: number) => void;
}

export const ControlCentreView: React.FC<ControlCentreViewProps> = ({
  runways,
  parkingBays,
  movements,
  weather,
  fuelTanks,
  selectedMovementId,
  onSelectMovement,
  onOpenDecisionPanel,
  onGenerateInvoice,
  onQuickFuelUplift,
}) => {
  const activeMovement =
    movements.find((m) => m.id === selectedMovementId) ||
    movements.find((m) => m.callsign === 'G-CDEF') ||
    movements[0];

  const activeAlerts = movements.flatMap((m) => m.activeAlerts);
  const circuitCount = movements.filter((m) => m.status === 'IN_CIRCUIT').length;
  const onGroundCount = movements.filter(
    (m) => m.status === 'PARKED' || m.status === 'REFUELING' || m.status === 'LANDED_TAXIED'
  ).length;

  const totalFuelDispensedToday = movements.reduce((sum, m) => sum + (m.fuelUpliftLiters || 0), 0);

  const selectedFlightFees = activeMovement ? calculateFlightFees(activeMovement) : null;

  return (
    <div className="space-y-6">
      {/* 6 Key Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Movements Today */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 font-mono shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            Movements Today
          </span>
          <span className="text-2xl font-bold text-zinc-950">{movements.length}</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">8 arr / 4 dep / 2 t&g</span>
        </div>

        {/* Active Circuit Traffic */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 font-mono shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            Circuit Traffic
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-950">{circuitCount}</span>
            <span className="text-xs text-zinc-500">/ 5 max</span>
          </div>
          <span className="text-[10px] text-zinc-600 block mt-0.5">Nominal capacity</span>
        </div>

        {/* Aircraft On Ground */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 font-mono shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            Aircraft On Ground
          </span>
          <span className="text-2xl font-bold text-zinc-950">{onGroundCount}</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Apron & Hangars</span>
        </div>

        {/* Fuel Farm AVGAS 100LL */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 font-mono shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            AVGAS 100LL Stock
          </span>
          <span className="text-xl font-bold text-zinc-950">16,840 L</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">£2.18/L pump price</span>
        </div>

        {/* Fuel Farm Jet A-1 */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 font-mono shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            Jet A-1 Stock
          </span>
          <span className="text-xl font-bold text-zinc-950">32,150 L</span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Bowser ready</span>
        </div>

        {/* Safety & Operational Alerts */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 font-mono shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-medium">
            Active Alerts
          </span>
          <span className="text-2xl font-bold text-zinc-950">
            {activeAlerts.length}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-0.5">
            {activeAlerts.length > 0 ? 'Review in Decision Panel' : 'Aerodrome nominal'}
          </span>
        </div>
      </div>

      {/* Disruption & Decision Alert Notice Banner */}
      {activeAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-zinc-950 text-white border border-zinc-900 flex flex-wrap items-center justify-between gap-4 font-mono shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  OPERATIONAL ACTIONS REQUIRED ({activeAlerts.length})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 uppercase font-semibold">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Overhead join sequencing (G-CDEF), Noise profile check (G-FLYT), and unbriefed noise waiver (G-ECHO).
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDecisionPanel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <span>Open Decision Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Aerodrome Map & Flight Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AerodromeMap
            runways={runways}
            parkingBays={parkingBays}
            movements={movements}
            weather={weather}
            selectedMovementId={activeMovement?.id || null}
            onSelectMovement={onSelectMovement}
          />
        </div>

        {/* Selected Flight Card & Quick Actions */}
        {activeMovement && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between font-mono shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-zinc-700" />
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Aircraft Movement File
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-950 text-white">
                  {activeMovement.callsign}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Aircraft Type:</span>
                  <span className="text-zinc-900 font-bold">{activeMovement.aircraftType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">MTOW:</span>
                  <span className="text-zinc-900 font-bold">{activeMovement.mtowKg} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Pilot in Command:</span>
                  <span className="text-zinc-900">{activeMovement.pilotName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Home Base / Origin:</span>
                  <span className="text-zinc-900 font-bold">{activeMovement.homeBase}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Movement Kind:</span>
                  <span className="text-zinc-900">{activeMovement.movementKind.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">PPR Number:</span>
                  <span className="text-zinc-900 font-bold">{activeMovement.pprNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Assigned Stand:</span>
                  <span className="text-zinc-900 font-bold">{activeMovement.parkingBayId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-500">Fuel Uplift:</span>
                  <span className="text-zinc-900 font-bold">
                    {activeMovement.fuelUpliftLiters > 0
                      ? `${activeMovement.fuelUpliftLiters} L (${activeMovement.fuelType})`
                      : 'None requested'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Est. Total Fees:</span>
                  <span className="text-zinc-950 font-bold text-sm">
                    £{selectedFlightFees ? selectedFlightFees.totalGbp.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 border-t border-zinc-200 mt-4 space-y-2">
              <button
                onClick={() => onGenerateInvoice(activeMovement)}
                className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Generate Official Invoice</span>
              </button>

              <button
                onClick={() => onQuickFuelUplift(activeMovement.id, 50)}
                className="w-full py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Fuel className="w-3.5 h-3.5 text-zinc-600" />
                <span>Quick Record Fuel (+50L AVGAS)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today's Aerodrome Movement Roster Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 overflow-hidden font-mono shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-zinc-700" />
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
              Aerodrome Movements & PPR Master Schedule
            </h3>
          </div>
          <span className="text-xs text-zinc-500">
            Click row to inspect aircraft telemetry & billings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 text-[11px] uppercase tracking-wider bg-zinc-50/70">
                <th className="py-2.5 px-3">Callsign</th>
                <th className="py-2.5 px-3">Aircraft</th>
                <th className="py-2.5 px-3">MTOW</th>
                <th className="py-2.5 px-3">Pilot</th>
                <th className="py-2.5 px-3">Base</th>
                <th className="py-2.5 px-3">Kind</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Fuel</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {movements.map((m) => {
                const isSelected = m.id === activeMovement?.id;
                const fees = calculateFlightFees(m);

                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMovement(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 font-bold'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-zinc-950">{m.callsign}</td>
                    <td className="py-2.5 px-3 text-zinc-800">{m.aircraftType}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{m.mtowKg} kg</td>
                    <td className="py-2.5 px-3 text-zinc-800">{m.pilotName}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{m.homeBase}</td>
                    <td className="py-2.5 px-3 text-zinc-700">
                      {m.movementKind === 'TOUCH_AND_GO'
                        ? `T&G (${m.touchAndGoCount}x)`
                        : m.movementKind.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{m.actualTime || m.scheduledTime}</td>
                    <td className="py-2.5 px-3 font-medium text-zinc-900">
                      {m.fuelUpliftLiters > 0 ? `${m.fuelUpliftLiters} L` : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {m.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300">
                        £{fees.totalGbp.toFixed(2)} ({m.billingStatus})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
