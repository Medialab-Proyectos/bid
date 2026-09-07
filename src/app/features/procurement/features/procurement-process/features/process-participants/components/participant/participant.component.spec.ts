import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ParticipantComponent } from './participant.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { screen, render } from '@testing-library/angular';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { PopupModule, POPUP_CONTAINER } from '@progress/kendo-angular-popup';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Participant } from '@core/models';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { CommonModule } from '@angular/common';
import { LabelModule } from '@progress/kendo-angular-label';
import { TranslateTestingModule } from 'ngx-translate-testing';
import {
  DirectivesModule,
  TablesModule,
} from '@fiduciary-interface/app/shared';
import { FiInputCurrencyModule } from '@fiduciary-interface/app/shared/components/input-currency/input-currency.module';
import { EvaluationParticipantsConfig } from '@core/enums';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

const mockedKnowParticipant = {
  searchName: '',
  biddingProcessBidderId: '9cfee90c-bc8f-4ef1-a5b8-c8945926ec1a',
  biddingProcessParticipantId: 'cd592ba8-dd11-47d2-81cf-3618370fb680',
  weighedTechScore: 15,
  weighedFinancialScore: 15,
  totalScore: 30,
  amount: 66,
  currency: 'USD',
  result: 0,
  bidder: {
    id: '9cfee90c-bc8f-4ef1-a5b8-c8945926ec1a',
    type: 1,
    economicSector: 1,
    name: 'Fake 6',
    nationality: 'CO',
    legalRepresentative: 'Fake 6 representative',
    beneficiaryOwner: 'Fake6 benefici',
  },
  options: ['asdad'],
  nationality: 18,
};

const mockedParticipantInput = {
  biddingProcessBidderId: '9cfee90c-bc8f-4ef1-a5b8-c8945926ec1a',
  biddingProcessParticipantId: 'cd592ba8-dd11-47d2-81cf-3618370fb680',
  weighedTechScore: 15,
  weighedFinancialScore: 15,
  totalScore: 30,
  amount: 66,
  currency: 'USD',
  result: 0,
  bidder: {
    id: '9cfee90c-bc8f-4ef1-a5b8-c8945926ec1a',
    type: 1,
    economicSector: 1,
    name: 'Fake 6',
    nationality: 'CO',
    legalRepresentative: 'Fake 6 representative',
    beneficiaryOwner: 'Fake6 benefici',
  },
  options: ['asdad'],
};

function getInitialState() {
  return {
    participants: {
      participants: [
        {
          biddingProcessBidderId: '9cfee90c-bc8f-4ef1-a5b8-c8945926ec1a',
          biddingProcessParticipantId: 'cd592ba8-dd11-47d2-81cf-3618370fb680',
          weighedTechScore: 15,
          weighedFinancialScore: 15,
          totalScore: 30,
          amount: 66,
          currency: 'USD',
          result: 0,
          bidder: {
            id: '9cfee90c-bc8f-4ef1-a5b8-c8945926ec1a',
            type: 1,
            economicSector: 1,
            name: 'Fake 6',
            nationality: 'CO',
            legalRepresentative: 'Fake 6 representative',
            beneficiaryOwner: 'Fake6 benefici',
          },
        },
        {
          biddingProcessBidderId: '5469a8ee-cb5f-4b54-bc52-51d3f11a2e7d',
          biddingProcessParticipantId: 'b95cfdd6-b410-4196-b8d7-3db5c8f1383e',
          weighedTechScore: 4,
          weighedFinancialScore: 4,
          totalScore: 8,
          amount: 88,
          currency: 'USD',
          result: 1,
          bidder: {
            id: '5469a8ee-cb5f-4b54-bc52-51d3f11a2e7d',
            type: 1,
            economicSector: 1,
            name: 'Fake 4',
            nationality: 'CO',
            legalRepresentative: 'Fake 3 representative',
            beneficiaryOwner: 'Fake3 benefici',
          },
        },
      ],
      // settings: [
      //   {
      //     id: 'fd3cfc25-b080-41eb-bd75-38cd89c603f5',
      //     type: 'ParticipantFields',
      //     attributes: [
      //       {
      //         key: 'countryCode',
      //         value: 'CO',
      //       },
      //       {
      //         key: 'category',
      //         value: 'PROCT_WORKS',
      //       },
      //       {
      //         key: 'procurementMethod',
      //         value: 'PROCT_ICB',
      //       },
      //     ],
      //     values:
      //       '{ "technicalScore" : "O", "financialScore" : "O", "overallScore" : "O", "awardedAmount" : "R" }',
      //     modified: 'System',
      //   },
      // ],
      loaded: false,
      loading: false,
      error: null,
    },
    enums: {
      biddingProcessParticipantResults: [
        {
          id: 1,
          name: 'Awarded',
        },
        {
          id: 2,
          name: 'Participant',
        },
        {
          id: 3,
          name: 'Rejected',
        },
      ],
      memberCountries: [
        {
          id: 0,
          name: 'ENUM.COUNTRY.AR',
        },
        {
          id: 1,
          name: 'ENUM.COUNTRY.AU',
        },
      ],
      loaded: false,
      loading: false,
      error: null,
    },
  };
}

