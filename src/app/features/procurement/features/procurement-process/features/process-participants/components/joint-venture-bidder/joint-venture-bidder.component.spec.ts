import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BidderTypes } from '@core/enums';
import { Bidder, Enumerator } from '@core/models';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { DirectivesModule } from '@fiduciary-interface/app/shared';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { BidderRegistrationFormComponent } from '../bidder-registration-form/bidder-registration-form.component';
import { JointVentureBidderComponent } from './joint-venture-bidder.component';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const mockEnumBidderTypes: Enumerator[] = [
  {
    id: 1,
    name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.FIRM',
  },
  {
    id: 3,
    name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.SME',
  },
];

const mockEnumBidderEconomicSectors: Enumerator[] = [
  {
    id: 0,
    name: 'ENUM.PROCESS.ECONOMIC.SECTOR.AGRICULTURE',
  },
  {
    id: 1,
    name: 'ENUM.PROCESS.ECONOMIC.SECTOR.WATER_SANITITATION',
  },
];

function getInitialState() {
  return {
    enums: {
      biddingProcessBidderTypes: [
        {
          id: 1,
          name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.FIRM',
        },

        {
          id: 3,
          name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.SME',
        },
      ],
      biddingProcessBidderEconomicSectors: [
        {
          id: 0,
          name: 'ENUM.PROCESS.ECONOMIC.SECTOR.AGRICULTURE',
        },
        {
          id: 1,
          name: 'ENUM.PROCESS.ECONOMIC.SECTOR.WATER_SANITITATION',
        },
      ],
      memberCountries: [
        { id: 0, name: 'ENUM.COUNTRY.AU' },
        {
          id: 1,
          name: 'ENUM.COUNTRY.AR',
        },
      ],
      countries: [
        { id: 'AU', name: 'ENUM.COUNTRY.AU' },
        {
          id: 'AR',
          name: 'ENUM.COUNTRY.AR',
        },
      ],
      enumsLoaded: {
        biddingProcessBidderTypes: true,
        memberCountries: true,
        biddingProcessBidderEconomicSectors: true,
        countries: true,
      },
      enumsLoading: {
        biddingProcessBidderTypes: false,
        memberCountries: false,
        biddingProcessBidderEconomicSectors: false,
        countries: false,
      },
      loaded: false,
      loading: false,
      error: null,
    },
    enumsMasterData: {
      countries: [
        {
          id: 18,
          code: 'FR',
          isMember: true,
          isBeneficiary: false,
          name: {
            en: 'FRANCE',
            es: 'FRANCIA',
            fr: 'FRANCE',
            pt: 'FRANÇA',
          },
        },
        {
          id: 264,
          code: 'UO',
          isMember: false,
          isBeneficiary: false,
          name: {
            en: 'UNITEDSTATESMINOROUTLY.ISLANDS',
            es: 'ISLASULTRAMARINASMENORESDEE.U.',
            fr: 'UNITEDSTATESMINOROUTLY.ISLANDS',
            pt: 'ILHAS MENORES DISTANTES DOS ESTADOS UNIDOS',
          },
        },
        {
          id: 122,
          code: 'MD',
          isMember: false,
          isBeneficiary: true,
          name: {
            en: 'MALDIVES',
            es: 'MALDIVAS',
            fr: 'MALDIVES',
            pt: 'MALDIVAS',
          },
        },
      ],
    },
    preferences: {
      preferences: {
        defaultLanguage: 'en',
        preferredLanguage: 'en',
        projects: [
          {
            projectBucketId: '2c5d6986-a21c-443b-8cac-d927df1c1bba',
            contractNumber: '3843/OC-BA',
            projectName: {
              en: 'Deployment of Cleaner Fuels and Renewable Energies in Barbados',
              es: 'Utilización de Combustibles más Limpios y Energías Renovables en Barbados',
              pt: '  ',
              fr: '  ',
            },
            operationNumber: 'BA-L1012',
            institutionName: 'National Petroleum Corporation',
            totalApprovedAmount: 34000000,
            countryCode: 'BA',
          },
          {
            projectBucketId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            contractNumber: '5049/OC-TT',
            projectName: {
              en: 'Urban Upgrading and Revitalization Program',
              es: 'Programa de Modernización y Revitalización Urbana',
              pt: '',
              fr: '',
            },
            operationNumber: 'TT-L1057',
            institutionName: 'Ministry of Housing and Urban Development',
            totalApprovedAmount: 17500000,
            countryCode: 'TT',
          },
        ],
        procurementPreferences: [],
      },
      loaded: true,
      loading: false,
      error: null,
    },
    permissions: {
      permissions: [],
      loaded: true,
      loading: false,
      error: null,
    },
    roles: {
      rolesResponse: {
        roles: [],
      },
      loaded: true,
      loading: false,
      error: null,
    },
  };
}

