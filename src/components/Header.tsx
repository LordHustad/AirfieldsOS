import React from 'react';
import {
  Plane,
  Wind,
  Radio,
  FileSpreadsheet,
  Receipt,
  CheckSquare,
  HelpCircle,
  PlusCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Database,
  PlaneLanding,
  LogOut,
  User,
  Search,
  Monitor,
  Keyboard,
  Maximize,
  Minimize,
  LayoutGrid,
} from 'lucide-react';
import { AirfieldWeather, AirfieldProfile } from '../types/airfield';
import { SaaSUser } from '../types/auth';

export type ActiveAppTab =
  | 'CONTROL_CENTRE'
  | 'DECISION_PANEL'
  | 'ATSU_LOGBOOK'
  | 'BILLING_ENGINE'
  | 'AIRFIELD_SETUP'
  | 'BACKEND_DATA'
  | 'GM_GUIDE';

interface HeaderProps {
  profile: AirfieldProfile;
  weather: AirfieldWeather;
  activeTab: ActiveAppTab;
  onSelectTab: (tab: ActiveAppTab) => void;
  pendingAlertsCount: number;
  circuitCount: number;
  onOpenQuickLogModal: () => void;
  onOpenNewPPRModal: () => void;
  onOpenLandedModal: () => void;
  currentUser?: SaaSUser | null;
  onLogout?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleDensity?: () => void;
  isHighDensity?: boolean;
  onOpenDualMonitor?: () => void;
  onOpenShortcuts?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  weather,
  activeTab,
  onSelectTab,
  pendingAlertsCount,
  circuitCount,
  onOpenQuickLogModal,
  onOpenNewPPRModal,
  onOpenLandedModal,
  currentUser,
  onLogout,
  onOpenCommandPalette,
  onToggleDensity,
  isHighDensity = false,
  onOpenDualMonitor,
  onOpenShortcuts,
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white/95 backdrop-blur sticky top-0 z-40 px-3 sm:px-4 py-2 shadow-xs">
      <div className={`w-full ${isHighDensity ? 'max-w-full' : 'max-w-7xl mx-auto'} flex flex-col xl:flex-row xl:items-center justify-between gap-2.5`}>
        {/* Aerodrome Brand & Radio Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-zinc-950 uppercase font-mono">
                {profile.name} ({profile.icao})
              </h1>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                OPEN
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-0.5">
              <span className="flex items-center gap-1 text-zinc-800 font-medium">
                <Radio className="w-3 h-3 text-zinc-500" />
                {profile.radioCallsign} {profile.radioFrequency}
              </span>
              <span>•</span>
              <span>Elev {profile.elevationFt}ft</span>
              <span>•</span>
              <span className="text-zinc-800 font-medium">Active: RWY {weather.activeRunway}</span>
            </div>
          </div>
        </div>

        {/* Live Aerodrome Conditions Ribbon */}
        <div className="hidden xl:flex items-center gap-3 font-mono text-xs bg-zinc-50 px-3.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-700">
          <div className="flex items-center gap-1.5 text-zinc-900">
            <Wind className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              {weather.windDegrees}° / {weather.windSpeedKnots}kt (G{weather.windGustKnots}kt)
            </span>
          </div>

          <div className="h-3 w-px bg-zinc-200" />

          <div className="text-zinc-600">
            X-Wind: <span className="text-zinc-900 font-semibold">{weather.crosswindKnots}kt {weather.crosswindDirection}</span>
          </div>

          <div className="h-3 w-px bg-zinc-200" />

          <div className="text-zinc-600">
            QNH: <span className="text-zinc-900 font-semibold">{weather.qnhHpa} hPa</span>
          </div>

          <div className="h-3 w-px bg-zinc-200" />

          <div className="flex items-center gap-1 text-zinc-600">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>Sunset: <strong className="text-zinc-900 font-semibold">18:48L</strong></span>
          </div>

          <div className="h-3 w-px bg-zinc-200" />

          <div className="text-zinc-600">
            Circuit: <span className="text-zinc-900 font-semibold">{circuitCount}/5 max</span>
          </div>
        </div>

