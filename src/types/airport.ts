export type FlightPriority = 'VIP' | 'CRITICAL_TRANSFER' | 'HIGH' | 'STANDARD';

export type FlightStatus =
  | 'SCHEDULED'
  | 'ARRIVED'
  | 'IN_TURNAROUND'
  | 'BOARDING'
  | 'PUSHBACK_READY'
  | 'DEPARTED'
  | 'DELAYED_AT_GATE';

export type TaskType =
  | 'DEBOARDING'
  | 'BAGGAGE_OFFLOAD'
  | 'CLEANING'
  | 'FUELLING'
  | 'CATERING'
  | 'BAGGAGE_LOADING'
  | 'BOARDING'
  | 'PUSHBACK';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'FAILED';

export type ResourceType =
  | 'FUEL_TRUCK'
  | 'BAGGAGE_BELT'
  | 'CATERING_TRUCK'
  | 'PUSHBACK_TUG'
  | 'GPU'
  | 'CLEANING_CREW'
  | 'BAGGAGE_CREW'
  | 'DISPATCHER';

export type ResourceAvailability =
  | 'AVAILABLE'
  | 'IN_USE'
  | 'BROKEN_DOWN'
  | 'TRANSIT'
  | 'STANDBY';

export interface Stand {
  id: string; // e.g., 'A11', 'A12', 'A13', 'B21', 'B22'
  terminal: string;
  name: string;
  maxAircraftSize: 'WIDEBODY' | 'NARROWBODY';
  assignedFlightId: string | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CONTAMINATED';
  coordinates: { x: number; y: number };
}

export interface Resource {
  id: string; // e.g., 'F11', 'F12', 'F17'
  type: ResourceType;
  name: string;
  location: string; // stand or apron zone
  availability: ResourceAvailability;
  capacity: number;
  assignedFlightId: string | null;
  assignedTaskId: string | null;
  transitMinutesRemaining?: number;
  healthPercent: number;
}

export interface Staff {
  id: string;
  name: string;
  role: 'CLEANING' | 'BAGGAGE' | 'FUELLING' | 'CATERING' | 'COORDINATOR';
  assignedFlightId: string | null;
  assignedTaskId: string | null;
  availability: 'AVAILABLE' | 'ASSIGNED' | 'ON_BREAK' | 'ABSENT';
}

export interface TurnaroundTask {
  id: string;
  flightId: string;
  type: TaskType;
  name: string;
  startTime: number; // minutes from base (e.g. 14:10 = 850)
  endTime: number;
  duration: number; // minutes
  requiredResourceType: ResourceType;
  assignedResourceId: string | null;
  requiredStaffRole: string;
  assignedStaffId: string | null;
  dependencies: string[]; // task IDs that must complete first
  status: TaskStatus;
  progress: number; // 0 to 100
  isCriticalPath?: boolean;
}

export interface Flight {
  id: string; // e.g., 'BA123'
  airline: string;
  aircraftType: string;
  origin: string;
  nextDestination: string;
  eta: string; // "14:10"
  etd: string; // "15:00"
  etaMinutes: number; // 850
  etdMinutes: number; // 900
  projectedDepartureMinutes: number; // dynamic computed based on tasks
  standId: string;
  passengerCount: number;
  connectingPassengers: number;
  priority: FlightPriority;
  status: FlightStatus;
  turnaroundTasks: TurnaroundTask[];
  delayMinutes: number;
}

export interface DisruptionEvent {
  id: string;
  timestamp: string; // "14:12"
  timestampMinutes: number;
  type:
    | 'RESOURCE_BREAKDOWN'
    | 'STAFF_SHORTAGE'
    | 'INBOUND_DELAY'
    | 'STAND_UNAVAILABLE'
    | 'TASK_DELAY'
    | 'SIMULTANEOUS_MULTIPLE';
  title: string;
  description: string;
  targetResourceId?: string;
  targetFlightId?: string;
  targetStandId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DETECTED' | 'ANALYZING' | 'INTERVENTION_PROPOSED' | 'APPROVED' | 'MITIGATED' | 'REJECTED';
}

export interface ProposedIntervention {
  id: string;
  optionLabel: 'OPTION A' | 'OPTION B' | 'OPTION C';
  title: string;
  description: string;
  actionType: 'REASSIGN_RESOURCE' | 'SWAP_STANDS' | 'PARALLEL_EXPEDITE' | 'DO_NOTHING';
  targetFlightId: string;
  targetTaskId?: string;
  replacementResourceId?: string;
  replacementStandId?: string;
  newProjectedDeparture: string;
  newProjectedDepartureMinutes: number;
  flightDelayMinutes: number;
  expectedNetworkDelayMinutes: number; // network cascading impact (+min)
  confidenceScore: number; // 0-1
  tradeoffs: string[];
  reason: string;
  isRecommended: boolean;
  resourceDetails?: {
    current: string;
    proposed: string;
    etaMinutes: number;
  };
}

export interface OperationalConflict {
  id: string;
  flightId: string;
  taskId: string;
  resourceId?: string;
  standId?: string;
  conflictType: 'RESOURCE_FAILURE' | 'STAND_COLLISION' | 'DEPENDENCY_BOTTLENECK' | 'CURFEW_RISK';
  severity: 'WARNING' | 'CRITICAL';
  description: string;
  timestamp: string;
}

export interface OperationsLogItem {
  id: string;
  timestamp: string;
  timestampMinutes: number;
  source: 'MONITOR' | 'CONSTRAINT_AGENT' | 'PLANNING_AGENT' | 'SIMULATION_ENGINE' | 'CONTROLLER_AGENT' | 'HUMAN_OPERATOR';
  type: 'INFO' | 'ALERT' | 'PROPOSAL' | 'SIMULATION' | 'ACTION' | 'RESOLVED';
  message: string;
  flightId?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export interface AirportState {
  simTimeMinutes: number; // e.g. 850 for 14:10
  simTimeFormatted: string; // "14:10"
  isRunning: boolean;
  speed: number; // 1x, 2x, 5x
  flights: Flight[];
  stands: Stand[];
  resources: Resource[];
  staff: Staff[];
  activeDisruptions: DisruptionEvent[];
  activeConflicts: OperationalConflict[];
  currentIntervention: {
    disruptionId: string;
    flightId: string;
    options: ProposedIntervention[];
    recommendedId: string;
    status: 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED';
    approvedOptionId?: string;
  } | null;
  operationsLog: OperationsLogItem[];
  metrics: {
    totalScheduledFlights: number;
    activeTurnarounds: number;
    flightsAtRisk: number;
    totalDelayMinutes: number;
    resolvedConflictsCount: number;
    onTimePercentage: number;
    avgDecisionTimeSeconds: number;
    baselineComparison: {
      baselineTotalDelayMinutes: number;
      savedDelayMinutes: number;
      baselineConflictsUnresolved: number;
    };
  };
}
