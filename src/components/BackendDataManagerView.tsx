import React, { useState } from 'react';
import {
  AircraftMovement,
  ATSULogEntry,
  AirfieldInvoice,
  AirfieldProfile,
  Runway,
  ParkingBay,
  FuelStorageTank,
  MovementStatus,
} from '../types/airfield';
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  Trash2,
  Edit2,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  PlaneLanding,
  Clock,
  Server,
  RefreshCw,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import {
  exportAtsuLogsToCsv,
  exportMovementsToCsv,
  downloadJsonFile,
  AerodromeDatabaseState,
} from '../utils/storage';
import { LogLandedAircraftModal } from './LogLandedAircraftModal';

interface BackendDataManagerViewProps {
  profile: AirfieldProfile;
  movements: AircraftMovement[];
  atsuLogs: ATSULogEntry[];
  invoices: AirfieldInvoice[];
  runways: Runway[];
  parkingBays: ParkingBay[];
  fuelTanks: FuelStorageTank[];
  onUpdateMovement: (updated: AircraftMovement) => void;
  onDeleteMovement: (movementId: string) => void;
  onAddLandedAircraft: (movement: AircraftMovement) => void;
  onUpdateAtsuLog: (updated: ATSULogEntry) => void;
  onDeleteAtsuLog: (logId: string) => void;
  onRestoreDatabase: (importedState: AerodromeDatabaseState) => void;
  onResetToDefaults: () => void;
  onArchiveDayMovements: () => void;
}

