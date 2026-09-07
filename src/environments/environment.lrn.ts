import { DefaultPrivacyLevel } from '@datadog/browser-rum';

const baseURL = 'https://lrn-fiduciaryinterface.iadb.org/';

export const environment = {
  demoMode: false,
  permissionsByPass: false,
  mockRequestsAfterAttempts: false,
  production: true,
  availableDatadog: false,
  applicationInsightsInstrumentationKey: '5081f5e7-7567-47ef-bb02-f90eb614805d',
  azureClientId: '0d934ad7-68c5-41c8-ba01-aa30c5257a46',
  azureTenantId: '9dfb1a05-5f1d-449a-8960-62abcb479e7d',
  azureTenant: 'idbg.onmicrosoft.com',
  envUrl: baseURL,
  B2CCLientID: '804290d2-6fb6-4824-aef4-83d05b400172',
  B2CAuthority:
    'https://idbgextt.b2clogin.com/tfp/idbgextt.onmicrosoft.com/B2C_1A_SUSI_IDBG',
  hostApi: {
    fiduciaryProcessApi: {
      endpoint:
        'https://apim-np-t-idb-integration.iadb.org/ext/process/cnvg/business/fp/lrn',
      scope: '',
    },
  },
  helpSupportUrl: 'https://clientportal-test.iadb.org/help',
  openId: {
    authority:
      'https://login.microsoftonline.com/9dfb1a05-5f1d-449a-8960-62abcb479e7d',
    clientID: 'f8cc117a-c7da-4a2b-a675-952de613b881',
    clientIDConvergence: 'TBD',
    redirectUri: baseURL,
    logoutRedirectUri: baseURL,
    scopes: [
      'user.read',
      'profile',
      'openid',
      'api://862ee457-612d-48f9-a2ec-dec3f511a741/default',
    ],
  },
  adB2C: {
    authority:
      'https://idbgextt.b2clogin.com/tfp/idbgextt.onmicrosoft.com/B2C_1A_SUSI_IDBG',
    clientID: '804290d2-6fb6-4824-aef4-83d05b400172',
    redirectUri: baseURL,
    logoutRedirectUri: baseURL,
    knownAuthorities: [
      'https://idbgextt.b2clogin.com/tfp/idbgextt.onmicrosoft.com/b2c_1a_susi_idbg/oauth2/v2.0/authorize',
    ],
    authorityApprovalFlow:
      'https://idbgextt.b2clogin.com/tfp/idbgextt.onmicrosoft.com/B2C_1A_SUSI_IDBGMFA',
    scopes: [
      'openid',
      'profile',
      'https://idbgextt.onmicrosoft.com/5b672c3d-21a6-42ed-b324-ee2d227eade4/fiduciary-process-write',
      'https://idbgextt.onmicrosoft.com/5b672c3d-21a6-42ed-b324-ee2d227eade4/fiduciary-process-read',
    ],
    tokenRenewal: {
      tokenRenewalOffsetSeconds: 1800,
    },
  },
  datadog: {
    applicationId: '08d9c8fe-8c67-42f9-8cca-7f06645c0b6a',
    clientToken: 'pubcf53c488f66056897e0ed3a28013c40b',
    site: 'datadoghq.com',
    service: 'wa-cnvg-fiduciary-process',
    env: 'lrn',
    // Specify a version number to identify the deployed version of your application in Datadog
    version: '14.32.0',
    sampleRate: 100,
    sessionReplaySampleRate: 100,
    trackInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: DefaultPrivacyLevel.ALLOW,
    enableExperimentalFeatures: ['clickmap'],
    allowedTracingOrigins: [/https:\/\/.*\.iadb\.org/],
  },
  TOKEN_REFRESH_INTERVAL_MINUTES: 5,
  MaxSessionWindowsTimeInSeconds: 600,
  sesionMaxInactivityMinutes: 45,
  clientsConnectivityPortalUrl:
    'https://uat-iadb.cs41.force.com/ClientConnectivity',

  ScopesB2C: {
    Locale: [
      'openid',
      'profile',
      'https://idbgextt.onmicrosoft.com/c2db9057-7202-41b2-985b-0279a0b1ba8b/Locale.Read',
    ],
    FiduciaryProcess: [
      'openid',
      'profile',
      'https://idbgextt.onmicrosoft.com/5b672c3d-21a6-42ed-b324-ee2d227eade4/fiduciary-process-write',
      'https://idbgextt.onmicrosoft.com/5b672c3d-21a6-42ed-b324-ee2d227eade4/fiduciary-process-read',
    ],
  },
  userPilot: {
    appToken: 'STG-NX-1f2358d0',
    enabled: false,
  },
};
