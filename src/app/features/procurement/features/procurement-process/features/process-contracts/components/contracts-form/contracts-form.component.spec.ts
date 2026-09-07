import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AccordionModule,
  NotificationModule,
  DirectivesModule,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { render } from '@testing-library/angular';
import { WinnerInformationComponent } from '../winner-information/winner-information.component';
import { ContractGeneralInformationComponent } from '../contract-general-information/contract-general-information.component';

import { ContractLotsComponent } from '../contract-lots/contract-lots.component';
import { DestinationPlaceComponent } from '../destination-place/destination-place.component';
import { AditionalInformationComponent } from '../aditional-information/aditional-information.component';
import { ContractAttachmentsComponent } from '../contract-attachments/contract-attachments.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CostDistributionComponent } from '@fiduciary-interface/app/shared/components/form-sections/components/cost-distribution/cost-distribution.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';

import { ContractsForm } from './contracts-form.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ModeEnum } from '@core/enums';
import { createSecurityGroup } from '../aditional-information/aditional-information.form';
import { DialogService } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { CUSTOM_DATE_FORMATS } from '../../process-contracts.module';
import { MatRadioModule } from '@angular/material/radio';
import { MatNumericComponent } from '@fiduciary-interface/app/shared/components/mat-numeric/mat-numeric.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDateComponent } from '../../../../../../../../shared/components/mat-date/mat-date.component';