        {/* Action Buttons, Desktop Tools & Operator Session Chip */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Universal Desktop Command Palette Search */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-600 text-xs transition-colors shadow-2xs group font-mono"
              title="Open Universal Command Palette & Search (Ctrl+K or ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700" />
              <span className="hidden md:inline text-[11px] text-zinc-500">Quick Search</span>
              <kbd className="text-[10px] bg-white border border-zinc-200 px-1 py-0.2 rounded text-zinc-700 font-bold">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Desktop Workstation Tools */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 font-mono">
            {onToggleDensity && (
              <button
                onClick={onToggleDensity}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isHighDensity
                    ? 'bg-zinc-950 text-white shadow-2xs font-bold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200'
                }`}
                title={isHighDensity ? 'Switch to Standard Width (Press D)' : 'Switch to High-Density Widescreen Tower Mode (Press D)'}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenDualMonitor && (
              <button
                onClick={onOpenDualMonitor}
                className="p-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 transition-colors"
                title="Launch Dual-Monitor Tower Display (Press M)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen Workstation (Press F)' : 'Toggle Fullscreen Tower Workstation (Press F)'}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>
            )}

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="p-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200 transition-colors"
                title="Desktop Keyboard Shortcuts Cheat Sheet (Press ?)"
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-800">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: currentUser.avatarColor || '#18181b' }}
              >
                {currentUser.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-bold text-[11px] leading-tight text-zinc-950 truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[9px] text-zinc-500 uppercase">{currentUser.role.replace('_', ' ')}</p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-950 hover:bg-zinc-200 transition-colors ml-1"
                  title="Switch Operator or Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={onOpenLandedModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-zinc-900 bg-white text-zinc-900 text-xs font-mono font-medium transition-all shadow-xs hover:bg-zinc-50"
            title="Record an aircraft that touched down (Press L)"
          >
            <PlaneLanding className="w-3.5 h-3.5" />
            <span>Log Landed</span>
            <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 bg-zinc-100 border border-zinc-300 rounded text-zinc-600 font-mono">
              L
            </kbd>
          </button>

          <button
            onClick={onOpenNewPPRModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-zinc-900 bg-white text-zinc-900 text-xs font-mono font-medium transition-all shadow-xs hover:bg-zinc-50"
            title="Create New PPR Booking (Press P)"
          >
            <PlusCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span>New PPR</span>
            <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 bg-zinc-100 border border-zinc-300 rounded text-zinc-600 font-mono">
              P
            </kbd>
          </button>

          <button
            onClick={onOpenQuickLogModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-mono font-medium transition-all shadow-xs"
            title="Log ATSU / Radio message (Press R)"
          >
            <Radio className="w-3.5 h-3.5 text-zinc-300" />
            <span>Log ATSU</span>
            <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono">
              R
            </kbd>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className={`w-full ${isHighDensity ? 'max-w-full' : 'max-w-7xl mx-auto'} mt-2.5 pt-2 border-t border-zinc-200 flex items-center justify-between overflow-x-auto`}>
        <nav className="flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => onSelectTab('CONTROL_CENTRE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CONTROL_CENTRE'
                ? 'bg-zinc-950 text-white font-medium border border-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>1. Control Centre</span>
          </button>

          <button
            onClick={() => onSelectTab('DECISION_PANEL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap relative ${
              activeTab === 'DECISION_PANEL'
                ? 'bg-zinc-950 text-white font-medium border border-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>2. Decision Panel</span>
            {pendingAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('ATSU_LOGBOOK')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ATSU_LOGBOOK'
                ? 'bg-zinc-950 text-white font-medium border border-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>3. ATSU Log (CAP 797)</span>
          </button>

          <button
            onClick={() => onSelectTab('BILLING_ENGINE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'BILLING_ENGINE'
                ? 'bg-zinc-950 text-white font-medium border border-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>4. Fees & Billing</span>
          </button>

          <button
            onClick={() => onSelectTab('AIRFIELD_SETUP')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'AIRFIELD_SETUP'
                ? 'bg-zinc-950 text-white font-medium border border-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>5. Airfield Setup & Specs</span>
          </button>

          <button
            onClick={() => onSelectTab('BACKEND_DATA')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'BACKEND_DATA'
                ? 'bg-zinc-950 text-white font-medium border border-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>6. Backend Data & Storage</span>
          </button>

          <button
            onClick={() => onSelectTab('GM_GUIDE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'GM_GUIDE'
                ? 'bg-zinc-950 text-white font-medium border border-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>7. GM Guide</span>
          </button>
        </nav>

        <div className="text-[11px] font-mono text-zinc-500 hidden md:flex items-center gap-1 whitespace-nowrap ml-2">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
          <span>CAA CAP 797 / CAP 413</span>
        </div>
      </div>
    </header>
  );
};

