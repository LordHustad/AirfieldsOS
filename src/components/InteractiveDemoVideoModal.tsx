import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  SkipForward,
  SkipBack,
  Monitor,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  PlaneLanding,
  Command,
  Radio,
  Building2,
  Layers,
  Sparkles,
  MousePointer,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { ActiveAppTab } from './Header';

interface InteractiveDemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveAppTab) => void;
  onOpenLandedModal: () => void;
  onOpenQuickLogModal: () => void;
  onOpenCommandPalette: () => void;
  onOpenDualMonitor: () => void;
}

interface DemoChapter {
  id: string;
  title: string;
  timestamp: string;
  durationSec: number;
  badge: string;
  headline: string;
  narration: string;
  actionSummary: string[];
  simulatedView: 'LOGIN' | 'CONTROL_CENTRE' | 'TOUCHDOWN' | 'ATSU' | 'COMMAND_PALETTE' | 'BILLING';
}

const DEMO_CHAPTERS: DemoChapter[] = [
  {
    id: 'ch-1',
    title: 'Multi-Tenant Operator Portal',
    timestamp: '0:00',
    durationSec: 10,
    badge: 'Multi-Tenant SaaS',
    headline: 'Operator Authentication & Airfield Data Segregation',
    narration:
      'AirfieldOS provides full multi-tenant data segregation. Each aerodrome operator logs in under their designated ICAO code with tailored roles: Airfield General Manager, AFISO Controller, or Ramp Admin.',
    actionSummary: [
      'Select aerodrome workspace (Meadowfield EGMS, Compton Abbas EGHA)',
      'Role-based permissions (AFISO vs Aerodrome General Manager)',
      'Isolated database partition for runways, pricing, and radio logs',
    ],
    simulatedView: 'LOGIN',
  },
  {
    id: 'ch-2',
    title: 'Tower Control Centre & Radar',
    timestamp: '0:10',
    durationSec: 12,
    badge: 'Surface Surveillance',
    headline: 'Live Runway Heading, Crosswinds & Circuit Pattern',
    narration:
      'The Control Centre gives the duty controller an instant bird-eye view of active runways, crosswind components, circuit density, and apron parking stand occupancy in real time.',
    actionSummary: [
      'Automatic crosswind calculations and active runway assignment',
      'Circuit traffic counter tracking circuit saturation (max 5 aircraft)',
      'Real-time apron tie-down stand availability tracker',
    ],
    simulatedView: 'CONTROL_CENTRE',
  },
  {
    id: 'ch-3',
    title: '10-Second Touchdown Logger',
    timestamp: '0:22',
    durationSec: 14,
    badge: 'Core Revenue Capture',
    headline: 'Rapid Landing Entry & Automated Fee Computation',
    narration:
      'When an aircraft touches down, the controller logs it in under 10 seconds. The software automatically looks up MTOW from the aircraft registry, calculates standard landing fees, and generates an invoice with zero manual arithmetic.',
    actionSummary: [
      'Fast callsign entry (e.g. G-CLIO Robin DR400)',
      'Automated MTOW tier matching (<1,200kg @ £18.50 + VAT)',
      'Instant invoice ledger generation capturing previously unbilled landings',
    ],
    simulatedView: 'TOUCHDOWN',
  },
  {
    id: 'ch-4',
    title: 'Statutory CAA CAP 797 Logbook',
    timestamp: '0:36',
    durationSec: 12,
    badge: 'CAA Compliance',
    headline: 'Audit-Proof Aeronautical Telecommunications Blotter',
    narration:
      'Every radio transmission, landing clearance, overhead join, and departure is recorded chronologically. At year-end, airfields export an audit-ready CSV formatted precisely for UK CAA Safety Regulation standards.',
    actionSummary: [
      'Chronological timestamped radio ledger replacing paper blotters',
      'Direct tagging of service provided (Basic Service, Flight Information)',
      '1-Click CAA Annual Traffic Return CSV export',
    ],
    simulatedView: 'ATSU',
  },
  {
    id: 'ch-5',
    title: 'Desktop Workstation & Dual Screen',
    timestamp: '0:48',
    durationSec: 12,
    badge: 'Desktop Power Tools',
    headline: 'Command Palette, 1-Key Hotkeys & Multi-Screen Support',
    narration:
      'Built specifically for physical tower desks. Controllers navigate via Ctrl+K command bar, trigger actions with single keys like L and R, and pop out a secondary radar display for multi-monitor setups.',
    actionSummary: [
      'Universal Command Palette (Ctrl+K or Cmd+K)',
      'Single-key hotkeys: L (Log Landed), P (New PPR), R (Log Radio)',
      'Dual-monitor secondary surface radar pop-out window',
    ],
    simulatedView: 'COMMAND_PALETTE',
  },
  {
    id: 'ch-6',
    title: 'Automated Billing & Invoices',
    timestamp: '1:00',
    durationSec: 12,
    badge: 'Commercial Engine',
    headline: 'Touch-and-Go Batching, Fuel Uplifts & PDF Receipts',
    narration:
      'Visiting pilots and resident flight schools receive clear, automated VAT invoices. The system batches multiple touch-and-goes, tracks AVGAS 100LL fuel uplifts, and eliminates missing revenue.',
    actionSummary: [
      'Aggregated invoicing for flight training touch-and-goes',
      'Fuel dispensing tracking with real-time tank stock deduction',
      'Automated pilot receipts via email & payment status tracking',
    ],
    simulatedView: 'BILLING',
  },
];

