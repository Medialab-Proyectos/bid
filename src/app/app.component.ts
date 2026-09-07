import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
  LOCALE_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { DrawerMenuItem, Permission, RoleObj, User } from '@core/models';
import { WindowSizeService, NavigationService } from '@core/services/view';
import { AppStateWithContact, AppStateWithPermissions } from '@core/store';
import { environment } from '@fiduciary-interface/environments/environment';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription } from 'rxjs';
import * as userTokenActions from '@core/store/user-token/actions/user-token.actions';
import { BreadcrumbService } from 'xng-breadcrumb';
import { AppStateWithUserToken } from '@core/store/user-token/reducers/user-token.reducer';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import { KendoKeysMessageService } from './shared/services/kendo-keys-message.service';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import {
  LanguagesCode,
  LanguagesName,
  UserContactCategoryType,
} from '@core/enums';
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
  RedirectRequest,
} from '@azure/msal-browser';
import { datadogRum } from '@datadog/browser-rum';
import { filter, take, takeUntil } from 'rxjs/operators';
import * as contactActions from '@core/store/contact/actions/contact.actions';
import { Userpilot } from 'userpilot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  readonly subscriptions: Subscription[] = [];
  loadedPreferences: boolean;
  public userInfo: User;
  public mobileView = false;
  public devMode = !environment.production;
  public isProjectsRoutes = false;
  screenHeight: number;
  screenWidth: number;
  tranlationsLoaded = false;
  localesIDs = ['fr-FR', 'pt-PT', 'es-ES', 'en-US'];
  loadingTranslations: boolean;
  currentLanguage: string;
  DEFAULT_LANGUAGE_CODE = LanguagesCode.ENGLISH;
  DEFAULT_LANGUAGE_NAME = LanguagesName.ENGLISH;
  email: string;
  INACTIVITY_TIMEOUT = environment.sesionMaxInactivityMinutes * 60000;
  inactiveTime: number;
  logoutTimer: any;

  private readonly _destroying$ = new Subject<void>();

  @HostListener('window:keydown')
  @HostListener('window:mousedown')
  resetLogoutTimer() {
    clearTimeout(this.logoutTimer);
    this.startLogoutTimer();
  }

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private messages: KendoKeysMessageService,
    readonly route: Router,
    private readonly navigationService: NavigationService,
    readonly storePermissions: Store<AppStateWithPermissions>,
    readonly storeContact: Store<AppStateWithContact>,
    readonly windowSvc: WindowSizeService,
    readonly msal: MsalService,
    readonly breadcrumbService: BreadcrumbService,
    readonly translate: TranslateService,
    readonly storeToken: Store<AppStateWithUserToken>,
    @Inject(LOCALE_ID) public localeId: string,
    public intlService: IntlService,
    private readonly preferencesstoreService: PreferencesstoreService,
    private readonly msalBroadcastService: MsalBroadcastService,
    private readonly authService: MsalService,
    private readonly store: Store<AppStateWithContact>,
    private readonly storeLoader: Store<any>,
    private readonly preferencesStrSvc: PreferencesstoreService
  ) {
    this.msal.handleRedirectObservable().subscribe(() => {});

    this.initMobileConditionals();
    this.breadcrumbService.breadcrumbs$.subscribe();
    this.getUsrData();
    this.changeLanguage(this.currentLanguage);
    this.subscriptions.push(
      this.preferencesStrSvc.selectPreferences().subscribe((data) => {
        this.loadingTranslations = data.loading;
      })
    );

    this.isLoading$ = this.storeLoader.select((state) => state.ui.isLoading);
  }
  public expanded = true;
  public transform: string;
  selectedLang = undefined;

  ngOnInit(): void {
    this.initialMethod();
    this.translate.setDefaultLang(this.currentLanguage);
    this.translate.use(this.currentLanguage);
    this.setUserToken();
    this.startLogoutTimer();

    this.preferencesstoreService
      .selectPreferences()
      .pipe(
        filter(
          (usrPreferencesState) =>
            usrPreferencesState &&
            usrPreferencesState.loaded &&
            usrPreferencesState.preferences.preferredLanguage !== undefined
        )
      )
      .subscribe((usrPreferencesState) => {
        if (
          this.selectedLang !==
          usrPreferencesState.preferences.preferredLanguage
        ) {
          this.selectedLang = usrPreferencesState.preferences.preferredLanguage;
          let lang =
            usrPreferencesState.preferences.preferredLanguage === ''
              ? 'en'
              : usrPreferencesState.preferences.preferredLanguage;
          localStorage.setItem('userLang', lang);
          this.changeLanguage(lang);
          this.currentLanguage = lang;
          this.translate.setDefaultLang(this.currentLanguage);
          this.translate.use(this.currentLanguage);
          this.translate.addLangs(['en', 'es', 'fr', 'pt']);
          const locale = this.localesIDs.find((l) =>
            l.includes(usrPreferencesState.preferences.preferredLanguage)
          );
          this.localeId = locale;
          (this.intlService as CldrIntlService).localeId = locale;
          setTimeout(() => {
            this.loadedPreferences = usrPreferencesState.loaded;
          }, 1000);
        }
      });
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS)
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
        localStorage.setItem(
          'userEmail',
          String(
            this.msal.instance.getActiveAccount()?.idTokenClaims.email
          ).toLocaleLowerCase()
        );
        localStorage.setItem('token', payload.accessToken);
        if (environment.availableDatadog) {
          datadogRum.init({
            applicationId: environment.datadog.applicationId,
            clientToken: environment.datadog.clientToken,
            site: environment.datadog.site,
            service: environment.datadog.service,
            // Specify a version number to identify the deployed version of your application in Datadog
            version: environment.datadog.version,
            env: environment.datadog.env,
            sampleRate: environment.datadog.sampleRate,
            sessionReplaySampleRate:
              environment.datadog.sessionReplaySampleRate,
            trackInteractions: environment.datadog.trackInteractions,
            trackResources: environment.datadog.trackResources,
            trackLongTasks: environment.datadog.trackLongTasks,
            defaultPrivacyLevel: environment.datadog.defaultPrivacyLevel,
            enableExperimentalFeatures:
              environment.datadog.enableExperimentalFeatures,
            allowedTracingOrigins: environment.datadog.allowedTracingOrigins,
          });

          datadogRum.startSessionReplayRecording();
          datadogRum.setUser({
            id: this.msal.instance.getActiveAccount()?.localAccountId,
            account: String(
              this.msal.instance.getActiveAccount()?.idTokenClaims.email
            ).toLocaleLowerCase(),
            email: String(
              this.msal.instance.getActiveAccount()?.idTokenClaims.email
            ).toLocaleLowerCase(),
            category: String(
              this.msal.instance.getActiveAccount()?.idTokenClaims.userCategory
            ),
            name: this.msal.instance.getActiveAccount()?.name,
          });
        }

        this.preferencesstoreService
          .selectPreferences()
          .pipe(
            filter(
              (usrPreferencesState) =>
                usrPreferencesState &&
                usrPreferencesState.loaded &&
                usrPreferencesState.preferences.preferredLanguage !== undefined
            ),
            take(1)
          )
          .subscribe((data: any) => {
            const doNotApply = 'N/A';
            const activeAccount = this.msal.instance.getActiveAccount();
            const userData = {
              name: activeAccount?.name,
              email: String(
                activeAccount?.idTokenClaims.email
              ).toLocaleLowerCase(),
              profile:
                activeAccount?.idTokenClaims.userCategory === 'Internal'
                  ? 'IDB'
                  : 'External',
              language: data.preferences.preferredLanguage,
              country: '-',
              countryCode: doNotApply,
              countryName: doNotApply,
              institution: '-',
              institutionCode: doNotApply,
              institutionName: doNotApply,
              roles: [],
            };
            const createdDate = new Date().getTime();
            if (environment.userPilot.enabled) {
              Userpilot.identify(`${userData.email.toLowerCase()}`, {
                ...userData,
                created_at: createdDate,
                browser_language: userData.language,
                locale_code: userData.language,
                company: {
                  id: userData.institution,
                  name: userData.institutionName,
                },
                appSource: 'Client Services | Client Portal',
              });
            }
          });
      });
  }

  initialMethod() {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }
  setLoginDisplay(): void {
    this.checkAndSetActiveAccount();
    this.acquireTokenSilent();
  }

  checkAndSetActiveAccount(): void {
    const activeAccount = this.authService.instance.getActiveAccount();
    if (
      !activeAccount &&
      this.authService.instance.getAllAccounts().length > 0
    ) {
      const accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }
  acquireTokenSilent(): void {
    if (this.authService.instance.getAllAccounts().length > 0) {
      const tokenRequest = {
        scopes: environment.adB2C.scopes,
        account: this.authService.instance.getActiveAccount(),
      };
      this.authService.instance
        .acquireTokenSilent(tokenRequest)
        .then((response) => {
          this.loadScreen(response.account);
        })
        .catch(() => {
          this.loginRedirect();
        });
    } else {
      this.loginRedirect();
    }
  }

  startLogoutTimer(): void {
    this.inactiveTime = 0;
    this.logoutTimer = setTimeout(() => {
      this.msal.logout();
    }, this.INACTIVITY_TIMEOUT);
  }

  loadScreen(account): void {
    this.authService.instance.setActiveAccount(account);
    this.store.dispatch(
      contactActions.setContactSucces({
        contact: {
          contactId: this.msal.instance.getActiveAccount()?.idTokenClaims?.sub,
          name: this.msal.instance.getActiveAccount()?.name,
          username:
            this.msal.instance.getActiveAccount()?.username ||
            `${
              this.msal.instance.getActiveAccount()?.idTokenClaims.sapUserId
            }` ||
            `${
              this.msal.instance.getActiveAccount()?.idTokenClaims.unique_name
            }`,
          email: `${
            this.msal.instance.getActiveAccount()?.idTokenClaims.unique_name
          }`,
          family_name: `${
            this.msal.instance.getActiveAccount()?.idTokenClaims.family_name
          }`,
          given_name: `${
            this.msal.instance.getActiveAccount()?.idTokenClaims.given_name
          }`,
          is_internal:
            `${
              this.msal.instance.getActiveAccount()?.idTokenClaims.userCategory
            }` === UserContactCategoryType.INTERNAL,
        },
      })
    );
  }

  loginRedirect(): void {
    if (this.msalGuardConfig.authRequest) {
      this.authService.instance
        .loginRedirect({
          ...this.msalGuardConfig.authRequest,
        } as RedirectRequest)
        .then(() => {})
        .catch(() => {
          localStorage.clear();
          sessionStorage.clear();
          setTimeout(() => {
            window.location.replace(environment.adB2C.logoutRedirectUri);
          }, 500);
        });
    } else {
      this.authService.loginRedirect();
    }
  }

  public changeLanguage(lang: string): void {
    const svc = <KendoKeysMessageService>this.messages;
    svc.language = lang;
  }

  initMobileConditionals(): void {
    this.subscriptions.push(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
        this.expanded = !data.mobileView;
      })
    );
  }

  public switchExpanded(): void {
    this.expanded = !this.expanded;
  }

  getUsrData(): void {
    this.subscriptions.push(
      this.storeContact.select('contact').subscribe((data) => {
        if (data && data.contact && data.contact?.contactId !== undefined) {
          this.email = data.contact.email;
          this.getUsrRoles(data.contact);
        }
      })
    );
  }

  getUsrRoles(data: any) {
    this.subscriptions.push(
      this.storePermissions.select('permissions').subscribe((res) => {
        if (res && res.permissions) {
          this.userInfo = {
            initials: data.given_name.charAt(0) + data.family_name.charAt(0),
            name: data?.name,
            email: data.email,
            roles: this.removeDuplicateRoles(res.permissions),
          };
        }
      })
    );
  }

  removeDuplicateRoles(arr: Permission[]): RoleObj[] {
    const result: RoleObj[] = [];

    arr.forEach((p) => {
      if (!result.some((r) => r.roleIdCode === p.roleIdCode)) {
        result.push({
          roleIdCode: p.roleIdCode,
          roleType: p.roleType,
        });
      }
    });

    return result;
  }

  navigateTo(item: DrawerMenuItem) {
    this.navigationService.navigateTo(item.path);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((el) => {
      el.unsubscribe();
    });
    this._destroying$.next();
    this._destroying$.complete();
  }

  // TODO: REMOVE WHEN USER STORAGE IN REDUX
  setUserToken(): void {
    this.storeToken.dispatch(
      userTokenActions.setUserToken({
        userToken: {
          userCategory: 'External',
        },
      })
    );
  }

  newFuntion() {
    const array = [
      {
        roleIdCode: '23',
        roleName: 'Procurement Fiduciary Specialist',
        roleType: 'OPERATIONAL_TEAM',
        roleTypeOrigin: '',
      },
      {
        roleIdCode: '25',
        roleName: 'Operational Analyst',
        roleType: 'OPERATIONAL_TEAM',
        roleTypeOrigin: '',
      },
      {
        roleIdCode: '25',
        roleName: 'Operational Analyst',
        roleType: 'OPERATIONAL_TEAM2',
        roleTypeOrigin: '',
      },
      {
        roleIdCode: '23',
        roleName: 'Operational Analyst',
        roleType: 'OPERATIONAL_TEAM2',
        roleTypeOrigin: '',
      },
      {
        roleIdCode: '25',
        roleName: 'Operational Analyst',
        roleType: 'OPERATIONAL_TEAM4',
        roleTypeOrigin: '',
      },
      {
        roleIdCode: '23',
        roleName: 'Operational Analyst',
        roleType: 'OPERATIONAL_TEAM4',
        roleTypeOrigin: '',
      },
    ];

    const unique = [...new Set(array.map((item) => item.roleType))];

    unique.forEach((i) => {
      const arrayaux = array.filter((a) => a.roleType === i);
      if (arrayaux.length > 0) {
        const newObject = {
          contractNumber: 'string',
          operationNumber: 'string',
          roles: [],
        };
        arrayaux.forEach((t) => {
          newObject.roles.push({
            roleIdCode: t.roleIdCode,
            roleType: t.roleType,
          });
        });
      }
    });
  }

  changeCategory(category: boolean): void {
    this.storeContact.dispatch(
      contactActions.setContactInternal({
        category,
      })
    );
  }
}
