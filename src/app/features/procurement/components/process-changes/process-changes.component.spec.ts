import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnumsStoreService } from '@core/services/store-services';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { ProcessChangesComponent } from './process-changes.component';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const initialState = {
  enums: {
    biddingProcessProcurementProcessCategories: [
      {
        id: 0,
        name: 'PROCUREMENT.CATEGORIES.PROCT_CSTFRM',
      },
    ],
    biddingProcessProcurementProcessProcurementMethods: [
      {
        id: 0,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICB',
      },
      {
        id: 1,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICBWP',
      },
      {
        id: 2,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CRLP',
      },
    ],
    biddingProcessProcurementProcessSupervisionMethods: [
      {
        id: 0,
        name: 'PROCUREMENT.SUPERVISION_METHOD.ExAnte',
      },
      {
        id: 1,
        name: 'PROCUREMENT.SUPERVISION_METHOD.ExPost',
      },
    ],
    biddingProcessProcurementProcessSustainabilities: [
      {
        id: 0,
        name: 'ENUM.PROCESS.SUSTAINABILITY.ECONOMIC_CONSIDERATIONS',
      },
      {
        id: 1,
        name: 'ENUM.PROCESS.SUSTAINABILITY.ENVIROMENTAL_CONSIDERATIONS',
      },
    ],
    biddingProcessProcurementProcessGoodsReferences: [
      {
        id: 0,
        name: 'ENUM.PROCESS.GOODS.REFERENCE.NEW',
      },
      {
        id: 1,
        name: 'ENUM.PROCESS.GOODS.REFERENCE.LEASE',
      },
    ],
  },
};

describe('ProcessChangesComponent', () => {
  let component: ProcessChangesComponent;
  let fixture: ComponentFixture<ProcessChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessChangesComponent],
      imports: [
        PipeModule,
        HttpClientTestingModule,
        MsalTestModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({
          initialState,
        }),
        EnumsStoreService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('translateValue', () => {
    it('should translate and return the enum for CATEGORY', () => {
      const expectedResponse = 'Consulting Firms';
      const updatedKey = 'FI.CNVG.FP.PROCUREMENT.CATEGORY';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });

    it('should translate and return the enum for ACQUISITION_METHOD', () => {
      const expectedResponse = 'International Competitive Bidding';
      const updatedKey = 'FI.CNVG.FP.PROCUREMENT.ACQUISITION_METHOD';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });

    it('should translate and return the enum for MONITORING_METHOD', () => {
      const expectedResponse = 'Ex-ante';
      const updatedKey = 'FI.CNVG.FP.PROCUREMENT.MONITORING_METHOD';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });

    it('should translate and return the enum for SUSTAINABILITY_LABEL', () => {
      const expectedResponse = 'Economic considerations';
      const updatedKey =
        'FI.CNVG.FP.PROCUREMENT.SUSTAINABILITY.SUSTAINABILITY_LABEL';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });

    it('should translate and return the enum for GOODS_AND_SERVICES', () => {
      const expectedResponse = 'New';
      const updatedKey = 'FI.CNVG.FP.PROCUREMENT.GOODS_AND_SERVICES';
      const modifiedValue = '0';

      const response = component.translateValue(updatedKey, modifiedValue);

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('mapKeyValueModified', () => {
    it('should map the old and new values of the response after translate its contents', () => {
      const expectedResponse = [
        {
          modifiedBy: 'onlinebiddingprocess',
          updatedValue: 'PROCUREMENT.TEST',
          previousValue: 'Previous Test',
          newValue: 'New Test',
          modified: '2020-02-24T00:00:00',
        },
      ];

      const input = [
        {
          modifiedBy: 'onlinebiddingprocess',
          updatedValue: 'FI.CNVG.FP.PROCUREMENT.TEST',
          previousValue: 'Previous Test',
          newValue: 'New Test',
          modified: '2020-02-24T00:00:00',
        },
      ];

      const response = component.mapKeyValueModified(input);

      expect(response).toEqual(expectedResponse);
    });
  });
});
