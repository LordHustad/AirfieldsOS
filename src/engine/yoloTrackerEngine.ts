/**
 * YOLO Computer Vision Detection & Tracking Engine
 * Simulates real-time multi-target surface detection, OCR callsign recognition,
 * Kalman filter velocity tracking, and geofence tripwire analytics.
 */

import {
  YoloTrackedObject,
  YoloCameraFeed,
  GeofenceZone,
  YoloDetectionEvent,
  YoloModelConfig,
  YoloDetectedClass,
} from '../types/yolo';

export const DEFAULT_CAMERAS: YoloCameraFeed[] = [
  {
    id: 'CAM-01',
    name: 'Runway 27 Touchdown Zone (TDZ)',
    location: 'Tower South Optical Mast (42m AGL)',
    viewpoint: 'RUNWAY_TOUCHDOWN',
    fovDeg: 45,
    resolution: '1920x1080',
    fps: 60,
    status: 'ONLINE',
  },
  {
    id: 'CAM-02',
    name: 'Main Apron & Fuel Bay Panorama',
    location: 'Hangar 1 Rooftop PTZ',
    viewpoint: 'APRON_PANORAMA',
    fovDeg: 90,
    resolution: '2560x1440',
    fps: 30,
    status: 'ONLINE',
  },
  {
    id: 'CAM-03',
    name: 'Taxiway Alpha & Holding Point 27',
    location: 'Perimeter Boundary Sensor Post',
    viewpoint: 'TAXIWAY_HOLDING',
    fovDeg: 60,
    resolution: '1920x1080',
    fps: 60,
    status: 'ONLINE',
  },
  {
    id: 'CAM-04',
    name: 'Final Approach Sector (Optic Zoom)',
    location: 'East Approach Glidepath Pole',
    viewpoint: 'APPROACH_SECTOR',
    fovDeg: 35,
    resolution: '1920x1080',
    fps: 60,
    status: 'ONLINE',
  },
];

export const DEFAULT_GEOFENCES: Record<string, GeofenceZone[]> = {
  'CAM-01': [
    {
      id: 'ZONE-TDZ-27',
      name: 'Runway 27 Touchdown Box',
      type: 'TOUCHDOWN_BOX',
      points: [
        { x: 0.28, y: 0.52 },
        { x: 0.72, y: 0.52 },
        { x: 0.84, y: 0.88 },
        { x: 0.16, y: 0.88 },
      ],
      color: '#10b981', // emerald
      description: 'Designated aim point touchdown area (CAP 168 compliant)',
      triggerCount: 14,
    },
    {
      id: 'ZONE-INCURSION-27',
      name: 'Active Runway Protected Corridor',
      type: 'RUNWAY_CORRIDOR',
      points: [
        { x: 0.1, y: 0.45 },
        { x: 0.9, y: 0.45 },
        { x: 0.95, y: 0.96 },
        { x: 0.05, y: 0.96 },
      ],
      color: '#ef4444', // red
      description: 'Sterile runway corridor. Any non-cleared vehicle triggers incursion protocol.',
      triggerCount: 1,
    },
  ],
  'CAM-02': [
    {
      id: 'ZONE-STAND-1',
      name: 'Hardstanding Stand 1 (Hard)',
      type: 'APRON_STAND',
      points: [
        { x: 0.1, y: 0.5 },
        { x: 0.32, y: 0.5 },
        { x: 0.35, y: 0.82 },
        { x: 0.08, y: 0.82 },
      ],
      color: '#38bdf8', // sky
      description: 'Visiting PA-28 / C172 Priority Stand',
      triggerCount: 8,
    },
    {
      id: 'ZONE-STAND-2',
      name: 'Hardstanding Stand 2 (Fuel Access)',
      type: 'APRON_STAND',
      points: [
        { x: 0.38, y: 0.5 },
        { x: 0.62, y: 0.5 },
        { x: 0.65, y: 0.82 },
        { x: 0.36, y: 0.82 },
      ],
      color: '#06b6d4', // cyan
      description: 'AVGAS 100LL Self-Serve Fuel Bay Stand',
      triggerCount: 5,
    },
    {
      id: 'ZONE-STAND-3',
      name: 'Tie-Down Stand 3 (Grass)',
      type: 'APRON_STAND',
      points: [
        { x: 0.68, y: 0.5 },
        { x: 0.92, y: 0.5 },
        { x: 0.94, y: 0.82 },
        { x: 0.66, y: 0.82 },
      ],
      color: '#a855f7', // purple
      description: 'Overnight tie-down parking',
      triggerCount: 3,
    },
  ],
  'CAM-03': [
    {
      id: 'ZONE-HOLD-A1',
      name: 'Holding Point Alpha (RWY 27)',
      type: 'HOLDING_POINT',
      points: [
        { x: 0.25, y: 0.6 },
        { x: 0.75, y: 0.6 },
        { x: 0.8, y: 0.85 },
        { x: 0.2, y: 0.85 },
      ],
      color: '#f59e0b', // amber
      description: 'Mandatory stop line before runway access',
      triggerCount: 19,
    },
  ],
  'CAM-04': [
    {
      id: 'ZONE-FINAL-APPR',
      name: '3° Visual Glidepath Funnel',
      type: 'RUNWAY_CORRIDOR',
      points: [
        { x: 0.35, y: 0.2 },
        { x: 0.65, y: 0.2 },
        { x: 0.85, y: 0.9 },
        { x: 0.15, y: 0.9 },
      ],
      color: '#3b82f6',
      description: 'Final approach monitoring segment',
      triggerCount: 22,
    },
  ],
};

