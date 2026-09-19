import React from 'react';
import { ProposedIntervention } from '../types/airport';
import { X, CheckCircle2, AlertOctagon, TrendingUp, Users, ArrowRight, ShieldCheck } from 'lucide-react';

interface SimulationComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ProposedIntervention[];
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  onApprove: (id: string) => void;
}

export const SimulationComparisonModal: React.FC<SimulationComparisonModalProps> = ({
  isOpen,
  onClose,
  options,
  selectedOptionId,
  onSelectOption,
  onApprove,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider font-['Chakra_Petch'] text-slate-100">
                Multi-Intervention Graph Simulation Engine • Comparative Matrix
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Forward Critical Path Method (CPM) propagation across Stand A12 & terminal fleet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparative Columns */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((opt) => {
              const isSelected = opt.id === selectedOptionId;
              const isOptionA = opt.optionLabel === 'OPTION A';
              const isOptionC = opt.optionLabel === 'OPTION C';

              return (
                <div
                  key={opt.id}
                  onClick={() => onSelectOption(opt.id)}
                  className={`rounded-xl p-4 flex flex-col justify-between border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-slate-800/90 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : opt.isRecommended
                      ? 'border-sky-500/50 bg-slate-900/90 hover:border-sky-400'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  {/* Option Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isOptionA
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isOptionC
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {opt.optionLabel}
                      </span>

                      {opt.isRecommended && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700">
                          <ShieldCheck className="w-3 h-3" /> RECOMMENDED
                        </span>
                      )}
                    </div>

                    <h3 className="font-mono font-bold text-sm text-slate-100 mb-1">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {opt.description}
                    </p>

                    {/* Simulation Telemetry KPIs */}
                    <div className="space-y-2.5 font-mono text-xs border-y border-slate-800/80 py-3 my-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">New Departure:</span>
                        <span className="font-bold text-slate-200">
                          {opt.newProjectedDeparture}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target Flight Delay:</span>
                        <span
                          className={`font-bold ${
                            opt.flightDelayMinutes <= 2 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          +{opt.flightDelayMinutes} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Network Cascade:</span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded ${
                            opt.expectedNetworkDelayMinutes <= 2
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-red-950 text-red-300'
                          }`}
                        >
                          +{opt.expectedNetworkDelayMinutes} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Stand A12 Clash:</span>
                        <span
                          className={`font-bold ${
                            isOptionC ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {isOptionC ? 'Triggered (KL1008)' : 'Avoided'}
                        </span>
                      </div>
                    </div>

                    {/* Tradeoffs List */}
                    <div className="space-y-1 mb-4">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Operational Trade-offs:
                      </div>
                      {opt.tradeoffs.map((to, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{to}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Select button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOption(opt.id);
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected Alternative' : 'Select This Option'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Explanation rationale footer */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
            <div className="text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Why Option A is Mathematically Superior:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Dispatching Fuel Bowser F12 from Apron A utilizes an already warm, pre-checked 45,000L dispenser with only 2 minutes of taxiway transit time. It recovers BA123 to push back at 15:01, providing a 14-minute buffer before KLM Flight KL1008 docks at Stand A12 at 15:15. This avoids apron towing gridlock (Option B) and prevents a catastrophic 27-minute departure delay and gate collision (Option C).
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-mono text-xs transition-colors"
          >
            Close Matrix
          </button>

          <button
            onClick={() => {
              onApprove(selectedOptionId);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Approve Selected Action</span>
          </button>
        </div>
      </div>
    </div>
  );
};
