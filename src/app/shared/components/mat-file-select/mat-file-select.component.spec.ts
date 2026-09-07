import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFileSelectorComponent } from './mat-file-select.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { PermissionEnum } from '@core/enums/permission.enum';

// Intercepta el módulo ANTES de que Angular compile
jest.mock(
  '../../directives/display-by-permissions-standalone.directive',
  () => {
    const { Directive, Input } = require('@angular/core');

    @Directive({
      selector: '[fiDisplayByPermissionsSa]',
      standalone: true,
    })
    class DisplayByPermissionsSaDirective {
      @Input() fiDisplayByPermissionsSa: any;
    }

    return { DisplayByPermissionsSaDirective };
  }
);

const mockPermissionService = {
  getPermissions: jest.fn().mockReturnValue([PermissionEnum.SPECIAL]),
  hasSpecialPermission: jest.fn().mockReturnValue(true),
};

describe('MatFileSelectorComponent', () => {
  let component: MatFileSelectorComponent;
  let fixture: ComponentFixture<MatFileSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatFileSelectorComponent,
        NoopAnimationsModule,
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatFileSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
