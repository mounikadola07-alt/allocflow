export type UserRole = 'SUPER_ADMIN' | 'CONFERENCE_ADMIN' | 'REVIEWER' | 'AUTHOR';

export type ManuscriptStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVIEWS_COMPLETE'
  | 'DECISION_PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ConflictType = 'INSTITUTIONAL' | 'CO_AUTHORSHIP' | 'ADVISOR_ADVISEE' | 'PERSONAL';

export type AlgorithmType = 'FORD_FULKERSON' | 'EDMONDS_KARP' | 'DINIC';

export type AssignmentRunStatus = 'SIMULATED' | 'COMMITTED' | 'OVERRIDDEN' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  affiliation?: string;
  role: UserRole;
  enabled: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Conference {
  id: string;
  code: string;
  name: string;
  acronym?: string;
  description?: string;
  submissionDeadline?: string;
  reviewDeadline?: string;
  requiredReviewsPerPaper: number;
  defaultReviewerCapacity: number;
  status: string;
  manuscriptCount: number;
  reviewerCount: number;
  createdAt: string;
}

export interface Track {
  id: string;
  conferenceId: string;
  name: string;
  description?: string;
}

export interface Manuscript {
  id: string;
  paperCode?: string;
  conferenceId?: string;
  conferenceCode?: string;
  trackId?: string;
  trackName?: string;
  track?: string;
  authorId?: string;
  authorName: string;
  primaryAuthorName?: string;
  authorEmail: string;
  title: string;
  abstractText?: string;
  status: ManuscriptStatus;
  requiredReviews?: number;
  requiredReviewsCount?: number;
  topics: string[];
  keywords: string[];
  authorAffiliations?: string[];
  assignedReviewersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reviewer {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  conferenceId: string;
  conferenceCode: string;
  affiliation?: string;
  maxCapacity: number;
  currentWorkload: number;
  active: boolean;
  available: boolean;
  topics: string[];
  keywords: string[];
  createdAt: string;
}

export interface Conflict {
  id: string;
  conferenceId: string;
  manuscriptId: string;
  manuscriptTitle: string;
  reviewerId: string;
  reviewerName: string;
  conflictType: ConflictType;
  reason?: string;
  createdAt: string;
}

export interface AssignedPair {
  manuscriptId: string;
  manuscriptTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAffiliation?: string;
  flow: number;
  compatibilityScore: number;
  topicOverlapCount: number;
  keywordOverlapCount: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'SOURCE' | 'MANUSCRIPT' | 'REVIEWER' | 'SINK';
  capacity: number;
  currentFlow: number;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  capacity: number;
  flow: number;
  saturated: boolean;
  type: string;
  manuscriptId?: string;
  reviewerId?: string;
}

export interface GraphVisualization {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ValidationSummary {
  valid: boolean;
  totalAssignedPairs: number;
  totalRequiredReviews: number;
  coveragePercentage: number;
  fullySatisfiedManuscripts: number;
  partiallySatisfiedManuscripts: number;
  zeroReviewManuscripts: number;
  errors: string[];
  warnings: string[];
}

export interface SimulationResponse {
  runId: string;
  conferenceId: string;
  conferenceCode: string;
  algorithm: AlgorithmType;
  algorithmName: string;
  theoreticalComplexity: string;
  graphFingerprint: string;
  totalManuscripts: number;
  totalReviewers: number;
  totalVertices: number;
  totalEdges: number;
  totalRequiredFlow: number;
  achievedFlow: number;
  coveragePercentage: number;
  durationMs: number;
  augmentationsCount: number;
  phasesCount: number;
  status: AssignmentRunStatus;
  validation: ValidationSummary;
  assignments: AssignedPair[];
  graphVisualization: GraphVisualization;
  executionTraceSummary: string[];
}

export interface AssignmentExplanation {
  manuscriptId: string;
  manuscriptTitle: string;
  manuscriptTrack?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAffiliation?: string;
  topicOverlapCount: number;
  matchingTopics: string[];
  keywordOverlapCount: number;
  matchingKeywords: string[];
  compatibilityScore: number;
  reviewerWorkloadAssigned: number;
  reviewerMaxCapacity: number;
  conflictFree: boolean;
  conflictVerificationDetails: string;
  algorithmName: string;
  algorithmRunId: string;
  flow: number;
  graphFingerprint: string;
  explanationSummary: string;
}

export interface AlgorithmMetric {
  algorithmName: string;
  theoreticalComplexity: string;
  graphFingerprint: string;
  maxFlow: number;
  warmupTrials: number;
  measuredTrials: number;
  minDurationMs: number;
  medianDurationMs: number;
  p95DurationMs: number;
  maxDurationMs: number;
  meanDurationMs: number;
  stdDevDurationMs: number;
  augmentations: number;
  phases: number;
  validityStatus: string;
  invariantVerified: boolean;
}

export interface BenchmarkComparisonResponse {
  datasetId: string;
  graphFingerprint: string;
  vertexCount: number;
  edgeCount: number;
  totalRequiredFlow: number;
  totalReviewerCapacity: number;
  invariantSatisfied: boolean;
  invariantMaxFlow: number;
  algorithms: AlgorithmMetric[];
  algorithmTraces: Record<string, string[]>;
}

export interface ScalabilityPoint {
  manuscriptCount: number;
  reviewerCount: number;
  totalVertices: number;
  totalEdges: number;
  maxFlow: number;
  fordFulkersonMedianMs: number;
  edmondsKarpMedianMs: number;
  dinicMedianMs: number;
  fordFulkersonAugmentations: number;
  edmondsKarpAugmentations: number;
  dinicAugmentations: number;
  invariantVerified: boolean;
}

export interface ScalabilitySweepResponse {
  seed: number;
  startManuscripts: number;
  endManuscripts: number;
  stepSize: number;
  points: ScalabilityPoint[];
  allInvariantsVerified: boolean;
}

export interface DashboardStats {
  activeConferenceId?: string;
  activeConferenceName?: string;
  activeConferenceCode?: string;
  totalConferences: number;
  totalManuscripts: number;
  totalReviewers: number;
  totalAssignments: number;
  totalConflicts: number;
  averageCoveragePercentage: number;
  activeReviewersCount: number;
  totalReviewerCapacity: number;
  totalRequiredReviews: number;
  manuscriptsByStatus: Record<string, number>;
  reviewerWorkloadDistribution: Record<string, number>;
}

export interface AuditLog {
  id: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}
