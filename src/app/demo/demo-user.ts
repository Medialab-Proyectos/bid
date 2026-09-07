/**
 * Identity used while the application runs in demo mode.
 *
 * It mimics the shape of an `AccountInfo` returned by MSAL so every component
 * that reads `msal.instance.getActiveAccount()` keeps working untouched.
 */
export const DEMO_ACCOUNT = {
  homeAccountId: 'demo-home-account-id',
  localAccountId: 'demo-local-account-id',
  environment: 'demo.local',
  tenantId: 'demo-tenant',
  username: 'demo.user@iadb.org',
  name: 'Demo User',
  idTokenClaims: {
    sub: 'demo-contact-id',
    oid: 'demo-object-id',
    name: 'Demo User',
    email: 'demo.user@iadb.org',
    unique_name: 'demo.user@iadb.org',
    given_name: 'Demo',
    family_name: 'User',
    sapUserId: 'DEMO001',
    userCategory: 'Internal',
    emails: ['demo.user@iadb.org'],
  },
};

export const DEMO_AUTH_RESULT = {
  authority: 'demo',
  uniqueId: DEMO_ACCOUNT.localAccountId,
  tenantId: DEMO_ACCOUNT.tenantId,
  scopes: [] as string[],
  account: DEMO_ACCOUNT,
  idToken: 'demo-id-token',
  idTokenClaims: DEMO_ACCOUNT.idTokenClaims,
  accessToken: 'demo-access-token',
  fromCache: true,
  expiresOn: new Date(Date.now() + 24 * 60 * 60 * 1000),
  tokenType: 'Bearer',
  correlationId: 'demo-correlation-id',
};
