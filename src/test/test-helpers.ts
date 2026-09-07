import {
  Component,
  Directive,
  forwardRef,
  Input,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { PermissionEnum } from '@core/enums';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
import { ModalService } from '../app/shared';

// Mock services
export const mockMsalService = {
  instance: {
    getActiveAccount: jest.fn().mockReturnValue(null),
    getAllAccounts: jest.fn().mockReturnValue([]),
  },
  acquireTokenSilent: jest
    .fn()
    .mockResolvedValue({ accessToken: 'mock-token' }),
  loginPopup: jest.fn().mockResolvedValue({}),
  logout: jest.fn().mockResolvedValue({}),
};

export const mockPermissionService = {
  hasPermission: jest.fn().mockReturnValue(true),
  checkPermissions: jest.fn().mockResolvedValue(true),
  getPermissions: jest.fn().mockReturnValue(Object.values(PermissionEnum)),
  getUserPermissions: jest.fn().mockReturnValue(['user:read', 'user:write']),
  hasSpecialPermission: jest.fn().mockReturnValue(true),
  haveSomePermissions: jest.fn().mockReturnValue(true),
};

export const mockTranslateService = {
  get: jest.fn().mockImplementation((key: string) => of(key)),
  instant: jest.fn().mockImplementation((key: string) => key),
  use: jest.fn().mockReturnValue(of({})),
  setDefaultLang: jest.fn(),
  addLangs: jest.fn(),
  getLangs: jest.fn().mockReturnValue(['en', 'es']),
  getBrowserLang: jest.fn().mockReturnValue('en'),
  onLangChange: of({ lang: 'en' }),
  onTranslationChange: of({}),
  onDefaultLangChange: of({ lang: 'en' }),
};

export const mockTranslatePipe = {
  transform: jest.fn().mockImplementation((key: string) => key),
};

export const mockDatePipe = {
  transform: jest.fn().mockImplementation((key: string) => key),
};

// Providers comunes
export const commonTestProviders = [
  { provide: MsalService, useValue: mockMsalService },
  { provide: PermissionService, useValue: mockPermissionService },
  { provide: TranslateService, useValue: mockTranslateService },
  { provide: TranslatePipe, useValue: mockTranslatePipe },
];

export const mockRouter = {
  navigate: jest.fn().mockResolvedValue(true),
  navigateByUrl: jest.fn().mockResolvedValue(true),
  url: '/test-url',
};

export const mockActivatedRoute = {
  snapshot: { params: {} },
  params: of({}),
  queryParams: of({}),
};

export const RouteTestProviders = [
  { provide: Router, useValue: mockRouter },
  { provide: ActivatedRoute, useValue: mockActivatedRoute },
];

export const mockMatDialog = {
  open: jest.fn().mockReturnValue({
    afterClosed: jest.fn().mockReturnValue(of({})),
    componentInstance: {},
  }),
};

export const mockDialogRef = {
  close: jest.fn(),
  afterClosed: jest.fn().mockReturnValue(of({})),
};

const mockDialogService = {
  open: jest.fn().mockReturnValue({
    afterClosed$: of({}),
  }),
};

const mockModalService = {
  openDialogOpenDate: jest.fn().mockReturnValue(of({})),
  openDialogChangeDate: jest.fn().mockReturnValue(of({})),
  openModalConfirm: jest.fn().mockReturnValue(of({})),
};

export const MatDialogProviders = [
  { provide: MatDialog, useValue: mockMatDialog },
  { provide: MAT_DIALOG_DATA, useValue: {} },
  { provide: MatDialogRef, useValue: mockDialogRef },
  { provide: DialogService, useValue: mockDialogService },
  { provide: ModalService, useValue: mockModalService },
];

export const mockMsalBroadcastService = {
  inProgress$: of(0),
  msalSubject$: of(null),
};

export const MsalProviders = [
  { provide: MsalService, useValue: mockMsalService },
  { provide: MsalBroadcastService, useValue: mockMsalBroadcastService },
];

@Directive({
  selector: '[fiDisplayByPermissionsSa]',
  standalone: true,
})
export class MockDisplayByPermissionsSaDirective {
  @Input() fiDisplayByPermissionsSa: any;
}

@Pipe({
  name: 'translateEnumSa',
  standalone: true,
})
export class MockTranslateEnumPipeSa implements PipeTransform {
  transform(value: any, _?: any): string {
    return value?.toString() || '';
  }
}

@Pipe({
  name: 'ifNumber',
})
export class MockIfNumberPipe implements PipeTransform {
  transform(value: any, _?: any): string {
    return value?.toString() || '';
  }
}

@Component({
  selector: 'fi-accordion-panel',
  template: `
    <div>
      <ng-content select="[title]"></ng-content>
      <ng-content select="[body]"></ng-content>
    </div>
  `,
})
export class MockAccordionPanelComponent {
  @Input() collapsible = true;
}

@Component({
  selector: 'sub-title',
  template: '<div class="sub-title"><ng-content></ng-content></div>',
})
export class MockSubTitleComponent {}

@Component({
  selector: 'fi-mat-numeric',
  template:
    '<input type="number" [value]="value" (input)="onInput($event)" (blur)="onTouched()" />',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockFiMatNumericComponent),
      multi: true,
    },
  ],
})
export class MockFiMatNumericComponent implements ControlValueAccessor {
  @Input() label: string;
  @Input() step: number;
  @Input() decimals: number;
  @Input() min: number;
  @Input() placeholder: string;

  value: any = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(_: boolean): void {}

  onInput(event: any): void {
    const numValue = parseFloat(event.target.value);
    this.value = isNaN(numValue) ? null : numValue;
    this.onChange(this.value);
  }
}

@Component({
  selector: 'fi-mat-date',
  template: '<input type="date" [value]="value" (input)="onInput($event)" />',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockFiMatDateComponent),
      multi: true,
    },
  ],
})
export class MockFiMatDateComponent implements ControlValueAccessor {
  @Input() label: string;

  value: any = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(_: boolean): void {}

  onInput(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
  }
}

export const mockNotificationService = {
  show: jest.fn().mockReturnValue({}),
};

@Pipe({
  name: 'translateEnum',
  standalone: true,
})
export class MockTranslateEnumPipe implements PipeTransform {
  transform(value: any, _?: any): string {
    return value?.toString() || '';
  }
}

export const mockProjectStoreService = {
  projects: jest.fn(() =>
    of({
      loaded: false,
      loading: false,
      projects: [],
      error: null,
    })
  ),
  selectedProject: jest.fn(() =>
    of({
      selectedProject: null,
    })
  ),
  sidebar: jest.fn(() =>
    of({
      open: false,
    })
  ),
  headerProject: jest.fn(() =>
    of({
      project: null,
    })
  ),
  languageSelected: jest.fn(() =>
    of({
      language: 'en',
      preferences: {},
    })
  ),
  getOrLoadProjectsCountries: jest.fn(() =>
    of({
      countries: [],
      loading: false,
      loaded: false,
      error: null,
    })
  ),
  getProjectsCountries: jest.fn(),
};

@Component({
  selector: 'fi-mat-numeric',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockMatNumericComponent),
      multi: true,
    },
  ],
})
export class MockMatNumericComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() decimals: number = 2;
  @Input() min: number;
  @Input() max: number;

  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
  setDisabledState(): void {}
}
