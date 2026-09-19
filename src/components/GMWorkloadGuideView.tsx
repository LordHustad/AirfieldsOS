import React from 'react';
import {
  HelpCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Plane,
  Fuel,
  Volume2,
  Users,
} from 'lucide-react';

export const GMWorkloadGuideView: React.FC = () => {
  return (
    <div className="space-y-8 font-mono max-w-5xl mx-auto">
      {/* Hero Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-100 font-['Chakra_Petch']">
              Airfield General Manager Duty & Workload Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              How AirfieldOS consolidates fragmented aerodrome operations into a single pane of glass.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Running a General Aviation (GA) airfield is a demanding multi-disciplinary role. Unlike major commercial airports with separate tower ATC, ground handling teams, and billing departments, a GA Airfield General Manager and their small team must simultaneously act as the <strong>Airfield Operations Coordinator</strong>, <strong>Radio Operator (A/G or AFISO)</strong>, <strong>Safety Manager</strong>, <strong>Fuel Farm Supervisor</strong>, and <strong>Financial Director</strong>.
        </p>

        {/* Quantified Workload Savings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Daily Time Saved
            </span>
            <span className="text-2xl font-bold text-amber-400">~3.5 Hours</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Eliminates paper logs, manual fee lookups & billing chase
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Fee Recovery (Annual)
            </span>
            <span className="text-2xl font-bold text-emerald-400">+£12,400+</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Captures unbilled touch-and-goes, parking & out-of-hours
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              CAA Compliance
            </span>
            <span className="text-2xl font-bold text-sky-400">100% Audit-Ready</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              CAP 797 & CAP 413 digital movement export in 1-click
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown: Before vs After with AirfieldOS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-['Chakra_Petch']">
          How AirfieldOS Replaces the 5 Fragmented Binders of a GA Aerodrome
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* 1. Operations Control */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Plane className="w-4 h-4" />
              <span>1. Aerodrome Control Centre</span>
            </div>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong className="text-red-400">Before:</strong> Whiteboard for apron parking, sticky notes for fuel requests, guessing if grass runways are soft, and having no live visualization of how many planes are doing circuits.
              </p>
              <p>
                <strong className="text-emerald-400">With AirfieldOS:</strong> Unified operations screen displaying active runway, live wind crosswind vector, circuit capacity gauge (max 5), fuel tank levels, and an interactive aerodrome map showing stands and circuit traffic.
              </p>
            </div>
          </div>

          {/* 2. Inbound/Outbound Decisions */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>2. Inbound & Outbound Decision Panel</span>
            </div>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong className="text-red-400">Before:</strong> Answering phone calls for PPR while on the radio, forgetting to check if the pilot has acknowledged local noise-sensitive villages, and missing crosswind limits for student solo flights.
              </p>
              <p>
                <strong className="text-emerald-400">With AirfieldOS:</strong> Dedicated decision workbench with automated constraint pre-checks (tailwind warnings, runway shoulder weight checks for PC-12s, noise abatement acknowledgement status). 1-click GM approval or diversion.
              </p>
            </div>
          </div>

          {/* 3. CAA ATSU Logbook */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <FileSpreadsheet className="w-4 h-4" />
              <span>3. CAA Statutory ATSU Log (CAP 797)</span>
            </div>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong className="text-red-400">Before:</strong> Scribbling on physical paper logbooks with illegible handwriting. When the CAA aerodrome inspector visits, spending days digging through dusty binders.
              </p>
              <p>
                <strong className="text-emerald-400">With AirfieldOS:</strong> Fast digital movement recording with autocompletion of aircraft types, MTOW, and PoB. Filterable in real-time, with an instant one-click CAA CSV Audit Export.
              </p>
            </div>
          </div>

          {/* 4. Automated Fee Engine */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Receipt className="w-4 h-4" />
              <span>4. Automated Fee Engine & Invoicing</span>
            </div>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong className="text-red-400">Before:</strong> Airfield staff manually flipping through MTOW tables, estimating circuits, forgetting to charge for overnight grass parking, and pilots flying away before fees are collected.
              </p>
              <p>
                <strong className="text-emerald-400">With AirfieldOS:</strong> Every movement recorded in the ATSU logbook automatically calculates the exact tiered landing fee, touch-and-go circuits, fuel uplift, and VAT. 1-click invoice issuance with card terminal settlement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory & Regulatory References */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-['Chakra_Petch']">
          Regulatory Compliance Architecture
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block mb-1">UK CAA CAP 797</strong>
            Flight Information Service Officer (FISO) Manual & aerodrome logbook record keeping standards.
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block mb-1">UK CAA CAP 413</strong>
            Radiotelephony standard phraseology & message recording compliance.
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block mb-1">UK CAA CAP 452</strong>
            Aeronautical Radio Station Operator's Guide for GA aerodromes & safetycom frequency coordination.
          </div>
        </div>
      </div>
    </div>
  );
};
