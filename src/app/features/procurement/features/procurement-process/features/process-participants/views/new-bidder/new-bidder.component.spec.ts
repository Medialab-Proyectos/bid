import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { render, screen } from '@testing-library/angular';
import { NewBidderComponent } from '../new-bidder/new-bidder.component';
import { routes } from '../../process-participants-routing.module';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { CommonModule, Location } from '@angular/common';
import { ErrorListComponent } from '@fiduciary-interface/app/shared/components/notification/components/error-list/error-list.component';
import { JointVentureBidderComponent } from '../../components/joint-venture-bidder/joint-venture-bidder.component';
import { newBidderRegistrationForm } from '../../components/bidder-registration-form/bidder-registration-form.form';
import { ParticipantsComponent } from '../participants/participants.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { FormTitleComponent } from '@fiduciary-interface/app/shared/components/form-title/components/form-title/form-title.component';
import {
  DirectivesModule,
  LoaderModule,
} from '@fiduciary-interface/app/shared';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BidderTypes } from '@core/enums';
import {
  Bidder,
  BiddingProcessBidderLocationResponse,
  Locations,
} from '@core/models';
import { BidderParentComponent } from '../bidder-parent/bidder-parent.component';
import { NewJointVentureComponent } from '../new-joint-venture/new-joint-venture.component';
import { DialogService } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const bidderTypeList = [
  {
    id: 0,
    name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.JOINT_VENTURE',
  },
  {
    id: 1,
    name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.FIRM',
  },
  {
    id: 2,
    name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.INDIVIDUAL',
  },
  {
    id: 3,
    name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.SME',
  },
  {
    id: 4,
    name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.ENTERPRISE',
  },
];

