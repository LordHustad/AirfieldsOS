import React, { useState } from 'react';
import { AirportState, Flight } from '../types/airport';
import { ApronMap } from './ApronMap';
import { TurnaroundGantt } from './TurnaroundGantt';
import { formatSimTime } from '../data/initialAirportState';
import {
  Plane,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  Fuel,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

interface ControlCentreProps {
  state: AirportState;
  onSelectFlight: (flightId: string) => void;
  selectedFlightId: string | null;
  onOpenDecisionPanel: () => void;
}

export const ControlCentre: React.FC<ControlCentreProps> = ({
  state,
  onSelectFlight,
  selectedFlightId,
  onOpenDecisionPanel,
}) => {
  const [selectedStandId, setSelectedStandId] = useState<string | null>('A12');

  const activeFlight =
    state.flights.find((f) => f.id === selectedFlightId) ||
    state.flights.find((f) => f.id === 'BA123') ||
    state.flights[0];

  const hasCriticalConflict = state.activeConflicts.length > 0;
  const isApproved = state.currentIntervention?.status === 'APPROVED';

  // Calculate high-level KPIs
  const activeTurnaroundsCount = state.flights.filter(
    (f) => f.status === 'IN_TURNAROUND' || f.status === 'ARRIVED'
  ).length;

  const flightsAtRiskCount = state.flights.filter(
    (f) => f.projectedDepartureMinutes > f.etdMinutes
  ).length;

  const predictedDelaySum = state.flights.reduce(
    (acc, f) => acc + Math.max(0, f.projectedDepartureMinutes - f.etdMinutes),
    0
  );

  return (
    <div className="space-y-6">
      {/* KPI Header Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Airport Status */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Airport Status
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                hasCriticalConflict && !isApproved
                  ? 'bg-red-500 animate-ping'
                  : 'bg-emerald-400'
              }`}
            />
            <span
              className={`text-sm font-bold ${
                hasCriticalConflict && !isApproved ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {hasCriticalConflict && !isApproved ? 'DISRUPTED' : 'NOMINAL / RECOVERED'}
            </span>
          </div>
        </div>

        {/* Active Flights */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Active Flights
          </span>
          <span className="text-xl font-bold text-slate-100">{state.flights.length}</span>
          <span className="text-[10px] text-slate-400 block">Terminal 1 apron</span>
        </div>

        {/* Active Turnarounds */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Active Turnarounds
          </span>
          <span className="text-xl font-bold text-sky-400">{activeTurnaroundsCount}</span>
          <span className="text-[10px] text-slate-400 block">5 Pier stands occupied</span>
        </div>

        {/* Flights At Risk */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Flights At Risk
          </span>
          <span
            className={`text-xl font-bold ${
              flightsAtRiskCount > 0 ? 'text-amber-400' : 'text-slate-100'
            }`}
          >
            {flightsAtRiskCount}
          </span>
          <span className="text-[10px] text-slate-400 block">Target ETD threatened</span>
        </div>

        {/* Resource Conflicts */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Resource Conflicts
          </span>
          <span
            className={`text-xl font-bold ${
              state.activeConflicts.length > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {state.activeConflicts.length}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {state.activeConflicts.length > 0 ? 'F17 pump fault' : '0 bottlenecks'}
          </span>
        </div>

        {/* Predicted Total Delay */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Predicted Total Delay
          </span>
          <span
            className={`text-xl font-bold ${
              predictedDelaySum > 5 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            +{predictedDelaySum}m
          </span>
          <span className="text-[10px] text-slate-400 block">Cumulative network</span>
        </div>
      </div>

      {/* Disruption Alert Notice (If pending approval) */}
      {hasCriticalConflict && !isApproved && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/60 flex flex-wrap items-center justify-between gap-4 font-mono animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-300 text-sm">
                  14:12 DISRUPTION DETECTED: Jet-A1 Bowser F17 Mechanical Breakdown
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-900 text-red-200 uppercase font-bold">
                  Stand A12
                </span>
              </div>
              <p className="text-xs text-red-200/80 mt-0.5">
                BA123 fuelling stalled. Predicted unmitigated delay: +27m with cascading stand collision for KL1008. AI Agent has generated 3 mitigation alternatives.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDecisionPanel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-colors"
          >
            <span>Open Decision Panel</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Apron Surface Map & Flight Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ApronMap
            stands={state.stands}
            flights={state.flights}
            resources={state.resources}
            selectedFlightId={activeFlight.id}
            onSelectFlight={onSelectFlight}
            onSelectStand={setSelectedStandId}
          />
        </div>

        {/* Selected Flight Summary Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-['Chakra_Petch']">
                  Flight Telemetry Card
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {activeFlight.id}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Airline:</span>
                <span className="text-slate-200 font-bold">{activeFlight.airline}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Aircraft:</span>
                <span className="text-slate-200 font-bold">{activeFlight.aircraftType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Stand Assignment:</span>
                <span className="text-amber-400 font-bold">{activeFlight.standId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Route:</span>
                <span className="text-slate-200">
                  {activeFlight.origin} ➔ {activeFlight.nextDestination}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Scheduled ETD:</span>
                <span className="text-slate-200 font-bold">{activeFlight.etd}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Projected Departure:</span>
                <span
                  className={`font-bold ${
                    activeFlight.projectedDepartureMinutes > activeFlight.etdMinutes
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {formatSimTime(activeFlight.projectedDepartureMinutes)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Passengers:</span>
                <span className="text-slate-200">
                  {activeFlight.passengerCount} pax ({activeFlight.connectingPassengers} transfer)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Operational Priority:</span>
                <span className="text-sky-400 font-bold">{activeFlight.priority}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => onSelectFlight('BA123')}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                activeFlight.id === 'BA123'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Focus Target Flight BA123 (Stand A12)
            </button>
          </div>
        </div>
      </div>

      {/* Turnaround Gantt Critical Path Timeline */}
      <TurnaroundGantt flight={activeFlight} simTimeMinutes={state.simTimeMinutes} />

      {/* Airport Fleet Status Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-['Chakra_Petch']">
              Airport Turnaround Schedule & Inbound Sequence (10 Aircraft)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click row to inspect turnaround graph
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-2">Flight</th>
                <th className="pb-2">Airline</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Stand</th>
                <th className="pb-2">ETA</th>
                <th className="pb-2">ETD</th>
                <th className="pb-2">Projected</th>
                <th className="pb-2">Variance</th>
                <th className="pb-2">Pax</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.flights.map((f) => {
                const isSelected = f.id === activeFlight.id;
                const delay = Math.max(0, f.projectedDepartureMinutes - f.etdMinutes);

                return (
                  <tr
                    key={f.id}
                    onClick={() => onSelectFlight(f.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 text-slate-100 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-2.5 font-bold text-amber-400">{f.id}</td>
                    <td className="py-2.5">{f.airline}</td>
                    <td className="py-2.5 text-slate-400">{f.aircraftType}</td>
                    <td className="py-2.5 font-bold">{f.standId}</td>
                    <td className="py-2.5 text-slate-400">{f.eta}</td>
                    <td className="py-2.5">{f.etd}</td>
                    <td className="py-2.5 font-bold">{formatSimTime(f.projectedDepartureMinutes)}</td>
                    <td className="py-2.5">
                      {delay > 0 ? (
                        <span className="text-red-400 font-bold">+{delay}m</span>
                      ) : (
                        <span className="text-emerald-400">ON TIME</span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-400">{f.passengerCount}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'IN_TURNAROUND'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : f.status === 'ARRIVED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {f.status}
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
