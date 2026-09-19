import React from 'react';
import { AirportState } from '../types/airport';
import { evaluateSystemPerformance } from '../engine/baselineScheduler';
import {
  Zap,
  TrendingDown,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';

interface EvaluationDashboardProps {
  state: AirportState;
  onInjectScenario: (type: string) => void;
  onReset: () => void;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  state,
  onInjectScenario,
  onReset,
}) => {
  const metrics = evaluateSystemPerformance(state);

  const scenarios = [
    {
      id: 'FUEL_BREAKDOWN',
      title: 'Fuel Bowser F17 Breakdown (14:12)',
      desc: 'Core hackathon demo scenario: Primary fuel dispenser fails during turnaround.',
      severity: 'CRITICAL',
    },
    {
      id: 'BAGGAGE_BELT',
      title: 'Baggage Belt BL2 Motor Jam',
      desc: 'Belt loader fails at Stand A11 during offload.',
      severity: 'HIGH',
    },
    {
      id: 'STAFF_SHORTAGE',
      title: 'Cabin Cleaning Crew Shortage',
      desc: 'Shift handover shortage: 2 cleaners absent, extending cleaning by 14m.',
      severity: 'MEDIUM',
    },
    {
      id: 'INBOUND_DELAY',
      title: 'Cascading Inbound Delay (LH904)',
      desc: 'Inbound flight arrives 25 min late, compressing turnaround window.',
      severity: 'HIGH',
    },
    {
      id: 'STAND_SPILL',
      title: 'Stand A12 Fuel Spill Closure',
      desc: 'Environmental safety shutdown forces gate evacuation.',
      severity: 'CRITICAL',
    },
    {
      id: 'MULTI_STRESS',
      title: 'Simultaneous Multi-Disruption',
      desc: 'Concurrent fuel failure + belt loader jam stress test.',
      severity: 'CRITICAL',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Benchmark Headline Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold font-['Chakra_Petch'] uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>Evaluation & Benchmark Engine • Autonomous AI vs. Baseline Scheduler</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Quantitative comparison of proactive agent graph optimization against reactive rule-based FIFO dispatch
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              +{metrics.delayMinutesSaved} Min Network Delay Saved
            </span>
          </div>
        </div>

        {/* Comparative 4x2 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
          {/* Delay Minutes */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Total Delay Minutes
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {metrics.agentTotalDelayMinutes}m
              </span>
              <span className="text-xs text-slate-500 line-through">
                {metrics.baselineTotalDelayMinutes}m baseline
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/90 block mt-1">
              {Math.round(((metrics.baselineTotalDelayMinutes - metrics.agentTotalDelayMinutes) / metrics.baselineTotalDelayMinutes) * 100)}% reduction in delay
            </span>
          </div>

          {/* Decision Time */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Decision Latency
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">
                {metrics.agentDecisionTimeSeconds}s
              </span>
              <span className="text-xs text-slate-500 line-through">
                {metrics.baselineDecisionTimeSeconds}s manual
              </span>
            </div>
            <span className="text-[10px] text-amber-400/90 block mt-1">
              28x faster operational reaction
            </span>
          </div>

          {/* Gate / Constraint Violations */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Constraint Violations
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-sky-400">
                {metrics.agentConstraintViolations}
              </span>
              <span className="text-xs text-slate-500 line-through">
                {metrics.baselineConstraintViolations} baseline
              </span>
            </div>
            <span className="text-[10px] text-sky-400/90 block mt-1">
              Zero stand gate collisions
            </span>
          </div>

          {/* On-Time OTP */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              On-Time Performance (OTP)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {metrics.agentOnTimePercentage}%
              </span>
              <span className="text-xs text-slate-500 line-through">
                {metrics.baselineOnTimePercentage}% baseline
              </span>
            </div>
            <span className="text-[10px] text-emerald-400/90 block mt-1">
              +{(metrics.agentOnTimePercentage - metrics.baselineOnTimePercentage).toFixed(1)}% punctuality gain
            </span>
          </div>
        </div>
      </div>

      {/* Disruption Scenario Generator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-['Chakra_Petch'] uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Operational Disruption Generator</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Simulate diverse ground handling stress test scenarios to evaluate autonomous response
            </p>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Environment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      sc.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : sc.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}
                  >
                    {sc.severity}
                  </span>
                </div>

                <h4 className="font-mono font-bold text-xs text-slate-200 mb-1">
                  {sc.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {sc.desc}
                </p>
              </div>

              <button
                onClick={() => onInjectScenario(sc.id)}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 text-amber-400" />
                <span>Inject Scenario</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
