import React, { useState } from 'react';
import { AirportState, ProposedIntervention } from '../types/airport';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldCheck,
  Plane,
  Fuel,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { formatSimTime } from '../data/initialAirportState';

interface DecisionPanelProps {
  state: AirportState;
  onApproveIntervention: (optionId: string) => void;
  onRejectIntervention: () => void;
  onOpenSimulationModal: () => void;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  state,
  onApproveIntervention,
  onRejectIntervention,
  onOpenSimulationModal,
}) => {
  const currentIntervention = state.currentIntervention;
  const isApproved = currentIntervention?.status === 'APPROVED';
  const isRejected = currentIntervention?.status === 'REJECTED';

  const defaultOptionId =
    currentIntervention?.approvedOptionId ||
    currentIntervention?.recommendedId ||
    currentIntervention?.options[0]?.id ||
    'int-opt-a';

  const [selectedOptionId, setSelectedOptionId] = useState<string>(defaultOptionId);

  const targetFlight = state.flights.find((f) => f.id === (currentIntervention?.flightId || 'BA123'));
  const activeOptions = currentIntervention?.options || [];
  const selectedOption =
    activeOptions.find((o) => o.id === selectedOptionId) ||
    activeOptions.find((o) => o.isRecommended) ||
    activeOptions[0];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-6 flex flex-col max-w-4xl mx-auto shadow-2xl">
      {/* Human-In-The-Loop Safety Banner */}
      <div className="mb-4 px-3.5 py-2 rounded-lg bg-sky-950/40 border border-sky-800/60 flex items-center justify-between text-xs font-mono text-sky-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>HUMAN-IN-THE-LOOP CONTROL: AI Monitors ➔ AI Reasons ➔ Human Approves ➔ AI Executes</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-900/80 px-2 py-0.5 rounded text-sky-200">
          Supervised Agentic Mode
        </span>
      </div>

      {/* Main Intervention Card */}
      <div className="border border-amber-500/40 bg-slate-950/90 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Plane className="w-6 h-6 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-['Chakra_Petch'] tracking-wide text-slate-100">
                  {targetFlight ? targetFlight.id : 'BA123'} — TURNAROUND INTERVENTION
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  STAND {targetFlight?.standId || 'A12'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Aircraft: {targetFlight?.aircraftType || 'A320neo'} • Destination: {targetFlight?.nextDestination || 'MAD'} • Active Disruption: Fuel Pump Failure
              </p>
            </div>
          </div>

          {/* Intervention State Badge */}
          {isApproved ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono font-bold text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>APPROVED & EXECUTED</span>
            </div>
          ) : isRejected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950 text-red-300 border border-red-700 font-mono font-bold text-xs uppercase tracking-wide">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>REJECTED (MANUAL OVERRIDE)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-600/80 font-mono font-bold text-xs uppercase tracking-wide animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>AWAITING OPERATOR APPROVAL</span>
            </div>
          )}
        </div>

        {/* 6 Core Metric Grid (Exactly matching prompt) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Current Projected Departure */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Current projected departure
            </span>
            <span className="text-2xl font-bold text-red-400 tracking-tight">
              {isApproved ? '15:01' : '15:07'}
            </span>
            <span className="text-[10px] text-red-400/80 block mt-0.5">
              {isApproved ? 'Mitigated from 15:27' : '+7m to +27m delay without intervention'}
            </span>
          </div>

          {/* Scheduled Departure */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Scheduled departure
            </span>
            <span className="text-2xl font-bold text-slate-200 tracking-tight">
              {targetFlight?.etd || '15:00'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Original slot lock
            </span>
          </div>

          {/* Expected Departure with Selected Action */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 font-mono">
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider block mb-1">
              Expected departure
            </span>
            <span className="text-2xl font-bold text-emerald-300 tracking-tight">
              {selectedOption?.newProjectedDeparture || '15:01'}
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">
              +{selectedOption?.flightDelayMinutes ?? 1} min slippage
            </span>
          </div>

          {/* Recommended Action */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono col-span-2 md:col-span-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Recommended action
            </span>
            <span className="text-base font-bold text-amber-300 tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{selectedOption?.title || 'Reassign F12'}</span>
            </span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {selectedOption?.description || 'Dispatch standby fuel bowser F12 currently at Apron A to Stand A12.'}
            </p>
          </div>

          {/* Network Impact */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Network impact
            </span>
            <span className="text-2xl font-bold text-sky-400 tracking-tight">
              +{selectedOption?.expectedNetworkDelayMinutes ?? 2} min
            </span>
            <span className="text-[10px] text-sky-400/80 block mt-0.5">
              System-wide cascade
            </span>
          </div>
        </div>

        {/* Reason Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-6 font-mono">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            Reason:
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {selectedOption?.reason ||
              'Lowest downstream disruption (+2 min). Resolves critical fuel task with minimal turnaround delay, preventing gate collision with incoming flight KL1008.'}
          </p>
        </div>

        {/* Multi-Option Selector Tabs */}
        {activeOptions.length > 0 && !isApproved && (
          <div className="mb-6">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Evaluated Candidate Options:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono">
              {activeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedOptionId === opt.id
                      ? 'border-amber-400 bg-amber-500/10 text-slate-100 ring-1 ring-amber-400/40'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{opt.optionLabel}</span>
                    <span className="text-[10px] text-slate-300">
                      Impact: +{opt.expectedNetworkDelayMinutes}m
                    </span>
                  </div>
                  <div className="text-[11px] truncate mt-0.5 text-slate-300">{opt.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons: [APPROVE], [REJECT], [VIEW SIMULATION] */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              id="btn-view-simulation"
              onClick={onOpenSimulationModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs font-bold transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>[VIEW SIMULATION]</span>
            </button>

            {!isApproved && (
              <button
                id="btn-reject-action"
                onClick={onRejectIntervention}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-800/80 hover:bg-red-950/40 text-red-300 font-mono text-xs font-bold transition-colors"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>[REJECT]</span>
              </button>
            )}
          </div>

          {!isApproved ? (
            <button
              id="btn-approve-action"
              onClick={() => onApproveIntervention(selectedOptionId)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/25 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>[APPROVE]</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>Intervention Active in Simulation State</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
