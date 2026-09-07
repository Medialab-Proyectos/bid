// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DefaultPrivacyLevel } from '@datadog/browser-rum';

const baseURL = 'https://localhost:5001';

export const environment = {
  demoMode: false,
  permissionsByPass: true,
  mockRequestsAfterAttempts: true,
  production: false,
  availableDatadog: false,
  applicationInsightsInstrumentationKey: '9d66fc62-f9dc-49a9-9022-a77e16f95d13',
  azureClientId: '0d934ad7-68c5-41c8-ba01-aa30c5257a46',
  azureTenantId: '9dfb1a05-5f1d-449a-8960-62abcb479e7d',
  azureTenant: 'idbg.onmicrosoft.com',
  B2CCLientID: 'ca696739-7e45-4a80-bbea-81e445c9b0e1',
  envUrl: baseURL,
  B2CAuthority:
    'https://idbgextt.b2clogin.com/tfp/idbgextt.onmicrosoft.com/B2C_1A_SUSI_IDBG',
  hostApi: {
    fiduciaryProcessApi: {
      endpoint: 'http://localhost:3101',
      scope: '',
    },
  },
  helpSupportUrl: 'https://clientportal-test.iadb.org/help',
  openId: {
    authority:
      'https://login.microsoftonline.com/9dfb1a05-5f1d-449a-8960-62abcb479e7d',
    clientID: 'ab28c119-3e59-4d39-8d48-7658db977e73',
    clientIDConvergence: 'TBD',
    redirectUri: baseURL,
    logoutRedirectUri: 'http://www.iadb.org/',
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
    clientID: 'ca696739-7e45-4a80-bbea-81e445c9b0e1',
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
      'https://idbgextt.onmicrosoft.com/a3455b27-859e-4d6c-a076-e0c044ae015b/fiduciary-process-write',
      'https://idbgextt.onmicrosoft.com/a3455b27-859e-4d6c-a076-e0c044ae015b/fiduciary-process-read',
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
    env: 'tok',
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
  sesionMaxInactivityMinutes: 60 * 12,
  clientsConnectivityPortalUrl:
    'https://ccon-iadb.cs27.force.com/ClientConnectivity',

  ScopesB2C: {
    Locale: [
      'https://idbgextt.onmicrosoft.com/937bc74f-32b4-42d5-8489-c329c7edf690/Locale.Read',
    ],
    FiduciaryProcess: [
      'https://idbgextt.onmicrosoft.com/f55d6169-0c2a-45cb-9b0a-d48f1e94e863/FiduciaryProcess.Read',
      'https://idbgextt.onmicrosoft.com/f55d6169-0c2a-45cb-9b0a-d48f1e94e863/FiduciaryProcess.Create',
      'https://idbgextt.onmicrosoft.com/f55d6169-0c2a-45cb-9b0a-d48f1e94e863/FiduciaryProcess.Update',
      'https://idbgextt.onmicrosoft.com/f55d6169-0c2a-45cb-9b0a-d48f1e94e863/FiduciaryProcess.Delete',
    ],
  },
  userPilot: {
    appToken: 'STG-NX-1f2358d0',
    enabled: false,
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
