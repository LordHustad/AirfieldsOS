import React, { useState } from 'react';
import { OperationsLogItem } from '../types/airport';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Terminal,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface OperationsFeedProps {
  logs: OperationsLogItem[];
  onOpenDecisionPanel: () => void;
  pendingIntervention: boolean;
}

export const OperationsFeed: React.FC<OperationsFeedProps> = ({
  logs,
  onOpenDecisionPanel,
  pendingIntervention,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'AGENTS' | 'ALERTS'>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALERTS') return log.type === 'ALERT' || log.type === 'PROPOSAL';
    if (filter === 'AGENTS') return log.source !== 'MONITOR' && log.source !== 'HUMAN_OPERATOR';
    return true;
  });

  const getSourceBadge = (source: OperationsLogItem['source']) => {
    switch (source) {
      case 'CONSTRAINT_AGENT':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-800">
            CONSTRAINT AGENT
          </span>
        );
      case 'PLANNING_AGENT':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
            PLANNING AGENT
          </span>
        );
      case 'SIMULATION_ENGINE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
            SIMULATION ENGINE
          </span>
        );
      case 'CONTROLLER_AGENT':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
            CONTROLLER AGENT
          </span>
        );
      case 'HUMAN_OPERATOR':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            HUMAN OPERATOR
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            OPS MONITOR
          </span>
        );
    }
  };

  const getIcon = (type: OperationsLogItem['type']) => {
    switch (type) {
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
      case 'PROPOSAL':
        return <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'SIMULATION':
        return <Activity className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />;
      case 'ACTION':
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col h-full">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider font-['Chakra_Petch'] text-slate-100">
              AI Operations Feed • Live Reasoning Telemetry
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Timestamped agent execution trace, constraint detection & simulation passes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingIntervention && (
            <button
              onClick={onOpenDecisionPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-colors shadow-sm animate-pulse"
            >
              <span>Awaiting Approval (Option A)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'ALL' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('AGENTS')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'AGENTS' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agents Only
            </button>
            <button
              onClick={() => setFilter('ALERTS')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'ALERTS' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Disruptions
            </button>
          </div>
        </div>
      </div>

      {/* Timestamped Event Stream */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 font-mono max-h-[580px]">
        {filteredLogs.slice().reverse().map((log) => {
          return (
            <div
              key={log.id}
              className={`p-3 rounded-lg border transition-all ${
                log.type === 'ALERT'
                  ? 'bg-red-950/20 border-red-500/40 text-red-200 shadow-sm'
                  : log.type === 'PROPOSAL'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : log.type === 'ACTION'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {getIcon(log.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {log.timestamp}
                    </span>
                    {getSourceBadge(log.source)}
                    {log.flightId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-bold border border-slate-700">
                        Flight: {log.flightId}
                      </span>
                    )}
                    {log.resourceId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                        Resource: {log.resourceId}
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-slate-200">
                    {log.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