const mockEnumBidderEconomicSectors = [
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
    participants: {
      participantsByProcess: {
        '22': {
          participants: [],
          loaded: true,
          loading: false,
          error: null,
        },
      },
    },
    enums: {
      biddingProcessBidderTypes: [
        {
          id: 0,
          name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.JOINT_VENTURE',
        },
        {
          id: 1,
          name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.FIRM',
        },
        {
          id: 2,
          name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.INDIVIDUAL',
        },
        {
          id: 3,
          name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.SME',
        },
        {
          id: 4,
          name: 'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.ENTERPRISE',
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
        { code: 'AU', name: 'ENUM.COUNTRY.AU' },
        {
          code: 'AR',
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
      loaded: true,
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
          isBeneficiary: true,
          name: {
            en: 'UNITEDSTATESMINOROUTLY.ISLANDS',
            es: 'ISLASULTRAMARINASMENORESDEE.U.',
            fr: 'UNITEDSTATESMINOROUTLY.ISLANDS',
            pt: 'ILHAS MENORES DISTANTES DOS ESTADOS UNIDOS',
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
  };
}

async function setup() {
  const initialState = getInitialState();
  const { fixture } = await render(NewBidderComponent, {
    declarations: [
      ErrorListComponent,
      JointVentureBidderComponent,
      ParticipantsComponent,
      FormTitleComponent,
      BidderParentComponent,
      NewJointVentureComponent,
    ],
    imports: [
      MsalTestModule,
      DirectivesModule,
      CommonModule,
      RouterTestingModule.withRoutes(routes),
      FormsModule,
      HttpClientTestingModule,
      ReactiveFormsModule,
      DropDownsModule,
      InputsModule,
      LabelModule,
      LoaderModule,
      DropDownsModule,
      ButtonsModule,
      ReactiveFormsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({ initialState }),
      Location,
      NotificationService,
      provideWindowSizeMock({ mobileView: false }),

      DialogService,
    ],
  });
  const location: Location = TestBed.inject(Location);
  const router: Router = TestBed.inject(Router);
  router.initialNavigation();
  const component = fixture.debugElement.componentInstance;
  return { fixture, component, router, location };
}

describe('NewBidderComponent', () => {
  describe('When i change the type selector', () => {
    describe('When i select the Type Joint Venture', () => {
      it('should show the second section', async () => {
        const { fixture, component } = await setup();
        component.visibleSectionVenture = true;
        component.bidderTypeChange(
          'FI.CNVG.FP.ENUM.PROCESS.BIDDER.TYPE.JOINT_VENTURE'
        );
        fixture.detectChanges();
        const jointVentureSection = screen.findByTestId(
          'qa-jointVentureSection'
        );
        expect(jointVentureSection).not.toBe(null);
      });
      it('should show the minimum of bidders', async () => {
        const { fixture, component } = await setup();
        component.isBidderLoading = false;
        component.isEnumLoaded = true;
        component.isSubmiting = false;
        component.loadingPlan = false;
        component.bidderTypeChange(0);
        fixture.detectChanges();
        const jointVentureSection = screen.getAllByTestId(
          'qa-jointVentureSection-element'
        );
        expect(jointVentureSection.length).toBe(2);
      });
    });
    describe('When i select the Type different from Joint Venture', () => {
      it('should not show the second section', async () => {
        const { fixture, component } = await setup();
        component.bidderTypeChange(2);
        fixture.detectChanges();
        const jointVentureSection = screen.queryByRole(
          'qa-jointVentureSection'
        );
        expect(jointVentureSection).toBe(null);
      });
      it('should reset the jointVentures array', async () => {
        const { component } = await setup();
        expect(component.jointVentures.length).toBe(0);
      });
    });
  });
  describe('When i click the cancel button', () => {
    it('should return me to the participant page', async () => {
      const { component, location, fixture } = await setup();
      component.isEnumLoaded = true;
      component.isBidderLoading = false;
      fixture.detectChanges();
      screen.getByTestId('qa-goBackBtn').click();
      fixture.detectChanges();
      component.goBack();
      expect(location.path()).toBe('');
    });
  });
  describe('When i click the save btn', () => {
    describe('when i have correctly filled all the mandatory form fields', () => {
      describe('When is not a bidder with joint venture', () => {
        it('should redirect me to participants page', async () => {
          const { location, fixture, component } = await setup();

          component.isEnumLoaded = true;
          fixture.detectChanges();

          component.participantForm
            .get('participantBidderForm')
            .get('name')
            .setValue('Name');
          component.participantForm
            .get('participantBidderForm')
            .get('nationality')
            .setValue('Albania');
          component.participantForm
            .get('participantBidderForm')
            .get('type')
            .setValue('Sme');
          screen.getByTestId('createProcessbtn').click();
          fixture.detectChanges();
          expect(location.path()).toBe('');
        });
      });
      describe('When is a bidder with joint venture', () => {
        it('give a valid format to the bidder', async () => {
          const { component, fixture } = await setup();
          component.isEnumLoaded = true;
          component.isBidderLoading = false;
          fixture.detectChanges();
          component.bidderTypeChange(0);
          fixture.detectChanges();
          component.participantForm
            .get('jointVentureBidders')
            .at(0)
            .addControl('participantBidderForm', newBidderRegistrationForm());
          component.participantForm
            .get('jointVentureBidders')
            .at(1)
            .addControl('participantBidderForm', newBidderRegistrationForm());
          screen.getByTestId('createProcessbtn').click();
        });
      });
    });
    describe('when i have not correctly filled all the mandatory the form fields', () => {
      describe('when is not a bidder with joint ventures', () => {
        describe('when i have not filled the name field', () => {
          it('should show an error message with the name type message', async () => {
            const { component, fixture } = await setup();
            component.isEnumLoaded = true;
            component.isBidderLoading = false;
            fixture.detectChanges();
            screen.getByTestId('createProcessbtn').click();
            await screen.findByText(/Name is required/i);
          });
        });
        describe('when i have select the type field', () => {
          it('should show an error message with the missing type message', async () => {
            const { component, fixture } = await setup();
            component.isEnumLoaded = true;
            component.isBidderLoading = false;
            fixture.detectChanges();
            screen.getByTestId('createProcessbtn').click();
            await screen.findByText(/Type is required/i);
          });
        });
        describe('when i have select the nationality field', () => {
          it('should show an error message with the missing nationality message', async () => {
            const { component, fixture } = await setup();
            component.isEnumLoaded = true;
            component.isBidderLoading = false;
            fixture.detectChanges();
            screen.getByTestId('createProcessbtn').click();
            await screen.findByText(/Nationality is required/i);
          });
        });
        it('should show the component list error', async () => {
          const { component, fixture } = await setup();
          component.isEnumLoaded = true;
          component.isBidderLoading = false;
          fixture.detectChanges();
          screen.getByTestId('createProcessbtn').click();
          await screen.findByTestId('ErrorMessage');
        });
      });
      describe('when is a bidder with joint ventures - CPO', () => {
        it('should return the error object that contains specific error -CPO ', async () => {
          const { component, fixture } = await setup();

          component.isEnumLoaded = true;
          component.bidderTypeChange(0);

          fixture.detectChanges();
          screen.getByTestId('createProcessbtn').click();
          const error = { error: 'x-nullable' };
          const index = { index: 1 };
          const key = { key: 'BIDDER.VALIDATION_ERRORS_JV_#' };
          expect(component.formErrorCollection).toContainEqual(
            Object.assign(error, index, key)
          );
        });
        describe('when one of the jointventure bidder is not null - CPO', () => {
          it('should not have errors - CPO', async () => {
            const { component, fixture } = await setup();

            component.isEnumLoaded = true;
            fixture.detectChanges();

            component.bidderTypeChange(0);
            fixture.detectChanges();
            component.participantForm
              .get('jointVentureBidders')
              .at(0)
              .addControl('participantBidderForm', newBidderRegistrationForm());
            screen.getByTestId('createProcessbtn').click();
            expect(component.errorKeys).not.toContain({
              error: 'x-nullable',
              index: 1,
            });
          });
        });
      });
    });
  });

  describe('when i get the enums from the store', () => {
    it('should updte the bidder type array variable', async () => {
      const { component } = await setup();

      component.populateEnums();
      expect(component.bidderTypeList).toEqual(bidderTypeList);
    });
    it('should updte the bidder economicSectorList array variable', async () => {
      const { component } = await setup();
      component.populateEnums();
      expect(component.economicSectorList).toEqual(
        mockEnumBidderEconomicSectors
      );
    });
    it('should updte the countries array variable', async () => {
      const { component } = await setup();
      component.populateEnums();
      expect(component.countries).toEqual([
        {
          id: 264,
          code: 'UO',
          isMember: false,
          isBeneficiary: true,
          name: 'UNITEDSTATESMINOROUTLY.ISLANDS',
        },
      ]);
    });

    it('should updte the memberCountries array variable', async () => {
      const { component } = await setup();
      component.populateEnums();
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

  describe('when bidder details is loading', () => {
    it('should show spinner', async () => {
      const { component, fixture } = await setup();
      component.isBidderLoading = true;
      fixture.detectChanges();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('Check location value', () => {
    it('should return the location if isnt empty', async () => {
      const { component } = await setup();

      const location: BiddingProcessBidderLocationResponse = {
        locations: [
          {
            id: '123',
            zipCode: '123',
            country: '123',
            address: '123',
          },
        ],
      };

      const locationResponse = component.checkLocationValue(location);
      expect(locationResponse).toEqual(location.locations[0]);
    });

    it('should return an empty location if location.locations.length > 0', async () => {
      const { component } = await setup();

      const location: BiddingProcessBidderLocationResponse = {
        locations: [
          {
            id: '',
            zipCode: '',
            country: '',
            address: '',
          },
        ],
      };

      const locationEmpty: Locations = {
        id: '',
        zipCode: '',
        country: '',
        address: '',
      };
      const locationResponse = component.checkLocationValue(location);
      expect(locationResponse).toEqual(locationEmpty);
    });
  });

  describe('when I call edit', () => {
    it('should set readonly false', async () => {
      const { component } = await setup();

      component.edit();
      expect(component.isReadOnly).toBe(false);
    });
  });

  it('should return the full data of a bidder with location', async () => {
    const { component } = await setup();
    jest.spyOn(component.bidderApi, 'searchBidderById').mockReturnValue(
      of({
        biddingProcessBidder: {
          address: 'Calle Americo Vespucio',
          beneficiaryOwner: 'Favio',
          country: 'AA',
          economicSector: 0,
          id: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
          legalRepresentative: 'Ruso',
          name: 'JointVenture 24dec',
          nationality: 0,
          type: 0,
          zipCode: '41800',
          searchName: 'string',
          biddersJointVenture: [
            '0caa0ed0-aabb-4407-b884-7f94918a4bca',
            '1f34d708-0ea0-420f-aba2-ac0d960b5971',
          ],
        },
      })
    );
    jest
      .spyOn(component.bidderApi, 'searchBidderLocationsById')
      .mockReturnValue(
        of({
          locations: [
            {
              address: 'Calle Americo Vespucio',
              country: 'AA',
              id: '46c37d92-a2bb-4977-993d-6df24d662507',
              zipCode: '41800',
            },
          ],
        })
      );
    component.searchBidderAndLocation('').subscribe((data) => {
      expect(data).toBe({
        address: 'Calle Americo Vespucio',
        beneficiaryOwner: 'Favio',
        country: 'AA',
        economicSector: 0,
        id: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
        legalRepresentative: 'Ruso',
        name: 'JointVenture 24dec',
        nationality: 0,
        type: 0,
        zipCode: '41800',
        biddersJointVenture: [
          '0caa0ed0-aabb-4407-b884-7f94918a4bca',
          '1f34d708-0ea0-420f-aba2-ac0d960b5971',
        ],
      });
    });
  });
  it('should return new empty location', async () => {
    const { component } = await setup();
    const locationResponse: BiddingProcessBidderLocationResponse = {
      locations: [],
    };
    const expectedResponse: Locations = {
      address: '',
      country: '',
      id: '',
      zipCode: '',
    };
    expect(component.checkLocationValue(locationResponse)).toEqual(
      expectedResponse
    );
  });
  it('should populate the bidder correctly', async () => {
    const { component } = await setup();
    const bidderMock: Bidder = {
      address: 'Calle Americo Vespucio',
      biddersJointVenture: [
        '0caa0ed0-aabb-4407-b884-7f94918a4bca',
        '1f34d708-0ea0-420f-aba2-ac0d960b5971',
      ],
      beneficiaryOwner: 'Favio',
      country: 'AA',
      economicSector: 0,
      id: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
      legalRepresentative: 'Ruso',
      name: 'JointVenture 24dec',
      nationality: 0,
      type: 0,
      zipCode: '41800',
    };
    expect(component.populateBidderForm(bidderMock).value).toEqual({
      address: 'Calle Americo Vespucio',
      beneficiaryOwner: 'Favio',
      economicSector: 0,
      id: '1f34d708-0ea0-420f-aba2-ac0d960b5971',
      legalRepresentative: 'Ruso',
      location: 'AA',
      name: 'JointVenture 24dec',
      nationality: 0,
      type: 0,
      zipCode: '41800',
    });
  });
  describe('checkSelectedParticipant ', () => {
    it('on no filtered participant', async () => {
      const { component } = await setup();
      component.participantId = '';
      mockParticipants(component);
      component.checkSelectedParticipant();
    });

    it('on aviable bidderId', async () => {
      const { component } = await setup();
      component.participantId = 'a672d640-ddd7-4ecb-a629-f62b193cbb0a';
      component.bidderId = '29c89e71-478a-4292-9b44-f260793c5034';
      mockParticipants(component);
      component.checkSelectedParticipant();
    });

    it('on aviable bidderId but no filtered participant', async () => {
      const { component } = await setup();
      component.participantId = '';
      component.bidderId = '29c89e71-478a-4292-9b44-f260793c5034';
      mockParticipants(component);
      component.checkSelectedParticipant();
    });
  });

  it('should delete a bidderSucessfully', async () => {
    const { component } = await setup();
    component.jointventureBiddersCounter = 1;
    component.jointVentures.push(new FormGroup({}));
    component.deleteBidder(0);
    expect(component.jointVentures.length).toBe(0);
  });

  describe('when click the edit bidder button', () => {
    it('should no send request if form is invalid', async () => {
      const { component, fixture } = await setup();
      component.isReadOnly = true;
      component.isEnumLoaded = true;
      component.loadingPlan = false;
      component.planInSync = true;
      fixture.detectChanges();

      const updateBidderSpy = jest.spyOn(component.bidderApi, 'updateBidder');

      component.participantForm
        .get('participantBidderForm')
        .get('name')
        .setValue(null);

      screen.getByTestId('editionModeBtn').click();
      fixture.detectChanges();
      screen.getByTestId('editBidderBtn').click();
      fixture.detectChanges();

      expect(updateBidderSpy).not.toHaveBeenCalled();
    });

    describe('when send request', () => {
      it('should show update related joint ventures when type is joint venture', async () => {
        const { component, fixture } = await setup();

        component.isEnumLoaded = true;
        component.isReadOnly = true;
        component.loadingPlan = false;
        component.planInSync = true;
        fixture.detectChanges();

        jest.spyOn(component.bidderApi, 'updateBidder').mockReturnValue(of(''));
        jest
          .spyOn(component.bidderApi, 'updateBidderJointVentures')
          .mockReturnValue(of(''));
        const successMessageSpy = jest.spyOn(
          component.notificationGlobalService,
          'showSuccess'
        );

        component.participantForm.get('participantBidderForm').patchValue({
          name: 'Nikolas',
          type: BidderTypes.JOINT_VENTURE,
          nationality: 'ES',
        });

        screen.getByTestId('editionModeBtn').click();
        fixture.detectChanges();
        screen.getByTestId('editBidderBtn').click();
        fixture.detectChanges();

        expect(successMessageSpy).toHaveBeenCalled();
      });
      it('should show edited successfully message and redirect to participants list', async () => {
        const { component, fixture, location } = await setup();

        component.isEnumLoaded = true;
        component.isReadOnly = true;
        component.loadingPlan = false;
        component.planInSync = true;
        fixture.detectChanges();

        jest.spyOn(component.bidderApi, 'updateBidder').mockReturnValue(of(''));
        jest
          .spyOn(component.bidderApi, 'updateBidderJointVentures')
          .mockReturnValue(of(''));
        const successMessageSpy = jest
          .spyOn(component.notificationGlobalService, 'showSuccess')
          .mockImplementation();

        component.participantForm.get('participantBidderForm').patchValue({
          name: 'Nikolas',
          type: BidderTypes.INDIVIDUAL,
          nationality: 'ES',
        });

        screen.getByTestId('editionModeBtn').click();
        fixture.detectChanges();
        screen.getByTestId('editBidderBtn').click();
        fixture.detectChanges();

        expect(successMessageSpy).toHaveBeenCalled();
        expect(location.path()).toBe('');
      });

      it('should show error message', async () => {
        const { component, fixture } = await setup();

        component.isEnumLoaded = true;
        component.isReadOnly = true;
        component.loadingPlan = false;
        component.planInSync = true;
        fixture.detectChanges();

        jest
          .spyOn(component.bidderApi, 'updateBidder')
          .mockReturnValue(throwError(''));
        const errorMessageSpy = jest.spyOn(
          component.notificationGlobalService,
          'showError'
        );

        component.participantForm.get('participantBidderForm').patchValue({
          name: 'Nikolas',
          type: BidderTypes.INDIVIDUAL,
          nationality: 'ES',
        });

        screen.getByTestId('editionModeBtn').click();
        fixture.detectChanges();
        screen.getByTestId('editBidderBtn').click();
        fixture.detectChanges();

        expect(errorMessageSpy).toHaveBeenCalled();
      });
    });
  });

  describe('addJointventureBidder', () => {
    it('should increment the jointventureBiddersCounter and add a new UntypedFormGroup to jointVentures', async () => {
      const { component } = await setup();

      const initialCounter = component.jointventureBiddersCounter;
      const initialJointVenturesLength = component.jointVentures.length;

      component.addJointventureBidder();

      expect(component.jointventureBiddersCounter).toBe(initialCounter + 1);
      expect(component.jointVentures.length).toBe(
        initialJointVenturesLength + 1
      );
    });
  });

  describe('removeJointventureBidder', () => {
    it('should remove the jointVenture at the specified index and decrement jointventureBiddersCounter', async () => {
      const { component } = await setup();
      const indexToRemove = 1;
      component.jointVentures.push(new FormGroup({}));
      component.jointVentures.push(new FormGroup({}));
      component.jointVentures.push(new FormGroup({}));
      const initialCounter = component.jointVentures.length;
      component.jointventureBiddersCounter = initialCounter;
      component.removeJointventureBidder(indexToRemove);
      expect(component.jointVentures.length).toBe(initialCounter - 1);
      expect(component.jointVentures[indexToRemove]).toBeUndefined();
    });
  });
});

export function mockParticipants(component) {
  jest
    .spyOn(component.participantsStoreSvc, 'getStateByProcess$')
    .mockReturnValue(
      of({
        error: null,
        loaded: true,
        loading: false,
        participants: [
          {
            amount: 66,
            biddingProcessBidderId: '29c89e71-478a-4292-9b44-f260793c5034',
            biddingProcessParticipantId: 'a672d640-ddd7-4ecb-a629-f62b193cbb0a',
            currency: 'USD',
            result: 0,
            totalScore: 0,
            weighedFinancialScore: null,
            weighedTechScore: null,
            bidder: {
              address: '',
              beneficiaryOwner: null,
              biddersJointVenture: [],
              country: null,
              economicSector: null,
              id: '29c89e71-478a-4292-9b44-f260793c5034',
              legalRepresentative: null,
              name: 'CanoTest1',
              nationality: 0,
              type: 2,
              zipCode: '',
            },
          },
        ],
      })
    );
}
