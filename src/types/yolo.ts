/**
 * YOLO Computer Vision & Surface Tracking Types for AirfieldOS GA
 * Complies with FAA / CAA Airport Surface Surveillance (ASDE-X / Visual AI) concepts
 */

export type YoloDetectedClass =
  | 'LIGHT_PROP'
  | 'TWIN_PROP'
  | 'TURBOPROP'
  | 'HELICOPTER'
  | 'GROUND_VEHICLE'
  | 'PERSONNEL'
  | 'WILDLIFE_BIRD';

export interface YoloBoundingBox {
  x: number; // 0..1 normalized center X
  y: number; // 0..1 normalized center Y
  w: number; // 0..1 normalized width
  h: number; // 0..1 normalized height
}

export interface YoloTrackedObject {
  trackId: string;
  detectedClass: YoloDetectedClass;
  confidence: number; // 0..1
  bbox: YoloBoundingBox;
  tailNumberOcr?: string;
  ocrConfidence?: number;
  groundspeedKts: number;
  headingDeg: number;
  altitudeFtAgl: number;
  history: Array<{ x: number; y: number; time: number }>;
  status:
    | 'APPROACH'
    | 'FLARE'
    | 'TOUCHDOWN'
    | 'ROLLOUT'
    | 'TAXI'
    | 'HOLDING'
    | 'PARKED'
    | 'INCURSION_RISK';
  timeOnScreenSec: number;
  matchedMovementId?: string;
  lastZoneId?: string;
}

export interface YoloCameraFeed {
  id: string;
  name: string;
  location: string;
  viewpoint: 'RUNWAY_TOUCHDOWN' | 'APRON_PANORAMA' | 'TAXIWAY_HOLDING' | 'APPROACH_SECTOR';
  fovDeg: number;
  resolution: string;
  fps: number;
  status: 'ONLINE' | 'STANDBY' | 'CALIBRATING';
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'TOUCHDOWN_BOX' | 'RUNWAY_CORRIDOR' | 'HOLDING_POINT' | 'APRON_STAND' | 'WILDLIFE_BUFFER';
  points: Array<{ x: number; y: number }>; // Normalized 0..1 polygon points
  color: string;
  description: string;
  triggerCount: number;
}

export interface YoloDetectionEvent {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  trackId: string;
  type:
    | 'TOUCHDOWN_CONFIRMED'
    | 'RUNWAY_INCURSION_WARNING'
    | 'HOLDING_COMPLIANCE'
    | 'STAND_OCCUPIED'
    | 'WILDLIFE_HAZARD'
    | 'AIRCRAFT_DETECTED';
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  message: string;
  callsign?: string;
  aircraftType?: string;
  confidence: number;
  autoLogged: boolean;
  speedKts?: number;
}

export interface YoloModelConfig {
  modelName: 'YOLOv11x-Aero (640p)' | 'YOLOv8-Tower (480p)' | 'YOLO-Nano Edge (320p)';
  confidenceThreshold: number; // 0.1 to 0.95
  nmsIouThreshold: number; // 0.1 to 0.95
  targetFps: number;
  showBoundingBoxes: boolean;
  showLabels: boolean;
  showTrajectories: boolean;
  showVelocityVectors: boolean;
  showGeofences: boolean;
  showHeatmap: boolean;
  autoLogTouchdowns: boolean;
  autoSoundAlerts: boolean;
}
