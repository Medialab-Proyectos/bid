import { DefaultPrivacyLevel } from '@datadog/browser-rum';

const baseURL = 'https://fiduciaryinterface.iadb.org/';

export const environment = {
  demoMode: false,
  permissionsByPass: false,
  mockRequestsAfterAttempts: false,
  production: true,
  availableDatadog: true,
  applicationInsightsInstrumentationKey: '4ad50829-1691-42e2-b76e-fa59ed8eebc3',
  azureClientId: 'f1324788-500b-442b-826f-5ab5a3d88937',
  azureTenantId: '9dfb1a05-5f1d-449a-8960-62abcb479e7d',
  azureTenant: 'idbg.onmicrosoft.com',
  envUrl: baseURL,
  B2CCLientID: 'fc30ee41-ff39-4cc8-bb42-7a945dbcd2c6',
  B2CAuthority:
    'https://idbgextp.b2clogin.com/tfp/idbgextp.onmicrosoft.com/B2C_1A_SUSI_IDBG',
  hostApi: {
    fiduciaryProcessApi: {
      endpoint:
        'https://apim-p-idb-integration.iadb.org/ext/process/cnvg/business/fp',
      scope: '',
    },
  },
  helpSupportUrl: 'https://clientportal.iadb.org/help',
  openId: {
    authority:
      'https://login.microsoftonline.com/9dfb1a05-5f1d-449a-8960-62abcb479e7d',
    clientID: 'f1324788-500b-442b-826f-5ab5a3d88937',
    redirectUri: baseURL,
    logoutRedirectUri: baseURL,
    scopes: [
      'user.read',
      'profile',
      'openid',
      'api://f1324788-500b-442b-826f-5ab5a3d88937/default',
    ],
  },
  adB2C: {
    authority:
      'https://idbgextp.b2clogin.com/tfp/idbgextp.onmicrosoft.com/B2C_1A_SUSI_IDBG',
    clientID: 'fc30ee41-ff39-4cc8-bb42-7a945dbcd2c6',
    redirectUri: baseURL,
    logoutRedirectUri: baseURL,
    knownAuthorities: [
      'https://idbgextp.b2clogin.com/tfp/idbgextp.onmicrosoft.com/b2c_1a_susi_idbg/oauth2/v2.0/authorize',
    ],
    authorityApprovalFlow:
      'https://idbgextp.b2clogin.com/tfp/idbgextp.onmicrosoft.com/B2C_1A_SUSI_IDBGMFA',
    scopes: [
      'openid',
      'profile',
      'https://idbgextp.onmicrosoft.com/b164bf30-e433-47b2-9174-d94dae6e3d9a/fiduciary-process-read',
      'https://idbgextp.onmicrosoft.com/b164bf30-e433-47b2-9174-d94dae6e3d9a/fiduciary-process-write',
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
    env: 'production',
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
  clientsConnectivityPortalUrl: 'http://clientportal.iadb.org/',

  ScopesB2C: {
    Locale: [
      'openid',
      'profile',
      'https://idbgextp.onmicrosoft.com/3980086c-4f28-4b16-92a8-4c8d28774ffd/Locale.Read',
    ],
    FiduciaryProcess: [
      'openid',
      'profile',
      'https://idbgextp.onmicrosoft.com/b164bf30-e433-47b2-9174-d94dae6e3d9a/fiduciary-process-read',
      'https://idbgextp.onmicrosoft.com/b164bf30-e433-47b2-9174-d94dae6e3d9a/fiduciary-process-write',
    ],
  },
  userPilot: {
    appToken: 'NX-1f2358d0',
    enabled: true,
  },
};