async function setup() {
  const initialState = getInitialState();
  const { fixture } = await render(JointVentureBidderComponent, {
    declarations: [BidderRegistrationFormComponent],
    componentProperties: {
      memberCountries: [
        {
          code: 'FR',
          id: 18,
          name: 'FRANCE',
          isBeneficiary: false,
          isMember: true,
        },
        {
          code: 'AR',
          id: 0,
          name: 'ARGENTINA',
          isBeneficiary: true,
          isMember: true,
        },
        {
          code: 'CD',
          id: 8,
          name: 'CANADA',
          isBeneficiary: false,
          isMember: true,
        },
        {
          code: 'UM',
          id: 203,
          name: 'GUAM',
          isBeneficiary: false,
          isMember: true,
        },
        {
          code: 'KR',
          id: 28,
          name: 'REPUBLIC OF KOREA',
          isBeneficiary: false,
          isMember: true,
        },
        {
          code: 'ES',
          id: 16,
          name: 'EL SALVADOR',
          isBeneficiary: true,
          isMember: true,
        },
      ],
      countries: [
        {
          code: 'AR',
          id: 0,
          name: 'ARGENTINA',
          isBeneficiary: true,
          isMember: true,
        },
        {
          code: 'ES',
          id: 16,
          name: 'EL SALVADOR',
          isBeneficiary: true,
          isMember: true,
        },
        {
          code: 'PR',
          id: 36,
          name: 'PARAGUAY',
          isBeneficiary: true,
          isMember: true,
        },
        {
          code: 'PE',
          id: 33,
          name: 'PERU',
          isBeneficiary: true,
          isMember: true,
        },
        {
          code: 'GY',
          id: 21,
          name: 'GUYANA',
          isBeneficiary: true,
          isMember: true,
        },
      ],
      allUnfilterCountries: [
        {
          code: 'AF',
          id: 300,
          name: 'AFGHANISTAN',
          isBeneficiary: false,
          isMember: false,
        },
        {
          code: 'AD',
          id: 272,
          name: 'ALAND ISLANDS',
          isBeneficiary: false,
          isMember: false,
        },
        {
          code: 'AL',
          id: 303,
          name: 'ALBANIA',
          isBeneficiary: false,
          isMember: false,
        },
        {
          code: 'AG',
          id: 301,
          name: 'ALGERIA',
          isBeneficiary: false,
          isMember: false,
        },
        {
          code: 'AM',
          id: 304,
          name: 'AMERICAN SAMOA',
          isBeneficiary: false,
          isMember: false,
        },
        {
          code: 'AO',
          id: 306,
          name: 'ANDORRA',
          isBeneficiary: false,
          isMember: false,
        },
        {
          code: 'AN',
          id: 305,
          name: 'ANGOLA',
          isBeneficiary: false,
          isMember: false,
        },
      ],
    },
    imports: [
      DirectivesModule,
      HttpClientTestingModule,
      RouterTestingModule,
      FormsModule,
      ReactiveFormsModule,
      MsalTestModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({ initialState }),
      provideWindowSizeMock({ mobileView: false }),
    ],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('JointVentureBidderComponent', () => {
  describe('When i click the expand section', () => {
    it('should change the variable expandend value', async () => {
      const { component } = await setup();
      component.expanded = true;
      component.toogleExpanded();
      expect(component.expanded).toBe(false);
    });
  });
  describe('on selection joint venture change', () => {
    describe('when i select a know bidder', () => {
      it('should create a valid control in the form group', async () => {
        jest.useFakeTimers();

        const { component } = await setup();
        const bidder: Bidder = {
          id: '09803c20-1547-4a63-92c5-09835b1c3452',
          type: 0,
          economicSector: 0,
          name: 'string',
          nationality: 0,
          legalRepresentative: 'string',
          beneficiaryOwner: 'string',
          biddersJointVenture: [],
          searchName: '',
          address: 'string',
          zipCode: 'string',
          country: 'string',
        };
        component.selectionChange(bidder);
        jest.runAllTimers();

        expect(component.bidderForm.get('participantBidderForm')).not.toBe(
          null
        );
      });
    });
    describe('when i select a not know bidder', () => {
      it('should remove control in the form group', async () => {
        const { component } = await setup();
        component.selectionChange(undefined);
        expect(component.bidderForm.get('participantBidderForm')).toBe(null);
      });
    });
  });

  describe('on destroy behaivour', () => {
    it('should call the method to ununsubscribe al the subscriptions', async () => {
      const { component, fixture } = await setup();
      jest.spyOn(component, 'unsubscribeAll');
      component.ngOnDestroy();
      fixture.detectChanges();
      expect(component.unsubscribeAll).toHaveBeenCalled();
    });
  });

  describe('Populate enum', () => {
    it('should fill bidderTypeList whith store data', async () => {
      const { component } = await setup();
      expect(component.bidderTypeList).toEqual(mockEnumBidderTypes);
    });
    it('should fill bidderEconomic whith store data', async () => {
      const { component } = await setup();

      expect(component.economicSectorList).toEqual(
        mockEnumBidderEconomicSectors
      );
    });

    it('should fill countries whith store data', async () => {
      const { component } = await setup();
      expect(component.countries).toEqual([
        {
          id: 122,
          code: 'MD',
          isMember: false,
          isBeneficiary: true,
          name: 'MALDIVES',
        },
      ]);
    });
    it('should fill member countries whith store data', async () => {
      const { component } = await setup();

      expect(component.memberCountries).toEqual([
        {
          id: 18,
          code: 'FR',
          isMember: true,
          isBeneficiary: false,
          name: 'FRANCE',
        },
      ]);
    });
  });

  describe('Bidder type change', () => {
    it('should set hideAditionalFields false', async () => {
      const { component, fixture } = await setup();

      component.bidderTypeChange(BidderTypes.FIRM);
      fixture.detectChanges();
      expect(component.hideAditionalFields).toBe(false);
    });
  });

  describe('DeleteJointVentureBidder', () => {
    it('should emit the index of the JointBidder ', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.deleteJointBidder, 'emit');
      component.deleteJointVentureBidder(1);
      fixture.detectChanges();
      expect(component.deleteJointBidder.emit).toHaveBeenCalled();
    });
  });

  describe('onNewBidder', () => {
    it('should emit onNewJointVenture', async () => {
      const { component } = await setup();
      jest.spyOn(component.onNewJointVenture, 'emit');
      component.onNewBidder();
      expect(component.onNewJointVenture.emit).toHaveBeenCalled();
    });
  });
});
