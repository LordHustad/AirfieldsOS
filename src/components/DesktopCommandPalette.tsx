import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  PlaneLanding,
  PlusCircle,
  Radio,
  Monitor,
  Maximize2,
  FileSpreadsheet,
  Receipt,
  Plane,
  LayoutDashboard,
  Building2,
  Database,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import { ActiveAppTab } from './Header';
import { AircraftMovement } from '../types/airfield';

interface DesktopCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveAppTab) => void;
  onOpenLandedModal: () => void;
  onOpenNewPPRModal: () => void;
  onOpenQuickLogModal: () => void;
  onToggleDensity: () => void;
  isHighDensity: boolean;
  onOpenDualMonitor: () => void;
  onToggleFullscreen: () => void;
  movements: AircraftMovement[];
  onSelectMovement?: (id: string) => void;
}

export const DesktopCommandPalette: React.FC<DesktopCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenLandedModal,
  onOpenNewPPRModal,
  onOpenQuickLogModal,
  onToggleDensity,
  isHighDensity,
  onOpenDualMonitor,
  onToggleFullscreen,
  movements,
  onSelectMovement,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter actions and aircraft
  const defaultActions = [
    {
      id: 'log-landed',
      title: 'Log Landed Aircraft (Touchdown)',
      category: 'Operations',
      icon: PlaneLanding,
      shortcut: 'L',
      action: () => {
        onClose();
        onOpenLandedModal();
      },
    },
    {
      id: 'new-ppr',
      title: 'Create Prior Permission Required (PPR) Booking',
      category: 'Operations',
      icon: PlusCircle,
      shortcut: 'P',
      action: () => {
        onClose();
        onOpenNewPPRModal();
      },
    },
    {
      id: 'log-atsu',
      title: 'Log ATSU / Radio Transmission (CAP 797)',
      category: 'Air Traffic',
      icon: Radio,
      shortcut: 'R',
      action: () => {
        onClose();
        onOpenQuickLogModal();
      },
    },
    {
      id: 'dual-monitor',
      title: 'Open Dual-Monitor Tower Display (Secondary Screen)',
      category: 'Desktop Workstation',
      icon: Monitor,
      shortcut: 'M',
      action: () => {
        onClose();
        onOpenDualMonitor();
      },
    },
    {
      id: 'toggle-density',
      title: isHighDensity ? 'Switch to Standard Display Density' : 'Switch to High-Density Tower Mode (Widescreen)',
      category: 'Desktop Workstation',
      icon: LayoutDashboard,
      shortcut: 'D',
      action: () => {
        onClose();
        onToggleDensity();
      },
    },
    {
      id: 'toggle-fullscreen',
      title: 'Toggle Fullscreen Tower Workstation',
      category: 'Desktop Workstation',
      icon: Maximize2,
      shortcut: 'F',
      action: () => {
        onClose();
        onToggleFullscreen();
      },
    },
    {
      id: 'tab-control-centre',
      title: 'Go to 1. Control Centre',
      category: 'Navigation',
      icon: Plane,
      shortcut: '1',
      action: () => {
        onClose();
        onSelectTab('CONTROL_CENTRE');
      },
    },
    {
      id: 'tab-operations-feed',
      title: 'Go to 2. Active Movements & Decision Panel',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: '2',
      action: () => {
        onClose();
        onSelectTab('DECISION_PANEL');
      },
    },
    {
      id: 'tab-atsu-logbook',
      title: 'Go to 3. CAA CAP 797 ATSU Logbook',
      category: 'Navigation',
      icon: FileSpreadsheet,
      shortcut: '3',
      action: () => {
        onClose();
        onSelectTab('ATSU_LOGBOOK');
      },
    },
    {
      id: 'tab-billing-engine',
      title: 'Go to 4. Billing & Fee Engine',
      category: 'Navigation',
      icon: Receipt,
      shortcut: '4',
      action: () => {
        onClose();
        onSelectTab('BILLING_ENGINE');
      },
    },
    {
      id: 'tab-airfield-setup',
      title: 'Go to 5. Airfield Setup & Runways',
      category: 'Navigation',
      icon: Building2,
      shortcut: '5',
      action: () => {
        onClose();
        onSelectTab('AIRFIELD_SETUP');
      },
    },
    {
      id: 'tab-backend-data',
      title: 'Go to 6. Backend Data Manager & Backup',
      category: 'Navigation',
      icon: Database,
      shortcut: '6',
      action: () => {
        onClose();
        onSelectTab('BACKEND_DATA');
      },
    },
    {
      id: 'tab-gm-guide',
      title: 'Go to 7. GM Workload & Standard Operations Guide',
      category: 'Navigation',
      icon: HelpCircle,
      shortcut: '7',
      action: () => {
        onClose();
        onSelectTab('GM_GUIDE');
      },
    },
  ];

  // Aircraft movement results based on query
  const aircraftResults = movements
    .filter(
      (m) =>
        m.callsign.toLowerCase().includes(query.toLowerCase()) ||
        m.pilotName.toLowerCase().includes(query.toLowerCase()) ||
        m.aircraftType.toLowerCase().includes(query.toLowerCase())
    )
    .map((m) => ({
      id: `ac-${m.id}`,
      title: `${m.callsign} — ${m.aircraftType} (${m.pilotName})`,
      category: `Aircraft Movements • Status: ${m.status.replace('_', ' ')}`,
      icon: Plane,
      shortcut: m.runway ? `Rwy ${m.runway}` : undefined,
      action: () => {
        onClose();
        if (onSelectMovement) {
          onSelectMovement(m.id);
        }
        onSelectTab('DECISION_PANEL');
      },
    }));

  const filteredActions = defaultActions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  const combinedResults = [...aircraftResults, ...filteredActions];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < combinedResults.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : combinedResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (combinedResults[selectedIndex]) {
        combinedResults[selectedIndex].action();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 font-mono animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 bg-zinc-50/50">
          <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, callsign (e.g. G-CLIO), runway, or tab..."
            className="w-full bg-transparent text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-300 font-semibold">
              ESC
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {combinedResults.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No matching commands or aircraft found for &quot;{query}&quot;
            </div>
          ) : (
            combinedResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 text-xs ${
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-zinc-950'}`}>
                        {item.title}
                      </p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {item.category}
                      </p>
                    </div>
                  </div>

                  {item.shortcut && (
                    <div className="shrink-0 flex items-center gap-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${
                          isSelected
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Desktop Pro-Tips Footer */}
        <div className="px-4 py-2.5 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-zinc-800">↑↓</strong> Navigate
            </span>
            <span>
              <strong className="text-zinc-800">↵</strong> Execute
            </span>
            <span>
              <strong className="text-zinc-800">Esc</strong> Dismiss
            </span>
          </div>
          <span className="hidden sm:inline text-zinc-400 font-mono">
            Desktop Tower Command Bar (Ctrl+K)
          </span>
        </div>
      </div>
    </div>
  );
};
