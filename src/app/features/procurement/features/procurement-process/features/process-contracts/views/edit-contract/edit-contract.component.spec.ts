import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  AccordionModule,
  DirectivesModule,
  DocumentsModule,
  HeaderFeatureModule,
  NotificationModule,
  PipeModule,
  TablesModule,
} from '@fiduciary-interface/app/shared';
import { FormSectionsModule } from '@fiduciary-interface/app/shared/components/form-sections/form-sections.module';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { AditionalInformationComponent } from '../../components/aditional-information/aditional-information.component';
import { BonusComponent } from '../../components/bonus/bonus.component';
import { ContractAttachmentsComponent } from '../../components/contract-attachments/contract-attachments.component';
import { ContractGeneralInformationComponent } from '../../components/contract-general-information/contract-general-information.component';
import { ContractLotsComponent } from '../../components/contract-lots/contract-lots.component';
import { ContractsForm } from '../../components/contracts-form/contracts-form.component';
import { DamagesComponent } from '../../components/damages/damages.component';
import { DestinationPlaceComponent } from '../../components/destination-place/destination-place.component';
import { SecuritiesComponent } from '../../components/securities/securities.component';
import { WinnerInformationComponent } from '../../components/winner-information/winner-information.component';
import { EditContractComponent } from './edit-contract.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ActivatedRoute } from '@angular/router';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import { TestBed } from '@angular/core/testing';
import { BiddingContractDetail } from '@core/models';
import { of, throwError } from 'rxjs';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

async function setup() {
  let contractFormSvc: ContractFormCompleteService;

  const { fixture } = await render(EditContractComponent, {
    declarations: [
      WinnerInformationComponent,
      ContractGeneralInformationComponent,
      ContractLotsComponent,
      DestinationPlaceComponent,
      AditionalInformationComponent,
      ContractAttachmentsComponent,
      SecuritiesComponent,
      DamagesComponent,
      BonusComponent,
      ContractsForm,
    ],
    imports: [
      LayoutModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      RouterTestingModule,
      ReactiveFormsModule,
      AccordionModule,
      TablesModule,
      HeaderFeatureModule,
      DocumentsModule,
      NotificationModule,
      FormSectionsModule,
      DirectivesModule,
      HttpClientTestingModule,
      PipeModule,
      MsalTestModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({}),
      provideWindowSizeMock(),
      NotificationService,
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            params: {
              contractId: 'e6dabfe6-87eb-4582-89b8-0111a7ec2f91',
            },
            url: [{ path: 'create' }],
          },
        },
      },
    ],
  });
  const component = fixture.componentInstance;
  contractFormSvc = TestBed.inject(ContractFormCompleteService);

  return { component, fixture, contractFormSvc };
}

describe('EditContractComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get biddingContractId', async () => {
    const { fixture } = await setup();

    const activatedRoute: ActivatedRoute =
      fixture.debugElement.injector.get(ActivatedRoute);

    expect(activatedRoute.snapshot.params.contractId).toEqual(
      'e6dabfe6-87eb-4582-89b8-0111a7ec2f91'
    );
  });

  it('should get contract info function', async () => {
    const { component } = await setup();
    const spy = jest.spyOn(component, 'getContractInformation');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  describe('updateErrorList', () => {
    it('should update the error list', async () => {
      const { component } = await setup();

      const eventMock = [];
      component.updateErrorList(eventMock);

      expect(component.formErrorCollection).toBe(eventMock);
    });
  });

  describe('getContractInformation', () => {
    it('should get contract information, fill form data, and set visualCode when successful', async () => {
      const { component, contractFormSvc } = await setup();

      const biddingContractId = '123';
      const procurementProcessId = '456';
      const responseMock: BiddingContractDetail = {
        awardees: [
          {
            biddingProcessBidderId: 'adeb9f0f-e20b-47e9-98ac-1a966f897d07',
            biddingProcessParticipantId: 'ce7779ee-7ce0-4225-b879-7cde0361daff',
            name: 'Bidder Test Add/Update Participant',
            nationality: '0',
          },
        ],
        contract: null,
        currencies: [],
        documents: [],
        locations: [],
        lots: [],
        participants: [
          {
            biddingProcessBidderId: 'adeb9f0f-e20b-47e9-98ac-1a966f897d07',
            biddingProcessParticipantId: 'ce7779ee-7ce0-4225-b879-7cde0361daff',
            name: 'Bidder Test Add/Update Participant',
            nationality: '0',
          },
          {
            biddingProcessBidderId: 'f4381891-8756-4f3b-8e02-2a33d1ca6d3b',
            biddingProcessParticipantId: '4742aa87-525b-43b3-969e-93396e16fdc5',
            name: 'THIS IS LAS TEST',
            nationality: '0',
          },
        ],
        participantsAndWinners: [],
        securities: [],
        visualCode: '',
      };
      const contractFormSvcGetContractDetailSpy = jest
        .spyOn(contractFormSvc, 'getContractDetail')
        .mockReturnValue(of(responseMock));
      const contractFormSvcFillFormDataSpy = jest
        .spyOn(contractFormSvc, 'fillFormData')
        .mockReturnValue();

      component.getContractInformation(biddingContractId, procurementProcessId);
      expect(contractFormSvcGetContractDetailSpy).toHaveBeenCalledWith(
        biddingContractId,
        procurementProcessId
      );
      expect(contractFormSvcFillFormDataSpy).toHaveBeenCalledWith(
        component.form,
        responseMock,
        'edit'
      );
      expect(component.visualCode).toBe(responseMock.visualCode);
      expect(component.isLoading).toBe(false);
    });

    it('should display error notification when there is an error', async () => {
      const { component, contractFormSvc } = await setup();

      const biddingContractId = '123';
      const procurementProcessId = '456';
      const errorMock = new Error('Error loading information');
      const notificationsSpy = jest.spyOn(component, 'notifications');

      const getContractDetailSpy = jest
        .spyOn(contractFormSvc, 'getContractDetail')
        .mockReturnValue(throwError(errorMock));

      component.getContractInformation(biddingContractId, procurementProcessId);

      expect(getContractDetailSpy).toHaveBeenCalledWith(
        biddingContractId,
        procurementProcessId
      );
      expect(notificationsSpy).toHaveBeenCalled();
    });
  });
});
