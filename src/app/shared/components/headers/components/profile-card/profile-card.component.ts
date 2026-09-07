import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  CodeNameEnum,
  DialogResponse,
  ModalOptions,
  PreferencesModel,
  RoleObj,
  User,
} from '@core/models';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { environment } from '@fiduciary-interface/environments/environment';
import { ProjectStoreService } from '@core/services/store-services';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { Router } from '@angular/router';
import {
  DialogReturn,
  ModalService,
} from '@fiduciary-interface/app/shared/services/modal.service';
import { LanguagesCode, LanguagesName } from '@core/enums';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import { MsalService } from '@azure/msal-angular';
import { Userpilot } from 'userpilot';

@Component({
  selector: 'fi-profile-card',
  templateUrl: './profile-card.component.html',
})
export class ProfileCardComponent implements OnInit, OnDestroy {
  @Input() userInfo: User;
  private readonly subscription = new Subscription();

  languages: CodeNameEnum[] = [
    { code: LanguagesCode.SPANISH, name: LanguagesName.SPANISH },
    { code: LanguagesCode.ENGLISH, name: LanguagesName.ENGLISH },
    { code: LanguagesCode.PORTUGUESE, name: LanguagesName.PORTUGUESE },
    { code: LanguagesCode.FRENCH, name: LanguagesName.FRENCH },
  ];

  selectedLanguage: CodeNameEnum;
  isDropdownOpen = false;
  modalOpen: boolean;
  roles: RoleObj[] = [];
  noRolesText: string;
  allPreferences: PreferencesModel;

  constructor(
    readonly projectStore: ProjectStoreService,
    readonly permissionSvc: PermissionService,
    readonly translate: TranslateService,
    readonly fiModalSvc: ModalService,
    readonly router: Router,
    private readonly preferencesStrSvc: PreferencesstoreService,
    readonly msal: MsalService
  ) {
    this.loadCurrentLanguage();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.projectStore.selectedProject().subscribe((data) => {
        if (this.router.url === '/dashboard') {
          this.roles = [];
          this.noRolesText = 'SHARED.HEADERS.HEADER_OPTIONS.SELECT_PROJECT';
        } else {
          if (!!data && !!data.selectedProject) {
            this.roles = this.permissionSvc.getRolesByContractNumber(
              data.selectedProject.contract
            );
            if (this.roles.length === 0) {
              this.noRolesText = 'SHARED.HEADERS.HEADER_OPTIONS.NO_ROLES';
            }
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  name(role: RoleObj): string {
    if (environment.permissionsByPass) {
      return `[${role.roleIdCode}] ${role.roleName}`;
    }
    return role.roleName;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  updateUserPilot(lang: string) {
    const doNotApply = 'N/A';
    const createdDate = new Date().getTime();
    const activeAccount = this.msal.instance.getActiveAccount();
    console.log({ doNotApply, createdDate, activeAccount });
    const userData = {
      name: activeAccount?.name,
      email: String(activeAccount?.idTokenClaims.email).toLocaleLowerCase(),
      profile:
        activeAccount?.idTokenClaims.userCategory === 'Internal'
          ? 'IDB'
          : 'External',
      language: lang,
      country: '-',
      countryCode: doNotApply,
      countryName: doNotApply,
      institution: '-',
      institutionCode: doNotApply,
      institutionName: doNotApply,
      roles: [],
    };
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
    Userpilot.reload();
  }

  onChangeLanguage(language: CodeNameEnum): void {
    localStorage.setItem('userLang', language.code);
    this.selectedLanguage = language;
    this.isDropdownOpen = false;
    this.preferencesStrSvc.setSelectedLanguageAction(language);
    this.preferencesStrSvc.updateLangPreference(
      language.code,
      this.allPreferences
    );
    this.updateUserPilot(language.code);
  }

  logOut(): void {
    this.msal.logout();
  }

  onChangeLanguageModalLogic(language: CodeNameEnum): void {
    if (!this.modalOpen) {
      this.modalOpen = true;
      this.onChangeLanguageModal().subscribe((data: DialogResponse) => {
        if (data.result === ModalOptions.ACCEPT) {
          this.onChangeLanguage(language);
        }
        this.modalOpen = false;
      });
    }
  }

  onChangeLanguageModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      'CHANGE_LANGUAGE.MODAL.TITLE',
      [
        { text: 'CHANGE_LANGUAGE.MODAL.OPTION.NO' },
        {
          text: 'CHANGE_LANGUAGE.MODAL.OPTION.YES',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'CHANGE_LANGUAGE.MODAL.OPTION.CONTENT',
          bold: false,
        },
      ]
    );
  }

  loadCurrentLanguage(): void {
    this.subscription.add(
      this.preferencesStrSvc.selectPreferences().subscribe((data) => {
        this.allPreferences = data.preferences;
        this.selectedLanguage = this.languages.find(
          (l) => l.code === this.allPreferences.preferredLanguage
        );
      })
    );
  }
}
