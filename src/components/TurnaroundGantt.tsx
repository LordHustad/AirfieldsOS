import React from 'react';
import { Flight } from '../types/airport';
import { formatSimTime } from '../data/initialAirportState';
import { Clock, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

interface TurnaroundGanttProps {
  flight: Flight;
  simTimeMinutes: number;
}

export const TurnaroundGantt: React.FC<TurnaroundGanttProps> = ({ flight, simTimeMinutes }) => {
  // Timeline scale: 14:05 (845) to 15:35 (935) -> 90 minutes span
  const startWindow = 845;
  const endWindow = 935;
  const totalWindowMinutes = endWindow - startWindow;

  const getLeftPercent = (timeMinutes: number) => {
    return Math.max(0, Math.min(100, ((timeMinutes - startWindow) / totalWindowMinutes) * 100));
  };

  const getWidthPercent = (durationMinutes: number) => {
    return (durationMinutes / totalWindowMinutes) * 100;
  };

  const simTimeLeft = getLeftPercent(simTimeMinutes);
  const etdLeft = getLeftPercent(flight.etdMinutes);
  const projectedDepartureLeft = getLeftPercent(flight.projectedDepartureMinutes);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm">
            {flight.id}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-['Chakra_Petch']">
              Turnaround Critical Path & Task Execution Graph
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Stand {flight.standId} • {flight.airline} • {flight.aircraftType} • Scheduled Departure:{' '}
              <span className="text-slate-200 font-bold">{flight.etd}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Projected Departure:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                flight.projectedDepartureMinutes > flight.etdMinutes
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {formatSimTime(flight.projectedDepartureMinutes)}
            </span>
          </div>

          {flight.projectedDepartureMinutes > flight.etdMinutes && (
            <div className="flex items-center gap-1 text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>+{flight.projectedDepartureMinutes - flight.etdMinutes}m Slippage</span>
            </div>
          )}
        </div>
      </div>

      {/* Gantt Timeline Graphic */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Timeline Time Ruler */}
          <div className="relative h-6 border-b border-slate-800 text-[10px] font-mono text-slate-400 flex items-center mb-2">
            {[845, 855, 865, 875, 885, 895, 905, 915, 925].map((tick) => (
              <div
                key={tick}
                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${getLeftPercent(tick)}%` }}
              >
                <span>{formatSimTime(tick)}</span>
                <span className="w-0.5 h-1.5 bg-slate-700" />
              </div>
            ))}

            {/* Target Scheduled ETD marker */}
            <div
              className="absolute top-0 bottom-0 z-10 flex flex-col items-center pointer-events-none"
              style={{ left: `${etdLeft}%` }}
            >
              <span className="text-[9px] font-bold text-sky-400 bg-sky-950/90 px-1 rounded border border-sky-800 -translate-y-2">
                TARGET ETD 15:00
              </span>
              <div className="w-[1.5px] h-full bg-sky-400/80 dashed" />
            </div>

            {/* Projected Departure Marker */}
            {flight.projectedDepartureMinutes > flight.etdMinutes && (
              <div
                className="absolute top-0 bottom-0 z-10 flex flex-col items-center pointer-events-none"
                style={{ left: `${projectedDepartureLeft}%` }}
              >
                <span className="text-[9px] font-bold text-red-400 bg-red-950/90 px-1 rounded border border-red-800 -translate-y-2">
                  PROJECTED {formatSimTime(flight.projectedDepartureMinutes)}
                </span>
                <div className="w-[1.5px] h-full bg-red-500/80 dashed" />
              </div>
            )}
          </div>

          {/* Task Rows */}
          <div className="relative space-y-2 py-1">
            {/* Real-time Vertical Sim Time Marker */}
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center transition-all duration-300"
              style={{ left: `${simTimeLeft}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
              <div className="w-[1px] h-full bg-amber-400/70" />
            </div>

            {flight.turnaroundTasks.map((task) => {
              const left = getLeftPercent(task.startTime);
              const width = Math.max(3, getWidthPercent(task.duration));
              const isFuel = task.type === 'FUELLING';
              const isPushback = task.type === 'PUSHBACK';

              return (
                <div key={task.id} className="group relative flex items-center h-8">
                  {/* Task Label on Left */}
                  <div className="w-48 shrink-0 flex items-center justify-between pr-3 text-xs font-mono">
                    <span className="truncate text-slate-300 font-medium">{task.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{task.duration}m</span>
                  </div>

                  {/* Task Bar Track */}
                  <div className="relative flex-1 h-6 bg-slate-950 rounded border border-slate-800/80 overflow-hidden">
                    <div
                      className={`absolute top-0.5 bottom-0.5 rounded px-2 flex items-center justify-between text-[10px] font-mono font-medium transition-all ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-sky-950 text-sky-200 border border-sky-600'
                          : isFuel && task.assignedResourceId === 'F17'
                          ? 'bg-red-950/80 text-red-300 border border-red-700 animate-pulse'
                          : task.isCriticalPath
                          ? 'bg-amber-950/70 text-amber-200 border border-amber-600/70'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                    >
                      <span className="truncate">
                        {isFuel ? `Fuel: ${task.assignedResourceId || 'None'}` : task.type}
                      </span>
                      <span>
                        {formatSimTime(task.startTime)} - {formatSimTime(task.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dependency legend & info */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/60 border border-amber-400" />
                Critical Path
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-900 border border-sky-500" /> In
                Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-600" />
                Completed
              </span>
            </div>

            <div className="text-slate-400">
              Dependency DAG: Deboard ➔ Clean/Cat ➔ Board ➔ Pushback • Fuelling on Critical Path
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