describe('FormViewComponent', () => {
  it('should fill the currrency var correctly', async () => {
    const { component } = await setup();
    jest
      .spyOn(component.contractsFormSvc.commonApi, 'getCurrencies')
      .mockReturnValue(
        of([
          {
            currency: 'string',
            isHard: true,
            isBorrowing: true,
            numberOfDecimals: 1,
          },
        ])
      );
    component.fillCurrencies();
    expect(component.formConfig.data.currencies).toEqual([
      {
        currency: 'string',
        numberOfDecimals: 1,
        exchangeRate: null,
        id: 'string',
      },
    ]);
  });

  it('should fill Participants Options On Create Contract', async () => {
    const { component } = await setup();
    jest
      .spyOn(
        component.contractsFormSvc.participantApi,
        'getAwardedParticipants'
      )
      .mockReturnValue(
        of({
          participantsAwarded: [
            {
              biddingProcessBidderId: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
              biddingProcessParticipantId:
                'a755fdf6-4123-4f39-acc1-90fe8fd86b8e',
              name: 'JointVenture 24dec',
              nationality: '0',
            },
            {
              biddingProcessBidderId: '08e5a5e8-b0df-4df5-9a7f-3377a97ffa9f',
              biddingProcessParticipantId:
                'abd09e6d-1351-43da-af73-bad98d0b07ae',
              name: 'Favio',
              nationality: '39',
            },
          ],
          procurementProcessId: 'eabba755-5abc-490d-8f86-5347d24c9085',
        })
      );
    component.fillParticipantsOptionsOnCreateContract();
    const winners = component.winnerInformationForm.get(
      'winnerList'
    ) as FormArray;
    expect(winners.value).toEqual([
      {
        biddingProcessParticipantId: 'a755fdf6-4123-4f39-acc1-90fe8fd86b8e',
        checked: false,
      },
      {
        biddingProcessParticipantId: 'abd09e6d-1351-43da-af73-bad98d0b07ae',
        checked: false,
      },
    ]);
  });

  describe('getMode function should return the roight boolean', () => {
    it('on CREATE mode should return false', async () => {
      const { component } = await setup();
      expect(component.getMode(ModeEnum.CREATE)).toBe(false);
    });
    it('on DETAIL mode should return false', async () => {
      const { component } = await setup();
      expect(component.getMode(ModeEnum.READ)).toBe(true);
    });
    it('on EDIT mode should return false', async () => {
      const { component } = await setup();
      expect(component.getMode(ModeEnum.UPDATE)).toBe(false);
    });
  });

  describe('should create succefully a new row of currency', () => {
    it('should create a recurity row', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.exchangeRateApi, 'convert')
        .mockReturnValue(
          of({ exchangeRate: 99.72075, fromCurrency: 'ARS', toCurrency: 'USD' })
        );
      component.formConfig.data.currencies = [
        {
          currency: 'ARS',
          exchangeRate: null,
          id: 'ARS',
          numberOfDecimals: 2,
        },
      ];
      const index = 0;
      component.securityList.push(createSecurityGroup());
      const event = { currency: 'ARS', index };
      component.onCurrencyChange(event, 'securities');
      expect(component.securityList.at(index).value).toEqual({
        amount: '',
        currency: '',
        expirationDate: '',
        id: null,
        securityType: '',
        usdEquivalentAmount: 0,
      });
    });
    it('should create a generalInfo Row', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.exchangeRateApi, 'convert')
        .mockReturnValue(
          of({ exchangeRate: 99.72075, fromCurrency: 'ARS', toCurrency: 'USD' })
        );
      component.formConfig.data.currencies = [
        {
          currency: 'ARS',
          exchangeRate: null,
          id: 'ARS',
          numberOfDecimals: 2,
        },
      ];
      const index = 0;
      component.securityList.push(createSecurityGroup());
      const event = { currency: 'ARS', index };
      component.onCurrencyChange(event, 'generalInformation');
      expect(component.securityList.at(index).value).toEqual({
        amount: '',
        currency: '',
        expirationDate: '',
        id: null,
        securityType: '',
        usdEquivalentAmount: '',
      });
    });
  });

  describe('submit', () => {
    it('should call the validate function', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component, 'validate');
      component.submit(true);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('saveContract', () => {
    it('on success', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.contractsFormSvc, 'saveContract')
        .mockReturnValue(of(''));
      jest
        .spyOn(
          component.contractsFormSvc.biddingContractApiService,
          'getBiddingContractLocations'
        )
        .mockReturnValue(
          of({
            locations: [
              {
                id: 1,
              },
            ],
          } as any)
        );

      component.saveContract(null);
      expect(component.secondStep).toBe(true);
      expect(component.isSubmitting).toBe(false);
    });

    it('on success second step', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.contractsFormSvc, 'saveContract')
        .mockReturnValue(of(''));
      jest
        .spyOn(
          component.contractsFormSvc.biddingContractApiService,
          'getBiddingContractLocations'
        )
        .mockReturnValue(
          of({
            locations: [
              {
                id: 1,
              },
            ],
          } as any)
        );
      component.secondStep = false;
      component.saveContract(null);
      expect(component.secondStep).toBe(true);
    });

    it('on error', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.contractsFormSvc, 'saveContract')
        .mockReturnValue(of(''));
      jest
        .spyOn(
          component.contractsFormSvc.biddingContractApiService,
          'getBiddingContractLocations'
        )
        .mockReturnValue(throwError(''));

      component.saveContract(null);
      expect(component.secondStep).toBe(false);
    });

    it('on error message', async () => {
      const { component } = await setup();
      const error = throwError('error');
      const spy = jest.spyOn(component, 'errorMessage');
      jest
        .spyOn(component.contractsFormSvc, 'saveContract')
        .mockReturnValue(error);
      component.saveContract(null);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('updateContract', () => {
    it('on success', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component, 'toastMessageAndNavigation');
      jest
        .spyOn(component.contractsFormSvc, 'updateContract')
        .mockReturnValue(of(''));
      component.updateContract(null, '');
      expect(spy).toHaveBeenCalled();
    });
    it('on error', async () => {
      const { component } = await setup();
      const error = throwError('error');
      const spy = jest.spyOn(component, 'errorMessage');
      jest
        .spyOn(component.contractsFormSvc, 'updateContract')
        .mockReturnValue(error);
      component.updateContract(null, '');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('updateConfirm', () => {
    it('on error message', async () => {
      const { component } = await setup();
      const error = throwError('error');
      const spy = jest.spyOn(component, 'errorMessage');
      jest
        .spyOn(component.contractsFormSvc, 'updateContract')
        .mockReturnValue(error);
      component.updateConfirm('', null);
      expect(spy).toHaveBeenCalled();
    });

    it('on error', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component, 'errorMessage');
      jest
        .spyOn(component.contractsFormSvc, 'updateContract')
        .mockReturnValue(throwError(''));
      component.updateConfirm('', null);
      expect(spy).toHaveBeenCalled();
    });

    it('on navegate', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component, 'errorMessage');
      jest
        .spyOn(component.contractsFormSvc, 'updateContract')
        .mockReturnValue(throwError(''));
      component.updateConfirm('', null);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getWinnersParticipantsId', () => {
    it('should return an empty array when winnerInformation is undefined', async () => {
      const { component } = await setup();
      expect(component.getWinnersParticipantsId()).toEqual([]);
    });
  });
});

