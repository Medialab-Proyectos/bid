/* eslint-disable @typescript-eslint/no-var-requires */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { BadgeModule } from '@progress/kendo-angular-indicators';
import { PopupModule } from '@progress/kendo-angular-popup';
import { HeaderOptionsComponent } from './header-options.component';
import { User } from '@core/models/userInfo.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { AppState } from '@core/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

const inputUserInfo: User = {
  email: 'franji@minedu.gov.co',
  name: 'Francisco Jimenez',
  roles: [],
};

describe('Should render with correct values ', () => {
  let component: HeaderOptionsComponent;
  let fixture: ComponentFixture<HeaderOptionsComponent>;

  const initialState: AppState = {
    enums: null,
    permissions: null,
    preferences: null,
    projects: null,
    roles: null,
    translations: null,
    contact: null,
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderOptionsComponent],
      imports: [
        LayoutModule,
        BadgeModule,
        PopupModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* it('Should show a popup with correct email', () => {
    const rendered = fixture.nativeElement;
    component.userInfo = inputUserInfo;
    component.expandedOptions = true;
    fixture.detectChanges();
    const emailSpan: HTMLButtonElement = rendered.querySelector(
      '.qa-headerInfoComponent-popUp-email'
    );
    expect(emailSpan.innerHTML).toEqual(inputUserInfo.email);
  }); */

  /* it('Should show the correct username', () => {
    const rendered = fixture.nativeElement;
    component.userInfo = inputUserInfo;
    component.expandedOptions = false;
    fixture.detectChanges();
    const usernameSpan: HTMLButtonElement = rendered.querySelector(
      '.qa-headerInfoComponent-username'
    );
    expect(usernameSpan.innerHTML).toEqual(inputUserInfo.name);
  }); */

  it('Should show a popup with the correct userRoles value', () => {
    component.userInfo = inputUserInfo;
    component.expandedOptions = true;
    const rendered = fixture.nativeElement;
    fixture.detectChanges();
    const rolesSpan: HTMLButtonElement = rendered.querySelector(
      '.qa-headerInfoComponent-popUp-rolesList'
    );
    expect(rolesSpan).toBeTruthy;
  });

  /* it('should show the language options', () => {
    component.userInfo = inputUserInfo;
    component.expandedOptions = true;
    component.toggle();
    const rendered = fixture.nativeElement;
    fixture.detectChanges();
    const langs = rendered.querySelectorAll('.qa-lang-op');
    expect(langs.length).toBe(component.languages.length);
  }); */

  it('should show the popUp correctly', () => {
    component.userInfo = inputUserInfo;
    component.expandedOptions = true;
    component.expandedOptions = false;
    component.toggle();
    const rendered = fixture.nativeElement;
    fixture.detectChanges();
    const popUp = rendered.querySelector('kendo-popup');
    expect(popUp).toBeTruthy();
  });
});
