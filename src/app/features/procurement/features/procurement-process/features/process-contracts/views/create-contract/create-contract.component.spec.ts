import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AccordionModule,
  DirectivesModule,
  NotificationModule,
} from '@fiduciary-interface/app/shared';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { render, screen } from '@testing-library/angular';
import { CreateContractComponent } from './create-contract.component';
import { WinnerInformationComponent } from '../../components/winner-information/winner-information.component';
import { ContractGeneralInformationComponent } from '../../components/contract-general-information/contract-general-information.component';

import { ContractLotsComponent } from '../../components/contract-lots/contract-lots.component';
import { DestinationPlaceComponent } from '../../components/destination-place/destination-place.component';
import { AditionalInformationComponent } from '../../components/aditional-information/aditional-information.component';
import { ContractAttachmentsComponent } from '../../components/contract-attachments/contract-attachments.component';
import { provideMockStore } from '@ngrx/store/testing';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CostDistributionComponent } from '@fiduciary-interface/app/shared/components/form-sections/components/cost-distribution/cost-distribution.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ContractsForm } from '../../components/contracts-form/contracts-form.component';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

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

    loaded: true,
    loading: false,
    error: null,
  },
};

describe('CreateContractComponent', () => {
  async function setup() {
    const { fixture } = await render(CreateContractComponent, {
      declarations: [
        ContractsForm,
        WinnerInformationComponent,
        ContractGeneralInformationComponent,
        CostDistributionComponent,
        ContractLotsComponent,
        DestinationPlaceComponent,
        AditionalInformationComponent,
        ContractAttachmentsComponent,
        IfNumberPipe,
      ],
      imports: [
        MsalTestModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputsModule,
        DropDownsModule,
        DateInputsModule,
        LabelModule,
        AccordionModule,
        ButtonsModule,
        RouterTestingModule,
        DirectivesModule,
        HttpClientTestingModule,
        NotificationModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        provideMockStore({ initialState }),
        provideWindowSizeMock(),
        DialogService,

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

        DialogService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    const component = fixture.componentInstance;
    return { component, fixture };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show error list', async () => {
    const { fixture, component } = await setup();
    component.formErrorCollection = [
      { error: 'error 1', key: 'error.key.1', index: 0 },
    ];
    fixture.detectChanges();
    expect(screen.getByTestId('errorList')).toBeInTheDocument();
  });
});
