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

  // Group parking bays into Main Apron (Hardstanding) and Secondary Apron (Grass Tie-downs)
  const hardstandingBays = parkingBays.filter((b) => b.type === 'HARDSTANDING');
  const grassBays = parkingBays.filter((b) => b.type === 'GRASS_TIEDOWN');

  // Hardstanding Apron Occupancy
  const hardstandingOccupied = hardstandingBays.filter((b) => b.occupiedByCallsign !== null).length;
  const hardstandingTotal = hardstandingBays.length || 4;

  // Secondary Apron Occupancy
  const grassOccupied = grassBays.filter((b) => b.occupiedByCallsign !== null).length;
  const grassTotal = grassBays.length || 8;

  // Fallback bays to guarantee 4 slots on Main Apron and 8 slots on Secondary Apron
  const displayHardstanding = hardstandingBays.length >= 4 
    ? hardstandingBays.slice(0, 4) 
    : [
        ...hardstandingBays,
        ...Array.from({ length: 4 - hardstandingBays.length }, (_, i) => ({
          id: `fallback-h-${hardstandingBays.length + i + 1}`,
          name: `H${hardstandingBays.length + i + 1}`,
          type: 'HARDSTANDING' as const,
          maxWingspanMeters: 14,
          maxWeightKg: 4000,
          occupiedByCallsign: null,
          tieDownRingsAvailable: true,
          isGrassSoft: false,
        })),
      ];

  const displayGrass = grassBays.length >= 8 
    ? grassBays.slice(0, 8) 
    : [
        ...grassBays,
        ...Array.from({ length: 8 - grassBays.length }, (_, i) => ({
          id: `fallback-g-${grassBays.length + i + 1}`,
          name: `G${grassBays.length + i + 1}`,
          type: 'GRASS_TIEDOWN' as const,
          maxWingspanMeters: 12,
          maxWeightKg: 1800,
          occupiedByCallsign: null,
          tieDownRingsAvailable: true,
          isGrassSoft: false,
        })),
      ];

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

          {/* Aerodrome Boundary & Airfield Field */}
          <rect x="0" y="0" width="1000" height="560" fill="url(#minimalGrid)" />
          <rect x="40" y="20" width="920" height="505" rx="16" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1.2" strokeDasharray="6 4" />
          <text x="60" y="42" fill="#71717a" fontSize="10.5" fontWeight="bold">
            EGMS AERODROME BOUNDARY • ELEV 342 FT AMSL
          </text>

          {/* Taxiways connecting Main and Secondary Aprons to Runway system */}
          <path d="M 440 140 L 480 140" fill="none" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
          <path d="M 440 140 L 480 140" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="6 4" />

          <path d="M 520 335 L 520 200 L 600 200" fill="none" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
          <path d="M 700 290 L 700 200 L 600 200" fill="none" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
          <path d="M 370 375 L 370 200 L 520 200" fill="none" stroke="#d4d4d8" strokeWidth="12" strokeLinecap="round" />
          {/* Taxiway yellow centerlines */}
          <path d="M 520 335 L 520 200 L 700 200" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="6 4" />
          <path d="M 370 375 L 370 200 L 520 200" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="6 4" />

          {/* 1. Noise Sensitive Zone Indicator (South-West) */}
          <g transform="translate(60, 420)">
            <rect width="210" height="75" rx="8" fill="#fee2e2" fillOpacity="0.4" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
            <text x="12" y="20" fill="#b91c1c" fontSize="9.5" fontWeight="bold">
              NOISE SENSITIVE ZONE
            </text>
            <text x="12" y="38" fill="#7f1d1d" fontSize="8.5">
              Highfield Village (Avoid Overflight)
            </text>
            <text x="12" y="55" fill="#991b1b" fontSize="8">
              Climb straight to 1,000 ft QFE before turning
            </text>
          </g>

          {/* 2. Cross Grass Strip 18 / 36 (CLOSED TODAY) */}
          <g transform="translate(450, 240) rotate(90)">
            <rect x="-100" y="-15" width="200" height="30" fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="1" />
            {/* Red X on Thresholds */}
            <text x="-90" y="5" fill="#ef4444" fontSize="14" fontWeight="bold">✕</text>
            <text x="75" y="5" fill="#ef4444" fontSize="14" fontWeight="bold">✕</text>
            <text x="-52" y="4" fill="#52525b" fontSize="8.5" fontWeight="bold">RWY 18/36 [CLOSED - SOFT]</text>
          </g>

          {/* 3. Parallel Grass Runway 24G / 06G */}
          <g transform="translate(500, 285) rotate(-15)">
            <rect x="-270" y="-18" width="540" height="36" fill="#e4e4e7" fillOpacity="0.6" stroke="#a1a1aa" strokeWidth="1.2" strokeDasharray="8 4" />
            <text x="-250" y="4" fill="#3f3f46" fontSize="11" fontWeight="bold">06G</text>
            <text x="220" y="4" fill="#3f3f46" fontSize="11" fontWeight="bold">24G</text>
            <text x="-35" y="4" fill="#71717a" fontSize="8.5" fontWeight="bold">GRASS STRIP (720M)</text>
          </g>

          {/* 4. Main Asphalt Runway 24 / 06 */}
          <g transform="translate(500, 350) rotate(-15)">
            {/* Asphalt Base - Deep Charcoal */}
            <rect x="-310" y="-22" width="620" height="44" rx="3" fill="#18181b" stroke="#09090b" strokeWidth="1.5" />
            
            {/* Centerline dashes */}
            <line x1="-280" y1="0" x2="280" y2="0" stroke="#ffffff" strokeWidth="2" strokeDasharray="20 15" opacity="0.9" />
            
            {/* Runway Threshold Markings */}
            <g stroke="#ffffff" strokeWidth="2.5" opacity="0.95">
              <line x1="-300" y1="-14" x2="-275" y2="-14" />
              <line x1="-300" y1="-7" x2="-275" y2="-7" />
              <line x1="-300" y1="0" x2="-275" y2="0" />
              <line x1="-300" y1="7" x2="-275" y2="7" />
              <line x1="-300" y1="14" x2="-275" y2="14" />

              <line x1="275" y1="-14" x2="300" y2="-14" />
              <line x1="275" y1="-7" x2="300" y2="-7" />
              <line x1="275" y1="0" x2="300" y2="0" />
              <line x1="275" y1="7" x2="300" y2="7" />
              <line x1="275" y1="14" x2="300" y2="14" />
            </g>

            {/* Runway Designation Numbers */}
            <text x="-260" y="5" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">06</text>
            <text x="235" y="5" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">24</text>

            {/* Active Runway Direction Indicator Arrow */}
            <path d="M 210 -8 L 226 0 L 210 8 Z" fill="#ffffff" />
          </g>

          {/* 5. Windsock Indicator */}
          <g transform="translate(750, 380)">
            <circle cx="0" cy="0" r="13" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            {/* Wind vector arrow pointing 230 degrees */}
            <line x1="0" y1="0" x2="-18" y2="-12" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
            <polygon points="-18,-12 -12,-8 -14,-15" fill="#18181b" />
            <text x="-40" y="24" fill="#18181b" fontSize="8.5" fontWeight="bold">WINDSOCK (230°/13kt)</text>
          </g>

          {/* 6. Main Apron Complex (Hardstanding, Fuel Island, Hangars & Tower) */}
          <g transform="translate(480, 80)">
            {/* Main Apron Asphalt Floor (Targeted by CSS Selector) */}
            <rect x="0" y="0" width="460" height="120" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            
            {/* Header: Title and Spaces Filled Fraction */}
            <text x="14" y="24" fill="#334155" fontSize="10.5" fontWeight="bold" letterSpacing="0.04em">
              MAIN APRON (HARDSTANDING)
            </text>

            {/* Fraction of spaces filled pill badge */}
            <g transform="translate(268, 9)">
              <rect width="180" height="22" rx="11" fill="#0f172a" />
              <text x="90" y="15" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" letterSpacing="0.03em">
                {hardstandingOccupied}/{hardstandingTotal} SPACES FILLED
              </text>
            </g>

            {/* Hardstanding Bays H1, H2, H3, H4 */}
            {displayHardstanding.map((bay, idx) => {
              const isOccupied = bay.occupiedByCallsign !== null;
              const occMovement = movements.find((m) => m.callsign === bay.occupiedByCallsign);
              const isSelected = occMovement && occMovement.id === selectedMovementId;
              const bayShortName = bay.name.replace('Main Hardstanding ', '').replace('Hardstanding ', '').split(' ')[0] || `H${idx + 1}`;

              return (
                <g
                  key={bay.id}
                  transform={`translate(${14 + idx * 72}, 38)`}
                  className="cursor-pointer"
                  onClick={() => occMovement && onSelectMovement(occMovement.id)}
                >
                  <rect
                    x="0"
                    y="0"
                    width="64"
                    height="70"
                    rx="6"
                    fill={isSelected ? '#0f172a' : isOccupied ? '#ffffff' : '#f1f5f9'}
                    stroke={isSelected ? '#000000' : isOccupied ? '#0f172a' : '#cbd5e1'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    x="32"
                    y="16"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#64748b'}
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {bayShortName}
                  </text>
                  {isOccupied ? (
                    <>
                      {/* Airplane silhouette icon */}
                      <path
                        d="M 32 25 L 32 45 M 20 33 L 44 33 M 25 43 L 39 43"
                        stroke={isSelected ? '#ffffff' : '#0f172a'}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <rect
                        x="6"
                        y="49"
                        width="52"
                        height="16"
                        rx="3"
                        fill={isSelected ? '#ffffff' : '#f8fafc'}
                        stroke={isSelected ? '#ffffff' : '#e2e8f0'}
                        strokeWidth="1"
                      />
                      <text
                        x="32"
                        y="61"
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize="8.5"
                        fontWeight="bold"
                      >
                        {bay.occupiedByCallsign}
                      </text>
                    </>
                  ) : (
                    <>
                      <circle cx="32" cy="33" r="8" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
                      <text x="32" y="58" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
                        VACANT
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Fuel Island Bay */}
            <g transform="translate(308, 38)">
              <rect x="0" y="0" width="140" height="70" rx="6" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.2" />
              <text x="70" y="16" textAnchor="middle" fill="#15803d" fontSize="9.5" fontWeight="bold">
                FUEL ISLAND
              </text>
              <text x="70" y="27" textAnchor="middle" fill="#166534" fontSize="7.5">
                100LL & JET A-1
              </text>
              <circle cx="24" cy="47" r="11" fill="#16a34a" />
              <text x="18" y="51" fill="#ffffff" fontSize="10" fontWeight="bold">⛽</text>
              <text x="44" y="44" fill="#0f172a" fontSize="9" fontWeight="bold">G-ROBN</text>
              <text x="44" y="56" fill="#166534" fontSize="8">Uplifting 70L</text>
            </g>

            {/* Control Tower & Clubhouse */}
            <g transform="translate(14, -36)">
              <rect x="0" y="0" width="105" height="28" rx="4" fill="#0f172a" stroke="#020617" strokeWidth="1.5" />
              <text x="8" y="13" fill="#ffffff" fontSize="8" fontWeight="bold">TOWER & A/G</text>
              <text x="8" y="22" fill="#94a3b8" fontSize="7.5">122.705 MHz</text>
            </g>

            {/* Hangars 1, 2, 3 */}
            <g transform="translate(127, -36)">
              <rect x="0" y="0" width="68" height="28" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="6" y="13" fill="#64748b" fontSize="7.5" fontWeight="bold">HANGAR 1</text>
              <text x="6" y="22" fill="#0f172a" fontSize="7">Club Fleet</text>
            </g>
            <g transform="translate(203, -36)">
              <rect x="0" y="0" width="68" height="28" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="6" y="13" fill="#64748b" fontSize="7.5" fontWeight="bold">HANGAR 2</text>
              <text x="6" y="22" fill="#0f172a" fontSize="7">Engineering</text>
            </g>
            <g transform="translate(279, -36)">
              <rect x="0" y="0" width="68" height="28" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="6" y="13" fill="#64748b" fontSize="7.5" fontWeight="bold">HANGAR 3</text>
              <text x="6" y="22" fill="#0f172a" fontSize="7">Private</text>
            </g>
          </g>

          {/* 7. Secondary Apron Complex (Grass Tie-downs) */}
          <g transform="translate(60, 80)">
            <rect x="0" y="0" width="380" height="120" rx="10" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
            
            {/* Header: Title and Spaces Filled Fraction */}
            <text x="14" y="24" fill="#166534" fontSize="10.5" fontWeight="bold" letterSpacing="0.04em">
              SECONDARY APRON (GRASS TIE-DOWNS)
            </text>

            {/* Fraction of spaces filled pill badge */}
            <g transform="translate(225, 9)">
              <rect width="145" height="22" rx="11" fill="#15803d" />
              <text x="72.5" y="15" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" letterSpacing="0.03em">
                {grassOccupied}/{grassTotal} SPACES FILLED
              </text>
            </g>

            {/* 8 Grass Tie-down spaces organized in 2 spaced rows */}
            {displayGrass.map((bay, idx) => {
              const isOccupied = bay.occupiedByCallsign !== null;
              const occMovement = movements.find((m) => m.callsign === bay.occupiedByCallsign);
              const isSelected = occMovement && occMovement.id === selectedMovementId;
              const col = idx % 4;
              const row = Math.floor(idx / 4);
              const bayShortName = bay.name.replace('Grass Tie-down ', '').replace(' (South Apron)', '').split(' ')[0] || `G${idx + 1}`;

              return (
                <g
                  key={bay.id}
                  transform={`translate(${14 + col * 88}, ${38 + row * 39})`}
                  className="cursor-pointer"
                  onClick={() => occMovement && onSelectMovement(occMovement.id)}
                >
                  <rect
                    x="0"
                    y="0"
                    width="80"
                    height="35"
                    rx="4"
                    fill={isSelected ? '#14532d' : isOccupied ? '#ffffff' : '#f0fdf4'}
                    stroke={isSelected ? '#052e16' : isOccupied ? '#16a34a' : '#86efac'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    x="8"
                    y="13"
                    fill={isSelected ? '#ffffff' : '#15803d'}
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {bayShortName}
                  </text>
                  <circle
                    cx="70"
                    cy="12"
                    r="3.5"
                    fill="none"
                    stroke={isSelected ? '#ffffff' : '#22c55e'}
                    strokeWidth="1.2"
                  />
                  {isOccupied ? (
                    <text
                      x="40"
                      y="27"
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#14532d'}
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      {bay.occupiedByCallsign}
                    </text>
                  ) : (
                    <text
                      x="40"
                      y="26"
                      textAnchor="middle"
                      fill="#86efac"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      VACANT
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 8. Standard Left Hand Circuit Pattern for RWY 24 */}
          <g stroke="#18181b" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.8">
            {/* Takeoff & Upwind Leg */}
            <path d="M 220 425 L 120 440" />
            {/* Crosswind Leg */}
            <path d="M 120 440 L 80 500" />
            {/* Downwind Leg (South, 1000 ft QFE) */}
            <path d="M 80 500 L 840 500" />
            {/* Base Leg */}
            <path d="M 840 500 L 890 380" />
            {/* Final Approach Leg */}
            <path d="M 890 380 L 730 295" />
          </g>
          
          <text x="500" y="535" textAnchor="middle" fill="#18181b" fontSize="10" fontWeight="bold">
            RWY 24 LEFT-HAND CIRCUIT • ALTITUDE 1,342 FT QNH (1,000 FT QFE)
          </text>

          {/* 9. Aircraft Plot in the Pattern: G-BTAW on Downwind */}
          <g
            transform="translate(350, 500)"
            className="cursor-pointer"
            onClick={() => onSelectMovement('mov-101')}
          >
            <circle cx="0" cy="0" r="12" fill="#18181b" stroke="#000000" strokeWidth="2" />
            <path d="M -7 0 L 7 0 M 0 -7 L 0 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <rect x="-30" y="-30" width="60" height="17" rx="4" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            <text x="0" y="-18" textAnchor="middle" fill="#18181b" fontSize="8.5" fontWeight="bold">G-BTAW</text>
            <text x="0" y="22" textAnchor="middle" fill="#3f3f46" fontSize="8" fontWeight="bold">Downwind (T&G)</text>
          </g>

          {/* 10. Aircraft Plot in the Pattern: G-FLYT on Base Leg */}
          <g
            transform="translate(865, 440)"
            className="cursor-pointer"
            onClick={() => onSelectMovement('mov-104')}
          >
            <circle cx="0" cy="0" r="12" fill="#18181b" stroke="#000000" strokeWidth="2" />
            <path d="M -7 0 L 7 0 M 0 -7 L 0 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <rect x="-30" y="-30" width="60" height="17" rx="4" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            <text x="0" y="-18" textAnchor="middle" fill="#18181b" fontSize="8.5" fontWeight="bold">G-FLYT</text>
            <text x="0" y="22" textAnchor="middle" fill="#3f3f46" fontSize="8" fontWeight="bold">Base (DA42)</text>
          </g>

          {/* 11. Aircraft Plot in the Pattern: G-CDEF Overhead Rejoin */}
          <g
            transform="translate(680, 255)"
            className="cursor-pointer"
            onClick={() => onSelectMovement('mov-102')}
          >
            <circle cx="0" cy="0" r="12" fill="#18181b" stroke="#000000" strokeWidth="2" />
            <path d="M -7 0 L 7 0 M 0 -7 L 0 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <rect x="-30" y="-30" width="60" height="17" rx="4" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
            <text x="0" y="-18" textAnchor="middle" fill="#18181b" fontSize="8.5" fontWeight="bold">G-CDEF</text>
            <text x="0" y="22" textAnchor="middle" fill="#3f3f46" fontSize="8" fontWeight="bold">Overhead Rejoin</text>
          </g>
        </svg>
      </div>

      {/* Legend & Quick Status Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 border-t border-zinc-200 pt-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
            <span>Main Apron ({hardstandingOccupied}/{hardstandingTotal} spaces filled)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Secondary Apron ({grassOccupied}/{grassTotal} spaces filled)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
            <span>Fuel Island</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Noise Sensitive Zone</span>
          </span>
        </div>

        <span className="text-[11px] text-zinc-500 font-mono">
          Click any aircraft node or apron bay to inspect flight telemetry
        </span>
      </div>
    </div>
  );
};