export const BackendDataManagerView: React.FC<BackendDataManagerViewProps> = ({
  profile,
  movements,
  atsuLogs,
  invoices,
  runways,
  parkingBays,
  fuelTanks,
  onUpdateMovement,
  onDeleteMovement,
  onAddLandedAircraft,
  onUpdateAtsuLog,
  onDeleteAtsuLog,
  onRestoreDatabase,
  onResetToDefaults,
  onArchiveDayMovements,
}) => {
  const [activeTab, setActiveTab] = useState<'MOVEMENTS' | 'ATSU_LOGS' | 'STORAGE_VAULT' | 'API_SCHEMA'>(
    'MOVEMENTS'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLandedModalOpen, setIsLandedModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<AircraftMovement | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered movements
  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.aircraftType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.pilotName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return m.status === statusFilter;
  });

  // Filtered logs
  const filteredLogs = atsuLogs.filter((log) => {
    return (
      log.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.pilotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(log.logSequence).includes(searchTerm)
    );
  });

  // Export Full JSON
  const handleExportFullJson = () => {
    const fullDb = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      aerodrome: profile,
      runways,
      parkingBays,
      fuelTanks,
      movements,
      atsuLogs,
      invoices,
    };
    downloadJsonFile(`AirfieldOS_Database_Backup_${profile.icao}_${Date.now()}.json`, fullDb);
    notify('Full JSON database export generated and downloaded.');
  };

  // Import JSON
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.movements || !parsed.aerodrome) {
          notify('Error: Uploaded file is missing required movements or aerodrome profile!');
          return;
        }

        const restoredState: AerodromeDatabaseState = {
          version: parsed.version || '1.2.0',
          lastUpdated: new Date().toISOString(),
          activeAirfieldId: parsed.aerodrome.id || profile.id,
          airfieldProfile: parsed.aerodrome || profile,
          customProfiles: [parsed.aerodrome || profile],
          runways: parsed.runways || runways,
          parkingBays: parsed.parkingBays || parkingBays,
          fuelTanks: parsed.fuelTanks || fuelTanks,
          movements: parsed.movements || [],
          atsuLogs: parsed.atsuLogs || [],
          invoices: parsed.invoices || [],
          weather: parsed.weather || {
            windDegrees: 240,
            windSpeedKnots: 12,
            windGustKnots: 16,
            qnhHpa: 1018,
            visibilityMeters: 10000,
            cloudBaseFt: 3500,
            temperatureC: 17,
            dewpointC: 9,
            surfaceConditionNotes: 'Runways clear and dry.',
            activeRunway: '24',
            headwindKnots: 12,
            crosswindKnots: 0,
            crosswindDirection: 'DIRECT',
          },
        };

        onRestoreDatabase(restoredState);
        notify('Aerodrome database restored successfully from JSON backup!');
      } catch (err) {
        console.error(err);
        notify('Failed to parse database file. Ensure valid JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Storage Status & Engine Banner */}
      <div className="p-5 rounded-2xl bg-white border border-zinc-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-zinc-800" />
            <h2 className="text-base font-bold uppercase tracking-wider text-zinc-950">
              Backend Data Management & Aerodrome Storage Vault
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold">
              PERSISTENCE ONLINE
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage raw database records for flights, landed airplanes, and CAA statutory logs. Export, backup, and restore persistent airfield records anytime.
          </p>
        </div>

        {/* Quick Database Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLandedModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-mono font-medium text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <PlaneLanding className="w-4 h-4" />
            <span>Log Landed Airplane</span>
          </button>

          <button
            onClick={handleExportFullJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-mono font-medium text-xs transition-colors shadow-xs"
            title="Download full database backup"
          >
            <Download className="w-4 h-4 text-zinc-600" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-mono font-medium text-xs cursor-pointer transition-colors shadow-xs">
            <Upload className="w-4 h-4 text-zinc-600" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJsonFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => exportAtsuLogsToCsv(atsuLogs, profile.icao)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-mono font-medium text-xs transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-zinc-600" />
            <span>CAA CSV</span>
          </button>
        </div>
      </div>

      {/* Storage Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <div className="text-zinc-500 text-[11px] font-medium">Flight Movements</div>
          <div className="text-xl font-bold text-zinc-950 mt-1">{movements.length} Records</div>
          <div className="text-[10px] text-zinc-600 mt-0.5">
            {movements.filter((m) => m.status === 'LANDED_TAXIED' || m.status === 'PARKED').length} currently on aerodrome
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <div className="text-zinc-500 text-[11px] font-medium">Statutory ATSU Logs</div>
          <div className="text-xl font-bold text-zinc-950 mt-1">{atsuLogs.length} Entries</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">CAA CAP 797 Audit Ready</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <div className="text-zinc-500 text-[11px] font-medium">Billing Invoices</div>
          <div className="text-xl font-bold text-zinc-950 mt-1">{invoices.length} Invoices</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            £{invoices.reduce((acc, i) => acc + i.totalGbp, 0).toFixed(2)} total billed
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-xs">
          <div className="text-zinc-500 text-[11px] font-medium">Storage Engine</div>
          <div className="text-sm font-bold text-zinc-950 mt-1 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-zinc-700" />
            <span>LocalStorage + Cloud JSON</span>
          </div>
          <div className="text-[10px] text-zinc-600 mt-0.5">Auto-synced across sessions</div>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-zinc-950 text-white border border-zinc-900 text-xs font-mono flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('MOVEMENTS')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'MOVEMENTS'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Flight Movements & Landed Airplanes ({movements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ATSU_LOGS')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'ATSU_LOGS'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>ATSU Statutory Records ({atsuLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('STORAGE_VAULT')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'STORAGE_VAULT'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Backup, Archive & Reset Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('API_SCHEMA')}
          className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'API_SCHEMA'
              ? 'bg-zinc-950 text-white font-medium'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Cloud Schema & API Architecture</span>
        </button>
      </div>

      {/* Sub-Panel 1: Flight Movements & Landed Aircraft Table */}
      {activeTab === 'MOVEMENTS' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search callsign, aircraft type, or pilot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-600">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-950 text-xs"
              >
                <option value="ALL">All Statuses ({movements.length})</option>
                <option value="LANDED_TAXIED">Landed & Taxied</option>
                <option value="PARKED">Parked on Stand</option>
                <option value="IN_CIRCUIT">In Circuit (T&G)</option>
                <option value="EN_ROUTE_INBOUND">Inbound En-Route</option>
                <option value="PPR_REQUESTED">PPR Requested</option>
                <option value="DEPARTED">Departed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={() => exportMovementsToCsv(movements, profile.icao)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 font-medium border border-zinc-200 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-zinc-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Movements Data Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] text-zinc-600 uppercase font-semibold">
                    <th className="p-3">Callsign / Type</th>
                    <th className="p-3">Pilot / Contact</th>
                    <th className="p-3">Flight Status</th>
                    <th className="p-3">Runway & Stand</th>
                    <th className="p-3">Touchdown / ETA</th>
                    <th className="p-3">Circuits</th>
                    <th className="p-3">Fuel Uplift</th>
                    <th className="p-3">Billing</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-zinc-500">
                        No flight movements found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-zinc-50/60 transition-colors">
                        {/* Callsign & Aircraft */}
                        <td className="p-3">
                          <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                            <span>{mov.callsign}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200">
                              {mov.mtowKg}kg
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-600">{mov.aircraftType}</div>
                          <div className="text-[10px] text-zinc-400 font-normal">
                            Ref: {mov.pprNumber}
                          </div>
                        </td>

                        {/* Pilot */}
                        <td className="p-3">
                          <div className="text-zinc-900 font-medium">{mov.pilotName}</div>
                          <div className="text-[10px] text-zinc-500">{mov.pilotPhone}</div>
                          <div className="text-[10px] text-zinc-400">From: {mov.homeBase}</div>
                        </td>

                        {/* Status with inline quick switcher */}
                        <td className="p-3">
                          <select
                            value={mov.status}
                            onChange={(e) =>
                              onUpdateMovement({
                                ...mov,
                                status: e.target.value as MovementStatus,
                                actualTime:
                                  e.target.value === 'LANDED_TAXIED' && !mov.actualTime
                                    ? mov.scheduledTime
                                    : mov.actualTime,
                              })
                            }
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border bg-zinc-50 text-zinc-900 border-zinc-200 focus:outline-none focus:border-zinc-950"
                          >
                            <option value="PPR_REQUESTED">PPR Requested</option>
                            <option value="EN_ROUTE_INBOUND">Inbound En Route</option>
                            <option value="IN_CIRCUIT">In Circuit (T&G)</option>
                            <option value="LANDED_TAXIED">Landed & Taxied</option>
                            <option value="PARKED">Parked on Stand</option>
                            <option value="DEPARTED">Departed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>

                        {/* Runway & Stand */}
                        <td className="p-3">
                          <div className="text-zinc-950 font-bold">RWY {mov.runway}</div>
                          <div className="text-[10px] text-zinc-500">{mov.parkingBayId}</div>
                        </td>

                        {/* Touchdown / ETA */}
                        <td className="p-3">
                          {mov.actualTime ? (
                            <div className="text-zinc-950 font-bold flex items-center gap-1">
                              <PlaneLanding className="w-3.5 h-3.5 text-zinc-700" />
                              <span>{mov.actualTime} UTC (Landed)</span>
                            </div>
                          ) : (
                            <div className="text-zinc-500">ETA {mov.scheduledTime} UTC</div>
                          )}
                        </td>

                        {/* Circuits */}
                        <td className="p-3">
                          <div className="text-zinc-950 font-bold">
                            {mov.touchAndGoCount > 0 ? `${mov.touchAndGoCount} T&G` : 'None'}
                          </div>
                        </td>

                        {/* Fuel */}
                        <td className="p-3">
                          {mov.fuelUpliftLiters > 0 ? (
                            <div className="text-zinc-950 font-bold">
                              {mov.fuelUpliftLiters}L {mov.fuelType}
                            </div>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>

                        {/* Billing Status */}
                        <td className="p-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                              mov.billingStatus === 'PAID'
                                ? 'bg-zinc-950 text-white border-zinc-950'
                                : mov.billingStatus === 'INVOICED'
                                ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
                                : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                            }`}
                          >
                            {mov.billingStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingMovement(mov)}
                              className="p-1 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950"
                              title="Edit Flight Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete flight record for ${mov.callsign}?`)) {
                                  onDeleteMovement(mov.id);
                                  notify(`Deleted flight movement ${mov.callsign}.`);
                                }
                              }}
                              className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Panel 2: ATSU Statutory Records Editor */}
      {activeTab === 'ATSU_LOGS' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search log sequence, callsign, or pilot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white text-xs w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportAtsuLogsToCsv(atsuLogs, profile.icao)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-medium shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-zinc-600" />
                <span>Export CAP 797 CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] text-zinc-600 uppercase font-semibold">
                    <th className="p-3">Seq #</th>
                    <th className="p-3">UTC Timestamp</th>
                    <th className="p-3">Callsign & Type</th>
                    <th className="p-3">Movement</th>
                    <th className="p-3">Runway</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Radio Remarks</th>
                    <th className="p-3 text-right">Fee (£)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="p-3 font-bold text-zinc-950">#{log.logSequence}</td>
                      <td className="p-3 text-zinc-600">{log.timestampUtc}</td>
                      <td className="p-3 font-bold text-zinc-950">
                        {log.callsign} <span className="text-zinc-500 font-normal">({log.aircraftType})</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200">
                          {log.movementType}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-800 font-medium">RWY {log.runway}</td>
                      <td className="p-3 text-zinc-600">
                        {log.routeFrom} → {log.routeTo}
                      </td>
                      <td className="p-3 text-zinc-600 max-w-xs truncate" title={log.radioLogRemarks}>
                        {log.radioLogRemarks}
                      </td>
                      <td className="p-3 text-right font-bold text-zinc-950">
                        £{log.feeCalculatedGbp.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove ATSU Log sequence #${log.logSequence}?`)) {
                              onDeleteAtsuLog(log.id);
                              notify(`Deleted statutory log entry #${log.logSequence}.`);
                            }
                          }}
                          className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950"
                          title="Void Log Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Panel 3: Backup, Storage & Archive Tools */}
      {activeTab === 'STORAGE_VAULT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Export / Backup Section */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <Download className="w-4 h-4 text-zinc-800" />
              <span>Database Backups & Cloud Exports</span>
            </h3>

            <p className="text-zinc-600 text-[11px] leading-relaxed">
              Export complete backups containing all your airfield profiles, runways, active flight schedules, landed airplanes, ATSU radio transcripts, and invoices.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleExportFullJson}
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:bg-white flex items-center justify-between text-left transition-all shadow-xs"
              >
                <div>
                  <div className="font-bold text-zinc-950 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-zinc-700" />
                    <span>Complete JSON Database Snapshot</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Portable standard JSON for cloud databases (Firestore, PostgreSQL, Mongo)
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-700" />
              </button>

              <button
                onClick={() => exportAtsuLogsToCsv(atsuLogs, profile.icao)}
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:bg-white flex items-center justify-between text-left transition-all shadow-xs"
              >
                <div>
                  <div className="font-bold text-zinc-950 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-zinc-700" />
                    <span>Official CAA CAP 797 Audit CSV</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Formatted for annual UK Civil Aviation Authority safety review
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-700" />
              </button>

              <button
                onClick={() => exportMovementsToCsv(movements, profile.icao)}
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:bg-white flex items-center justify-between text-left transition-all shadow-xs"
              >
                <div>
                  <div className="font-bold text-zinc-950 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-zinc-700" />
                    <span>Flight Movements & Landed Fleet CSV</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Spreadsheet of all traffic, parking stands, fuel uplifts, and fees
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-700" />
              </button>
            </div>
          </div>

          {/* Maintenance & Reset Operations */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-zinc-800" />
              <span>Operations Archival & Reset Controls</span>
            </h3>

            <p className="text-zinc-600 text-[11px] leading-relaxed">
              Use these utilities at the end of the flying day, before seasonal audits, or when initializing a fresh airfield profile.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="font-bold text-zinc-950">Archive Day Operations</div>
                <p className="text-[11px] text-zinc-500">
                  Clears completed arrivals and departures while maintaining resident club aircraft parked in hangars and preserving ATSU logs.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Archive completed day flights?')) {
                      onArchiveDayMovements();
                      notify('Day operations archived. Apron cleared for next flying session.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-medium shadow-xs transition-colors"
                >
                  Archive Today's Completed Traffic
                </button>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="font-bold text-zinc-950">Restore Factory Preset Sample Data</div>
                <p className="text-[11px] text-zinc-500">
                  Resets the database back to standard Meadowfield (EGMS) baseline with sample traffic, ATSU entries, and fuel tanks.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all data back to factory defaults?')) {
                      onResetToDefaults();
                      notify('Database restored to default baseline.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium border border-zinc-300 transition-colors"
                >
                  Reset to Factory Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Panel 4: API & Cloud Architecture Documentation */}
      {activeTab === 'API_SCHEMA' && (
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 font-mono text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-800" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
              Aerodrome Backend Storage Architecture & Schema Guide
            </h3>
          </div>

          <p className="text-zinc-600 leading-relaxed text-xs">
            AirfieldOS is engineered with a decoupled schema designed to run offline on the client via persistent local storage while syncing seamlessly with remote cloud databases (such as Google Cloud Firestore, PostgreSQL via Cloud SQL, or custom aerodrome REST backends).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-zinc-700" />
                <span>1. Local Offline Vault</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Every movement, radio entry, and fuel dip is cached in real-time in the browser's persistent key-value store. Zero internet dependency during tower radio operations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-zinc-700" />
                <span>2. JSON Data Interchange</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Standardized ISO-8601 UTC timestamps, ICAO identifiers, and CAP 797 log sequences allow one-click JSON import/export between different aerodrome staff shifts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                <span>3. CAA Compliance Schema</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Data entities strictly correspond to UK Civil Aviation Authority CAP 797 (AFIS) and CAP 452 (A/G Radiotelephony) statutory fields for seamless annual audits.
              </p>
            </div>
          </div>

          <div>
            <div className="text-zinc-600 font-bold mb-1">Raw Aircraft Movement Entity Schema (JSON Preview):</div>
            <pre className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl text-[11px] overflow-x-auto">
{`{
  "id": "mov-102",
  "callsign": "G-CDEF",
  "aircraftType": "Cirrus SR22T G6",
  "mtowKg": 1633,
  "category": "VISITING_PRIVATE",
  "pilotName": "Capt. James Miller",
  "homeBase": "EGTE",
  "pprNumber": "PPR-2026-0842",
  "flightRules": "VFR",
  "movementKind": "FULL_STOP_LANDING",
  "status": "LANDED_TAXIED",
  "scheduledTime": "14:15",
  "actualTime": "14:18",
  "runway": "24 (Asphalt)",
  "parkingBayId": "Hardstanding H2",
  "fuelUpliftLiters": 80,
  "fuelType": "AVGAS_100LL",
  "billingStatus": "INVOICED"
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Log Landed Aircraft Modal */}
      <LogLandedAircraftModal
        isOpen={isLandedModalOpen}
        onClose={() => setIsLandedModalOpen(false)}
        runways={runways}
        parkingBays={parkingBays}
        feeSchedule={profile.feeSchedule}
        onSaveLandedAircraft={(newMov) => {
          onAddLandedAircraft(newMov);
          notify(`Logged landed aircraft ${newMov.callsign} on runway ${newMov.runway}.`);
        }}
      />

      {/* Inline Movement Edit Modal */}
      {editingMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-mono text-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="font-bold text-zinc-950 uppercase text-sm">
                Edit Flight Record: {editingMovement.callsign}
              </h3>
              <button
                onClick={() => setEditingMovement(null)}
                className="text-zinc-400 hover:text-zinc-900"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Pilot Name</label>
                <input
                  type="text"
                  value={editingMovement.pilotName}
                  onChange={(e) =>
                    setEditingMovement({ ...editingMovement, pilotName: e.target.value })
                  }
                  className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Aircraft MTOW (kg)</label>
                <input
                  type="number"
                  value={editingMovement.mtowKg}
                  onChange={(e) =>
                    setEditingMovement({ ...editingMovement, mtowKg: Number(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Actual Landing Time (UTC)</label>
                <input
                  type="text"
                  value={editingMovement.actualTime || ''}
                  onChange={(e) =>
                    setEditingMovement({ ...editingMovement, actualTime: e.target.value })
                  }
                  placeholder="e.g. 14:18"
                  className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Allocated Stand</label>
                <select
                  value={editingMovement.parkingBayId}
                  onChange={(e) =>
                    setEditingMovement({ ...editingMovement, parkingBayId: e.target.value })
                  }
                  className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                >
                  {parkingBays.map((bay) => (
                    <option key={bay.id} value={bay.name}>
                      {bay.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Fuel Uplift (Litres)</label>
                <input
                  type="number"
                  value={editingMovement.fuelUpliftLiters}
                  onChange={(e) =>
                    setEditingMovement({
                      ...editingMovement,
                      fuelUpliftLiters: Number(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Billing Status</label>
                <select
                  value={editingMovement.billingStatus}
                  onChange={(e) =>
                    setEditingMovement({
                      ...editingMovement,
                      billingStatus: e.target.value as any,
                    })
                  }
                  className="w-full px-2 py-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-950 focus:outline-none focus:border-zinc-950 focus:bg-white"
                >
                  <option value="UNBILLED">UNBILLED</option>
                  <option value="INVOICED">INVOICED</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingMovement(null)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateMovement(editingMovement);
                  setEditingMovement(null);
                  notify(`Saved updates to flight ${editingMovement.callsign}.`);
                }}
                className="px-4 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-medium uppercase shadow-xs"
              >
                Update Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
