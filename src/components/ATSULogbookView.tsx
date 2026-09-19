import React, { useState } from 'react';
import { ATSULogEntry } from '../types/airfield';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Plus,
  Radio,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface ATSULogbookViewProps {
  logs: ATSULogEntry[];
  onOpenQuickLogModal: () => void;
  onOpenInvoiceForCallsign: (callsign: string) => void;
}

export const ATSULogbookView: React.FC<ATSULogbookViewProps> = ({
  logs,
  onOpenQuickLogModal,
  onOpenInvoiceForCallsign,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs.filter((entry) => {
    const matchesSearch =
      entry.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.aircraftType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.pilotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.radioLogRemarks.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || entry.movementType === filterType;

    return matchesSearch && matchesType;
  });

  const exportCsv = () => {
    const headers = [
      'Seq #',
      'UTC Time',
      'Callsign',
      'Type',
      'MTOW (kg)',
      'Pilot (PIC)',
      'Movement',
      'Rules',
      'Runway',
      'PoB',
      'Route From',
      'Route To',
      'Service',
      'T&G Count',
      'Radio Remarks',
      'Fee (£)',
      'Payment Status',
    ];

    const rows = filteredLogs.map((log) => [
      log.logSequence,
      log.timestampUtc,
      log.callsign,
      log.aircraftType,
      log.mtowKg,
      `"${log.pilotName}"`,
      log.movementType,
      log.flightRules,
      log.runway,
      log.pob,
      log.routeFrom,
      log.routeTo,
      `"${log.atsuServiceProvided}"`,
      log.touchAndGoCompleted,
      `"${log.radioLogRemarks}"`,
      log.feeCalculatedGbp.toFixed(2),
      log.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAA_ATSU_Movement_Log_EGMS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* CAA Regulatory Header Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold uppercase tracking-wider text-zinc-950">
                CAA Statutory ATSU Movements & Radio Logbook
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                UK CAP 797 & CAP 452
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Statutory Air-Ground (A/G) Radio & Movement Record. Feeds automated fee computation for landings, touch-and-goes, and fuel.
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Record & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>Export CAA CSV Audit</span>
          </button>

          <button
            onClick={onOpenQuickLogModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Log Movement / Radio Call</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by Callsign, Pilot, Aircraft Type, or Radio Remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'ARR', 'DEP', 'T&G', 'TRANSIT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === type
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
              }`}
            >
              {type === 'ALL' ? 'All Movements' : type}
            </button>
          ))}
        </div>
      </div>

      {/* The Statutory Logbook Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-500 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Seq #</th>
                <th className="py-3 px-3">Time (UTC)</th>
                <th className="py-3 px-3">Callsign</th>
                <th className="py-3 px-3">Type / MTOW</th>
                <th className="py-3 px-3">Pilot (PIC)</th>
                <th className="py-3 px-3">Kind</th>
                <th className="py-3 px-3">RWY</th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-4">Radio Log Remarks (Statutory Record)</th>
                <th className="py-3 px-3 text-right">Fee (£)</th>
                <th className="py-3 px-4 text-center">Billing Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-zinc-500">
                    #{entry.logSequence}
                  </td>
                  <td className="py-3 px-3 font-mono text-zinc-700 whitespace-nowrap">
                    {entry.timestampUtc}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-zinc-950 text-sm">
                    {entry.callsign}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-zinc-900 font-medium">{entry.aircraftType}</div>
                    <div className="text-[10px] text-zinc-500">{entry.mtowKg} kg</div>
                  </td>
                  <td className="py-3 px-3 text-zinc-800">{entry.pilotName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {entry.movementType} {entry.touchAndGoCompleted > 0 && `(${entry.touchAndGoCompleted}x)`}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-zinc-800">
                    {entry.runway}
                  </td>
                  <td className="py-3 px-3 text-zinc-600 font-mono text-[11px]">
                    {entry.routeFrom} ➔ {entry.routeTo}
                  </td>
                  <td className="py-3 px-4 text-zinc-700 max-w-xs leading-relaxed text-[11px]">
                    {entry.radioLogRemarks}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-zinc-950">
                    £{entry.feeCalculatedGbp.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onOpenInvoiceForCallsign(entry.callsign)}
                      className="px-2.5 py-1 rounded bg-white hover:bg-zinc-50 text-zinc-800 text-[10px] font-medium transition-colors inline-flex items-center gap-1 border border-zinc-300"
                    >
                      <span>{entry.paymentMethod}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 font-mono">
          <span>
            Total Entries: <strong className="text-zinc-900">{filteredLogs.length}</strong> statutory movements logged today
          </span>
          <span>
            Total Movement Revenue Logged: <strong className="text-zinc-950 font-bold">
              £{filteredLogs.reduce((sum, l) => sum + l.feeCalculatedGbp, 0).toFixed(2)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
