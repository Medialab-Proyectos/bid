import { DEMO_ACCOUNT } from '../demo-user';

const demoUser = {
  userName: DEMO_ACCOUNT.username,
  email: DEMO_ACCOUNT.idTokenClaims.email,
  fullName: DEMO_ACCOUNT.name,
  roleIdCode: '23',
};

const reviewer = {
  userName: 'ana.fiduciary@iadb.org',
  email: 'ana.fiduciary@iadb.org',
  fullName: 'Ana Fiduciary',
  roleIdCode: '25',
};

/**
 * `GET /api/workFlowOD/{projectBucketId}/configuration`.
 *
 * Step 0 must list the signed-in user: the transactions screen reads
 * `assignedUsers` of step 0 to decide which row actions are available, and
 * throws when the step is missing.
 */
export function buildDemoWorkflowConfig(projectBucketId: string) {
  const step = (order: number, taskDescription: string, users: unknown[]) => ({
    id: `${projectBucketId}-wf-step-${order}`,
    step: order,
    institutionCode: 'EC-GADMCP',
    order,
    assignedUsers: users,
    taskDescription,
    lastUpdate: new Date(),
    lastUpdateBy: DEMO_ACCOUNT.name,
    isMandatory: order === 0,
  });

  return {
    workFlowConfig: [
      step(0, 'Creation', [demoUser]),
      step(1, 'Review', [reviewer]),
      step(2, 'Authorization', [demoUser, reviewer]),
    ],
    usersRolUpdated: [],
    usersInstitutionUpdated: [],
  };
}

/** `GET /api/workFlowOD/{projectBucketId}/institutions`. */
export function buildDemoWorkflowInstitutions() {
  return [
    {
      institutionCode: 'EC-GADMCP',
      institutionName: 'Gobierno Autonomo Descentralizado Municipal de Portoviejo',
    },
  ];
}

/** `GET /api/workFlowOD/{institution}/institutions/{code}/users`. */
export function buildDemoWorkflowInstitutionUsers() {
  return [demoUser, reviewer];
}

/** `POST /api/workflow/getAllWorkflowActive`. */
export function buildDemoActiveWorkflows() {
  return { entityTypes: [] };
}

/**
 * `GET /api/v3/workflows/last-step`.
 *
 * Reports that nothing is in flight for the entity: no workflow instance and
 * no pending action, which is the neutral state every screen handles.
 */
export function buildDemoWorkflowLastStep(query: URLSearchParams) {
  return {
    currentStep: '',
    nextStep: '',
    nextActions: [],
    nextActors: [],
    nextUsers: [],
    workflowInstanceId: '',
    actionSelected: '',
    workflowDocument: false,
    entityTypeId: query.get('entityTypeId') ?? '',
  };
}
