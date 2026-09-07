import { DEMO_OPERATIONS } from './demo-projects';

const daysAgo = (days: number): Date =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const task = (step: number, role: string, user: string, action: string) => ({
  step,
  role: [role],
  roles: role,
  user,
  update: daysAgo(step),
  action,
  stepLiteral: `ACTIVITIES.OD.WORKFLOW.TASK.ACTION.${action}`,
});

const activity = (
  index: number,
  workflowStatus: string,
  workflowCode: string,
  currentStep: number
) => {
  const operation = DEMO_OPERATIONS[index % DEMO_OPERATIONS.length];
  return {
    workflowInstanceId: `demo-workflow-${index}`,
    projectBucketId: operation.id,
    entityType: 1,
    isInternalVisibility: false,
    createdBy: 'Demo User',
    workflowCode,
    externalWorkflowInstance: `EXT-${1000 + index}`,
    createdAt: daysAgo(index + 2),
    lastExecution: null,
    workflowStatus,
    entityTypeId: `demo-entity-${index}`,
    Comment: [],
    task: [
      task(1, 'EXECUTING_AGENCY', 'Demo User', 'STARTWORKFLOW'),
      task(2, 'FIDUCIARY_SPECIALIST', 'Ana Fiduciary', 'REVIEW'),
    ],
    operationNumber: operation.project,
    contractNumber: operation.operation,
    activityCode: `ACT-${2024000 + index}`,
    currentStep,
    showDetails: false,
    workflowDocuments: [],
    pendingAction: index % 2,
  };
};

const DEMO_ACTIVITY_ROWS = [
  activity(0, 'RUNNING', 'ONLINE_DISBURSEMENT', 2),
  activity(1, 'RUNNING', 'PROCUREMENT', 1),
  activity(2, 'COMPLETED', 'ONLINE_DISBURSEMENT', 3),
  activity(3, 'RUNNING', 'PROCUREMENT', 2),
  activity(4, 'SUSPENDED', 'ONLINE_DISBURSEMENT', 1),
  activity(5, 'COMPLETED', 'PROCUREMENT', 3),
];

/** Paginated payload for `POST /api/v2/activities`. */
export function buildDemoActivities(index: number, size: number) {
  const page = index > 0 ? index : 1;
  const pageSize = size > 0 ? size : 10;
  const start = (page - 1) * pageSize;
  return {
    data: DEMO_ACTIVITY_ROWS.slice(start, start + pageSize),
    pageNumber: page,
    pageSize,
    totalPages: Math.ceil(DEMO_ACTIVITY_ROWS.length / pageSize),
    totalItems: DEMO_ACTIVITY_ROWS.length,
  };
}
