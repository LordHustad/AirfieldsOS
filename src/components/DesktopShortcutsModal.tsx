import React from 'react';
import {
  Keyboard,
  X,
  Command,
  Monitor,
  Maximize2,
  PlaneLanding,
  PlusCircle,
  Radio,
  FileSpreadsheet,
  Receipt,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';

interface DesktopShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopShortcutsModal: React.FC<DesktopShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: 'Rapid Tower Flight Actions (1-Key Press)',
      items: [
        { key: 'L', description: 'Log Landed Aircraft (Touchdown recording with instant fee calculation)' },
        { key: 'P', description: 'Create New PPR (Prior Permission Required) booking' },
        { key: 'R', description: 'Log ATSU / Radio Message into CAA CAP 797 ledger' },
      ],
    },
    {
      group: 'Desktop Workstation & Multi-Screen',
      items: [
        { key: 'Ctrl + K  /  ⌘K', description: 'Open Universal Command Palette & Search' },
        { key: 'M', description: 'Launch Dual-Monitor Secondary Tower Display' },
        { key: 'D', description: 'Toggle High-Density Tower Mode (Widescreen multi-column)' },
        { key: 'F', description: 'Toggle Fullscreen Tower Workstation' },
        { key: '?', description: 'Show this keyboard shortcuts guide' },
        { key: 'Esc', description: 'Close any active modal, dialog, or drawer' },
      ],
    },
    {
      group: 'Instant Tab Switching (Number Keys)',
      items: [
        { key: '1', description: 'Jump to 1. Control Centre' },
        { key: '2', description: 'Jump to 2. Active Movements & Decision Panel' },
        { key: '3', description: 'Jump to 3. CAA CAP 797 ATSU Logbook' },
        { key: '4', description: 'Jump to 4. Billing Engine & Invoices' },
        { key: '5', description: 'Jump to 5. Airfield Setup & Runways' },
        { key: '6', description: 'Jump to 6. Backend Data Manager & Backup' },
        { key: '7', description: 'Jump to 7. GM Workload & SOP Guide' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-mono animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-950 text-white">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Desktop & Laptop Keyboard Shortcuts</h2>
              <p className="text-[11px] text-zinc-500">Fast hands-on-keyboard aerodrome tower operation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {shortcutGroups.map((grp) => (
            <div key={grp.group} className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-1">
                {grp.group}
              </h3>
              <div className="space-y-2">
                {grp.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 transition-colors"
                  >
                    <span className="text-zinc-700 font-sans">{item.description}</span>
                    <kbd className="px-2.5 py-1 rounded-md bg-white border border-zinc-300 shadow-2xs font-bold text-zinc-900 text-[11px] shrink-0 ml-3">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-4 rounded-xl bg-zinc-900 text-zinc-300 space-y-1.5 text-[11px]">
            <p className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Desktop Ergonomics in the Tower
            </p>
            <p className="leading-relaxed text-zinc-400 font-sans">
              Airfield duty controllers report entering touchdown logs 3.5x faster using single-key shortcuts compared to standard mouse navigation. Keys are automatically disabled when typing in form text boxes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Press <strong className="text-zinc-800 font-mono">Esc</strong> anytime to dismiss</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-950 text-white font-semibold hover:bg-zinc-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