export const InteractiveDemoVideoModal: React.FC<InteractiveDemoVideoModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenLandedModal,
  onOpenQuickLogModal,
  onOpenCommandPalette,
  onOpenDualMonitor,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [progressSec, setProgressSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeSubTab, setActiveSubTab] = useState<'VIDEO' | 'SCRIPT'>('VIDEO');
  const [copiedScript, setCopiedScript] = useState(false);

  const totalDurationSec = DEMO_CHAPTERS.reduce((acc, c) => acc + c.durationSec, 0);

  // Timer loop for simulated video playback
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgressSec((prev) => {
        const next = prev + 0.25 * playbackSpeed;
        if (next >= totalDurationSec) {
          setIsPlaying(false);
          return totalDurationSec;
        }

        // Determine current chapter from accumulated time
        let accumulated = 0;
        for (let i = 0; i < DEMO_CHAPTERS.length; i++) {
          accumulated += DEMO_CHAPTERS[i].durationSec;
          if (next <= accumulated) {
            setCurrentChapterIndex(i);
            break;
          }
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed, totalDurationSec]);

  if (!isOpen) return null;

  const currentChapter = DEMO_CHAPTERS[currentChapterIndex];

  const handleSeek = (index: number) => {
    let startSec = 0;
    for (let i = 0; i < index; i++) {
      startSec += DEMO_CHAPTERS[i].durationSec;
    }
    setProgressSec(startSec);
    setCurrentChapterIndex(index);
    setIsPlaying(true);
  };

  const handleRestart = () => {
    setProgressSec(0);
    setCurrentChapterIndex(0);
    setIsPlaying(true);
  };

  const handleLaunchLive = () => {
    onClose();
    if (currentChapter.simulatedView === 'CONTROL_CENTRE') {
      onSelectTab('CONTROL_CENTRE');
    } else if (currentChapter.simulatedView === 'TOUCHDOWN') {
      onSelectTab('DECISION_PANEL');
      setTimeout(() => onOpenLandedModal(), 200);
    } else if (currentChapter.simulatedView === 'ATSU') {
      onSelectTab('ATSU_LOGBOOK');
    } else if (currentChapter.simulatedView === 'COMMAND_PALETTE') {
      setTimeout(() => onOpenCommandPalette(), 200);
    } else if (currentChapter.simulatedView === 'BILLING') {
      onSelectTab('BILLING_ENGINE');
    }
  };

  const scriptText = `AIRFIELDOS GA — OFFICIAL PRODUCT DEMO VIDEO SCRIPT
Target Audience: Aerodrome General Managers, AFISOs, Flight School Operators

0:00 - 0:10 | CHAPTER 1: MULTI-TENANT OPERATOR PORTAL
"Welcome to AirfieldOS GA, the dedicated operating system for General Aviation airfields.
Each aerodrome operates in a strictly isolated, secure tenant workspace. Here you can see Meadowfield EGMS, Compton Abbas EGHA, or create a new airfield in 60 seconds with custom runway headings and fee cards."

0:10 - 0:22 | CHAPTER 2: TOWER CONTROL CENTRE & SURFACE RADAR
"In the Control Centre, duty controllers get immediate situational awareness: active runway assignments based on real-time crosswind calculations, live circuit traffic counts, and apron parking stand occupancy."

0:22 - 0:36 | CHAPTER 3: THE 10-SECOND TOUCHDOWN LOGGER
"Logging visiting aircraft used to mean messy paper blotters and missed revenue. With AirfieldOS, entering a callsign like Golf-Charlie-Lima-India-Oscar takes under 10 seconds. The system automatically fetches MTOW, calculates landing fees and VAT, and issues an invoice on the spot."

0:36 - 0:48 | CHAPTER 4: CAA STATUTORY CAP 797 ATSU LOGBOOK
"For UK air traffic compliance, AirfieldOS replaces paper radio logs with an audit-proof chronological ledger adhering to CAA CAP 797. At year-end, 1-click generates the exact CSV format required by CAA safety inspectors."

0:48 - 1:00 | CHAPTER 5: DESKTOP WORKSTATION & DUAL-MONITOR SUPPORT
"Designed for fast-paced tower desks, controllers can use single-key shortcuts: 'L' for landing, 'R' for radio calls, 'Ctrl+K' for universal search, or pop out a dedicated secondary radar display for dual-monitor setups."

1:00 - 1:12 | CHAPTER 6: AUTOMATED BILLING & FUEL LEDGERS
"Finally, the Billing Engine batches touch-and-goes for resident flight schools, tracks AVGAS and UL91 fuel bowsers, and sends automated receipts to visiting pilots, recapturing hundreds of pounds in missed revenue every week."`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-mono animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-zinc-950 text-white border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Play className="w-4 h-4 fill-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  AirfieldOS GA — Interactive Product Demo Video
                </h2>
                <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  DEMO WALKTHROUGH
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Full visual demonstration of aerodrome operations, CAP 797 logbook & fee engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-800 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setActiveSubTab('VIDEO')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  activeSubTab === 'VIDEO' ? 'bg-zinc-950 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Simulated Video
              </button>
              <button
                onClick={() => setActiveSubTab('SCRIPT')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                  activeSubTab === 'SCRIPT' ? 'bg-zinc-950 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Voiceover Script</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeSubTab === 'VIDEO' ? (
          <div className="flex-1 overflow-y-auto flex flex-col bg-zinc-950">
            {/* Simulated Video Screen Viewport */}
            <div className="relative w-full aspect-16/9 bg-zinc-900 border-b border-zinc-800 flex flex-col overflow-hidden group">
              {/* Scene Display based on current chapter */}
              <div className="relative flex-1 bg-zinc-950 p-6 flex flex-col justify-between overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute inset-0 bg-radial-at-t from-zinc-800/20 via-zinc-950 to-zinc-950 pointer-events-none" />

                {/* Simulated Screen Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-zinc-400">SCENE {currentChapterIndex + 1}/6:</span>
                    <span className="text-xs bg-zinc-800 text-emerald-400 px-2 py-0.5 rounded-md font-bold border border-zinc-700">
                      {currentChapter.badge}
                    </span>
                    <h3 className="text-sm font-bold text-white">{currentChapter.headline}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>LIVE AIRFIELD OS WORKSTATION</span>
                  </div>
                </div>

                {/* Simulated Graphic Content per chapter */}
                <div className="relative z-10 my-auto py-4">
                  {currentChapter.simulatedView === 'LOGIN' && (
                    <div className="max-w-xl mx-auto bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-5 shadow-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white">Aerodrome Multi-Tenant Authentication</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">Meadowfield (EGMS)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">OPERATOR PROFILE</span>
                          <p className="font-bold text-white">Capt. Arthur Pendelton</p>
                          <p className="text-[10px] text-emerald-400">Airfield General Manager</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">DATA SEGREGATION</span>
                          <p className="font-bold text-white">Airfield Partition #104</p>
                          <p className="text-[10px] text-zinc-400">Isolated Runway & Fee Tables</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                        <span>● Connected to Cloud DB</span>
                        <span className="text-emerald-400 font-bold">1-Click Switcher Available</span>
                      </div>
                    </div>
                  )}

                  {currentChapter.simulatedView === 'CONTROL_CENTRE' && (
                    <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 flex flex-col justify-between">
                        <span className="text-[10px] text-zinc-400 uppercase">ACTIVE RUNWAY</span>
                        <p className="text-2xl font-bold text-emerald-400">RWY 27</p>
                        <p className="text-[10px] text-zinc-500">Asphalt • 820m • QNH 1018</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 flex flex-col justify-between">
                        <span className="text-[10px] text-zinc-400 uppercase">SURFACE WIND</span>
                        <p className="text-2xl font-bold text-white">250° / 12kt</p>
                        <p className="text-[10px] text-cyan-400">Crosswind: 4kt Left</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 flex flex-col justify-between">
                        <span className="text-[10px] text-zinc-400 uppercase">CIRCUIT SATURATION</span>
                        <p className="text-2xl font-bold text-yellow-400">3 / 5 Aircraft</p>
                        <p className="text-[10px] text-zinc-400">Left-Hand Pattern Active</p>
                      </div>
                    </div>
                  )}

                  {currentChapter.simulatedView === 'TOUCHDOWN' && (
                    <div className="max-w-xl mx-auto bg-zinc-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-zinc-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                        <PlaneLanding className="w-3 h-3" />
                        <span>TOUCHDOWN LOGGED IN 8.4s</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 uppercase">AIRCRAFT CALLSIGN</span>
                        <p className="text-xl font-bold text-white">G-CLIO (Robin DR400)</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">MTOW WEIGHT</span>
                          <p className="font-bold text-zinc-200">1,000 kg</p>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">LANDING FEE</span>
                          <p className="font-bold text-emerald-400">£18.50 + VAT</p>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">INVOICE #</span>
                          <p className="font-bold text-zinc-200">INV-8492</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 italic">
                        &quot;Saved directly to aerodrome movements ledger. Zero manual paperwork.&quot;
                      </p>
                    </div>
                  )}

                  {currentChapter.simulatedView === 'ATSU' && (
                    <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl space-y-2">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          CAA CAP 797 Radio & Movement Logbook
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                          AUDIT-READY
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 rounded-xl bg-zinc-950 flex items-center justify-between border border-zinc-800">
                          <span className="font-mono text-emerald-400">14:32 UTC</span>
                          <span className="font-bold text-white">G-BRPV (C172)</span>
                          <span className="text-zinc-400">Touchdown RWY 27</span>
                          <span className="text-zinc-500">Basic Service</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-950 flex items-center justify-between border border-zinc-800">
                          <span className="font-mono text-emerald-400">14:38 UTC</span>
                          <span className="font-bold text-white">G-CLIO (DR40)</span>
                          <span className="text-zinc-400">Overhead Join 2,000ft</span>
                          <span className="text-zinc-500">Traffic Info</span>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <span className="text-[10px] text-zinc-400 font-mono">1-Click CSV Export for CAA Inspectors</span>
                      </div>
                    </div>
                  )}

                  {currentChapter.simulatedView === 'COMMAND_PALETTE' && (
                    <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-600 rounded-2xl p-4 shadow-2xl space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                        <Command className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs text-white font-mono">Log Landed Aircraft (Touchdown)</span>
                        <kbd className="ml-auto text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">L</kbd>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <kbd className="text-xs font-bold text-emerald-400">Ctrl+K</kbd>
                          <p className="text-[10px] text-zinc-500 mt-1">Universal Search</p>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <kbd className="text-xs font-bold text-emerald-400">M</kbd>
                          <p className="text-[10px] text-zinc-500 mt-1">Dual Monitor</p>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                          <kbd className="text-xs font-bold text-emerald-400">D</kbd>
                          <p className="text-[10px] text-zinc-500 mt-1">Widescreen Mode</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentChapter.simulatedView === 'BILLING' && (
                    <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl space-y-2">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-emerald-400" />
                          Automated Aerodrome Invoices & Fees
                        </span>
                        <span className="text-[10px] text-zinc-400">Stripe & Direct BACS Ready</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">TODAY REVENUE CAPTURED</span>
                          <p className="text-xl font-bold text-emerald-400">£482.40</p>
                          <p className="text-[10px] text-zinc-400">14 Movements • 2 Fuel Uplifts</p>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                          <span className="text-[10px] text-zinc-500">UNBILLED RECOVERED</span>
                          <p className="text-xl font-bold text-cyan-400">£165.00</p>
                          <p className="text-[10px] text-zinc-400">Touch & Go batches caught</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtitle / Closed Caption Voiceover Bar */}
                <div className="relative z-10 bg-black/80 backdrop-blur border border-zinc-800/80 rounded-2xl p-3.5 flex items-start gap-3">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {currentChapter.narration}
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Timeline & Scrub Bar */}
              <div className="px-5 py-3 bg-zinc-950/90 border-t border-zinc-800 flex flex-col gap-2">
                {/* Progress Bar with Chapter Markers */}
                <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${(progressSec / totalDurationSec) * 100}%` }}
                  />
                </div>

                {/* Player Controls Ribbon */}
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying((p) => !p)}
                      className="p-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-xs"
                      title={isPlaying ? 'Pause Video' : 'Play Video'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950" />}
                    </button>

                    <button
                      onClick={handleRestart}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Restart Video Walkthrough"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <div className="font-mono text-zinc-300">
                      {formatTime(progressSec)} / {formatTime(totalDurationSec)}
                    </div>

                    <span className="text-zinc-600">|</span>

                    <span className="font-bold text-zinc-200 truncate max-w-[200px] sm:max-w-sm">
                      {currentChapter.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Playback Speed */}
                    <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800 text-[11px]">
                      {[1, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-1.5 py-0.5 rounded ${
                            playbackSpeed === spd ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    {/* Try this feature live in app */}
                    <button
                      onClick={handleLaunchLive}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors text-xs font-semibold"
                      title="Jump straight to this live view inside the app"
                    >
                      <span>Try Live in App</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters Navigation Grid */}
            <div className="p-4 sm:p-5 bg-zinc-900/60 border-t border-zinc-800 flex-1">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                Video Chapters & Key Feature Highlights (Click to Jump)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {DEMO_CHAPTERS.map((ch, idx) => {
                  const isActive = idx === currentChapterIndex;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSeek(idx)}
                      className={`text-left p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-2 ${
                        isActive
                          ? 'bg-zinc-800/90 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500'
                          : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {ch.timestamp}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {ch.badge}
                        </span>
                      </div>
                      <p className="font-bold text-white line-clamp-1">{ch.title}</p>
                      <ul className="text-[10px] space-y-0.5 text-zinc-400 font-sans">
                        {ch.actionSummary.slice(0, 2).map((item, i) => (
                          <li key={i} className="truncate">• {item}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Script View for Recording Pitch & Loom Videos */
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950 text-xs">
            <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">Full Video Voiceover & Recording Script</h3>
                <p className="text-[11px] text-zinc-400">
                  Use this exact timestamped script when recording a Loom video or in-person investor pitch.
                </p>
              </div>
              <button
                onClick={copyScriptToClipboard}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors border border-zinc-700"
              >
                {copiedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 font-mono text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">
              {scriptText}
            </pre>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Designed for Aerodrome General Managers, AFISOs & Airport Authority demonstrations
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
          >
            Close Demo Player
          </button>
        </div>
      </div>
    </div>
  );
};
