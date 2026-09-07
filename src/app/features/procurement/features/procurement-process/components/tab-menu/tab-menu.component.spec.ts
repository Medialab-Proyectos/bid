import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TabMenuComponent } from './tab-menu.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { of } from 'rxjs';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { BiddingProcessProcurementProcessStatuses } from '@core/enums';
import { BiddingProcessPlanState } from '@core/store';

describe('TabMenuComponent', () => {
  let component: TabMenuComponent;
  let fixture: ComponentFixture<TabMenuComponent>;
  let biddingStoreSvc: BiddingProcessPlanStoreService;
  let permissionSvc: PermissionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabMenuComponent],
      imports: [
        PopupModule,
        MsalTestModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        TranslatePipe,
        provideMockStore({ initialState }),
        { provide: 'windowObject', useValue: window },
      ],
    }).compileComponents();
    permissionSvc = TestBed.inject(PermissionService);
    biddingStoreSvc = TestBed.inject(BiddingProcessPlanStoreService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('when i call the toogle event', () => {
    describe('when we pass a param', () => {
      it('should toggle the variable value', () => {
        component.showMenuMobile = true;
        component.onToggleMobileMenu();
        expect(component.showMenuMobile).toBe(false);
      });
    });
    describe('when we dont pass a param', () => {
      it('should toggle the variable value', () => {
        component.showMenuMobile = true;
        component.onToggleMobileMenu();
        expect(component.showMenuMobile).toBe(false);
      });
    });
  });

  describe('checkPermissionForTabs', () => {
    it('should call haveSomePermissions with permissionSeeParticipantContract when status meets the conditions', () => {
      const spy = jest.spyOn(permissionSvc, 'haveSomePermissions');
      biddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.EXPECTED;
      jest
        .spyOn(biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(biddingProcessPlanState));

      component.checkPermissionForTabs();
      expect(spy).toHaveBeenCalledWith(
        component.permissionSeeParticipantContract
      );
    });

    it('should call haveSomePermissions with permissionSeeParticipantContractGuest when status does not meet the conditions', () => {
      const spy = jest.spyOn(permissionSvc, 'haveSomePermissions');
      biddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION;
      jest
        .spyOn(biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(biddingProcessPlanState));

      component.checkPermissionForTabs();
      expect(spy).toHaveBeenCalledWith(
        component.permissionSeeParticipantContractGuest
      );
    });
  });

  const biddingProcessPlanState: BiddingProcessPlanState = {
    biddingProcessPlan: null,
    biddingProcessProcurementProcesses: null,
    error: null,
    isSelectedProcessLoaded: true,
    isSelectedProcessLoading: false,
    loaded: false,
    loading: false,
    processScreenLoaded: false,
    processScreenLoading: false,
    loadingProcess: false,
    selectedBiddingProcessProcurementProcess: {
      biddingProcessPlanId: 'bb309ef8-5192-4c47-99c8-39ca201a86f3',
      code: 'EC-L1245-P0001',
      description: 'ICB TEST 1 Normal',
      sustainabilityDescription: '',
      totalComments: 0,
      totalAcumulatedAmount: 0,
      advanceMilestone: {
        totalCompleted: 0,
        total: 0,
        delayed: false,
        currentMilestone: null,
      },
      componentName: '',
      bafo: null,
      sepaPeclaId: '',
      lots: 0,
      category: {
        name: 'PROCT_GOODS',
        id: 2,
      },
      procurementMethod: {
        name: 'PROCT_ICB',
        id: 0,
      },
      supervisionMethod: {
        name: 'ExAnte',
        id: 0,
      },
      status: BiddingProcessProcurementProcessStatuses.EXPECTED,
      sustainability: null,
      goodsReference: 0,
      id: '223647d9-37fe-4c9d-99a3-31a8052d1d29',
      manualId: '',
      name: 'ICB TEST 1 Normal',
      projectAmount: {
        estimatedAmount: 3000,
        localCounterpartAmount: 0,
        idbAmount: 3000,
        cofinancedAmount: 0,
        costJustification: '',
      },
      subExecutor: '',
      justification: '',
      isMigrated: false,
      packagesUnderReview: false,
      isUpdated: true,
      procurementProcessComments: [],
      order: 4,
    },
    selectedFilterForBiddingProcess: null,
    filteredBiddingProcessProcurementProcesses: [],
  };

  const initialState = {
    permissions: {
      permissions: [],
      loaded: true,
      loading: false,
      error: null,
    },
  };
});
