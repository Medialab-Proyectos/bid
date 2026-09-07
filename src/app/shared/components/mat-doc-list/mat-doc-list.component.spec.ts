import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDocListComponent } from './mat-doc-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  MockDisplayByPermissionsSaDirective,
  mockMsalBroadcastService,
  mockMsalService,
  MockTranslateEnumPipeSa,
} from '../../../../test/test-helpers';
import { DocEnum, PermissionEnum } from '@core/enums';
import { Enums, FiduciaryProcessDocumentGroup } from '@core/models';
import { By } from '@angular/platform-browser';

describe('MatDocListComponent', () => {
  let component: MatDocListComponent;
  let fixture: ComponentFixture<MatDocListComponent>;

  const mockMandatoryDocs: FiduciaryProcessDocumentGroup[] = [
    {
      groupCode: 1,
      fiduciaryProcessDocuments: [
        {
          created: new Date(),
          createdBy: '',
          description: '',
          ezshareNumber: '',
          id: '',
          modified: new Date(),
          name: '',
          operationsDocumentId: 3,
          relationalId: '',
          status: 3,
          type: 3,
        },
      ],
    } as FiduciaryProcessDocumentGroup,
    {
      groupCode: 2,
      fiduciaryProcessDocuments: [
        {
          created: new Date(),
          createdBy: '',
          description: '',
          ezshareNumber: '',
          id: '',
          modified: new Date(),
          name: '',
          operationsDocumentId: 3,
          relationalId: '',
          status: 3,
          type: 3,
        },
      ],
    } as FiduciaryProcessDocumentGroup,
  ];

  const mockOptionalDocs: FiduciaryProcessDocumentGroup[] = [
    {
      groupCode: 3,
      fiduciaryProcessDocuments: [],
    } as FiduciaryProcessDocumentGroup,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDocListComponent,
        TranslateModule.forRoot(),
        MatTabsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        MockDisplayByPermissionsSaDirective,
        MockTranslateEnumPipeSa,
      ],
      providers: [
        { provide: MsalService, useValue: mockMsalService },
        { provide: MsalBroadcastService, useValue: mockMsalBroadcastService },
        provideMockStore({}),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatDocListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.mandatoryDocs).toEqual([]);
      expect(component.optionalDocs).toEqual([]);
      expect(component.permissions).toEqual([PermissionEnum.SPECIAL]);
    });

    it('should initialize groupEnum as undefined', () => {
      expect(component.groupEnum).toBeUndefined();
    });
  });

  describe('Mode Setter', () => {
    it('should set groupEnum to biddingContractDocumentGroupCodes when mode is CONTRACTS', () => {
      component.mode = DocEnum.CONTRACTS;

      expect(component.groupEnum).toBe(Enums.biddingContractDocumentGroupCodes);
    });

    it('should set groupEnum to biddingContractAmendmentDocumentGroupCodes when mode is AMENDMENTS', () => {
      component.mode = DocEnum.AMENDMENTS;

      expect(component.groupEnum).toBe(
        Enums.biddingContractAmendmentDocumentGroupCodes
      );
    });

    it('should set groupEnum to biddingProcessDocumentGroupCodes for default case', () => {
      component.mode = 'UNKNOWN_MODE';

      expect(component.groupEnum).toBe(Enums.biddingProcessDocumentGroupCodes);
    });

    it('should set groupEnum to biddingProcessDocumentGroupCodes when mode is undefined', () => {
      component.mode = undefined as any;

      expect(component.groupEnum).toBe(Enums.biddingProcessDocumentGroupCodes);
    });
  });

  describe('Input Properties', () => {
    it('should accept mandatoryDocs input', () => {
      component.mandatoryDocs = mockMandatoryDocs;
      fixture.detectChanges();

      expect(component.mandatoryDocs).toEqual(mockMandatoryDocs);
      expect(component.mandatoryDocs.length).toBe(2);
    });

    it('should accept optionalDocs input', () => {
      component.optionalDocs = mockOptionalDocs;
      fixture.detectChanges();

      expect(component.optionalDocs).toEqual(mockOptionalDocs);
      expect(component.optionalDocs.length).toBe(1);
    });
  });

  describe('Template Rendering', () => {
    it('should render mat-tab-group', () => {
      const tabGroup = fixture.debugElement.query(By.css('mat-tab-group'));

      expect(tabGroup).toBeTruthy();
    });

    it('should display mandatory docs tab label', () => {
      const tabLabel = fixture.debugElement.query(By.css('#Tab_docsLitst_0'));

      expect(tabLabel).toBeTruthy();
    });

    it('should display optional docs tab label', () => {
      const tabLabel = fixture.debugElement.query(By.css('#Tab_docsLitst_1'));

      expect(tabLabel).toBeTruthy();
    });

    it('should render mandatory docs when provided', () => {
      component.mandatoryDocs = mockMandatoryDocs;
      fixture.detectChanges();

      const docItems = fixture.debugElement.queryAll(
        By.css('.doc-package-menu__doc-item')
      );

      expect(docItems.length).toBeGreaterThan(0);
    });

    it('should render check icon for docs with fiduciaryProcessDocuments', () => {
      component.mandatoryDocs = mockMandatoryDocs;
      fixture.detectChanges();

      const checkIcons = fixture.debugElement.queryAll(
        By.css('.icon-col .fa-check-circle')
      );

      expect(checkIcons.length).toBe(2);
    });
  });

  describe('Tab Group Configuration', () => {
    it('should configure mat-tab-group with correct properties', () => {
      const tabGroup = fixture.debugElement.query(By.css('mat-tab-group'));

      expect(tabGroup.nativeElement.getAttribute('mat-stretch-tabs')).toBe(
        'false'
      );
      expect(tabGroup.nativeElement.getAttribute('mat-align-tabs')).toBe(
        'start'
      );
    });

    it('should have dynamicHeight enabled', () => {
      const tabGroup = fixture.debugElement.query(By.css('mat-tab-group'));

      expect(tabGroup.nativeElement.hasAttribute('dynamicheight')).toBe(true);
    });
  });

  describe('Document List Template', () => {
    it('should iterate over all mandatory documents', () => {
      component.mandatoryDocs = mockMandatoryDocs;
      fixture.detectChanges();

      const docItems = fixture.debugElement.queryAll(
        By.css('.doc-package-menu__doc-item')
      );

      expect(docItems.length).toBe(mockMandatoryDocs.length);
    });

    it('should display group code for each document', () => {
      component.mandatoryDocs = mockMandatoryDocs;
      fixture.detectChanges();

      const titles = fixture.debugElement.queryAll(
        By.css('.doc-package-menu__doc-item-title')
      );

      expect(titles.length).toBe(mockMandatoryDocs.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty mandatoryDocs array', () => {
      component.mandatoryDocs = [];
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty optionalDocs array', () => {
      component.optionalDocs = [];
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });
});
