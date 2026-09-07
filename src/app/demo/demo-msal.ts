import { Injectable } from '@angular/core';
import { EventMessage, InteractionStatus } from '@azure/msal-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { DEMO_ACCOUNT, DEMO_AUTH_RESULT } from './demo-user';

/**
 * Stand-in for `PublicClientApplication`.
 *
 * Every method resolves locally, so the demo never contacts Azure AD B2C and
 * never triggers a login redirect. Only the surface the application actually
 * uses is implemented.
 */
class DemoPublicClientApplication {
  private activeAccount: any = DEMO_ACCOUNT;

  initialize(): Promise<void> {
    return Promise.resolve();
  }

  initializeWrapperLibrary(): void {
    // no-op
  }

  handleRedirectPromise(): Promise<any> {
    return Promise.resolve(null);
  }

  getAllAccounts(): any[] {
    return [this.activeAccount];
  }

  getAccountByHomeId(): any {
    return this.activeAccount;
  }

  getAccountByLocalId(): any {
    return this.activeAccount;
  }

  getAccountByUsername(): any {
    return this.activeAccount;
  }

  getActiveAccount(): any {
    return this.activeAccount;
  }

  setActiveAccount(account: any): void {
    this.activeAccount = account ?? DEMO_ACCOUNT;
  }

  acquireTokenSilent(): Promise<any> {
    return Promise.resolve(DEMO_AUTH_RESULT);
  }

  acquireTokenPopup(): Promise<any> {
    return Promise.resolve(DEMO_AUTH_RESULT);
  }

  acquireTokenRedirect(): Promise<void> {
    return Promise.resolve();
  }

  loginPopup(): Promise<any> {
    return Promise.resolve(DEMO_AUTH_RESULT);
  }

  loginRedirect(): Promise<void> {
    return Promise.resolve();
  }

  ssoSilent(): Promise<any> {
    return Promise.resolve(DEMO_AUTH_RESULT);
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  logoutRedirect(): Promise<void> {
    return Promise.resolve();
  }

  logoutPopup(): Promise<void> {
    return Promise.resolve();
  }

  addEventCallback(): string {
    return 'demo-callback-id';
  }

  removeEventCallback(): void {
    // no-op
  }

  enableAccountStorageEvents(): void {
    // no-op
  }

  disableAccountStorageEvents(): void {
    // no-op
  }

  getTokenCache(): any {
    return null;
  }

  getLogger(): any {
    return {
      info: () => undefined,
      verbose: () => undefined,
      warning: () => undefined,
      error: () => undefined,
      clone: () => undefined,
    };
  }

  setLogger(): void {
    // no-op
  }

  getConfiguration(): any {
    return { auth: {}, cache: {}, system: {} };
  }

  setNavigationClient(): void {
    // no-op
  }
}

export const DEMO_MSAL_INSTANCE = new DemoPublicClientApplication();

export function DemoMsalInstanceFactory(): any {
  return DEMO_MSAL_INSTANCE;
}

/** Drop-in replacement for `MsalService` while in demo mode. */
@Injectable()
export class DemoMsalService {
  instance: any = DEMO_MSAL_INSTANCE;

  initialize(): Observable<void> {
    return of(undefined);
  }

  handleRedirectObservable(): Observable<any> {
    return of(null);
  }

  acquireTokenSilent(): Observable<any> {
    return of(DEMO_AUTH_RESULT);
  }

  acquireTokenPopup(): Observable<any> {
    return of(DEMO_AUTH_RESULT);
  }

  acquireTokenRedirect(): Observable<void> {
    return of(undefined);
  }

  loginPopup(): Observable<any> {
    return of(DEMO_AUTH_RESULT);
  }

  loginRedirect(): Observable<void> {
    return of(undefined);
  }

  ssoSilent(): Observable<any> {
    return of(DEMO_AUTH_RESULT);
  }

  logout(): Observable<void> {
    return of(undefined);
  }

  logoutRedirect(): Observable<void> {
    return of(undefined);
  }

  logoutPopup(): Observable<void> {
    return of(undefined);
  }

  getLogger(): any {
    return DEMO_MSAL_INSTANCE.getLogger();
  }

  setLogger(): void {
    // no-op
  }
}

/**
 * Drop-in replacement for `MsalBroadcastService`.
 *
 * `inProgress$` emits `None` straight away, which is the signal several
 * services wait for before loading their data (`InitService`,
 * `PermissionService`, `SelectedProjectGuard`).
 */
@Injectable()
export class DemoMsalBroadcastService {
  private readonly subject = new Subject<EventMessage>();
  private readonly progress = new BehaviorSubject<InteractionStatus>(
    InteractionStatus.None
  );

  msalSubject$: Observable<EventMessage> = this.subject.asObservable();
  inProgress$: Observable<InteractionStatus> = this.progress.asObservable();
}

/** Providers that replace the real MSAL stack when `demoMode` is on. */
export const DEMO_MSAL_PROVIDERS = [
  { provide: MsalService, useClass: DemoMsalService },
  { provide: MsalBroadcastService, useClass: DemoMsalBroadcastService },
];