async function setup(contractId = true) {
  let params;
  if (contractId) {
    params = {
      contractId: 'e6dabfe6-87eb-4582-89b8-0111a7ec2f91',
    };
  } else {
    params = {};
  }
  const { fixture } = await render(ContractsForm, {
    declarations: [
      WinnerInformationComponent,
      ContractGeneralInformationComponent,
      CostDistributionComponent,
      ContractLotsComponent,
      DestinationPlaceComponent,
      AditionalInformationComponent,
      ContractAttachmentsComponent,
    ],
    imports: [
      MatDateComponent,
      MsalTestModule,
      PipeModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      DropDownsModule,
      DateInputsModule,
      LabelModule,
      AccordionModule,
      DirectivesModule,
      ButtonsModule,
      RouterTestingModule,
      HttpClientTestingModule,
      MsalTestModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      MatSelectModule,
      MatCheckboxModule,
      MatDividerModule,
      MatDatepickerModule,
      MatRadioModule,
      MatNumericComponent,
      MatTooltipModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      NotificationModule,
    ],
    providers: [
      provideMockStore({ initialState }),
      provideWindowSizeMock(),
      NotificationService,
      DialogService,
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            params: params,
            url: [{ path: 'create' }],
          },
        },
      },
      { provide: DateAdapter, useClass: MomentDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
      { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
      { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return {
    component,
    fixture,
  };
}

const initialState = {
  enums: {
    biddingProcessDocumentGroupCodes: [
      {
        id: 0,
        name: 'ENUM.PROCESS.DOCUMENT.GROUP.AMENDMENT_REQUEST_QUOTATIONS',
      },
      {
        id: 1,
        name: 'ENUM.PROCESS.DOCUMENT.GROUP.AMENDMENTS_PREQUALIFICATION',
      },
      {
        id: 2,
        name: 'ENUM.PROCESS.DOCUMENT.GROUP.AMEDMENTS_BIDDING_DOCUMENTS',
      },
      {
        id: 3,
        name: 'ENUM.PROCESS.DOCUMENT.GROUP.AMENDMENTS_REQUEST_PROPOSAL',
      },
      {
        id: 4,
        name: 'ENUM.PROCESS.DOCUMENT.GROUP.NOTIFICATION_AWARD',
      },
      {
        id: 5,
        name: 'ENUM.PROCESS.DOCUMENT.GROUP.BANK_RESPONSE',
      },
    ],
    enumsLoaded: {
      biddingProcessDocumentGroupCodes: true,
    },
    memberCountries: [
      {
        id: 0,
        name: 'ENUM.COUNTRY.AR',
      },
      {
        id: 1,
        name: 'ENUM.COUNTRY.AU',
      },
      {
        id: 2,
        name: 'ENUM.COUNTRY.BA',
      },
    ],
    beneficiaryCountries: [
      {
        code: 'AR',
        name: 'ENUM.COUNTRY.AR',
      },
      {
        code: 'BA',
        name: 'ENUM.COUNTRY.BA',
      },
      {
        code: 'BH',
        name: 'ENUM.COUNTRY.BH',
      },
    ],
  },
};
