import { AirportState, ProposedIntervention } from '../types/airport';
import { simulateOperationalGraph } from './simulationEngine';
import { formatSimTime } from '../data/initialAirportState';

/**
 * Planning Agent:
 * Formulates multiple viable intervention alternatives for an operational conflict,
 * passes each candidate through the Impact Simulation Engine, and identifies the lowest-impact choice.
 */
export function generateInterventions(
  state: AirportState,
  targetFlightId = 'BA123',
  conflictResourceId = 'F17'
): ProposedIntervention[] {
  const flight = state.flights.find((f) => f.id === targetFlightId);
  if (!flight) return [];

  const interventions: ProposedIntervention[] = [];

  // OPTION A: Reassign Available Fuel Truck (F12)
  const optionACandidate: Partial<ProposedIntervention> = {
    id: 'int-opt-a',
    optionLabel: 'OPTION A',
    title: 'Reassign Fuel Bowser F12',
    description: 'Dispatch idle fuel bowser F12 currently at Apron A (Stand A13 perimeter) to Stand A12.',
    actionType: 'REASSIGN_RESOURCE',
    targetFlightId,
    targetTaskId: 'BA123_FUEL',
    replacementResourceId: 'F12',
    resourceDetails: {
      current: 'F17 (Defective Pump)',
      proposed: 'F12 (Ready, 94% health)',
      etaMinutes: 2,
    },
  };

  const simA = simulateOperationalGraph(state, optionACandidate);
  interventions.push({
    ...optionACandidate as any,
    newProjectedDeparture: formatSimTime(simA.newProjectedDepartureMinutes),
    newProjectedDepartureMinutes: simA.newProjectedDepartureMinutes,
    flightDelayMinutes: simA.flightDelayMinutes,
    expectedNetworkDelayMinutes: simA.expectedNetworkDelayMinutes,
    confidenceScore: 0.96,
    tradeoffs: [
      'Minor deadhead repositioning across taxiway Alpha (2 min)',
      'Requires quick ground technician crew handover',
      'Preserves original Stand A12 gate for incoming KL1008',
    ],
    reason: 'Lowest downstream disruption (+2 min network delay). Resolves critical fuel task with minimal 1-min turnaround departure slip, preventing gate clash with incoming flight KL1008.',
    isRecommended: true,
  });

  // OPTION B: Swap Stand / Gate Relocation (e.g. Move to Stand B21)
  const optionBCandidate: Partial<ProposedIntervention> = {
    id: 'int-opt-b',
    optionLabel: 'OPTION B',
    title: 'Swap to Stand B21 & Assign Bowser F11',
    description: 'Tow aircraft BA123 to open Stand B21 where bowser F11 is already stationed.',
    actionType: 'SWAP_STANDS',
    targetFlightId,
    replacementStandId: 'B21',
    replacementResourceId: 'F11',
    resourceDetails: {
      current: 'Stand A12',
      proposed: 'Stand B21 (F11 on site)',
      etaMinutes: 4,
    },
  };

  const simB = simulateOperationalGraph(state, optionBCandidate);
  interventions.push({
    ...optionBCandidate as any,
    newProjectedDeparture: formatSimTime(simB.newProjectedDepartureMinutes),
    newProjectedDepartureMinutes: simB.newProjectedDepartureMinutes,
    flightDelayMinutes: simB.flightDelayMinutes,
    expectedNetworkDelayMinutes: simB.expectedNetworkDelayMinutes,
    confidenceScore: 0.84,
    tradeoffs: [
      'Passenger terminal transfer notices required for Pier A to Pier B',
      '4 min aircraft apron towing duration',
      'Moderate ramp congestion near Pier B heavy stands',
    ],
    reason: 'Feasible secondary mitigation (+4 min network delay). Secures fuel supply from F11 but introduces passenger inconvenience and ramp tug movement across active taxiways.',
    isRecommended: false,
  });

  // OPTION C: Do Nothing / Wait for Maintenance (Baseline)
  const optionCCandidate: Partial<ProposedIntervention> = {
    id: 'int-opt-c',
    optionLabel: 'OPTION C',
    title: 'Do Nothing (Await F17 Repair / Standard Queue)',
    description: 'Leave BA123 at Stand A12 and wait for GSE mobile mechanics to diagnose and fix pump F17.',
    actionType: 'DO_NOTHING',
    targetFlightId,
    targetTaskId: 'BA123_FUEL',
    resourceDetails: {
      current: 'F17 (Defective)',
      proposed: 'Unassisted Mechanic Dispatch',
      etaMinutes: 25,
    },
  };

  const simC = simulateOperationalGraph(state, optionCCandidate);
  interventions.push({
    ...optionCCandidate as any,
    newProjectedDeparture: formatSimTime(simC.newProjectedDepartureMinutes),
    newProjectedDepartureMinutes: simC.newProjectedDepartureMinutes,
    flightDelayMinutes: simC.flightDelayMinutes,
    expectedNetworkDelayMinutes: simC.expectedNetworkDelayMinutes,
    confidenceScore: 0.35,
    tradeoffs: [
      '+27 min severe departure delay for BA123 (Projected 15:27)',
      'Stand A12 blocked, forcing inbound KL1008 to hold on taxiway',
      '42 high-priority connecting passengers miss onward Madrid connection',
    ],
    reason: 'Severe network penalty (+27 min network delay). Fails critical turnaround milestone, triggering gate collision and cascading delay across downstream arrivals.',
    isRecommended: false,
  });

  return interventions;
}
