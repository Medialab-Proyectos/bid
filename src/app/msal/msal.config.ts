import {
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication,
  Configuration,
  BrowserCacheLocation,
} from '@azure/msal-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';
import {
  MsalGuard,
  MsalBroadcastService,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalGuardConfiguration,
  MsalRedirectComponent,
} from '@azure/msal-angular';
import { environment } from '@fiduciary-interface/environments/environment';
import { MsalInterceptor } from './msal.interceptor';
import { DEMO_MSAL_PROVIDERS, DemoMsalInstanceFactory } from '../demo/demo-msal';
const isIE = false;
const msalConfig: Configuration = {
  auth: {
    authority: environment.adB2C.authority,
    clientId: environment.adB2C.clientID,
    redirectUri: environment.adB2C.redirectUri,
    postLogoutRedirectUri: environment.adB2C.logoutRedirectUri,
    navigateToLoginRequestUrl: true,
    knownAuthorities: environment.adB2C.knownAuthorities,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: isIE,
  },
  system: {
    allowNativeBroker: false,
    tokenRenewalOffsetSeconds:
      environment.adB2C.tokenRenewal.tokenRenewalOffsetSeconds,
  },
};
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...environment.adB2C.scopes],
      authority: environment.adB2C.authority,
      redirectUri: environment.adB2C.redirectUri,
    },
  };
}
export function MSALInstanceFactory(): IPublicClientApplication {
  if (environment.demoMode) {
    return DemoMsalInstanceFactory();
  }
  return new PublicClientApplication(msalConfig);
}
const providers: Provider[] = [
  {
    provide: MSAL_INSTANCE,
    useFactory: MSALInstanceFactory,
  },
  {
    provide: MSAL_GUARD_CONFIG,
    useFactory: MSALGuardConfigFactory,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: MsalInterceptor,
    multi: true,
  },
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MsalRedirectComponent,
];
/**
 * In demo mode the whole MSAL stack is swapped for local stand-ins: no
 * sign-in redirect, no token acquisition and no `MsalInterceptor` adding
 * bearer headers to requests that never leave the browser.
 */
const demoProviders: Provider[] = [
  {
    provide: MSAL_INSTANCE,
    useFactory: MSALInstanceFactory,
  },
  {
    provide: MSAL_GUARD_CONFIG,
    useFactory: MSALGuardConfigFactory,
  },
  ...DEMO_MSAL_PROVIDERS,
];

export const MSALProviders = environment.demoMode ? demoProviders : providers;
