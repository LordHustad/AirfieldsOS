/**
 * YOLO Optical Video & Surface Detection Canvas
 * Renders real-time camera optical streams, dynamic aircraft 2.5D rendering,
 * and high-precision computer vision bounding boxes, velocity vectors, and geofences.
 */

import React, { useRef, useEffect } from 'react';
import {
  YoloTrackedObject,
  YoloCameraFeed,
  GeofenceZone,
  YoloModelConfig,
} from '../types/yolo';

interface YoloVideoCanvasProps {
  camera: YoloCameraFeed;
  trackedObjects: YoloTrackedObject[];
  geofences: GeofenceZone[];
  config: YoloModelConfig;
  selectedTrackId?: string | null;
  onSelectTrack?: (trackId: string) => void;
  scenarioTime: number;
  incursionAlertActive?: boolean;
  touchdownAlertActive?: boolean;
  videoElement?: HTMLVideoElement | null;
  isCustomVideoMode?: boolean;
}

export const YoloVideoCanvas: React.FC<YoloVideoCanvasProps> = ({
  camera,
  trackedObjects,
  geofences,
  config,
  selectedTrackId,
  onSelectTrack,
  scenarioTime,
  incursionAlertActive = false,
  touchdownAlertActive = false,
  videoElement,
  isCustomVideoMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 450;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // 1. Draw Base Camera Feed (Custom video or Synthetic Airport Background)
    if (isCustomVideoMode && videoElement && videoElement.readyState >= 2) {
      ctx.drawImage(videoElement, 0, 0, width, height);
    } else {
      drawAirportScene(ctx, width, height, camera, scenarioTime);
    }

    // 2. Draw Geofence Tripwires
    if (config.showGeofences) {
      drawGeofences(ctx, width, height, geofences, trackedObjects);
    }

    // 3. Draw Dynamic Aircraft/Vehicles (Synthetic)
    if (!isCustomVideoMode) {
      trackedObjects.forEach((obj) => {
        drawRealisticTarget(ctx, width, height, obj, scenarioTime);
      });
    }

    // 4. Draw YOLO Computer Vision Overlays (Bounding boxes, Trajectories, OCR, Velocity)
    trackedObjects.forEach((obj) => {
      // Check confidence threshold
      if (obj.confidence < config.confidenceThreshold) return;

      const isSelected = selectedTrackId === obj.trackId;
      drawYoloOverlay(ctx, width, height, obj, config, isSelected);
    });

    // 5. Draw Incursion Flash Warning Border if active
    if (incursionAlertActive) {
      const flash = Math.sin(scenarioTime * 12) > 0;
      if (flash) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, width - 6, height - 6);

        // Warning banner
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(width / 2 - 190, 16, 380, 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠ CAUTION: RUNWAY INCURSION DETECTED', width / 2, 32);
      }
    } else if (touchdownAlertActive) {
      // Emerald confirmation flash
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, width - 4, height - 4);
    }

    // 6. Draw Camera OSD & Neural Telemetry HUD
    drawCameraOSD(ctx, width, height, camera, trackedObjects, config);
  }, [
    camera,
    trackedObjects,
    geofences,
    config,
    selectedTrackId,
    scenarioTime,
    incursionAlertActive,
    touchdownAlertActive,
    videoElement,
    isCustomVideoMode,
  ]);

  // Click handler to select target
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectTrack) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    // Check if clicked inside any tracked object bbox
    const found = trackedObjects.find((obj) => {
      const halfW = obj.bbox.w / 2;
      const halfH = obj.bbox.h / 2;
      return (
        clickX >= obj.bbox.x - halfW &&
        clickX <= obj.bbox.x + halfW &&
        clickY >= obj.bbox.y - halfH &&
        clickY <= obj.bbox.y + halfH
      );
    });

    if (found) {
      onSelectTrack(found.trackId);
    } else {
      onSelectTrack('');
    }
  };

  return (
    <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group select-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block"
      />
    </div>
  );
};

