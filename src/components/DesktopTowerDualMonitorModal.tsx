import React, { useState } from 'react';
import {
  Monitor,
  ExternalLink,
  X,
  Compass,
  Wind,
  Plane,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Maximize2,
  Radio,
  Layers,
  Fuel,
} from 'lucide-react';
import {
  AirfieldProfile,
  AirfieldWeather,
  Runway,
  ParkingBay,
  AircraftMovement,
} from '../types/airfield';
import { AerodromeMap } from './AerodromeMap';

interface DesktopTowerDualMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AirfieldProfile;
  weather: AirfieldWeather;
  runways: Runway[];
  parkingBays: ParkingBay[];
  movements: AircraftMovement[];
  circuitCount: number;
}

export const DesktopTowerDualMonitorModal: React.FC<DesktopTowerDualMonitorModalProps> = ({
  isOpen,
  onClose,
  profile,
  weather,
  runways,
  parkingBays,
  movements,
  circuitCount,
}) => {
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeRunway = runways.find((r) => r.isInUse) || runways[0];
  const occupiedBays = parkingBays.filter((b) => b.occupiedByCallsign !== null).length;
  const activeCircuitFlights = movements.filter(
    (m) => m.status === 'IN_CIRCUIT' || m.status === 'OVERHEAD_JOIN'
  );

  const handleOpenStandaloneWindow = () => {
    // Open a dedicated window configured for a secondary monitor
    const dualWindow = window.open(
      '',
      'AirfieldOSTowerSecondaryScreen',
      'width=1320,height=840,menubar=no,toolbar=no,location=no,status=no'
    );

    if (dualWindow) {
      dualWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AirfieldOS GA — Secondary Tower Monitor (${profile.icao})</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #09090b; color: #fafafa; margin: 0; padding: 1.5rem; }
            </style>
          </head>
          <body class="p-6">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-white">
                  ✈
                </div>
                <div>
                  <h1 class="text-xl font-bold">${profile.name} (${profile.icao}) — SECONDARY MONITOR</h1>
                  <p class="text-xs text-zinc-400">TOWER VISUAL SURFACE & RUNWAY SURVEILLANCE DISPLAY</p>
                </div>
              </div>
              <div class="text-right font-mono text-xs">
                <p class="text-emerald-400 font-bold">● LIVE TOWER FEED</p>
                <p class="text-zinc-400">ACTIVE RWY: ${activeRunway?.designation || '27'} | QNH: ${weather.qnhHpa} hPa</p>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p class="text-xs text-zinc-400">SURFACE WIND</p>
                <p class="text-2xl font-bold text-white">${weather.windDegrees}° / ${weather.windSpeedKnots} kt</p>
                <p class="text-xs text-zinc-500">Crosswind: ${weather.crosswindKnots} kt ${weather.crosswindDirection}</p>
              </div>

              <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p class="text-xs text-zinc-400">ACTIVE RUNWAY</p>
                <p class="text-2xl font-bold text-emerald-400">RWY ${activeRunway?.designation || '27'}</p>
                <p class="text-xs text-zinc-500">${activeRunway?.surface} • ${activeRunway?.lengthMeters}m</p>
              </div>

              <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p class="text-xs text-zinc-400">CIRCUIT PATTERN</p>
                <p class="text-2xl font-bold text-yellow-400">${circuitCount} / 5 Max</p>
                <p class="text-xs text-zinc-500">Left-Hand Pattern</p>
              </div>

              <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p class="text-xs text-zinc-400">APRON OCCUPANCY</p>
                <p class="text-2xl font-bold text-white">${occupiedBays} / ${parkingBays.length} Stands</p>
                <p class="text-xs text-zinc-500">${parkingBays.length - occupiedBays} Stands Free</p>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
              <h2 class="text-base font-bold text-zinc-200 mb-2">Dual Monitor Connected Successfully</h2>
              <p class="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Position this window onto your secondary physical display monitor. It will continuously monitor surface radar and circuit operations while you handle flight clearances and CAA CAP 797 log entries on your primary display.
              </p>
            </div>
          </body>
        </html>
      `);
      dualWindow.document.close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-mono animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-zinc-950 text-white border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Secondary Screen Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Desktop Dual-Monitor Tower Workstation
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                  SECONDARY DISPLAY MODE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Aerodrome surface, circuit radar & apron stands for 2nd physical tower monitor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenStandaloneWindow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
              title="Open in native independent browser window to drag to 2nd monitor"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pop Out to Real Window</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Surface Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-900/40 border-b border-zinc-800 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">ACTIVE RUNWAY</span>
              <p className="text-xl font-bold text-emerald-400">
                RWY {activeRunway ? activeRunway.designation : '27'}
              </p>
              <p className="text-[10px] text-zinc-400">{activeRunway?.surface} • {activeRunway?.lengthMeters}m</p>
            </div>
            <Compass className="w-6 h-6 text-zinc-600" />
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">SURFACE WIND & QNH</span>
              <p className="text-xl font-bold text-white">
                {weather.windDegrees}° / {weather.windSpeedKnots}kt
              </p>
              <p className="text-[10px] text-zinc-400">QNH {weather.qnhHpa} hPa • X-Wind {weather.crosswindKnots}kt {weather.crosswindDirection}</p>
            </div>
            <Wind className="w-6 h-6 text-cyan-400" />
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">CIRCUIT TRAFFIC</span>
              <p className="text-xl font-bold text-yellow-400">
                {circuitCount} / 5 Max
              </p>
              <p className="text-[10px] text-zinc-400">{5 - circuitCount} pattern slots open</p>
            </div>
            <Plane className="w-6 h-6 text-yellow-500" />
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">APRON STANDS</span>
              <p className="text-xl font-bold text-white">
                {occupiedBays} / {parkingBays.length}
              </p>
              <p className="text-[10px] text-zinc-400">{parkingBays.length - occupiedBays} bays free</p>
            </div>
            <Building2 className="w-6 h-6 text-zinc-500" />
          </div>
        </div>

        {/* Visual Map Layout Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-950">
          {/* Visual Aerodrome Surface Schematic */}
          <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Live Aerodrome Surface & Movement Radar
              </span>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                {profile.name} ({profile.icao})
              </span>
            </div>
            <div className="flex-1 min-h-[360px] bg-white rounded-2xl p-2 text-zinc-950 overflow-hidden">
              <AerodromeMap
                runways={runways}
                parkingBays={parkingBays}
                movements={movements}
                weather={weather}
                selectedMovementId={selectedMovementId}
                onSelectMovement={(id) => setSelectedMovementId(id)}
              />
            </div>
          </div>

          {/* Apron Stands & Parking Bay Status Card */}
          <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Apron Stands & Tie-Downs
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {parkingBays.length} Allocated Bays
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
              {parkingBays.map((bay) => {
                const isOccupied = bay.occupiedByCallsign !== null;
                return (
                  <div
                    key={bay.id}
                    className={`p-3 rounded-2xl border transition-all text-xs ${
                      isOccupied
                        ? 'bg-zinc-800/80 border-amber-500/40 text-amber-200'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{bay.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isOccupied
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isOccupied ? bay.occupiedByCallsign : 'FREE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400">
                      <span>{bay.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Max {bay.maxWingspanMeters}m span</span>
                      {bay.tieDownRingsAvailable && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Tie-down</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Advice */}
        <div className="px-6 py-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Keep this view open on your secondary tower screen while logging flights on your primary monitor.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
          >
            Close Secondary View
          </button>
        </div>
      </div>
    </div>
  );
};