export const DEFAULT_YOLO_CONFIG: YoloModelConfig = {
  modelName: 'YOLOv11x-Aero (640p)',
  confidenceThreshold: 0.45,
  nmsIouThreshold: 0.5,
  targetFps: 60,
  showBoundingBoxes: true,
  showLabels: true,
  showTrajectories: true,
  showVelocityVectors: true,
  showGeofences: true,
  showHeatmap: false,
  autoLogTouchdowns: true,
  autoSoundAlerts: false,
};

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  cameraId: string;
  durationSec: number;
  aircraft: Array<{
    trackId: string;
    detectedClass: YoloDetectedClass;
    tailNumber: string;
    pilotCategory: string;
    aircraftModel: string;
    path: (t: number) => {
      x: number;
      y: number;
      w: number;
      h: number;
      kts: number;
      heading: number;
      alt: number;
      status: YoloTrackedObject['status'];
    };
  }>;
  hazards?: Array<{
    trackId: string;
    detectedClass: YoloDetectedClass;
    name: string;
    path: (t: number) => {
      x: number;
      y: number;
      w: number;
      h: number;
      kts: number;
      heading: number;
      status: YoloTrackedObject['status'];
    };
  }>;
}

export const PRESET_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'SCENARIO-TOUCHDOWN',
    name: '1. Standard Touchdown & Rollout (G-CLIO Robin DR400)',
    description: 'Aircraft flares at 20ft, makes firm wheel contact on RWY 27 TDZ, decelerates and vacates to Taxiway Alpha.',
    cameraId: 'CAM-01',
    durationSec: 18,
    aircraft: [
      {
        trackId: 'TRK-01',
        detectedClass: 'LIGHT_PROP',
        tailNumber: 'G-CLIO',
        pilotCategory: 'VISITING_PRIVATE',
        aircraftModel: 'Robin DR400-180 Regent',
        path: (t) => {
          // t runs 0 to 18 sec
          const progress = Math.min(1, t / 18);
          if (progress < 0.25) {
            // Short Final approach (high, center-left descending)
            const p = progress / 0.25;
            return {
              x: 0.48 + p * 0.02,
              y: 0.35 + p * 0.2,
              w: 0.08 + p * 0.08,
              h: 0.06 + p * 0.06,
              kts: 68 - p * 3,
              heading: 268,
              alt: 60 - p * 50,
              status: 'APPROACH',
            };
          } else if (progress < 0.38) {
            // Flare & Touchdown
            const p = (progress - 0.25) / 0.13;
            return {
              x: 0.5 + p * 0.02,
              y: 0.55 + p * 0.15,
              w: 0.16 + p * 0.08,
              h: 0.12 + p * 0.06,
              kts: 62 - p * 8,
              heading: 269,
              alt: Math.max(0, 10 - p * 10),
              status: p > 0.4 ? 'TOUCHDOWN' : 'FLARE',
            };
          } else if (progress < 0.75) {
            // Rollout along centerline
            const p = (progress - 0.38) / 0.37;
            return {
              x: 0.52 + p * 0.03,
              y: 0.7 + p * 0.15,
              w: 0.24 + p * 0.06,
              h: 0.18 + p * 0.05,
              kts: 54 - p * 36,
              heading: 270,
              alt: 0,
              status: 'ROLLOUT',
            };
          } else {
            // Vacating onto taxiway Alpha (turning right)
            const p = (progress - 0.75) / 0.25;
            return {
              x: 0.55 + p * 0.25,
              y: 0.85 - p * 0.05,
              w: 0.28,
              h: 0.22,
              kts: 16 - p * 4,
              heading: 320,
              alt: 0,
              status: 'TAXI',
            };
          }
        },
      },
    ],
  },
  {
    id: 'SCENARIO-INCURSION',
    name: '2. Runway Incursion Hazard (Inspection Truck vs G-BTAW)',
    description: 'Ground vehicle crosses holding point line 27 while Warrior PA-28 is on 1/2 mile short final. Triggers CAP 797 incursion alert.',
    cameraId: 'CAM-01',
    durationSec: 16,
    aircraft: [
      {
        trackId: 'TRK-02',
        detectedClass: 'LIGHT_PROP',
        tailNumber: 'G-BTAW',
        pilotCategory: 'RESIDENT_CLUB',
        aircraftModel: 'Piper PA-28-161 Warrior II',
        path: (t) => {
          const progress = Math.min(1, t / 16);
          return {
            x: 0.5 - progress * 0.02,
            y: 0.3 + progress * 0.35,
            w: 0.08 + progress * 0.15,
            h: 0.06 + progress * 0.12,
            kts: 70,
            heading: 269,
            alt: Math.max(10, 150 - progress * 140),
            status: progress > 0.4 ? 'INCURSION_RISK' : 'APPROACH',
          };
        },
      },
    ],
    hazards: [
      {
        trackId: 'TRK-VEH-01',
        detectedClass: 'GROUND_VEHICLE',
        name: 'Aerodrome Inspection Van (OPS-1)',
        path: (t) => {
          const progress = Math.min(1, t / 16);
          // Vehicle encroaches from right side across runway threshold
          return {
            x: 0.85 - progress * 0.45,
            y: 0.65 + progress * 0.05,
            w: 0.09,
            h: 0.07,
            kts: 22,
            heading: 210,
            status: progress > 0.35 ? 'INCURSION_RISK' : 'TAXI',
          };
        },
      },
    ],
  },
  {
    id: 'SCENARIO-APRON',
    name: '3. Apron Taxi-In & Stand Allocation (N452X Cirrus SR22)',
    description: 'Cirrus SR22 arrives from taxiway, enters Apron Stand 1, and marshals shut down. System marks Bay 1 occupied.',
    cameraId: 'CAM-02',
    durationSec: 16,
    aircraft: [
      {
        trackId: 'TRK-03',
        detectedClass: 'LIGHT_PROP',
        tailNumber: 'N452X',
        pilotCategory: 'VISITING_PRIVATE',
        aircraftModel: 'Cirrus SR22-G6 Turbo',
        path: (t) => {
          const progress = Math.min(1, t / 16);
          if (progress < 0.6) {
            // Taxiing along apron lead-in line
            const p = progress / 0.6;
            return {
              x: 0.8 - p * 0.6,
              y: 0.35 + p * 0.3,
              w: 0.12 + p * 0.06,
              h: 0.09 + p * 0.05,
              kts: 14 - p * 8,
              heading: 235,
              alt: 0,
              status: 'TAXI',
            };
          } else {
            // Turning into Stand 1
            const p = (progress - 0.6) / 0.4;
            return {
              x: 0.2 - p * 0.02,
              y: 0.65 + p * 0.03,
              w: 0.18,
              h: 0.14,
              kts: Math.max(0, 6 - p * 6),
              heading: 180,
              alt: 0,
              status: p > 0.7 ? 'PARKED' : 'TAXI',
            };
          }
        },
      },
    ],
  },
  {
    id: 'SCENARIO-WILDLIFE',
    name: '4. Runway Threshold Bird Flock Detection',
    description: 'Flock of 8-12 lapwings detected circling 30m before Runway 27 threshold. Automatic bird dispersal advisory dispatched.',
    cameraId: 'CAM-01',
    durationSec: 14,
    aircraft: [
      {
        trackId: 'TRK-04',
        detectedClass: 'LIGHT_PROP',
        tailNumber: 'G-BOOM',
        pilotCategory: 'RESIDENT_CLUB',
        aircraftModel: 'Cessna 172N Skyhawk',
        path: (t) => {
          const progress = Math.min(1, t / 14);
          return {
            x: 0.5,
            y: 0.2 + progress * 0.3,
            w: 0.07 + progress * 0.08,
            h: 0.05 + progress * 0.06,
            kts: 65,
            heading: 270,
            alt: 120 - progress * 90,
            status: 'APPROACH',
          };
        },
      },
    ],
    hazards: [
      {
        trackId: 'TRK-WILD-01',
        detectedClass: 'WILDLIFE_BIRD',
        name: 'Flock of Lapwings (6-10 birds)',
        path: (t) => {
          // Birds circling threshold
          const angle = (t * 1.5) % (2 * Math.PI);
          return {
            x: 0.45 + Math.cos(angle) * 0.12,
            y: 0.48 + Math.sin(angle) * 0.08,
            w: 0.06,
            h: 0.05,
            kts: 18,
            heading: Math.round((angle * 180) / Math.PI) % 360,
            status: 'INCURSION_RISK',
          };
        },
      },
    ],
  },
];
