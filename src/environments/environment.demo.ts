/**
 * Demo environment.
 *
 * Runs the application 100% offline: there is no database, no backend and no
 * Azure AD / B2C sign-in. Authentication is replaced by a fake local account
 * (see `src/app/demo/demo-msal.ts`) and every HTTP call to the fiduciary API is
 * answered by `DemoBackendInterceptor` with data from `src/app/demo/data`.
 *
 * Start it with: npm run start:demo
 */
import { DefaultPrivacyLevel } from '@datadog/browser-rum';

const baseURL = 'http://localhost:4200';

// Not a real host: nothing is ever requested from it because the demo
// interceptor answers before the request leaves the browser. Keeping an
// unreachable host guarantees the demo can never hit a real environment.
const demoApi = 'https://demo.local/fiduciary-api';

export const environment = {
  demoMode: true,
  permissionsByPass: true,
  mockRequestsAfterAttempts: false,
  production: false,
  availableDatadog: false,
  applicationInsightsInstrumentationKey: '',
  azureClientId: '',
  azureTenantId: '',
  azureTenant: '',
  envUrl: baseURL,
  B2CCLientID: '',
  B2CAuthority: '',
  hostApi: {
    fiduciaryProcessApi: {
      endpoint: demoApi,
      scope: '',
    },
  },
  helpSupportUrl: '',
  openId: {
    authority: '',
    clientID: '',
    clientIDConvergence: '',
    redirectUri: baseURL,
    logoutRedirectUri: baseURL,
    scopes: [],
  },
  adB2C: {
    authority: '',
    clientID: '',
    redirectUri: baseURL,
    logoutRedirectUri: baseURL,
    knownAuthorities: [],
    authorityApprovalFlow: '',
    scopes: [],
    tokenRenewal: {
      tokenRenewalOffsetSeconds: 1800,
    },
  },
  datadog: {
    applicationId: '',
    clientToken: '',
    site: '',
    service: '',
    env: 'demo',
    version: '0.0.0',
    sampleRate: 0,
    sessionReplaySampleRate: 0,
    trackInteractions: false,
    trackResources: false,
    trackLongTasks: false,
    defaultPrivacyLevel: DefaultPrivacyLevel.MASK,
    enableExperimentalFeatures: [],
    allowedTracingOrigins: [],
  },
  TOKEN_REFRESH_INTERVAL_MINUTES: 5,
  MaxSessionWindowsTimeInSeconds: 600,
  // 8h: the demo should never log itself out during a presentation.
  sesionMaxInactivityMinutes: 480,
  clientsConnectivityPortalUrl: '',

  ScopesB2C: {
    Locale: [],
    FiduciaryProcess: [],
  },
  userPilot: {
    appToken: '',
    enabled: false,
  },
};