// -------------------------------------------------------------
// Helper: Draw Airport Background Scene for Camera Perspective
// -------------------------------------------------------------
function drawAirportScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  camera: YoloCameraFeed,
  time: number
) {
  if (camera.viewpoint === 'RUNWAY_TOUCHDOWN') {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    skyGrad.addColorStop(0, '#38bdf8'); // sky blue
    skyGrad.addColorStop(0.8, '#bae6fd');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.45);

    // Distant hills / trees
    ctx.fillStyle = '#1e3a1e';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.quadraticCurveTo(w * 0.25, h * 0.42, w * 0.5, h * 0.45);
    ctx.quadraticCurveTo(w * 0.75, h * 0.43, w, h * 0.45);
    ctx.lineTo(w, h * 0.46);
    ctx.lineTo(0, h * 0.46);
    ctx.fill();

    // Grass Field
    const grassGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    grassGrad.addColorStop(0, '#2d5a27');
    grassGrad.addColorStop(1, '#1b3b18');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    // Perspective Runway (Trapezoid)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(w * 0.46, h * 0.45); // Far threshold top-left
    ctx.lineTo(w * 0.54, h * 0.45); // Far threshold top-right
    ctx.lineTo(w * 0.88, h);        // Near threshold bottom-right
    ctx.lineTo(w * 0.12, h);        // Near threshold bottom-left
    ctx.closePath();

    const rwyGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    rwyGrad.addColorStop(0, '#3f3f46');
    rwyGrad.addColorStop(1, '#27272a');
    ctx.fillStyle = rwyGrad;
    ctx.fill();

    // Runway White Edge Markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Centerline Dashes
    ctx.fillStyle = '#fafafa';
    for (let i = 1; i <= 8; i++) {
      const p = i / 9;
      const y = h * 0.45 + p * (h * 0.55);
      const dashW = 3 + p * 8;
      const dashH = 4 + p * 20;
      ctx.fillRect(w * 0.5 - dashW / 2, y, dashW, dashH);
    }

    // Touchdown Aim Point Blocks (White rectangles on either side)
    const tdzY = h * 0.65;
    const tdzW = w * 0.045;
    const tdzH = h * 0.12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(w * 0.41 - tdzW, tdzY, tdzW, tdzH);
    ctx.fillRect(w * 0.59, tdzY, tdzW, tdzH);

    // Runway Designation Number "27"
    ctx.font = `bold ${Math.round(h * 0.06)}px ui-monospace, monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.textAlign = 'center';
    ctx.fillText('27', w * 0.5, h * 0.88);

    // Taxiway Alpha turnoff to the right
    ctx.beginPath();
    ctx.moveTo(w * 0.72, h * 0.78);
    ctx.lineTo(w * 0.95, h * 0.74);
    ctx.lineTo(w, h * 0.88);
    ctx.lineTo(w * 0.84, h * 0.94);
    ctx.closePath();
    ctx.fillStyle = '#334155';
    ctx.fill();

    // Taxiway Yellow Centerline
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.84);
    ctx.quadraticCurveTo(w * 0.74, h * 0.86, w * 0.98, h * 0.8);
    ctx.stroke();

    // Windsock on the left
    drawWindsock(ctx, w * 0.08, h * 0.52, 12, time);

    ctx.restore();
  } else if (camera.viewpoint === 'APRON_PANORAMA') {
    // Apron Concrete Tarmac
    ctx.fillStyle = '#374151'; // Slate gray tarmac
    ctx.fillRect(0, 0, w, h);

    // Distant hangar buildings
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, w, h * 0.3);
    // Hangar roofs & doors
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(i * (w / 4), h * 0.08, w / 4 - 4, h * 0.22);
    }
    // Hangar labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.fillText('HANGAR 1 - FLIGHT CLUB', w * 0.05, h * 0.06);
    ctx.fillText('AVGAS 100LL FUEL BAY', w * 0.38, h * 0.06);
    ctx.fillText('MAIN VISITOR PARKING', w * 0.68, h * 0.06);

    // Parking Stands (Stands 1, 2, 3)
    const stands = [
      { name: 'STAND 1', x: w * 0.2, y: h * 0.65 },
      { name: 'STAND 2 (FUEL)', x: w * 0.5, y: h * 0.65 },
      { name: 'STAND 3 (TIE-DOWN)', x: w * 0.8, y: h * 0.65 },
    ];

    stands.forEach((s) => {
      // Yellow parking circle & T-bar
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, w * 0.1, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(s.x, s.y - w * 0.08);
      ctx.lineTo(s.x, s.y + w * 0.08);
      ctx.moveTo(s.x - w * 0.05, s.y);
      ctx.lineTo(s.x + w * 0.05, s.y);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 13px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x, s.y + w * 0.12);
    });

    // Yellow taxi guidelines
    ctx.strokeStyle = '#eab308';
    ctx.setLineDash([12, 8]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42);
    ctx.lineTo(w, h * 0.42);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Generic high-contrast tarmac & field
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h * 0.35);

    // Guide lines
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.7);
    ctx.lineTo(w * 0.9, h * 0.7);
    ctx.stroke();
  }
}

// -------------------------------------------------------------
// Helper: Draw Windsock
// -------------------------------------------------------------
function drawWindsock(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, time: number) {
  // Mast pole
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 28);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Orange striped sock
  const sway = Math.sin(time * 3) * 3;
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + length * 2.2, y + sway);
  ctx.lineTo(x + length * 2.2, y + 7 + sway);
  ctx.lineTo(x, y + 10);
  ctx.closePath();
  ctx.fill();
}

// -------------------------------------------------------------
// Helper: Draw Geofence Tripwires
// -------------------------------------------------------------
function drawGeofences(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  geofences: GeofenceZone[],
  trackedObjects: YoloTrackedObject[]
) {
  geofences.forEach((zone) => {
    if (!zone.points || zone.points.length < 3) return;

    // Check if any tracked object is currently inside this zone
    const isTriggered = trackedObjects.some((obj) => {
      return pointInPolygon(obj.bbox.x, obj.bbox.y, zone.points);
    });

    ctx.save();
    ctx.beginPath();
    zone.points.forEach((pt, idx) => {
      const px = pt.x * w;
      const py = pt.y * h;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();

    // Fill with alpha
    ctx.fillStyle = isTriggered
      ? `${zone.color}33` // 20% opacity
      : `${zone.color}15`; // 8% opacity
    ctx.fill();

    // Border line (dashed)
    ctx.strokeStyle = isTriggered ? zone.color : `${zone.color}aa`;
    ctx.lineWidth = isTriggered ? 2.5 : 1.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zone Label Tag
    const firstPt = zone.points[0];
    const tagX = firstPt.x * w;
    const tagY = firstPt.y * h - 6;
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillStyle = '#0f172a';
    const textW = ctx.measureText(zone.name).width;
    ctx.fillStyle = isTriggered ? zone.color : 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(tagX - 4, tagY - 12, textW + 12, 16);

    ctx.fillStyle = isTriggered ? '#ffffff' : '#e2e8f0';
    ctx.fillText(`${zone.name}${isTriggered ? ' [ACTIVE]' : ''}`, tagX + 2, tagY);

    ctx.restore();
  });
}

function pointInPolygon(x: number, y: number, vs: Array<{ x: number; y: number }>): boolean {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x,
      yi = vs[i].y;
    const xj = vs[j].x,
      yj = vs[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// -------------------------------------------------------------
// Helper: Draw Synthetic Aircraft or Vehicle on Scene
// -------------------------------------------------------------
function drawRealisticTarget(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  obj: YoloTrackedObject,
  time: number
) {
  const cx = obj.bbox.x * w;
  const cy = obj.bbox.y * h;
  const targetW = obj.bbox.w * w;
  const targetH = obj.bbox.h * h;

  ctx.save();
  ctx.translate(cx, cy);

  if (obj.detectedClass === 'LIGHT_PROP' || obj.detectedClass === 'TWIN_PROP') {
    // Realistic Single Engine Airplane (e.g. Robin DR400 / PA-28)
    const altitudeScale = Math.min(1, Math.max(0, obj.altitudeFtAgl / 100));

    // Ground shadow (drawn lower if aircraft has altitude)
    const shadowOffsetY = altitudeScale * 25;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(
      0,
      targetH * 0.3 + shadowOffsetY,
      targetW * 0.45,
      targetH * 0.15,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Fuselage
    ctx.fillStyle = '#f8fafc'; // Crisp white body
    ctx.beginPath();
    ctx.ellipse(0, 0, targetW * 0.38, targetH * 0.12, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wings
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(-targetW * 0.46, -targetH * 0.06);
    ctx.lineTo(targetW * 0.46, -targetH * 0.06);
    ctx.lineTo(targetW * 0.42, targetH * 0.08);
    ctx.lineTo(-targetW * 0.42, targetH * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blue/Red Acrobatic Cheat Line
    ctx.fillStyle = '#2563eb'; // Aero blue stripe
    ctx.fillRect(-targetW * 0.3, -targetH * 0.02, targetW * 0.6, targetH * 0.04);

    // Cabin Canopy
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.beginPath();
    ctx.ellipse(targetW * 0.05, -targetH * 0.02, targetW * 0.14, targetH * 0.06, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Tail Fin
    ctx.fillStyle = '#ef4444'; // Red rudder
    ctx.beginPath();
    ctx.moveTo(-targetW * 0.34, 0);
    ctx.lineTo(-targetW * 0.42, -targetH * 0.18);
    ctx.lineTo(-targetW * 0.38, -targetH * 0.18);
    ctx.lineTo(-targetW * 0.3, 0);
    ctx.closePath();
    ctx.fill();

    // Spinning Propeller Blur at the nose
    ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
    ctx.beginPath();
    ctx.ellipse(targetW * 0.39, 0, targetW * 0.03, targetH * 0.22, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Touchdown wheel smoke if touchdown status
    if (obj.status === 'TOUCHDOWN') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const smokeRadius = (Math.sin(time * 20) + 1) * 8 + 10;
      ctx.beginPath();
      ctx.arc(-targetW * 0.15, targetH * 0.18, smokeRadius, 0, 2 * Math.PI);
      ctx.arc(targetW * 0.05, targetH * 0.18, smokeRadius * 0.8, 0, 2 * Math.PI);
      ctx.fill();
    }
  } else if (obj.detectedClass === 'GROUND_VEHICLE') {
    // Yellow Airport Follow-Me / Inspection Truck
    ctx.fillStyle = '#eab308'; // Safety yellow
    ctx.fillRect(-targetW * 0.35, -targetH * 0.25, targetW * 0.7, targetH * 0.5);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-targetW * 0.35, -targetH * 0.25, targetW * 0.7, targetH * 0.5);

    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(targetW * 0.05, -targetH * 0.2, targetW * 0.25, targetH * 0.4);

    // Amber Flashing Light Bar
    const beaconFlash = Math.sin(time * 16) > 0;
    ctx.fillStyle = beaconFlash ? '#f59e0b' : '#78350f';
    ctx.fillRect(-targetW * 0.08, -targetH * 0.34, targetW * 0.16, targetH * 0.09);
    if (beaconFlash) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.arc(0, -targetH * 0.3, targetW * 0.25, 0, 2 * Math.PI);
      ctx.fill();
    }
  } else if (obj.detectedClass === 'WILDLIFE_BIRD') {
    // Flock of Birds
    ctx.fillStyle = '#0f172a';
    const flap = Math.sin(time * 18);
    for (let b = -2; b <= 2; b++) {
      const bx = b * 8;
      const by = (b % 2) * 6;
      ctx.beginPath();
      ctx.moveTo(bx - 6, by - flap * 4);
      ctx.quadraticCurveTo(bx, by, bx + 6, by - flap * 4);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// -------------------------------------------------------------
// Helper: Draw YOLO Neural Detection Overlay (BBox, Labels, OCR)
// -------------------------------------------------------------
function drawYoloOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  obj: YoloTrackedObject,
  config: YoloModelConfig,
  isSelected: boolean
) {
  const cx = obj.bbox.x * w;
  const cy = obj.bbox.y * h;
  const boxW = obj.bbox.w * w;
  const boxH = obj.bbox.h * h;
  const x1 = cx - boxW / 2;
  const y1 = cy - boxH / 2;

  // Choose theme color based on status
  let themeColor = '#10b981'; // Emerald default (normal track)
  if (obj.status === 'INCURSION_RISK') {
    themeColor = '#ef4444'; // Red
  } else if (obj.status === 'TOUCHDOWN') {
    themeColor = '#06b6d4'; // Cyan
  } else if (obj.status === 'TAXI' || obj.status === 'HOLDING') {
    themeColor = '#f59e0b'; // Amber
  } else if (obj.status === 'PARKED') {
    themeColor = '#8b5cf6'; // Violet
  }

  ctx.save();

  // 1. Trajectory History Trace Line
  if (config.showTrajectories && obj.history && obj.history.length > 1) {
    ctx.beginPath();
    obj.history.forEach((pt, i) => {
      const hx = pt.x * w;
      const hy = pt.y * h;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    });
    ctx.strokeStyle = `${themeColor}66`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Centroid dots
    obj.history.forEach((pt) => {
      ctx.fillStyle = themeColor;
      ctx.fillRect(pt.x * w - 1.5, pt.y * h - 1.5, 3, 3);
    });
  }

  // 2. Velocity Vector Arrow
  if (config.showVelocityVectors && obj.groundspeedKts > 2) {
    const rad = ((obj.headingDeg - 90) * Math.PI) / 180;
    const len = Math.min(60, obj.groundspeedKts * 0.8);
    const vx = cx + Math.cos(rad) * len;
    const vy = cy + Math.sin(rad) * len;

    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(vx, vy);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.arc(vx, vy, 3.5, 0, 2 * Math.PI);
    ctx.fill();
  }

  // 3. High-Tech Corner Bracket Bounding Box
  if (config.showBoundingBoxes) {
    const bracketLen = Math.min(16, boxW * 0.25, boxH * 0.25);
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = isSelected ? 3 : 2;

    // Outer subtle box
    ctx.fillStyle = isSelected ? `${themeColor}22` : `${themeColor}0a`;
    ctx.fillRect(x1, y1, boxW, boxH);

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x1, y1 + bracketLen);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 + bracketLen, y1);
    // Top-right
    ctx.moveTo(x1 + boxW - bracketLen, y1);
    ctx.lineTo(x1 + boxW, y1);
    ctx.lineTo(x1 + boxW, y1 + bracketLen);
    // Bottom-right
    ctx.moveTo(x1 + boxW, y1 + boxH - bracketLen);
    ctx.lineTo(x1 + boxW, y1 + boxH);
    ctx.lineTo(x1 + boxW - bracketLen, y1 + boxH);
    // Bottom-left
    ctx.moveTo(x1 + bracketLen, y1 + boxH);
    ctx.lineTo(x1, y1 + boxH);
    ctx.lineTo(x1, y1 + boxH - bracketLen);
    ctx.stroke();

    // Center crosshair
    ctx.strokeStyle = `${themeColor}99`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy);
    ctx.lineTo(cx + 5, cy);
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx, cy + 5);
    ctx.stroke();
  }

  // 4. Labels & Telemetry Badge
  if (config.showLabels) {
    const confPct = Math.round(obj.confidence * 100);
    const ocrLabel = obj.tailNumberOcr ? ` ${obj.tailNumberOcr}` : '';
    const mainText = `${obj.trackId} | ${obj.detectedClass}${ocrLabel} ${confPct}%`;
    const subText = `${Math.round(obj.groundspeedKts)}kts · ${Math.round(obj.headingDeg)}° · ${Math.round(obj.altitudeFtAgl)}ft`;

    ctx.font = 'bold 11px ui-monospace, monospace';
    const textW = Math.max(ctx.measureText(mainText).width, ctx.measureText(subText).width);
    const tagH = 30;
    const tagY = y1 - tagH - 4;

    // Dark HUD badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 1;
    ctx.fillRect(x1, tagY, textW + 16, tagH);
    ctx.strokeRect(x1, tagY, textW + 16, tagH);

    // Status indicator pip
    ctx.fillStyle = themeColor;
    ctx.fillRect(x1 + 4, tagY + 6, 4, 18);

    // Text lines
    ctx.fillStyle = '#ffffff';
    ctx.fillText(mainText, x1 + 12, tagY + 13);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText(subText, x1 + 12, tagY + 25);
  }

  // 5. Selected Reticle Halo
  if (isSelected) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x1 - 4, y1 - 4, boxW + 8, boxH + 8);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

// -------------------------------------------------------------
// Helper: Draw Camera OSD & Neural Telemetry HUD
// -------------------------------------------------------------
function drawCameraOSD(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  camera: YoloCameraFeed,
  trackedObjects: YoloTrackedObject[],
  config: YoloModelConfig
) {
  ctx.save();

  // Top Left: Camera Identification & Optical Spec
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(10, 10, 240, 48);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, 240, 48);

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(22, 24, 4, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText(`${camera.id} · ${camera.name}`, 32, 27);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px ui-monospace, monospace';
  ctx.fillText(`${camera.resolution} @ ${camera.fps}fps · FOV ${camera.fovDeg}°`, 32, 44);

  // Top Right: YOLO Neural Inference Telemetry
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(w - 230, 10, 220, 48);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(w - 230, 10, 220, 48);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px ui-monospace, monospace';
  ctx.fillText(`NEURAL ENGINE: ${config.modelName.split(' ')[0]}`, w - 218, 27);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px ui-monospace, monospace';
  ctx.fillText(`Inference: 14.2ms · ${trackedObjects.length} Targets Tracked`, w - 218, 44);

  // Bottom Center: Target Summary Pill
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(w / 2 - 130, h - 34, 260, 24);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(w / 2 - 130, h - 34, 260, 24);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '10px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `SURFACE RADAR OPTICS · CONF ≥ ${Math.round(config.confidenceThreshold * 100)}% · MOT BYTE-TRACK`,
    w / 2,
    h - 18
  );

  ctx.restore();
}
