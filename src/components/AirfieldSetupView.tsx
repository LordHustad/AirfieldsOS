import React, { useState } from 'react';
import {
  AirfieldProfile,
  Runway,
  ParkingBay,
  FuelStorageTank,
  RunwaySurface,
  RunwayCondition,
  FuelType,
} from '../types/airfield';
import { PRESET_AIRFIELDS } from '../data/airfieldProfiles';
import {
  Building2,
  Plane,
  Radio,
  Fuel,
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  MapPin,
  Shield,
  Clock,
  Compass,
} from 'lucide-react';

interface AirfieldSetupViewProps {
  currentProfile: AirfieldProfile;
  runways: Runway[];
  parkingBays: ParkingBay[];
  fuelTanks: FuelStorageTank[];
  onSaveProfile: (
    profile: AirfieldProfile,
    runways: Runway[],
    fuelTanks: FuelStorageTank[],
    parkingBays: ParkingBay[]
  ) => void;
  onSwitchAirfieldPreset: (presetId: string) => void;
}

export const AirfieldSetupView: React.FC<AirfieldSetupViewProps> = ({
  currentProfile,
  runways: initialRunways,
  parkingBays: initialParkingBays,
  fuelTanks: initialFuelTanks,
  onSaveProfile,
  onSwitchAirfieldPreset,
}) => {
  const [profile, setProfile] = useState<AirfieldProfile>(currentProfile);
  const [runways, setRunways] = useState<Runway[]>(initialRunways);
  const [fuelTanks, setFuelTanks] = useState<FuelStorageTank[]>(initialFuelTanks);
  const [parkingBays, setParkingBays] = useState<ParkingBay[]>(initialParkingBays);
  const [activeSubTab, setActiveSubTab] = useState<
    'GENERAL' | 'RUNWAYS' | 'PARKING' | 'FUEL' | 'TARIFFS'
  >('GENERAL');
  const [isSaved, setIsSaved] = useState(false);

  // Sync if props change
  React.useEffect(() => {
    setProfile(currentProfile);
    setRunways(initialRunways);
    setFuelTanks(initialFuelTanks);
    setParkingBays(initialParkingBays);
  }, [currentProfile, initialRunways, initialFuelTanks, initialParkingBays]);

  const handleSaveAll = () => {
    onSaveProfile(profile, runways, fuelTanks, parkingBays);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Runway handlers
  const handleAddRunway = () => {
    const newRwy: Runway = {
      id: `rwy-${Date.now()}`,
      designation: '09 / 27 (New)',
      reciprocal: '27',
      headingDegrees: 270,
      surface: 'GRASS',
      lengthMeters: 750,
      widthMeters: 25,
      toraMeters: 750,
      ldaMeters: 720,
      condition: 'DRY',
      isInUse: true,
      circuitDirection: 'LEFT_HAND',
      noiseSensitiveSide: 'Standard circuit avoidance',
    };
    setRunways([...runways, newRwy]);
  };

  const handleRemoveRunway = (id: string) => {
    setRunways(runways.filter((r) => r.id !== id));
  };

  const handleUpdateRunway = (id: string, updates: Partial<Runway>) => {
    setRunways(runways.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  // Fuel tank handlers
  const handleUpdateTank = (id: string, updates: Partial<FuelStorageTank>) => {
    setFuelTanks(fuelTanks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Parking handlers
  const handleAddParkingBay = () => {
    const newBay: ParkingBay = {
      id: `bay-${Date.now()}`,
      name: `Tie-down G${parkingBays.length + 1}`,
      type: 'GRASS_TIEDOWN',
      maxWingspanMeters: 12,
      maxWeightKg: 2000,
      occupiedByCallsign: null,
      tieDownRingsAvailable: true,
      isGrassSoft: false,
    };
    setParkingBays([...parkingBays, newBay]);
  };

  const handleRemoveParkingBay = (id: string) => {
    setParkingBays(parkingBays.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Switcher */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-zinc-800" />
            <h2 className="text-base font-bold uppercase tracking-wider text-zinc-950">
              Airfield Profile & Facility Setup Studio
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold">
              ICAO: {profile.icao}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure aerodrome parameters, physical runways, frequencies, noise restrictions, and
            custom fee schedules. Settings persist locally and can be exported.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono">
            <span className="text-zinc-600">Load Preset Airfield:</span>
            <select
              value={profile.id}
              onChange={(e) => onSwitchAirfieldPreset(e.target.value)}
              className="bg-transparent text-zinc-950 font-bold focus:outline-none cursor-pointer"
            >
              {PRESET_AIRFIELDS.map((preset) => (
                <option key={preset.profile.id} value={preset.profile.id} className="bg-white text-zinc-900">
                  {preset.profile.name} ({preset.profile.icao})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-mono font-medium text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Airfield Specs</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 rounded-xl bg-zinc-950 text-white border border-zinc-900 text-xs font-mono flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>Airfield specifications and tariffs successfully saved to aerodrome database!</span>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('GENERAL')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'GENERAL'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Aerodrome Identity & Radios</span>
        </button>

        <button
          onClick={() => setActiveSubTab('RUNWAYS')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'RUNWAYS'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>Runways ({runways.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PARKING')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'PARKING'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Apron & Parking Stands ({parkingBays.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('FUEL')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'FUEL'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>Fuel Storage & Pumps ({fuelTanks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('TARIFFS')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'TARIFFS'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Tariffs & Landing Fee Schedule</span>
        </button>
      </div>

      {/* Sub-tab 1: Aerodrome Identity & Radios */}
      {activeSubTab === 'GENERAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Identity Card */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-800" />
              <span>Aerodrome Identification</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">ICAO Code *</label>
                <input
                  type="text"
                  value={profile.icao}
                  onChange={(e) =>
                    setProfile({ ...profile, icao: e.target.value.toUpperCase().slice(0, 4) })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold uppercase focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Elevation (ft AMSL)</label>
                <input
                  type="number"
                  value={profile.elevationFt}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      elevationFt: Number(e.target.value),
                      circuitHeightQnhFt: Number(e.target.value) + profile.circuitHeightAglFt,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Aerodrome Official Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Location & County</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Operating Hours</label>
                <input
                  type="text"
                  value={profile.operatingHours}
                  onChange={(e) => setProfile({ ...profile, operatingHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Days of Operation</label>
                <input
                  type="text"
                  value={profile.operatingDays}
                  onChange={(e) => setProfile({ ...profile, operatingDays: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">CAA License / Safety Ref</label>
                <input
                  type="text"
                  value={profile.caaAerodromeLicense}
                  onChange={(e) => setProfile({ ...profile, caaAerodromeLicense: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Pavement Max Weight (kg)</label>
                <input
                  type="number"
                  value={profile.pavementLimitKg}
                  onChange={(e) => setProfile({ ...profile, pavementLimitKg: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Radios & Airspace Card */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <Radio className="w-4 h-4 text-zinc-800" />
              <span>Radios, ATSU Service & Circuit Height</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Station Callsign</label>
                <input
                  type="text"
                  value={profile.radioCallsign}
                  onChange={(e) => setProfile({ ...profile, radioCallsign: e.target.value })}
                  placeholder="e.g. Popham Radio"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">ATSU Service Type</label>
                <select
                  value={profile.atsService}
                  onChange={(e) => setProfile({ ...profile, atsService: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                >
                  <option value="Air/Ground Radio (A/G)">Air/Ground Radio (A/G)</option>
                  <option value="AFIS (Flight Information)">AFIS (Flight Information Service)</option>
                  <option value="SafetyCom Only">Airfield SafetyCom Only</option>
                  <option value="Aerodrome Control (TWR)">Aerodrome Control (TWR)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Main Radio Freq</label>
                <input
                  type="text"
                  value={profile.radioFrequency}
                  onChange={(e) => setProfile({ ...profile, radioFrequency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">SafetyCom Freq</label>
                <input
                  type="text"
                  value={profile.safetyCom}
                  onChange={(e) => setProfile({ ...profile, safetyCom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">ATIS / Info Freq</label>
                <input
                  type="text"
                  value={profile.atisFrequency || ''}
                  onChange={(e) => setProfile({ ...profile, atisFrequency: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Circuit Height AGL (ft)</label>
                <input
                  type="number"
                  value={profile.circuitHeightAglFt}
                  onChange={(e) => {
                    const agl = Number(e.target.value);
                    setProfile({
                      ...profile,
                      circuitHeightAglFt: agl,
                      circuitHeightQnhFt: profile.elevationFt + agl,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Circuit Height QNH (ft)</label>
                <input
                  type="number"
                  disabled
                  value={profile.circuitHeightQnhFt}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Noise Abatement & Environmental Rules</label>
              <textarea
                rows={3}
                value={profile.noiseAbatementProcedures}
                onChange={(e) =>
                  setProfile({ ...profile, noiseAbatementProcedures: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Runways Management */}
      {activeSubTab === 'RUNWAYS' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <Plane className="w-4 h-4 text-zinc-800" />
              <span>Physical Runways & Operating Directions</span>
            </h3>
            <button
              onClick={handleAddRunway}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-medium transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Runway Strip</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {runways.map((rwy, idx) => (
              <div
                key={rwy.id}
                className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-800 flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={rwy.designation}
                      onChange={(e) => handleUpdateRunway(rwy.id, { designation: e.target.value })}
                      className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded font-bold text-zinc-950 text-sm focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rwy.isInUse}
                        onChange={(e) => handleUpdateRunway(rwy.id, { isInUse: e.target.checked })}
                        className="rounded accent-zinc-900"
                      />
                      <span className={rwy.isInUse ? 'text-zinc-950 font-bold' : 'text-zinc-400'}>
                        {rwy.isInUse ? 'ACTIVE FOR FLIGHTS' : 'INACTIVE'}
                      </span>
                    </label>

                    {runways.length > 1 && (
                      <button
                        onClick={() => handleRemoveRunway(rwy.id)}
                        className="text-zinc-400 hover:text-zinc-900 p-1 rounded hover:bg-zinc-100"
                        title="Delete Runway"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-zinc-600 mb-1 font-medium">Magnetic Heading (°)</label>
                    <input
                      type="number"
                      value={rwy.headingDegrees}
                      onChange={(e) =>
                        handleUpdateRunway(rwy.id, { headingDegrees: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 mb-1 font-medium">Surface Type</label>
                    <select
                      value={rwy.surface}
                      onChange={(e) =>
                        handleUpdateRunway(rwy.id, { surface: e.target.value as RunwaySurface })
                      }
                      className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    >
                      <option value="ASPHALT">Asphalt / Tarmac</option>
                      <option value="GRASS">Grass Strip</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 mb-1 font-medium">Length (m)</label>
                    <input
                      type="number"
                      value={rwy.lengthMeters}
                      onChange={(e) =>
                        handleUpdateRunway(rwy.id, {
                          lengthMeters: Number(e.target.value),
                          toraMeters: Number(e.target.value),
                          ldaMeters: Math.max(0, Number(e.target.value) - 40),
                        })
                      }
                      className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 mb-1 font-medium">Width (m)</label>
                    <input
                      type="number"
                      value={rwy.widthMeters}
                      onChange={(e) =>
                        handleUpdateRunway(rwy.id, { widthMeters: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 mb-1 font-medium">Surface Condition</label>
                    <select
                      value={rwy.condition}
                      onChange={(e) =>
                        handleUpdateRunway(rwy.id, { condition: e.target.value as RunwayCondition })
                      }
                      className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    >
                      <option value="DRY">Dry (Good)</option>
                      <option value="DAMP">Damp</option>
                      <option value="WET">Wet</option>
                      <option value="SOFT_GROUND">Soft Ground</option>
                      <option value="WATERLOGGED">Waterlogged</option>
                      <option value="CLOSED">Closed (X Markings)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 mb-1 font-medium">Circuit Hand</label>
                    <select
                      value={rwy.circuitDirection}
                      onChange={(e) =>
                        handleUpdateRunway(rwy.id, {
                          circuitDirection: e.target.value as 'LEFT_HAND' | 'RIGHT_HAND',
                        })
                      }
                      className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    >
                      <option value="LEFT_HAND">Left Hand (LH)</option>
                      <option value="RIGHT_HAND">Right Hand (RH)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 mb-1 font-medium">Runway-Specific Noise & Local Notes</label>
                  <input
                    type="text"
                    value={rwy.noiseSensitiveSide}
                    onChange={(e) =>
                      handleUpdateRunway(rwy.id, { noiseSensitiveSide: e.target.value })
                    }
                    className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Parking & Stands */}
      {activeSubTab === 'PARKING' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-800" />
              <span>Apron Hardstandings, Tie-down Bays & Hangars</span>
            </h3>
            <button
              onClick={handleAddParkingBay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-medium transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parking Stand</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {parkingBays.map((bay) => (
              <div
                key={bay.id}
                className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2 relative shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-950">{bay.name}</span>
                  <button
                    onClick={() => handleRemoveParkingBay(bay.id)}
                    className="text-zinc-400 hover:text-zinc-900"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-zinc-600">
                  <div>Type: <strong className="text-zinc-950">{bay.type.replace('_', ' ')}</strong></div>
                  <div>Max Wingspan: <strong className="text-zinc-950">{bay.maxWingspanMeters}m</strong></div>
                  <div>Max Weight: <strong className="text-zinc-950">{bay.maxWeightKg}kg</strong></div>
                  <div>
                    Occupied By:{' '}
                    {bay.occupiedByCallsign ? (
                      <span className="text-zinc-950 font-bold">{bay.occupiedByCallsign}</span>
                    ) : (
                      <span className="text-zinc-500 font-medium">VACANT</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 4: Fuel Tanks & Retail Prices */}
      {activeSubTab === 'FUEL' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <Fuel className="w-4 h-4 text-zinc-800" />
              <span>Aviation Fuel Tanks & Retail Tariffs (£ / Litre)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fuelTanks.map((tank) => (
              <div
                key={tank.id}
                className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="font-bold text-zinc-950">{tank.name}</div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200">
                    {tank.fuelType}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-zinc-600 mb-1 font-medium">Retail Price (Pence per Litre)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tank.pricePerLiterPence}
                        onChange={(e) =>
                          handleUpdateTank(tank.id, { pricePerLiterPence: Number(e.target.value) })
                        }
                        className="w-full px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
                      />
                      <span className="text-zinc-600 font-bold whitespace-nowrap">
                        = £{(tank.pricePerLiterPence / 100).toFixed(2)}/L
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-zinc-600 mb-1 font-medium">Tank Capacity (L)</label>
                      <input
                        type="number"
                        value={tank.capacityLiters}
                        onChange={(e) =>
                          handleUpdateTank(tank.id, { capacityLiters: Number(e.target.value) })
                        }
                        className="w-full px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 mb-1 font-medium">Current Dip Level (L)</label>
                      <input
                        type="number"
                        value={tank.currentLevelLiters}
                        onChange={(e) =>
                          handleUpdateTank(tank.id, { currentLevelLiters: Number(e.target.value) })
                        }
                        className="w-full px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-600 mb-1 font-medium">Dispenser Pump Status</label>
                    <select
                      value={tank.pumpStatus}
                      onChange={(e) =>
                        handleUpdateTank(tank.id, { pumpStatus: e.target.value as any })
                      }
                      className="w-full px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                    >
                      <option value="OPERATIONAL">Operational</option>
                      <option value="REFUELING_IN_PROGRESS">Refueling in progress</option>
                      <option value="LOW_STOCK">Low Stock Warning</option>
                      <option value="CALIBRATION">Calibration / Out of Service</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 5: Tariffs & Landing Fee Schedule */}
      {activeSubTab === 'TARIFFS' && (
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 font-mono text-xs shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-zinc-800" />
              <span>Published Aerodrome Tariffs & Landing Fee Schedule</span>
            </h3>
            <span className="text-zinc-500">All prices in £ GBP (excl VAT)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Microlight / VLA (≤ 450 kg)</label>
              <input
                type="number"
                step="0.5"
                value={profile.feeSchedule.microlightFee}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: { ...profile.feeSchedule, microlightFee: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Sub-1000 kg (C152, Robin DR400)</label>
              <input
                type="number"
                step="0.5"
                value={profile.feeSchedule.sub1000KgFee}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: { ...profile.feeSchedule, sub1000KgFee: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">1001 - 1500 kg (PA-28, C172, DA40)</label>
              <input
                type="number"
                step="0.5"
                value={profile.feeSchedule.sub1500KgFee}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: { ...profile.feeSchedule, sub1500KgFee: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">1501 - 2000 kg (Cirrus SR22, Bonanza)</label>
              <input
                type="number"
                step="0.5"
                value={profile.feeSchedule.sub2000KgFee}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: { ...profile.feeSchedule, sub2000KgFee: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Twin / Heavy (Over 2000 kg, DA42, Seneca)</label>
              <input
                type="number"
                step="1"
                value={profile.feeSchedule.twinFee}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: { ...profile.feeSchedule, twinFee: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Touch-and-Go / Circuit Training Fee</label>
              <input
                type="number"
                step="1"
                value={profile.feeSchedule.circuitFee}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: { ...profile.feeSchedule, circuitFee: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Overnight Apron Grass Tie-down (£/night)</label>
              <input
                type="number"
                step="1"
                value={profile.feeSchedule.overnightGrassFee}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: {
                      ...profile.feeSchedule,
                      overnightGrassFee: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Overnight Secure Hangarage (£/night)</label>
              <input
                type="number"
                step="1"
                value={profile.feeSchedule.overnightHangarFee}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: {
                      ...profile.feeSchedule,
                      overnightHangarFee: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-600 mb-1 font-medium">Resident Flying Club Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={profile.feeSchedule.residentDiscountPercent}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    feeSchedule: {
                      ...profile.feeSchedule,
                      residentDiscountPercent: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 font-bold focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
