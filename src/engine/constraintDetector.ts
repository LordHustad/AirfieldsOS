import { AirportState, OperationalConflict } from '../types/airport';
import { formatSimTime } from '../data/initialAirportState';

/**
 * Constraint Detection Agent:
 * Evaluates the airport state graph to detect resource failures, dependency stalls,
 * stand collisions, and cascading curfew/delay risks.
 */
export function detectOperationalConstraints(state: AirportState): OperationalConflict[] {
  const conflicts: OperationalConflict[] = [];

  // 1. Detect Resource Failures & Dependent Tasks
  for (const resource of state.resources) {
    if (resource.availability === 'BROKEN_DOWN' || resource.healthPercent <= 15) {
      // Find all tasks assigned to this broken resource across all flights
      for (const flight of state.flights) {
        for (const task of flight.turnaroundTasks) {
          if (task.assignedResourceId === resource.id && task.status !== 'COMPLETED') {
            conflicts.push({
              id: `conflict-${resource.id}-${task.id}`,
              flightId: flight.id,
              taskId: task.id,
              resourceId: resource.id,
              standId: flight.standId,
              conflictType: 'RESOURCE_FAILURE',
              severity: 'CRITICAL',
              description: `${resource.name} failed (${resource.id} pump malfunction) at Stand ${flight.standId}. Halts critical turnaround task "${task.name}" for flight ${flight.id}.`,
              timestamp: formatSimTime(state.simTimeMinutes),
            });
          }
        }
      }
    }
  }

  // 2. Stand Collisions / Overlapping Gate Assignments
  // Group flights by stand
  const standFlightMap = new Map<string, typeof state.flights>();
  for (const flight of state.flights) {
    const list = standFlightMap.get(flight.standId) || [];
    list.push(flight);
    standFlightMap.set(flight.standId, list);
  }

  standFlightMap.forEach((flightsOnStand, standId) => {
    if (flightsOnStand.length > 1) {
      // Sort by ETA
      const sorted = [...flightsOnStand].sort((a, b) => a.etaMinutes - b.etaMinutes);
      for (let i = 0; i < sorted.length - 1; i++) {
        const departing = sorted[i];
        const arriving = sorted[i + 1];
        // If departing flight's projected departure + buffer > arriving flight's ETA
        const buffer = 10;
        if (departing.projectedDepartureMinutes + buffer > arriving.etaMinutes) {
          conflicts.push({
            id: `stand-clash-${standId}-${departing.id}-${arriving.id}`,
            flightId: departing.id,
            taskId: 'STAND_ASSIGNMENT',
            standId,
            conflictType: 'STAND_COLLISION',
            severity: 'CRITICAL',
            description: `Stand ${standId} conflict: ${departing.id} projected departure at ${formatSimTime(
              departing.projectedDepartureMinutes
            )} blocks inbound ${arriving.id} arriving at ${formatSimTime(arriving.etaMinutes)}.`,
            timestamp: formatSimTime(state.simTimeMinutes),
          });
        }
      }
    }
  });

  // 3. Downstream Delay / Critical Transfer Risk
  for (const flight of state.flights) {
    if (flight.projectedDepartureMinutes > flight.etdMinutes + 15 && flight.priority === 'CRITICAL_TRANSFER') {
      conflicts.push({
        id: `transfer-risk-${flight.id}`,
        flightId: flight.id,
        taskId: 'BOARDING',
        conflictType: 'CURFEW_RISK',
        severity: 'WARNING',
        description: `Flight ${flight.id} has ${flight.connectingPassengers} transfer passengers at risk due to +${
          flight.projectedDepartureMinutes - flight.etdMinutes
        }m departure slip.`,
        timestamp: formatSimTime(state.simTimeMinutes),
      });
    }
  }

  return conflicts;
}