async function setup(
  config = {
    awardedAmount: EvaluationParticipantsConfig.Required,
    financialScore: EvaluationParticipantsConfig.Optional,
    overallScore: EvaluationParticipantsConfig.Optional,
    technicalScore: EvaluationParticipantsConfig.Optional,
  }
) {
  const initialState = getInitialState();
  const { fixture } = await render(ParticipantComponent, {
    declarations: [IfNumberPipe],
    imports: [
      MsalTestModule,
      DirectivesModule,
      CommonModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      ButtonsModule,
      RouterTestingModule,
      TablesModule,
      PopupModule,
      FormsModule,
      ReactiveFormsModule,
      DirectivesModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      FiInputCurrencyModule,
    ],
    componentProperties: {
      configValues: config,
      allCountries: [
        {
          id: 18,
          name: 'FRANCE',
          code: 'FR',
          isMember: true,
          isBeneficiary: false,
        },
        {
          id: 264,
          name: 'UNITEDSTATESMINOROUTLY.ISLANDS',
          code: 'UO',
          isMember: false,
          isBeneficiary: false,
        },
        {
          id: 122,
          name: 'MALDIVES',
          code: 'MD',
          isMember: false,
          isBeneficiary: false,
        },
        {
          id: 167,
          name: 'SAN MARINO',
          code: 'SB',
          isMember: false,
          isBeneficiary: false,
        },
        {
          id: 147,
          name: 'NAURU',
          code: 'NU',
          isMember: false,
          isBeneficiary: false,
        },
        {
          id: 127,
          name: 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF',
          code: 'MK',
          isMember: false,
          isBeneficiary: false,
        },
        {
          id: 230,
          name: 'GIBRALTAR',
          code: 'GB',
          isMember: false,
          isBeneficiary: false,
        },
      ],
    },
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({}),
      {
        provide: POPUP_CONTAINER,
        useFactory: () => {
          return { nativeElement: document.body } as ElementRef;
        },
      },
      provideMockStore({ initialState }),
      provideWindowSizeMock({ mobileView: false }),
      {
        provide: POPUP_CONTAINER,
        useFactory: () => {
          return { nativeElement: document.body } as ElementRef;
        },
      },
    ],
  });
  const httpMock = TestBed.inject(HttpTestingController);
  const component = fixture.debugElement.componentInstance;
  return {
    fixture,
    component,
    httpMock,
  };
}

