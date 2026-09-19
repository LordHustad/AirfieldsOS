import React from 'react';
import { Runway, ParkingBay, AircraftMovement, AirfieldWeather } from '../types/airfield';
import { Wind, Plane, Fuel, AlertTriangle, ShieldCheck, Compass } from 'lucide-react';

interface AerodromeMapProps {
  runways: Runway[];
  parkingBays: ParkingBay[];
  movements: AircraftMovement[];
  weather: AirfieldWeather;
  selectedMovementId: string | null;
  onSelectMovement: (id: string) => void;
}

export const AerodromeMap: React.FC<AerodromeMapProps> = ({
  runways,
  parkingBays,
  movements,
  weather,
  selectedMovementId,
  onSelectMovement,
}) => {
  const activeRunway = runways.find((r) => r.isInUse) || runways[0];
  const activeCircuitFlights = movements.filter(
    (m) => m.status === 'IN_CIRCUIT' || m.status === 'OVERHEAD_JOIN'
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col font-mono shadow-xs relative overflow-hidden">
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-zinc-900" />
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
            Live Aerodrome Surface & Standard VFR Circuit Pattern
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-zinc-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active: <strong>RWY 24 LH Circuit</strong>
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600">
            <Wind className="w-3.5 h-3.5 text-zinc-400" />
            {weather.windDegrees}° @ {weather.windSpeedKnots}kt
          </span>
        </div>
      </div>

      {/* SVG Aerodrome Surface & Circuit Diagram */}
      <div className="relative w-full aspect-[16/9] bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 1000 560"
          className="w-full h-full select-none"
          style={{ background: '#fafafa' }}
        >
          {/* Compass Rose & Grid Rings */}
          <defs>
            <pattern id="minimalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e4e4e7" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Aerodrome Boundary & Airfield Grass Field */}
          <rect x="0" y="0" width="1000" height="560" fill="url(#minimalGrid)" />
          <rect x="120" y="160" width="760" height="340" rx="20" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1.2" strokeDasharray="6 4" />
          <text x="140" y="185" fill="#71717a" fontSize="11" fontWeight="bold">
            EGMS AERODROME BOUNDARY • ELEV 342 FT AMSL
          </text>

          {/* Noise Sensitive Zone Indicator (South-West) */}
          <g transform="translate(140, 390)">
            <rect width="180" height="90" rx="8" fill="#fee2e2" fillOpacity="0.4" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
            <text x="12" y="24" fill="#b91c1c" fontSize="10" fontWeight="bold">
              NOISE SENSITIVE ZONE
            </text>
            <text x="12" y="42" fill="#7f1d1d" fontSize="9">
              Highfield Village (Avoid)
            </text>
            <text x="12" y="58" fill="#991b1b" fontSize="8">
              Climb to 1000ft QFE before turning
            </text>
          </g>

          {/* Cross Grass Strip 18 / 36 (CLOSED TODAY) */}
          <g transform="translate(480, 200) rotate(90)">
            <rect x="-140" y="-18" width="280" height="36" fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="1" />
            {/* Red X on Thresholds */}
            <text x="-125" y="6" fill="#ef4444" fontSize="16" fontWeight="bold">✕</text>
            <text x="110" y="6" fill="#ef4444" fontSize="16" fontWeight="bold">✕</text>
            <text x="-40" y="4" fill="#52525b" fontSize="10" fontWeight="bold">RWY 18/36 [CLOSED - SOFT]</text>
          </g>

          {/* Parallel Grass Runway 24G / 06G */}
          <g transform="translate(480, 270) rotate(-15)">
            <rect x="-300" y="-22" width="600" height="44" fill="#e4e4e7" fillOpacity="0.6" stroke="#a1a1aa" strokeWidth="1.2" strokeDasharray="8 4" />
            <text x="-280" y="5" fill="#3f3f46" fontSize="12" fontWeight="bold">06G</text>
            <text x="250" y="5" fill="#3f3f46" fontSize="12" fontWeight="bold">24G</text>
            <text x="-30" y="4" fill="#71717a" fontSize="9" fontWeight="bold">GRASS STRIP (720M)</text>
          </g>

          {/* Main Asphalt Runway 24 / 06 */}
          <g transform="translate(480, 330) rotate(-15)">
            {/* Asphalt Base - Deep Charcoal */}
            <rect x="-340" y="-22" width="680" height="44" rx="3" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
            
            {/* Centerline dashes */}
            <line x1="-310" y1="0" x2="310" y2="0" stroke="#ffffff" strokeWidth="2" strokeDasharray="20 15" opacity="0.9" />
            
            {/* Runway Threshold Markings */}
            <g stroke="#ffffff" strokeWidth="2.5" opacity="0.95">
              <line x1="-330" y1="-14" x2="-305" y2="-14" />
              <line x1="-330" y1="-7" x2="-305" y2="-7" />
              <line x1="-330" y1="0" x2="-305" y2="0" />
              <line x1="-330" y1="7" x2="-305" y2="7" />
              <line x1="-330" y1="14" x2="-305" y2="14" />

              <line x1="305" y1="-14" x2="330" y2="-14" />
              <line x1="305" y1="-7" x2="330" y2="-7" />
              <line x1="305" y1="0" x2="330" y2="0" />
              <line x1="305" y1="7" x2="330" y2="7" />
              <line x1="305" y1="14" x2="330" y2="14" />
            </g>

            {/* Runway Designation Numbers */}
            <text x="-290" y="5" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="monospace">06</text>
            <text x="260" y="5" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="monospace">24</text>

            {/* Active Runway Direction Indicator Arrow */}
            <path d="M 230 -10 L 250 0 L 230 10 Z" fill="#ffffff" />
          </g>

          {/* Taxiways: Alpha & Bravo connecting runway to apron */}
          <path d="M 520 318 L 520 220 L 590 220" fill="none" stroke="#d4d4d8" strokeWidth="14" strokeLinecap="round" />
          <path d="M 360 360 L 360 220 L 520 220" fill="none" stroke="#d4d4d8" strokeWidth="14" strokeLinecap="round" />
          <path d="M 680 276 L 680 220 L 590 220" fill="none" stroke="#d4d4d8" strokeWidth="14" strokeLinecap="round" />
          {/* Taxiway yellow centerlines */}
          <path d="M 520 318 L 520 220 L 680 220" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="6 4" />
          <path d="M 360 360 L 360 220 L 520 220" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="6 4" />

          {/* Windsock Indicator */}
          <g transform="translate(680, 370)">
            <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            {/* Wind vector arrow pointing 230 degrees */}
            <line x1="0" y1="0" x2="-18" y2="-12" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
            <polygon points="-18,-12 -12,-8 -14,-15" fill="#18181b" />
            <text x="-25" y="24" fill="#18181b" fontSize="9" fontWeight="bold">WINDSOCK (230°/13kt)</text>
          </g>

          {/* Apron Complex: Hardstanding, Grass Tie-downs, Fuel Island, Hangars */}
          <g transform="translate(420, 90)">
            {/* Apron Asphalt Floor */}
            <rect x="0" y="0" width="380" height="130" rx="8" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1.2" />
            <text x="12" y="20" fill="#71717a" fontSize="10" fontWeight="bold">MAIN APRON & DISPATCH RAMP</text>

            {/* Hardstanding Bays H1, H2, H3 */}
            {parkingBays
              .filter((b) => b.type === 'HARDSTANDING')
              .map((bay, idx) => {
                const isOccupied = bay.occupiedByCallsign !== null;
                const occMovement = movements.find((m) => m.callsign === bay.occupiedByCallsign);
                const isSelected = occMovement && occMovement.id === selectedMovementId;

                return (
                  <g
                    key={bay.id}
                    transform={`translate(${20 + idx * 75}, 35)`}
                    className="cursor-pointer"
                    onClick={() => occMovement && onSelectMovement(occMovement.id)}
                  >
                    <rect
                      x="0"
                      y="0"
                      width="65"
                      height="65"
                      rx="6"
                      fill={isSelected ? '#18181b' : isOccupied ? '#ffffff' : '#fafafa'}
                      stroke={isSelected ? '#000000' : isOccupied ? '#18181b' : '#d4d4d8'}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text x="6" y="14" fill={isSelected ? '#ffffff' : '#71717a'} fontSize="9" fontWeight="bold">
                      {bay.name.replace('Main Hardstanding ', '')}
                    </text>
                    {isOccupied ? (
                      <>
                        <path
                          d="M 32 28 L 32 52 M 16 38 L 48 38 M 24 50 L 40 50"
                          stroke={isSelected ? '#ffffff' : '#18181b'}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <text x="6" y="60" fill={isSelected ? '#ffffff' : '#18181b'} fontSize="9" fontWeight="bold">
                          {bay.occupiedByCallsign}
                        </text>
                      </>
                    ) : (
                      <text x="16" y="38" fill="#a1a1aa" fontSize="9">VACANT</text>
                    )}
                  </g>
                );
              })}

            {/* Fuel Island Bay */}
            <g transform="translate(250, 35)">
              <rect x="0" y="0" width="115" height="65" rx="6" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.2" />
              <text x="8" y="14" fill="#15803d" fontSize="9" fontWeight="bold">FUEL ISLAND (100LL / JET A-1)</text>
              <circle cx="25" cy="40" r="12" fill="#16a34a" />
              <text x="19" y="44" fill="#ffffff" fontSize="10" fontWeight="bold">⛽</text>
              <text x="44" y="35" fill="#18181b" fontSize="9" fontWeight="bold">G-ROBN</text>
              <text x="44" y="48" fill="#166534" fontSize="8">Refueling 70L</text>
            </g>

            {/* Control Tower & Clubhouse */}
            <g transform="translate(20, -45)">
              <rect x="0" y="0" width="110" height="35" rx="4" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
              <text x="8" y="16" fill="#ffffff" fontSize="9" fontWeight="bold">TOWER & A/G RADIO</text>
              <text x="8" y="28" fill="#a1a1aa" fontSize="8">122.705 MHz [ACTIVE]</text>
            </g>

            {/* Hangars 1, 2, 3 */}
            <g transform="translate(140, -45)">
              <rect x="0" y="0" width="70" height="35" rx="4" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" />
              <text x="6" y="16" fill="#71717a" fontSize="8" fontWeight="bold">HANGAR 1</text>
              <text x="6" y="27" fill="#18181b" fontSize="7">Club Fleet</text>
            </g>
            <g transform="translate(220, -45)">
              <rect x="0" y="0" width="70" height="35" rx="4" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" />
              <text x="6" y="16" fill="#71717a" fontSize="8" fontWeight="bold">HANGAR 2</text>
              <text x="6" y="27" fill="#18181b" fontSize="7">Engineering</text>
            </g>
            <g transform="translate(300, -45)">
              <rect x="0" y="0" width="70" height="35" rx="4" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" />
              <text x="6" y="16" fill="#71717a" fontSize="8" fontWeight="bold">HANGAR 3</text>
              <text x="6" y="27" fill="#18181b" fontSize="7">Private Owners</text>
            </g>
          </g>

          {/* Standard Left Hand Circuit Pattern for RWY 24 */}
          <g stroke="#18181b" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.8">
            {/* Takeoff & Upwind Leg */}
            <path d="M 230 380 L 120 400" />
            {/* Crosswind Leg */}
            <path d="M 120 400 L 100 500" />
            {/* Downwind Leg (South, 1000 ft QFE) */}
            <path d="M 100 500 L 760 500" />
            {/* Base Leg */}
            <path d="M 760 500 L 820 370" />
            {/* Final Approach Leg */}
            <path d="M 820 370 L 680 300" />
          </g>
          <text x="380" y="525" fill="#18181b" fontSize="11" fontWeight="bold">
            RWY 24 LEFT-HAND CIRCUIT • ALTITUDE 1,342 FT QNH (1,000 FT QFE)
          </text>

          {/* Aircraft Plot in the Pattern */}
          {/* 1. G-BTAW on Downwind */}
          <g
            transform="translate(480, 500)"
            className="cursor-pointer"
            onClick={() => onSelectMovement('mov-101')}
          >
            <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#000000" strokeWidth="2" />
            <path d="M -8 0 L 8 0 M 0 -8 L 0 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <rect x="-35" y="-35" width="70" height="18" rx="4" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            <text x="-28" y="-23" fill="#18181b" fontSize="9" fontWeight="bold">G-BTAW</text>
            <text x="-35" y="25" fill="#18181b" fontSize="8" fontWeight="bold">Downwind (T&G #3)</text>
          </g>

          {/* 2. G-FLYT on Base Leg */}
          <g
            transform="translate(780, 440)"
            className="cursor-pointer"
            onClick={() => onSelectMovement('mov-104')}
          >
            <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#000000" strokeWidth="2" />
            <path d="M -8 0 L 8 0 M 0 -8 L 0 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <rect x="-35" y="-35" width="70" height="18" rx="4" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            <text x="-28" y="-23" fill="#18181b" fontSize="9" fontWeight="bold">G-FLYT</text>
            <text x="-30" y="25" fill="#18181b" fontSize="8" fontWeight="bold">Base (DA42 ME)</text>
          </g>

          {/* 3. G-CDEF Overhead Rejoin */}
          <g
            transform="translate(620, 290)"
            className="cursor-pointer"
            onClick={() => onSelectMovement('mov-102')}
          >
            <circle cx="0" cy="0" r="14" fill="#18181b" stroke="#000000" strokeWidth="2" />
            <path d="M -8 0 L 8 0 M 0 -8 L 0 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <rect x="-35" y="-35" width="70" height="18" rx="4" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            <text x="-28" y="-23" fill="#18181b" fontSize="9" fontWeight="bold">G-CDEF</text>
            <text x="-38" y="25" fill="#18181b" fontSize="8" fontWeight="bold">Overhead Rejoin</text>
          </g>
        </svg>
      </div>

      {/* Legend & Quick Status Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 border-t border-zinc-200 pt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
            <span>Active Aircraft (3)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Fuel Island</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Noise Sensitive Boundary</span>
          </span>
        </div>

        <span className="text-[11px] text-zinc-500 font-mono">
          Click any aircraft node or apron bay to inspect flight telemetry
        </span>
      </div>
    </div>
  );
};
