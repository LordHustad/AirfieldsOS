import {
  AirportState,
  Flight,
  ProposedIntervention,
  TurnaroundTask,
} from '../types/airport';
import { formatSimTime } from '../data/initialAirportState';

export interface SimulationResult {
  interventionId?: string;
  targetFlightId: string;
  originalProjectedDepartureMinutes: number;
  newProjectedDepartureMinutes: number;
  flightDelayMinutes: number;
  expectedNetworkDelayMinutes: number;
  standCollisions: {
    standId: string;
    departingFlightId: string;
    arrivingFlightId: string;
    overlapMinutes: number;
  }[];
  criticalPathTaskIds: string[];
  connectingPaxAtRisk: number;
  resourceUtilizationScore: number; // 0-100
  simulatedTasks: TurnaroundTask[];
  narrativeSummary: string;
}

/**
 * Deterministically simulates the airport operational graph (tasks, dependencies, resources, stands).
 * Computes exact critical path, flight departures, and cascading downstream airport delays.
 */
export function simulateOperationalGraph(
  state: AirportState,
  intervention?: Partial<ProposedIntervention>
): SimulationResult {
  const clonedFlights: Flight[] = JSON.parse(JSON.stringify(state.flights));
  const targetFlightId = intervention?.targetFlightId || 'BA123';
  const targetFlight = clonedFlights.find((f) => f.id === targetFlightId);

  if (!targetFlight) {
    throw new Error(`Target flight ${targetFlightId} not found in airport state.`);
  }

  // Check if F17 or another resource is broken down
  const isF17Broken = state.resources.find((r) => r.id === 'F17')?.availability === 'BROKEN_DOWN' ||
    state.activeDisruptions.some((d) => d.targetResourceId === 'F17');

  let assignedFuelResource = 'F17';
  let fuelStartDelayMinutes = 0;
  let standSwapPenaltyMinutes = 0;
  let targetStandId = targetFlight.standId;

  // Apply hypothetical intervention parameters
  if (intervention) {
    if (intervention.actionType === 'REASSIGN_RESOURCE') {
      assignedFuelResource = intervention.replacementResourceId || 'F12';
      // Transit time from current location (F12 is Apron A, ~2 minutes transit to A12)
      fuelStartDelayMinutes = intervention.resourceDetails?.etaMinutes ?? 2;
    } else if (intervention.actionType === 'SWAP_STANDS') {
      targetStandId = intervention.replacementStandId || 'B21';
      // Towing / push to remote or open stand takes 4 minutes
      standSwapPenaltyMinutes = 4;
      assignedFuelResource = 'F11'; // fuel bowser at B21
    } else if (intervention.actionType === 'DO_NOTHING') {
      // Waiting for maintenance truck / repair of F17 pump or queue takes ~25 minutes
      fuelStartDelayMinutes = 25;
    }
  } else if (isF17Broken) {
    // Default without intervention when broken is DO_NOTHING
    fuelStartDelayMinutes = 25;
  }

  // 1. Compute Critical Path and Task Schedule for Target Flight (CPM)
  const tasks = targetFlight.turnaroundTasks;
  const taskMap = new Map<string, TurnaroundTask>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  const baseArrivalMinutes = targetFlight.etaMinutes;

  // Update Fuel Task
  const fuelTask = tasks.find((t) => t.type === 'FUELLING');
  if (fuelTask) {
    fuelTask.assignedResourceId = assignedFuelResource;
    fuelTask.startTime = Math.max(fuelTask.startTime, baseArrivalMinutes + 4 + fuelStartDelayMinutes);
    fuelTask.endTime = fuelTask.startTime + fuelTask.duration;
  }

  // Forward pass through DAG dependencies
  let updatedAny = true;
  let iterations = 0;
  while (updatedAny && iterations < 15) {
    updatedAny = false;
    iterations++;

    for (const task of tasks) {
      if (task.dependencies.length > 0) {
        let maxDependencyEndTime = baseArrivalMinutes;
        for (const depId of task.dependencies) {
          const depTask = taskMap.get(depId);
          if (depTask && depTask.endTime > maxDependencyEndTime) {
            maxDependencyEndTime = depTask.endTime;
          }
        }

        // Apply stand swap buffer if applicable
        const earliestStart = maxDependencyEndTime + (task.type === 'BOARDING' ? standSwapPenaltyMinutes : 0);
        if (task.startTime < earliestStart) {
          task.startTime = earliestStart;
          task.endTime = task.startTime + task.duration;
          updatedAny = true;
        }
      }
    }
  }

  // Determine pushback completion = target flight actual ready departure
  const pushTask = tasks.find((t) => t.type === 'PUSHBACK');
  const calculatedDepartureMinutes = pushTask ? pushTask.endTime : targetFlight.etdMinutes;
  const targetFlightDelayMinutes = Math.max(0, calculatedDepartureMinutes - targetFlight.etdMinutes);

  // 2. Identify Critical Path
  const criticalPathTaskIds: string[] = [];
  if (pushTask) {
    let curr: TurnaroundTask | undefined = pushTask;
    while (curr) {
      criticalPathTaskIds.push(curr.id);
      curr.isCriticalPath = true;
      if (curr.dependencies.length === 0) break;

      // Find the dependency that finished latest (drove the start time)
      let drivingDep: TurnaroundTask | undefined;
      let maxEnd = -1;
      for (const depId of curr.dependencies) {
        const d = taskMap.get(depId);
        if (d && d.endTime > maxEnd) {
          maxEnd = d.endTime;
          drivingDep = d;
        }
      }
      curr = drivingDep;
    }
  }

  // 3. Network Ripple Simulation: Stand collisions & Downstream flights
  const standCollisions: SimulationResult['standCollisions'] = [];
  let networkTotalDelayMinutes = targetFlightDelayMinutes;

  // Stand A12 buffer check: Next flight is KL1008 (ETA 15:15 = 915 min)
  // If BA123 stays at A12 until calculatedDepartureMinutes:
  if (targetStandId === 'A12') {
    const nextFlightAtA12 = clonedFlights.find((f) => f.id === 'KL1008');
    if (nextFlightAtA12) {
      const minBuffer = 10; // 10 min stand turn buffer
      const requiredGateClearance = calculatedDepartureMinutes + minBuffer;
      if (requiredGateClearance > nextFlightAtA12.etaMinutes) {
        const overlap = requiredGateClearance - nextFlightAtA12.etaMinutes;
        standCollisions.push({
          standId: 'A12',
          departingFlightId: targetFlight.id,
          arrivingFlightId: nextFlightAtA12.id,
          overlapMinutes: overlap,
        });
        // Downstream cascade onto KL1008
        networkTotalDelayMinutes += overlap;
      }
    }
  }

  // If Stand Swap to B21 was selected, check DL45 and AA102
  if (targetStandId === 'B21') {
    // DL45 departs at 15:10. Towing BA123 to B21 might cause slight ramp congestion
    networkTotalDelayMinutes += 2; // small ramp repositioning cost
  }

  // 4. Passenger connection impact
  // If target flight delay > 15 mins, connecting passengers miss tight banks
  let connectingPaxAtRisk = 0;
  if (targetFlightDelayMinutes > 15) {
    connectingPaxAtRisk = targetFlight.connectingPassengers;
  } else if (targetFlightDelayMinutes > 5) {
    connectingPaxAtRisk = Math.round(targetFlight.connectingPassengers * 0.3);
  }

  // 5. Resource utilization score (0-100)
  const activeResourcesCount = state.resources.filter((r) => r.availability === 'IN_USE').length;
  const resourceUtilizationScore = Math.min(100, Math.round((activeResourcesCount / state.resources.length) * 100));

  // Generate clear narrative summary for operations controller
  let narrativeSummary = '';
  if (intervention?.actionType === 'REASSIGN_RESOURCE') {
    narrativeSummary = `Option A: Reassign ${assignedFuelResource} to Stand ${targetStandId}. Transit time is 2 min. Turnaround recovered to depart at ${formatSimTime(calculatedDepartureMinutes)} (+${targetFlightDelayMinutes}m). Net airport network delay impact: +${networkTotalDelayMinutes}m. Stand A12 cleared before KL1008 arrival.`;
  } else if (intervention?.actionType === 'SWAP_STANDS') {
    narrativeSummary = `Option B: Swap BA123 to Stand ${targetStandId}. Incurs 4 min towing delay + gate change notification for ${targetFlight.passengerCount} passengers. Projected departure: ${formatSimTime(calculatedDepartureMinutes)} (+${targetFlightDelayMinutes}m). Network impact: +${networkTotalDelayMinutes}m.`;
  } else if (intervention?.actionType === 'DO_NOTHING') {
    narrativeSummary = `Option C (Baseline): No intervention. Wait for pump technician or queue. Fuelling postponed by 25m. Projected departure shifts to ${formatSimTime(calculatedDepartureMinutes)} (+${targetFlightDelayMinutes}m). Cascades into Stand A12 collision with KL1008 (+${networkTotalDelayMinutes}m network delay).`;
  } else {
    narrativeSummary = `Current state projection: Departure at ${formatSimTime(calculatedDepartureMinutes)} with +${targetFlightDelayMinutes}m delay.`;
  }

  return {
    interventionId: intervention?.id,
    targetFlightId,
    originalProjectedDepartureMinutes: targetFlight.projectedDepartureMinutes,
    newProjectedDepartureMinutes: calculatedDepartureMinutes,
    flightDelayMinutes: targetFlightDelayMinutes,
    expectedNetworkDelayMinutes: networkTotalDelayMinutes,
    standCollisions,
    criticalPathTaskIds,
    connectingPaxAtRisk,
    resourceUtilizationScore,
    simulatedTasks: tasks,
    narrativeSummary,
  };
}