describe('ParticipantComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Given i init the component with a valid participant', () => {
    it('should show the amount field', async () => {
      const { component } = await setup();
      component.participant = mockedParticipantInput;
      const amountComponent = screen.queryAllByTestId('inputCurrency');
      expect(amountComponent.length).toBe(1);
    });
    it('should show the nationality field', async () => {
      const { component } = await setup();
      component.participant = mockedParticipantInput;
      const nationalityComponent = screen.queryAllByRole('nationality');
      expect(nationalityComponent.length).toBe(1);
    });
    it('should show the technical score field', async () => {
      const { component } = await setup();
      component.participant = mockedParticipantInput;
      const techScoreComponent = screen.queryAllByRole('weighedTechScore');
      expect(techScoreComponent.length).toBe(1);
    });
    it('should show the financial score field', async () => {
      const { component } = await setup();
      component.participant = mockedParticipantInput;
      const financialScoreComponent = screen.queryAllByRole(
        'weighedFinancialScore'
      );
      expect(financialScoreComponent.length).toBe(1);
    });
    it('should show the total score field', async () => {
      const { component } = await setup();
      component.participant = mockedParticipantInput;
      const totalScoreComponent = screen.queryAllByRole('totalScore');
      expect(totalScoreComponent.length).toBe(1);
    });
  });

  describe('when the search component selection change', () => {
    describe('when is a know bidder', () => {
      it('should render the field correctly', async () => {
        const { component } = await setup();
        component.selectionChange(mockedKnowParticipant);
        expect(component.participantForm.get('bidder').value).toEqual(
          mockedKnowParticipant
        );
      });
    });

    describe('when is not a know bidder', () => {
      it('should reset the form', async () => {
        const { component } = await setup();
        component.selectionChange(undefined);
        expect(component.participantForm.get('bidder').value).toBe(null);
      });

      it('should redirect to add new bidder', async () => {
        const { component } = await setup();
        const spy = jest.spyOn(component.router, 'navigate');

        component.onNewParticipant();

        expect(spy).toHaveBeenCalled();
      });
    });
  });
  describe('when i click the save btn', () => {
    it('should emit the participant data to parent component', async () => {
      const { component, fixture } = await setup();
      const componentInstance = fixture.componentInstance;
      jest.spyOn(componentInstance.addedParticipant, 'emit');
      component.saveParticipant();
      fixture.detectChanges();
      expect(componentInstance.addedParticipant.emit).toHaveBeenCalled();
    });
  });
  it('should fill form with participant when no has bidder', async () => {
    const { component } = await setup();
    const participant: Participant = {
      bidder: null,
      biddingProcessBidderId: '123456',
      weighedTechScore: 0,
      weighedFinancialScore: 0,
      totalScore: 0,
      amount: 0,
      result: 0,
    } as any;

    component.participant = participant;
    component.ngOnChanges(participant);
    expect(component.disabledFields).toBe(false);
  });

  it('should unsubscribe subscriptions when destroy', async () => {
    const { component } = await setup();
    const spy = jest.spyOn(component.subscriptions, 'unsubscribe');

    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  describe('When i left the search box', () => {
    it('should reset isLoading and searchText', async () => {
      const { component } = await setup();

      component.blur();
      expect(component.isloading).toBe(true);
      expect(component.searchText).toBe(0);
    });
  });

  describe('When config is found', () => {
    it('should show evaluation fields', async () => {
      await setup({
        awardedAmount: EvaluationParticipantsConfig.Required,
        financialScore: EvaluationParticipantsConfig.Required,
        overallScore: EvaluationParticipantsConfig.Required,
        technicalScore: EvaluationParticipantsConfig.Required,
      });
      expect(screen.getByTestId('techScore')).toBeInTheDocument();
      expect(screen.getByTestId('financialScore')).toBeInTheDocument();
      expect(screen.getByTestId('overallScore')).toBeInTheDocument();
      expect(screen.getByTestId('awardedAmount')).toBeInTheDocument();
    });

    describe('and NotApplicable', () => {
      it('should not show evaluation fields', async () => {
        await setup({
          awardedAmount: EvaluationParticipantsConfig.NotApplicable,
          financialScore: EvaluationParticipantsConfig.NotApplicable,
          overallScore: EvaluationParticipantsConfig.NotApplicable,
          technicalScore: EvaluationParticipantsConfig.NotApplicable,
        });

        expect(screen.queryByTestId('techScore')).not.toBeInTheDocument();
        expect(screen.queryByTestId('financialScore')).not.toBeInTheDocument();
        expect(screen.queryByTestId('overallScore')).not.toBeInTheDocument();
        expect(screen.queryByTestId('awardedAmount')).not.toBeInTheDocument();
      });
    });
  });

  describe('item options', () => {
    it('should emit a participant option SEE event', async () => {
      const { component, fixture } = await setup();

      const spy = jest.spyOn(component.participantOption, 'emit');
      component.itemOption('PARTICIPANT.SEE');
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('item emit row is disabled and hide', () => {
    it('should emit row is disabled', async () => {
      const { component, fixture } = await setup();

      const spy = jest.spyOn(component.isRowDisabled, 'emit');
      component.removeRow();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });
});
