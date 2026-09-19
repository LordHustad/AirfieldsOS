import React, { useState, useEffect } from 'react';
import {
  AirfieldProfile,
  Runway,
  AirfieldWeather,
  FuelStorageTank,
  ParkingBay,
  AircraftMovement,
  ATSULogEntry,
  AirfieldInvoice,
} from './types/airfield';
import { SaaSUser } from './types/auth';
import { PRESET_AIRFIELDS } from './data/airfieldProfiles';
import { Header, ActiveAppTab } from './components/Header';
import { ControlCentreView } from './components/ControlCentreView';
import { DecisionPanelView } from './components/DecisionPanelView';
import { ATSULogbookView } from './components/ATSULogbookView';
import { BillingEngineView } from './components/BillingEngineView';
import { AirfieldSetupView } from './components/AirfieldSetupView';
import { BackendDataManagerView } from './components/BackendDataManagerView';
import { GMWorkloadGuideView } from './components/GMWorkloadGuideView';
import { AuthView } from './components/AuthView';
import { LogMovementModal } from './components/LogMovementModal';
import { NewPPRModal } from './components/NewPPRModal';
import { LogLandedAircraftModal } from './components/LogLandedAircraftModal';
import { DesktopCommandPalette } from './components/DesktopCommandPalette';
import { DesktopShortcutsModal } from './components/DesktopShortcutsModal';
import { DesktopTowerDualMonitorModal } from './components/DesktopTowerDualMonitorModal';
import { InteractiveDemoVideoModal } from './components/InteractiveDemoVideoModal';
import { YoloVisionView } from './components/YoloVisionView';
import { generateInvoiceForMovement } from './utils/feeCalculator';
import {
  getDefaultDatabaseState,
  AerodromeDatabaseState,
} from './utils/storage';
import {
  getCurrentSession,
  loadUserDatabase,
  saveUserDatabase,
  logoutSaaS,
} from './services/saasBackend';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // SaaS Multi-User Authentication Session
  const [currentUser, setCurrentUser] = useState<SaaSUser | null>(() => {
    const session = getCurrentSession();
    return session ? session.user : null;
  });

  // Load initial aerodrome database from user's isolated partition
  const initialDb = currentUser ? loadUserDatabase(currentUser.id) : getDefaultDatabaseState();

  const [activeTab, setActiveTab] = useState<ActiveAppTab>('CONTROL_CENTRE');

  const [activeProfile, setActiveProfile] = useState<AirfieldProfile>(initialDb.airfieldProfile);
  const [weather, setWeather] = useState<AirfieldWeather>(initialDb.weather);
  const [runways, setRunways] = useState<Runway[]>(initialDb.runways);
  const [fuelTanks, setFuelTanks] = useState<FuelStorageTank[]>(initialDb.fuelTanks);
  const [parkingBays, setParkingBays] = useState<ParkingBay[]>(initialDb.parkingBays);
  const [movements, setMovements] = useState<AircraftMovement[]>(initialDb.movements);
  const [atsuLogs, setAtsuLogs] = useState<ATSULogEntry[]>(initialDb.atsuLogs);
  const [invoices, setInvoices] = useState<AirfieldInvoice[]>(initialDb.invoices);

  const [selectedMovementId, setSelectedMovementId] = useState<string>('mov-102');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isPPRModalOpen, setIsPPRModalOpen] = useState(false);
  const [isLandedModalOpen, setIsLandedModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Desktop / Laptop Workstation & Multi-Screen State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDualMonitorOpen, setIsDualMonitorOpen] = useState(false);
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);
  const [isHighDensity, setIsHighDensity] = useState<boolean>(() => {
    try {
      return localStorage.getItem('airfieldos_density') === 'high';
    } catch {
      return false;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleDensity = () => {
    setIsHighDensity((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('airfieldos_density', next ? 'high' : 'standard');
      } catch {}
      showToast(next ? 'High-Density Widescreen Tower Mode Enabled' : 'Standard Display Density Enabled');
      return next;
    });
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
        showToast('Fullscreen Tower Workstation Activated');
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
        showToast('Exited Fullscreen');
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  // Listen for fullscreenchange events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Desktop Global Keyboard Hotkeys Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check if typing inside an interactive input / form element
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Universal Command Palette: Cmd+K or Ctrl+K (works everywhere)
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.key === 'p' && e.shiftKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Close open modals on Escape
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsShortcutsOpen(false);
        setIsDualMonitorOpen(false);
        setIsDemoVideoOpen(false);
        setIsLogModalOpen(false);
        setIsPPRModalOpen(false);
        setIsLandedModalOpen(false);
        return;
      }

      // If user is currently typing in a text field, do not trigger single-key hotkeys
      if (isInputFocused) return;

      // Single-Key Desktop Hotkeys:
      switch (e.key.toLowerCase()) {
        case '?':
          e.preventDefault();
          setIsShortcutsOpen(true);
          break;
        case 'v':
          e.preventDefault();
          setIsDemoVideoOpen((prev) => !prev);
          break;
        case 'l':
          e.preventDefault();
          setIsLandedModalOpen(true);
          break;
        case 'p':
          e.preventDefault();
          setIsPPRModalOpen(true);
          break;
        case 'r':
          e.preventDefault();
          setIsLogModalOpen(true);
          break;
        case 'm':
          e.preventDefault();
          setIsDualMonitorOpen((prev) => !prev);
          break;
        case 'd':
          e.preventDefault();
          toggleDensity();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        // Tab switching: 1 to 7
        case '1':
          e.preventDefault();
          setActiveTab('CONTROL_CENTRE');
          break;
        case '2':
          e.preventDefault();
          setActiveTab('DECISION_PANEL');
          break;
        case '3':
          e.preventDefault();
          setActiveTab('ATSU_LOGBOOK');
          break;
        case '4':
          e.preventDefault();
          setActiveTab('BILLING_ENGINE');
          break;
        case '5':
          e.preventDefault();
          setActiveTab('AIRFIELD_SETUP');
          break;
        case '6':
          e.preventDefault();
          setActiveTab('BACKEND_DATA');
          break;
        case '7':
          e.preventDefault();
          setActiveTab('GM_GUIDE');
          break;
        case '8':
        case 'y':
          e.preventDefault();
          setActiveTab('YOLO_VISION');
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Switch / Sign-in user handler: loads isolated tenant data
  const handleAuthSuccess = (user: SaaSUser) => {
    setCurrentUser(user);
    const userDb = loadUserDatabase(user.id);
    setActiveProfile(userDb.airfieldProfile);
    setWeather(userDb.weather);
    setRunways(userDb.runways);
    setFuelTanks(userDb.fuelTanks);
    setParkingBays(userDb.parkingBays);
    setMovements(userDb.movements);
    setAtsuLogs(userDb.atsuLogs);
    setInvoices(userDb.invoices);
    setActiveTab('CONTROL_CENTRE');
    showToast(`Logged into ${user.airfieldName} (${user.icao}) as ${user.name}.`);
  };

  // Log out user handler
  const handleLogout = () => {
    logoutSaaS();
    setCurrentUser(null);
  };

  // Auto-sync entire aerodrome state to the authenticated user's isolated partition
  useEffect(() => {
    if (!currentUser) return;

    const currentState: AerodromeDatabaseState = {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      activeAirfieldId: activeProfile.id,
      airfieldProfile: activeProfile,
      customProfiles: [activeProfile],
      runways,
      parkingBays,
      fuelTanks,
      movements,
      atsuLogs,
      invoices,
      weather,
    };
    saveUserDatabase(currentUser.id, currentState);
  }, [currentUser, activeProfile, runways, parkingBays, fuelTanks, movements, atsuLogs, invoices, weather]);

  // If no user is logged in, show the Auth / Operator Portal
  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // Airfield Profile Preset Switcher (within current user's profile)
  const handleSwitchAirfieldPreset = (presetId: string) => {
    const found = PRESET_AIRFIELDS.find((p) => p.profile.id === presetId);
    if (!found) return;

    setActiveProfile(found.profile);
    setRunways(found.runways);
    setParkingBays(found.parkingBays);
    setFuelTanks(found.fuelTanks);
    setWeather((prev) => ({
      ...prev,
      activeRunway: found.runways[0]?.reciprocal || found.runways[0]?.designation || '24',
    }));

    showToast(`Switched active aerodrome layout to ${found.profile.name} (${found.profile.icao}).`);
  };

  // Airfield Custom Profile & Specs Save
  const handleSaveCustomProfile = (
    updatedProfile: AirfieldProfile,
    updatedRunways: Runway[],
    updatedFuelTanks: FuelStorageTank[],
    updatedParkingBays: ParkingBay[]
  ) => {
    setActiveProfile(updatedProfile);
    setRunways(updatedRunways);
    setFuelTanks(updatedFuelTanks);
    setParkingBays(updatedParkingBays);
    showToast(`Saved configuration for ${updatedProfile.name} (${updatedProfile.icao}).`);
  };

  // 1. GM Approval of PPR / Inbound Aircraft
  const handleApprovePPR = (movementId: string) => {
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id === movementId) {
          return {
            ...m,
            status: m.status === 'PPR_REQUESTED' ? 'EN_ROUTE_INBOUND' : m.status,
            activeAlerts: [],
            noiseAbatementAcknowledged: true,
          };
        }
        return m;
      })
    );

    const approvedFlight = movements.find((m) => m.id === movementId);
    showToast(
      `PPR & Aerodrome Clearance APPROVED for ${approvedFlight?.callsign || 'aircraft'}. Radio advisory sent.`
    );
  };

  // 2. GM Rejection / Diversion
  const handleRejectPPR = (movementId: string) => {
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id === movementId) {
          return {
            ...m,
            status: 'CANCELLED',
          };
        }
        return m;
      })
    );

    const flight = movements.find((m) => m.id === movementId);
    showToast(`PPR REJECTED for ${flight?.callsign}. Advised to divert to alternate aerodrome.`);
  };

  // 3. Resolve Individual Alert
  const handleResolveAlert = (movementId: string, alertId: string) => {
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id === movementId) {
          return {
            ...m,
            activeAlerts: m.activeAlerts.filter((a) => a.id !== alertId),
          };
        }
        return m;
      })
    );
    showToast('Alert cleared and documented in aerodrome log.');
  };

  // 4. Assign Runway
  const handleAssignRunway = (movementId: string, runwayDesignation: string) => {
    setMovements((prev) =>
      prev.map((m) => (m.id === movementId ? { ...m, runway: runwayDesignation } : m))
    );
    showToast(`Runway updated to ${runwayDesignation} for active movement.`);
  };

  // 5. Generate Invoice with airfield custom fee schedule
  const handleGenerateInvoice = (movement: AircraftMovement) => {
    const newInvoice = generateInvoiceForMovement(movement, activeProfile.feeSchedule);

    setInvoices((prev) => [newInvoice, ...prev]);
    setMovements((prev) =>
      prev.map((m) =>
        m.id === movement.id
          ? { ...m, billingStatus: 'INVOICED', invoiceId: newInvoice.invoiceNumber }
          : m
      )
    );

    showToast(
      `Invoice ${newInvoice.invoiceNumber} (£${newInvoice.totalGbp.toFixed(2)}) generated for ${movement.callsign}!`
    );
    setActiveTab('BILLING_ENGINE');
  };

  // 6. Mark Invoice Paid
  const handleMarkInvoicePaid = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv))
    );

    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      setMovements((prev) =>
        prev.map((m) => (m.callsign === inv.callsign ? { ...m, billingStatus: 'PAID' } : m))
      );
    }

    showToast('Payment settled and recorded in financial ledger.');
  };

  // 7. Quick Fuel Uplift
  const handleQuickFuelUplift = (movementId: string, liters: number) => {
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id === movementId) {
          return {
            ...m,
            fuelUpliftLiters: (m.fuelUpliftLiters || 0) + liters,
            fuelType: m.fuelType || 'AVGAS_100LL',
          };
        }
        return m;
      })
    );

    // Decrement fuel tank
    setFuelTanks((prev) =>
      prev.map((t) =>
        t.fuelType === 'AVGAS_100LL'
          ? { ...t, currentLevelLiters: Math.max(0, t.currentLevelLiters - liters) }
          : t
      )
    );

    showToast(`Recorded ${liters}L AVGAS 100LL uplift. Storage tank levels updated.`);
  };

  // 8. Save ATSU Log Entry
  const handleSaveLog = (
    entry: Omit<ATSULogEntry, 'id' | 'logSequence'>,
    fuelLiters?: number
  ) => {
    const nextSeq = atsuLogs.length > 0 ? Math.max(...atsuLogs.map((l) => l.logSequence)) + 1 : 1;
    const newEntry: ATSULogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      logSequence: nextSeq,
    };

    setAtsuLogs((prev) => [newEntry, ...prev]);

    // Check if movement exists, or create a matching movement
    const existing = movements.find((m) => m.callsign === entry.callsign);
    if (!existing) {
      const newMov: AircraftMovement = {
        id: `mov-${Date.now()}`,
        callsign: entry.callsign,
        aircraftType: entry.aircraftType,
        mtowKg: entry.mtowKg,
        category: 'VISITING_PRIVATE',
        pilotName: entry.pilotName,
        pilotPhone: '+44 7700 900888',
        homeBase: entry.routeFrom,
        pprNumber: `PPR-AUTO-${nextSeq}`,
        flightRules: entry.flightRules,
        pob: entry.pob,
        movementKind:
          entry.movementType === 'ARR'
            ? 'FULL_STOP_LANDING'
            : entry.movementType === 'T&G'
            ? 'TOUCH_AND_GO'
            : entry.movementType === 'DEP'
            ? 'DEPARTURE'
            : 'OVERHEAD_TRANSIT',
        status: entry.movementType === 'ARR' ? 'LANDED_TAXIED' : 'IN_CIRCUIT',
        scheduledTime: entry.timestampUtc.replace(' UTC', ''),
        actualTime: entry.timestampUtc.replace(' UTC', ''),
        etaMinutes: entry.timestampMinutes,
        runway: entry.runway,
        parkingBayId: parkingBays[0]?.name || 'Main Hardstanding H1',
        touchAndGoCount: entry.touchAndGoCompleted,
        fuelUpliftLiters: fuelLiters || 0,
        fuelType: fuelLiters ? 'AVGAS_100LL' : undefined,
        outOfHours: false,
        overnightStay: false,
        noiseAbatementAcknowledged: true,
        pilotNotes: entry.radioLogRemarks,
        activeAlerts: [],
        billingStatus: 'UNBILLED',
      };
      setMovements((prev) => [newMov, ...prev]);
    }

    showToast(`ATSU Log #${nextSeq} recorded. CAA CAP 797 entry archived.`);
  };

  // 9. Add New PPR Request
  const handleAddPPR = (movement: AircraftMovement) => {
    setMovements((prev) => [movement, ...prev]);
    setSelectedMovementId(movement.id);
    showToast(`PPR ${movement.pprNumber} received for ${movement.callsign}. Queued in Decision Panel.`);
    setActiveTab('DECISION_PANEL');
  };

  // 10. Log Landed Aircraft Directly
  const handleAddLandedAircraft = (newMovement: AircraftMovement) => {
    setMovements((prev) => [newMovement, ...prev]);
    setSelectedMovementId(newMovement.id);

    // Also write statutory ATSU landing entry
    const nextSeq = atsuLogs.length > 0 ? Math.max(...atsuLogs.map((l) => l.logSequence)) + 1 : 1;
    const atsuEntry: ATSULogEntry = {
      id: `log-${Date.now()}`,
      logSequence: nextSeq,
      timestampUtc: `${newMovement.actualTime || '12:00'} UTC`,
      timestampMinutes: newMovement.etaMinutes,
      callsign: newMovement.callsign,
      aircraftType: newMovement.aircraftType,
      mtowKg: newMovement.mtowKg,
      pilotName: newMovement.pilotName,
      movementType: 'ARR',
      flightRules: newMovement.flightRules,
      runway: newMovement.runway,
      pob: newMovement.pob,
      routeFrom: newMovement.homeBase,
      routeTo: activeProfile.icao,
      radioLogRemarks: `Landed Runway ${newMovement.runway}. Direct touchdown recorded by operator.`,
      feeCalculatedGbp: activeProfile.feeSchedule.sub1500KgFee,
      paymentMethod: 'INVOICED',
      atsuServiceProvided: (activeProfile.atsService as any) || 'A/G Radio',
      touchAndGoCompleted: newMovement.touchAndGoCount,
    };
    setAtsuLogs((prev) => [atsuEntry, ...prev]);

    showToast(`Landed aircraft ${newMovement.callsign} logged in database and CAP 797 logbook.`);
  };

  // 11. Update movement from Backend Data Manager
  const handleUpdateMovement = (updated: AircraftMovement) => {
    setMovements((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    showToast(`Movement ${updated.callsign} updated.`);
  };

  // 12. Delete movement
  const handleDeleteMovement = (movementId: string) => {
    setMovements((prev) => prev.filter((m) => m.id !== movementId));
  };

  // 13. Update ATSU Log
  const handleUpdateAtsuLog = (updated: ATSULogEntry) => {
    setAtsuLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  // 14. Delete ATSU Log
  const handleDeleteAtsuLog = (logId: string) => {
    setAtsuLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  // 15. Restore Database from JSON
  const handleRestoreDatabase = (state: AerodromeDatabaseState) => {
    setActiveProfile(state.airfieldProfile);
    setRunways(state.runways);
    setParkingBays(state.parkingBays);
    setFuelTanks(state.fuelTanks);
    setMovements(state.movements);
    setAtsuLogs(state.atsuLogs);
    setInvoices(state.invoices);
    setWeather(state.weather);
    showToast('Complete aerodrome database restored from snapshot.');
  };

  // 16. Reset to factory defaults
  const handleResetToDefaults = () => {
    const defaults = getDefaultDatabaseState();
    setActiveProfile(defaults.airfieldProfile);
    setRunways(defaults.runways);
    setParkingBays(defaults.parkingBays);
    setFuelTanks(defaults.fuelTanks);
    setMovements(defaults.movements);
    setAtsuLogs(defaults.atsuLogs);
    setInvoices(defaults.invoices);
    setWeather(defaults.weather);
    showToast('Database reset to Meadowfield (EGMS) factory sample.');
  };

  // 17. Archive day movements
  const handleArchiveDayMovements = () => {
    setMovements((prev) =>
      prev.filter(
        (m) =>
          m.category === 'RESIDENT_CLUB' ||
          m.category === 'RESIDENT_PRIVATE' ||
          m.status === 'PARKED' ||
          m.billingStatus === 'UNBILLED'
      )
    );
    showToast("Completed traffic archived. Apron ready for tomorrow's flying.");
  };

  const pendingAlertsCount = movements.reduce((acc, m) => acc + m.activeAlerts.length, 0);
  const circuitCount = movements.filter((m) => m.status === 'IN_CIRCUIT').length;

  return (
    <div className={`min-h-screen bg-zinc-100 text-zinc-900 flex flex-col font-['Plus_Jakarta_Sans'] antialiased ${isFullscreen ? 'p-0' : ''}`}>
      {/* Aerodrome Header & Status Ribbon */}
      <Header
        profile={activeProfile}
        weather={weather}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingAlertsCount={pendingAlertsCount}
        circuitCount={circuitCount}
        onOpenQuickLogModal={() => setIsLogModalOpen(true)}
        onOpenNewPPRModal={() => setIsPPRModalOpen(true)}
        onOpenLandedModal={() => setIsLandedModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleDensity={toggleDensity}
        isHighDensity={isHighDensity}
        onOpenDualMonitor={() => setIsDualMonitorOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenDemoVideo={() => setIsDemoVideoOpen(true)}
      />

      {/* Main Operational Views */}
      <main className={`flex-1 w-full p-3 sm:p-4 md:p-6 transition-all duration-200 ${isHighDensity ? 'max-w-full' : 'max-w-7xl mx-auto'}`}>
        {activeTab === 'CONTROL_CENTRE' && (
          <ControlCentreView
            runways={runways}
            parkingBays={parkingBays}
            movements={movements}
            weather={weather}
            fuelTanks={fuelTanks}
            selectedMovementId={selectedMovementId}
            onSelectMovement={setSelectedMovementId}
            onOpenDecisionPanel={() => setActiveTab('DECISION_PANEL')}
            onGenerateInvoice={handleGenerateInvoice}
            onQuickFuelUplift={handleQuickFuelUplift}
            onOpenYoloVision={() => setActiveTab('YOLO_VISION')}
          />
        )}

        {activeTab === 'DECISION_PANEL' && (
          <DecisionPanelView
            movements={movements}
            weather={weather}
            onApprovePPR={handleApprovePPR}
            onRejectPPR={handleRejectPPR}
            onResolveAlert={handleResolveAlert}
            onAssignRunway={handleAssignRunway}
          />
        )}

        {activeTab === 'ATSU_LOGBOOK' && (
          <ATSULogbookView
            logs={atsuLogs}
            onOpenQuickLogModal={() => setIsLogModalOpen(true)}
            onOpenInvoiceForCallsign={(callsign) => {
              const matchedMov = movements.find((m) => m.callsign === callsign);
              if (matchedMov) {
                handleGenerateInvoice(matchedMov);
              } else {
                setActiveTab('BILLING_ENGINE');
              }
            }}
          />
        )}

        {activeTab === 'BILLING_ENGINE' && (
          <BillingEngineView
            movements={movements}
            invoices={invoices}
            fuelTanks={fuelTanks}
            feeSchedule={activeProfile.feeSchedule}
            onMarkInvoicePaid={handleMarkInvoicePaid}
            onGenerateInvoice={handleGenerateInvoice}
          />
        )}

        {activeTab === 'AIRFIELD_SETUP' && (
          <AirfieldSetupView
            currentProfile={activeProfile}
            runways={runways}
            parkingBays={parkingBays}
            fuelTanks={fuelTanks}
            onSaveProfile={handleSaveCustomProfile}
            onSwitchAirfieldPreset={handleSwitchAirfieldPreset}
          />
        )}

        {activeTab === 'BACKEND_DATA' && (
          <BackendDataManagerView
            profile={activeProfile}
            movements={movements}
            atsuLogs={atsuLogs}
            invoices={invoices}
            runways={runways}
            parkingBays={parkingBays}
            fuelTanks={fuelTanks}
            onUpdateMovement={handleUpdateMovement}
            onDeleteMovement={handleDeleteMovement}
            onAddLandedAircraft={handleAddLandedAircraft}
            onUpdateAtsuLog={handleUpdateAtsuLog}
            onDeleteAtsuLog={handleDeleteAtsuLog}
            onRestoreDatabase={handleRestoreDatabase}
            onResetToDefaults={handleResetToDefaults}
            onArchiveDayMovements={handleArchiveDayMovements}
          />
        )}

        {activeTab === 'GM_GUIDE' && (
          <GMWorkloadGuideView onOpenDemoVideo={() => setIsDemoVideoOpen(true)} />
        )}

        {activeTab === 'YOLO_VISION' && (
          <YoloVisionView
            movements={movements}
            parkingBays={parkingBays}
            onAddLandedAircraft={handleAddLandedAircraft}
            onGenerateInvoice={handleGenerateInvoice}
            onSelectTab={setActiveTab}
            onQuickLogAtsu={() => setIsLogModalOpen(true)}
          />
        )}
      </main>

      {/* Quick Action Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl flex items-center gap-3 font-mono text-xs animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-zinc-100">Aerodrome Operations Dispatch</div>
            <div className="text-zinc-300 mt-0.5">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* ATSU Radio Call Modal */}
      <LogMovementModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaveLog={handleSaveLog}
        nextSeqNumber={
          atsuLogs.length > 0 ? Math.max(...atsuLogs.map((l) => l.logSequence)) + 1 : 1
        }
      />

      {/* New PPR Modal */}
      <NewPPRModal
        isOpen={isPPRModalOpen}
        onClose={() => setIsPPRModalOpen(false)}
        onAddPPR={handleAddPPR}
      />

      {/* Quick Landed Aircraft Touchdown Modal */}
      <LogLandedAircraftModal
        isOpen={isLandedModalOpen}
        onClose={() => setIsLandedModalOpen(false)}
        runways={runways}
        parkingBays={parkingBays}
        feeSchedule={activeProfile.feeSchedule}
        onSaveLandedAircraft={handleAddLandedAircraft}
      />

      {/* Desktop Workstation Command Palette (Ctrl+K / Cmd+K) */}
      <DesktopCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onOpenLandedModal={() => setIsLandedModalOpen(true)}
        onOpenNewPPRModal={() => setIsPPRModalOpen(true)}
        onOpenQuickLogModal={() => setIsLogModalOpen(true)}
        onToggleDensity={toggleDensity}
        isHighDensity={isHighDensity}
        onOpenDualMonitor={() => setIsDualMonitorOpen(true)}
        onToggleFullscreen={toggleFullscreen}
        movements={movements}
        onSelectMovement={setSelectedMovementId}
        onOpenDemoVideo={() => setIsDemoVideoOpen(true)}
      />

      {/* Desktop Workstation Keyboard Shortcuts Cheat Sheet (?) */}
      <DesktopShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Desktop Dual-Monitor Secondary Tower Display Modal */}
      <DesktopTowerDualMonitorModal
        isOpen={isDualMonitorOpen}
        onClose={() => setIsDualMonitorOpen(false)}
        profile={activeProfile}
        weather={weather}
        runways={runways}
        parkingBays={parkingBays}
        movements={movements}
        circuitCount={circuitCount}
      />

      {/* Interactive Product Demo Video & Walkthrough Modal */}
      <InteractiveDemoVideoModal
        isOpen={isDemoVideoOpen}
        onClose={() => setIsDemoVideoOpen(false)}
        onSelectTab={setActiveTab}
        onOpenLandedModal={() => setIsLandedModalOpen(true)}
        onOpenQuickLogModal={() => setIsLogModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenDualMonitor={() => setIsDualMonitorOpen(true)}
      />
    </div>
  );
}
