/**
 * YOLO Computer Vision Aircraft Identification & Surface Tracking View
 * AirfieldOS GA - Optical Surface Surveillance (Visual AI & Track Analysis)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Camera,
  Eye,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Plane,
  Truck,
  Bird,
  Crosshair,
  Maximize2,
  FileSpreadsheet,
  Receipt,
  Layers,
  Sparkles,
  Radio,
  Upload,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  YoloTrackedObject,
  YoloCameraFeed,
  GeofenceZone,
  YoloDetectionEvent,
  YoloModelConfig,
} from '../types/yolo';
import {
  DEFAULT_CAMERAS,
  DEFAULT_GEOFENCES,
  DEFAULT_YOLO_CONFIG,
  PRESET_SCENARIOS,
  ScenarioDefinition,
} from '../engine/yoloTrackerEngine';
import { YoloVideoCanvas } from './YoloVideoCanvas';
import { AircraftMovement, ParkingBay } from '../types/airfield';

interface YoloVisionViewProps {
  movements: AircraftMovement[];
  parkingBays: ParkingBay[];
  onAddLandedAircraft?: (movement: AircraftMovement) => void;
  onGenerateInvoice?: (movement: AircraftMovement) => void;
  onSelectTab?: (tab: any) => void;
  onQuickLogAtsu?: () => void;
}

export const YoloVisionView: React.FC<YoloVisionViewProps> = ({
  movements,
  parkingBays,
  onAddLandedAircraft,
  onGenerateInvoice,
  onSelectTab,
  onQuickLogAtsu,
}) => {
  // Active Camera & Scenario State
  const [activeCameraId, setActiveCameraId] = useState<string>('CAM-01');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('SCENARIO-TOUCHDOWN');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [scenarioTime, setScenarioTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('TRK-01');

  // YOLO Config
  const [config, setConfig] = useState<YoloModelConfig>(DEFAULT_YOLO_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Custom Video / Webcam state
  const [isCustomVideoMode, setIsCustomVideoMode] = useState<boolean>(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Event Blotter & Notification state
  const [events, setEvents] = useState<YoloDetectionEvent[]>([
    {
      id: 'evt-init-1',
      timestamp: '14:38:05 UTC',
      cameraId: 'CAM-01',
      cameraName: 'Runway 27 TDZ',
      trackId: 'TRK-01',
      type: 'AIRCRAFT_DETECTED',
      severity: 'INFO',
      message: 'YOLO acquired target TRK-01 on 3° Final Approach. OCR: G-CLIO (97.4% conf).',
      callsign: 'G-CLIO',
      aircraftType: 'Robin DR400-180',
      confidence: 0.97,
      autoLogged: false,
      speedKts: 68,
    },
    {
      id: 'evt-init-2',
      timestamp: '14:38:12 UTC',
      cameraId: 'CAM-01',
      cameraName: 'Runway 27 TDZ',
      trackId: 'TRK-01',
      type: 'TOUCHDOWN_CONFIRMED',
      severity: 'SUCCESS',
      message: 'Wheel touchdown detected inside ZONE-TDZ-27 at 62 kts. CAP 797 timestamp captured.',
      callsign: 'G-CLIO',
      aircraftType: 'Robin DR400-180',
      confidence: 0.98,
      autoLogged: true,
      speedKts: 62,
    },
  ]);

  // Track state history for trajectory trails
  const trackHistoriesRef = useRef<Record<string, Array<{ x: number; y: number; time: number }>>>({});
  const lastLoggedTouchdownRef = useRef<string | null>(null);

  const activeScenario: ScenarioDefinition = useMemo(() => {
    return PRESET_SCENARIOS.find((s) => s.id === activeScenarioId) || PRESET_SCENARIOS[0];
  }, [activeScenarioId]);

  const activeCamera = useMemo(() => {
    return DEFAULT_CAMERAS.find((c) => c.id === activeCameraId) || DEFAULT_CAMERAS[0];
  }, [activeCameraId]);

  const activeGeofences = useMemo(() => {
    return DEFAULT_GEOFENCES[activeCameraId] || [];
  }, [activeCameraId]);

  // Switch camera when scenario changes
  useEffect(() => {
    if (activeScenario && activeScenario.cameraId !== activeCameraId) {
      setActiveCameraId(activeScenario.cameraId);
    }
    setScenarioTime(0);
    trackHistoriesRef.current = {};
    lastLoggedTouchdownRef.current = null;
  }, [activeScenarioId]);

  // Simulation Animation Loop (60 FPS)
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying && !isCustomVideoMode) {
        setScenarioTime((prev) => {
          const next = prev + dt * playbackSpeed;
          if (next >= activeScenario.durationSec) {
            // Loop scenario
            trackHistoriesRef.current = {};
            return 0;
          }
          return next;
        });
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed, activeScenario, isCustomVideoMode]);

  // Compute Current Tracked Objects from Active Scenario at scenarioTime
  const currentTrackedObjects: YoloTrackedObject[] = useMemo(() => {
    if (isCustomVideoMode) {
      // In webcam/custom mode, generate interactive demo target
      return [
        {
          trackId: 'TRK-LIVE-01',
          detectedClass: 'LIGHT_PROP',
          confidence: 0.94,
          bbox: { x: 0.5, y: 0.5, w: 0.25, h: 0.18 },
          tailNumberOcr: 'G-DEMO',
          ocrConfidence: 0.92,
          groundspeedKts: 55,
          headingDeg: 270,
          altitudeFtAgl: 15,
          history: [],
          status: 'TOUCHDOWN',
          timeOnScreenSec: scenarioTime,
        },
      ];
    }

    const objects: YoloTrackedObject[] = [];

    // Aircraft targets
    activeScenario.aircraft.forEach((item) => {
      const state = item.path(scenarioTime);
      const hist = trackHistoriesRef.current[item.trackId] || [];

      // Update history
      const newHist = [...hist, { x: state.x, y: state.y, time: scenarioTime }].slice(-30);
      trackHistoriesRef.current[item.trackId] = newHist;

      // Check matching movement in database
      const matchedMov = movements.find((m) => m.callsign === item.tailNumber);

      objects.push({
        trackId: item.trackId,
        detectedClass: item.detectedClass,
        confidence: 0.95 - (state.status === 'TOUCHDOWN' ? 0.01 : 0.03),
        bbox: { x: state.x, y: state.y, w: state.w, h: state.h },
        tailNumberOcr: item.tailNumber,
        ocrConfidence: 0.96,
        groundspeedKts: state.kts,
        headingDeg: state.heading,
        altitudeFtAgl: state.alt,
        history: newHist,
        status: state.status,
        timeOnScreenSec: scenarioTime,
        matchedMovementId: matchedMov?.id,
      });
    });

    // Hazard targets (vehicles / birds)
    if (activeScenario.hazards) {
      activeScenario.hazards.forEach((h) => {
        const state = h.path(scenarioTime);
        const hist = trackHistoriesRef.current[h.trackId] || [];
        const newHist = [...hist, { x: state.x, y: state.y, time: scenarioTime }].slice(-30);
        trackHistoriesRef.current[h.trackId] = newHist;

        objects.push({
          trackId: h.trackId,
          detectedClass: h.detectedClass,
          confidence: 0.91,
          bbox: { x: state.x, y: state.y, w: state.w, h: state.h },
          tailNumberOcr: h.name,
          groundspeedKts: state.kts,
          headingDeg: state.heading,
          altitudeFtAgl: 0,
          history: newHist,
          status: state.status,
          timeOnScreenSec: scenarioTime,
        });
      });
    }

    return objects;
  }, [activeScenario, scenarioTime, movements, isCustomVideoMode]);

  // Check Incursion Alert
  const incursionAlertActive = useMemo(() => {
    return currentTrackedObjects.some((o) => o.status === 'INCURSION_RISK');
  }, [currentTrackedObjects]);

  // Check Touchdown Alert
  const touchdownAlertActive = useMemo(() => {
    return currentTrackedObjects.some((o) => o.status === 'TOUCHDOWN');
  }, [currentTrackedObjects]);

  // Trigger Automatic Touchdown Event & Optional Auto-Log
  useEffect(() => {
    const touchdownObj = currentTrackedObjects.find((o) => o.status === 'TOUCHDOWN');
    if (touchdownObj && touchdownObj.tailNumberOcr && lastLoggedTouchdownRef.current !== touchdownObj.tailNumberOcr) {
      lastLoggedTouchdownRef.current = touchdownObj.tailNumberOcr;

      // Add detection event
      const newEvt: YoloDetectionEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        cameraId: activeCamera.id,
        cameraName: activeCamera.name,
        trackId: touchdownObj.trackId,
        type: 'TOUCHDOWN_CONFIRMED',
        severity: 'SUCCESS',
        message: `Optical YOLO confirmed touchdown: ${touchdownObj.tailNumberOcr} inside TDZ Zone at ${Math.round(touchdownObj.groundspeedKts)} kts.`,
        callsign: touchdownObj.tailNumberOcr,
        aircraftType: 'Detected Light Prop',
        confidence: touchdownObj.confidence,
        autoLogged: config.autoLogTouchdowns,
        speedKts: touchdownObj.groundspeedKts,
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 40)]);

      // Auto-Log to Aerodrome Database if enabled
      if (config.autoLogTouchdowns && onAddLandedAircraft) {
        // Build movement record
        const movRecord: AircraftMovement = {
          id: `mov-yolo-${Date.now()}`,
          callsign: touchdownObj.tailNumberOcr,
          aircraftType: 'Robin DR400-180 Regent',
          mtowKg: 1100,
          category: 'VISITING_PRIVATE',
          pilotName: 'YOLO Visual Capture',
          pilotPhone: '+44 7700 900555',
          homeBase: 'Visual Identification (EGMS)',
          pprNumber: `YOLO-TDZ-${Math.floor(1000 + Math.random() * 9000)}`,
          flightRules: 'VFR',
          pob: 2,
          movementKind: 'FULL_STOP_LANDING',
          status: 'LANDED_TAXIED',
          scheduledTime: new Date().toISOString().substring(11, 16),
          actualTime: new Date().toISOString().substring(11, 16),
          etaMinutes: 0,
          runway: '27',
          parkingBayId: parkingBays[0]?.name || 'Hardstanding Stand 1',
          touchAndGoCount: 0,
          fuelUpliftLiters: 0,
          outOfHours: false,
          overnightStay: false,
          noiseAbatementAcknowledged: true,
          pilotNotes: `Auto-logged by YOLOv11x Optical Touchdown Detector on CAM-01 (Confidence ${Math.round(touchdownObj.confidence * 100)}%)`,
          activeAlerts: [],
          billingStatus: 'UNBILLED',
        };
        onAddLandedAircraft(movRecord);
      }
    }
  }, [currentTrackedObjects, config.autoLogTouchdowns, activeCamera, onAddLandedAircraft, parkingBays]);

  // Handle Manual Log Touchdown for Selected Object
  const handleManualLogTouchdown = (obj: YoloTrackedObject) => {
    if (!onAddLandedAircraft) return;
    const movRecord: AircraftMovement = {
      id: `mov-yolo-${Date.now()}`,
      callsign: obj.tailNumberOcr || 'G-VISN',
      aircraftType: obj.detectedClass === 'TWIN_PROP' ? 'Piper PA-34 Seneca' : 'Piper PA-28-161 Warrior',
      mtowKg: 1107,
      category: 'VISITING_PRIVATE',
      pilotName: 'Visual Verification Officer',
      pilotPhone: '+44 7700 900444',
      homeBase: 'En Route',
      pprNumber: `YOLO-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
      flightRules: 'VFR',
      pob: 1,
      movementKind: 'FULL_STOP_LANDING',
      status: 'LANDED_TAXIED',
      scheduledTime: new Date().toISOString().substring(11, 16),
      actualTime: new Date().toISOString().substring(11, 16),
      etaMinutes: 0,
      runway: '27',
      parkingBayId: parkingBays[0]?.name || 'Hardstanding Stand 1',
      touchAndGoCount: 0,
      fuelUpliftLiters: 0,
      outOfHours: false,
      overnightStay: false,
      noiseAbatementAcknowledged: true,
      pilotNotes: `Operator confirmed YOLO target ${obj.trackId} (${obj.tailNumberOcr}) at ${Math.round(obj.groundspeedKts)} kts`,
      activeAlerts: [],
      billingStatus: 'UNBILLED',
    };
    onAddLandedAircraft(movRecord);

    setEvents((prev) => [
      {
        id: `evt-manual-${Date.now()}`,
        timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
        cameraId: activeCamera.id,
        cameraName: activeCamera.name,
        trackId: obj.trackId,
        type: 'TOUCHDOWN_CONFIRMED',
        severity: 'SUCCESS',
        message: `Operator logged touchdown for ${obj.tailNumberOcr} to movements and ATSU log.`,
        callsign: obj.tailNumberOcr,
        confidence: obj.confidence,
        autoLogged: true,
      },
      ...prev,
    ]);
  };

  // Handle webcam / user video upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setIsCustomVideoMode(true);
      setIsPlaying(true);
    }
  };

  const handleStartWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCustomVideoMode(true);
        setIsPlaying(true);
      }
    } catch (err) {
      alert('Could not access webcam. Please check browser permissions.');
    }
  };

  const handleStopCustomVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCustomVideoUrl(null);
    setIsCustomVideoMode(false);
  };

  const selectedTarget = currentTrackedObjects.find((o) => o.trackId === selectedTrackId);

  return (
    <div className="space-y-6 font-mono max-w-7xl mx-auto">
      {/* Top Header & Neural Status Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">
                  YOLO Optical Surface Surveillance
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  LIVE MODEL: {config.modelName.split(' ')[0]}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                  71.4 FPS · 14.1ms
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time You Only Look Once (YOLO) multi-target aircraft detection, tail OCR, touchdown tripwire verification, and runway incursion alerting.
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSettingsOpen
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="YOLO Model Hyperparameters & Detection Thresholds"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Model Params</span>
            </button>

            <button
              onClick={() => setConfig((c) => ({ ...c, autoSoundAlerts: !c.autoSoundAlerts }))}
              className={`p-2 rounded-xl border text-xs transition-all ${
                config.autoSoundAlerts
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={config.autoSoundAlerts ? 'Audio alert chime enabled' : 'Audio alert muted'}
            >
              {config.autoSoundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Camera Selector Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              Optical Feeds:
            </span>
            {DEFAULT_CAMERAS.map((cam) => {
              const isActive = activeCameraId === cam.id && !isCustomVideoMode;
              return (
                <button
                  key={cam.id}
                  onClick={() => {
                    handleStopCustomVideo();
                    setActiveCameraId(cam.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{cam.id}</span>
                  <span className="hidden sm:inline text-slate-300 text-[10px]">
                    ({cam.name.split(' ')[0]})
                  </span>
                </button>
              );
            })}

            {/* Webcam / Custom Video Option */}
            <div className="relative inline-block ml-1">
              <button
                onClick={() => {
                  if (isCustomVideoMode) {
                    handleStopCustomVideo();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isCustomVideoMode
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
                title="Upload video file or use Webcam"
              >
                <Video className="w-3.5 h-3.5 text-amber-400" />
                <span>{isCustomVideoMode ? 'Exit Custom Video' : 'Upload Video / Webcam'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Test Scenario Quick Switcher */}
          {!isCustomVideoMode && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider hidden md:inline">
                Aero Scenario:
              </span>
              <select
                value={activeScenarioId}
                onChange={(e) => setActiveScenarioId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                {PRESET_SCENARIOS.map((scen) => (
                  <option key={scen.id} value={scen.id}>
                    {scen.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Model Hyperparameters Drawer (Collapsible) */}
      {isSettingsOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Neural Backbone Model
            </label>
            <select
              value={config.modelName}
              onChange={(e) => setConfig({ ...config, modelName: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2"
            >
              <option value="YOLOv11x-Aero (640p)">YOLOv11x-Aero (640p - 71 FPS High Accuracy)</option>
              <option value="YOLOv8-Tower (480p)">YOLOv8-Tower (480p - 95 FPS Balanced)</option>
              <option value="YOLO-Nano Edge (320p)">YOLO-Nano Edge (320p - 140 FPS Edge)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Trained on Aero-Surface-15k dataset with GA aircraft, gliders, helicopters & bowsers.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Confidence Threshold</span>
              <span className="text-emerald-400">{Math.round(config.confidenceThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.95"
              step="0.05"
              value={config.confidenceThreshold}
              onChange={(e) =>
                setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>More detections (20%)</span>
              <span>Strict only (95%)</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-300 mb-2">Display Overlays</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showBoundingBoxes}
                  onChange={(e) => setConfig({ ...config, showBoundingBoxes: e.target.checked })}
                  className="rounded border-slate-700 accent-emerald-500"
                />
                <span>Bounding Boxes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showLabels}
                  onChange={(e) => setConfig({ ...config, showLabels: e.target.checked })}
                  className="rounded border-slate-700 accent-emerald-500"
                />
                <span>OCR & Labels</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showTrajectories}
                  onChange={(e) => setConfig({ ...config, showTrajectories: e.target.checked })}
                  className="rounded border-slate-700 accent-emerald-500"
                />
                <span>Trajectory Trails</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showGeofences}
                  onChange={(e) => setConfig({ ...config, showGeofences: e.target.checked })}
                  className="rounded border-slate-700 accent-emerald-500"
                />
                <span>Tripwire Zones</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Canvas + Right Target Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center (8 cols): High-Def YOLO Video Canvas & Playback Bar */}
        <div className="lg:col-span-8 space-y-3">
          {/* Active Incursion Banner if detected */}
          {incursionAlertActive && (
            <div className="bg-red-950/80 border-2 border-red-500 text-red-100 p-3 rounded-xl flex items-center justify-between animate-bounce shadow-lg">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs">
                    CAP 797 RUNWAY INCURSION ALERT: GROUND VEHICLE EN ROUTE
                  </div>
                  <div className="text-[11px] text-red-200">
                    Inspection truck OPS-1 encroaching Runway 27 while aircraft is on final approach!
                  </div>
                </div>
              </div>
              <button
                onClick={onQuickLogAtsu}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
              >
                Broadcast Go-Around
              </button>
            </div>
          )}

          {/* Video / Canvas Element */}
          <div className="relative">
            {isCustomVideoMode && customVideoUrl && (
              <video
                ref={videoRef}
                src={customVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="hidden"
              />
            )}

            <YoloVideoCanvas
              camera={activeCamera}
              trackedObjects={currentTrackedObjects}
              geofences={activeGeofences}
              config={config}
              selectedTrackId={selectedTrackId}
              onSelectTrack={setSelectedTrackId}
              scenarioTime={scenarioTime}
              incursionAlertActive={incursionAlertActive}
              touchdownAlertActive={touchdownAlertActive}
              videoElement={videoRef.current}
              isCustomVideoMode={isCustomVideoMode}
            />
          </div>

          {/* Timeline & Playback Controller */}
          {!isCustomVideoMode && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xs"
                  title={isPlaying ? 'Pause simulation' : 'Play simulation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={() => {
                    setScenarioTime(0);
                    trackHistoriesRef.current = {};
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Scrub slider */}
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-[11px] text-slate-400">
                    {scenarioTime.toFixed(1)}s / {activeScenario.durationSec}s
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={activeScenario.durationSec}
                    step="0.1"
                    value={scenarioTime}
                    onChange={(e) => {
                      setScenarioTime(parseFloat(e.target.value));
                      trackHistoriesRef.current = {};
                    }}
                    className="w-32 sm:w-48 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Speed Toggles */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 uppercase mr-1">Speed:</span>
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 rounded text-[10px] font-mono ${
                      playbackSpeed === spd
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Dispatch Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Selected:</span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {selectedTarget ? `${selectedTarget.trackId} (${selectedTarget.tailNumberOcr || 'N/A'})` : 'No Target Selected'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedTarget && (
                <button
                  onClick={() => handleManualLogTouchdown(selectedTarget)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Log Touchdown</span>
                </button>
              )}

              {onSelectTab && (
                <button
                  onClick={() => onSelectTab('ATSU_LOGBOOK')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                  <span>CAP 797 Logbook</span>
                </button>
              )}

              {onSelectTab && (
                <button
                  onClick={() => onSelectTab('BILLING_ENGINE')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  <span>Billing & Invoices</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Active Target Inspector + YOLO Event Stream */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Target Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Optical Trackers ({currentTrackedObjects.length})
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">MOT ByteTrack</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {currentTrackedObjects.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center">
                  Scanning optical sector... No active target bounding boxes.
                </div>
              ) : (
                currentTrackedObjects.map((obj) => {
                  const isSelected = selectedTrackId === obj.trackId;
                  return (
                    <div
                      key={obj.trackId}
                      onClick={() => setSelectedTrackId(obj.trackId)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                            {obj.detectedClass === 'GROUND_VEHICLE' ? (
                              <Truck className="w-3.5 h-3.5" />
                            ) : obj.detectedClass === 'WILDLIFE_BIRD' ? (
                              <Bird className="w-3.5 h-3.5" />
                            ) : (
                              <Plane className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{obj.tailNumberOcr || obj.trackId}</span>
                              <span className="text-[10px] text-slate-400">({obj.detectedClass})</span>
                            </div>
                            <div className="text-[10px] text-slate-500">Track ID: {obj.trackId}</div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            obj.status === 'TOUCHDOWN'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : obj.status === 'INCURSION_RISK'
                              ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                              : obj.status === 'ROLLOUT'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {obj.status}
                        </span>
                      </div>

                      {/* Telemetry Metrics Bar */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[11px] font-mono">
                        <div>
                          <div className="text-[9px] text-slate-500">SPEED</div>
                          <div className="text-slate-200 font-bold">{Math.round(obj.groundspeedKts)} kts</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500">HEADING</div>
                          <div className="text-slate-200 font-bold">{Math.round(obj.headingDeg)}°</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-500">CONFIDENCE</div>
                          <div className="text-emerald-400 font-bold">
                            {Math.round(obj.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live YOLO Detection Event Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Event Blotter
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{events.length} logged</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">{evt.timestamp}</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-300'
                          : evt.severity === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-300'
                          : evt.severity === 'WARNING'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {evt.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{evt.message}</p>
                  {evt.autoLogged && (
                    <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Synchronized to CAP 797 ATSU Logbook & Movements</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
