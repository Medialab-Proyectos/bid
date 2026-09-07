import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { newBidderRegistrationForm } from '../../components/bidder-registration-form/bidder-registration-form.form';
import { FormValidationService } from '@core/services/validation';
import { VisibilityService } from '@core/services/view';
import { BidderApiService } from '@core/services/apis';
import {
  Bidder,
  BidderFormGroup,
  BiddingProcessBidderLocationResponse,
  BiddingProcessBidderRequest,
  BiddingProcessPlan,
  Enumerator,
  Enums,
  Locations,
  MasterDataCountry,
  MasterDataCountryEnum,
  Participant,
} from '@core/models';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
  ParticipantsStoreService,
} from '@core/services/store-services';
import { TranslateService } from '@ngx-translate/core';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import {
  BidderTypes,
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  PermissionEnum,
} from '@core/enums';
import { concatMap, filter, map, mergeMap } from 'rxjs/operators';
import { ParticipantsService } from '../../services/participants.service';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { EnumsmasterdataStoreService } from '@core/services/store-services/enumsMasterData/enumsmasterdata-store.service';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import { EnumsMasterDataState } from '@core/store';

@Component({
  selector: 'fi-new-bidder',
  templateUrl: './new-bidder.component.html',
})
export class NewBidderComponent implements OnInit, OnDestroy {
  public subscriptionCollection: Subscription[] = [];
  public participantForm: UntypedFormGroup;
  public requiredErrorMessage = 'BIDDER.REQUIRED';
  public bidderTypeList: Enumerator[];
  public economicSectorList: Enumerator[];
  public memberCountries: MasterDataCountry[];
  public countries: MasterDataCountry[];
  public allCountries: MasterDataCountry[];
  public allUnfilterCountries: MasterDataCountry[];

  formErrorCollection: FormErrorTranslateKey[] = [];
  public errorKeys: FormErrorTranslateKey[] = [];
  public errorDefinitions = {
    'name-required': 'BIDDER.VALIDATION_ERRORS_NAME',
    'type-required': 'BIDDER.VALIDATION_ERRORS_TYPE',
    'nationality-required': 'BIDDER.VALIDATION_ERRORS_NATIONALITY',
    'x-nullable': 'BIDDER.VALIDATION_ERRORS_JV_#',
    'x-name-required': 'BIDDER.VALIDATION_ERRORS_JV_#_NAME',
    'x-type-required': 'BIDDER.VALIDATION_ERRORS_JV_#_TYPE',
    'x-nationality-required': 'BIDDER.VALIDATION_ERRORS_JV_#_NATIONALITY',
  };

  public participantId: string;
  private bidderId: string;
  private participantProcessId: string;

  // System display two bidders by default
  public jointventureBiddersCounter = 2;

  BidderEnumTypes = BidderTypes;

  public visibleSectionVenture = false;
  public jointVentureBiddersLoading = false;
  public saveDisabled = false;
  public isEnumLoaded = false;
  public isBidderLoading = true;
  submitted = false;
  public hideAditionalFields = true;
  public isReadOnly = false;
  editMode = false;
  public isDetailMode: boolean;
  public isSubmiting: boolean;
  bidderForm: UntypedFormGroup;
  statusProcuperement: number;
  public isProcurementComplete: boolean = false;

  editButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  registerNewBidderButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  addJointVentureButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  cancelButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  saveButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  removeJointVenturePermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  processPlan: BiddingProcessPlan;
  planInSync: boolean;
  loadingPlan: boolean;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly enumStoreSvc: EnumsStoreService,
    private readonly enumStoreMasterDataSvc: EnumsmasterdataStoreService,
    private readonly visibilityService: VisibilityService,
    private readonly validatorSVC: FormValidationService,
    readonly bidderApi: BidderApiService,
    private readonly notificationGlobalService: NotificationGlobalService,
    public readonly translate: TranslateService,
    private readonly participantsStoreSvc: ParticipantsStoreService,
    private readonly participantService: ParticipantsService,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard,
    private readonly biddingProcessPlanStore: BiddingProcessPlanStoreService,
    private readonly preferencesstoreService: PreferencesstoreService
  ) {}

  get bidder(): UntypedFormGroup {
    return this.participantForm.get(
      'participantBidderForm'
    ) as UntypedFormGroup;
  }

  get jointVentures(): UntypedFormArray {
    return this.participantForm.get('jointVentureBidders') as UntypedFormArray;
  }

  ngOnInit(): void {
    this.participantId = this.activatedRoute.snapshot.params.participantId;
    this.participantProcessId = this.activatedRoute.snapshot.params.processId;
    this.bidderId = this.activatedRoute.snapshot.params.bidderId;
    this.getStatusProcurementProcess();
    if (this.participantId) {
      this.isReadOnly = true;
    }
    this.checkInitialForm();
    this.visibilityService.setVisiblityProjectHeader(false);
    this.visibilityService.setVisiblityProcessHeader(false);
    this.populateEnums();
    this.loadingPlan = true;
    this.subscriptionCollection.push(
      this.biddingProcessPlanStore
        .getOrLoadBiddingProcessPlan()
        .pipe(
          filter((data) => data.biddingPlanState.biddingProcessPlan !== null)
        )
        .pipe(map((data) => data.biddingPlanState.biddingProcessPlan))
        .subscribe((data) => {
          this.processPlan = data;
          this.planInSync =
            this.processPlan.status !== BiddingProcessPlanStatus.IN_SYNC;
          this.loadingPlan = false;
        })
    );
  }

  ngOnDestroy(): void {
    this.visibilityService.setVisiblityProcessHeader(true);
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.subscriptionCollection.forEach((el) => {
      el.unsubscribe();
    });
  }

  checkInitialForm(): void {
    this.subscriptionCollection.push(
      this.participantService.getBidderForm$().subscribe((form) => {
        if (form !== null && !this.isReadOnly) {
          this.participantForm = form;
          this.visibleSectionVenture = true;
          this.hideAditionalFields = false;
        } else {
          this.participantForm = this.createForm();
        }
        this.checkSelectedParticipant();
      })
    );
  }

  searchBidderAndLocation(bidderId: string) {
    return this.bidderApi.searchBidderById(bidderId).pipe(
      concatMap((bidderResponse) => {
        return this.bidderApi.searchBidderLocationsById(bidderId).pipe(
          map((locationResponse) => {
            const location = this.checkLocationValue(locationResponse);
            const bidder = bidderResponse.biddingProcessBidder;
            bidder.address = location.address;
            bidder.zipCode = location.zipCode;
            bidder.country = location.country;
            bidderResponse.biddingProcessBidder = bidder;
            return bidderResponse.biddingProcessBidder;
          })
        );
      })
    );
  }

  checkLocationValue(
    location: BiddingProcessBidderLocationResponse
  ): Locations {
    if (location.locations.length > 0) {
      return location.locations[0];
    } else {
      return {
        id: '',
        zipCode: '',
        country: '',
        address: '',
      };
    }
  }

  mapCountryData(data: MasterDataCountryEnum[], lang): MasterDataCountry[] {
    return data.map((data) => {
      return {
        code: data.code,
        id: data.id,
        name: data.name[lang],
        isBeneficiary: data.isBeneficiary,
        isMember: data.isMember,
      };
    });
  }

  populateEnums(): void {
    const enumsObs$ = this.enumStoreSvc.selectEnums();
    const masterDataEnumsObs$ =
      this.enumStoreMasterDataSvc.selectMasterDataEnums();
    const preferenceLangObs$ = this.preferencesstoreService
      .selectPreferences()
      .pipe(map((data) => data.preferences.preferredLanguage));
    this.subscriptionCollection.push(
      combineLatest([
        enumsObs$,
        masterDataEnumsObs$,
        preferenceLangObs$,
      ]).subscribe((data) => {
        const bidderTypesEnum =
          data[0].enumsLoaded[Enums.biddingProcessBidderTypes];
        const economicSectorsEnum =
          data[0].enumsLoaded[Enums.biddingProcessBidderEconomicSectors];
        const countries = data[1].countries.length > 0;
        const lang = data[2];

        this.bidderTypeList = data[0].biddingProcessBidderTypes;
        this.economicSectorList = data[0].biddingProcessBidderEconomicSectors;
        this.memberCountries = this.mapCountryData(
          this.handleMemberCountries(data[1], 'isMember'),
          lang
        );
        this.countries = this.mapCountryData(
          this.handleMemberCountries(data[1], 'isBeneficiary'),
          lang
        );
        this.allUnfilterCountries = this.mapCountryData(
          data[1].countries,
          lang
        );
        this.allCountries = [...this.memberCountries, ...this.countries];
        this.isEnumLoaded = bidderTypesEnum && economicSectorsEnum && countries;
      })
    );
  }

  handleMemberCountries(
    state: EnumsMasterDataState,
    prop: string
  ): MasterDataCountryEnum[] {
    return state.countries.filter((e) => e[prop]);
  }

  populateBidderForm(filteredBidder: Bidder): UntypedFormGroup {
    const formGroupBidder = newBidderRegistrationForm();
    if (filteredBidder) {
      const bidderWithLocations: Bidder = this.checkFormValue(filteredBidder);
      if (filteredBidder.biddersJointVenture.length >= 1) {
        this.visibleSectionVenture = true;
        this.isDetailMode = true;
        this.jointVentureBiddersLoading = true;
        filteredBidder.biddersJointVenture.forEach((el, index, array) => {
          this.searchBidderAndLocation(el).subscribe(
            (bidderResponse: Bidder) => {
              const formControl = newBidderRegistrationForm();
              formControl.setValue(
                this.populateBidderForm(bidderResponse).getRawValue()
              );
              const newBidder = new UntypedFormGroup({
                participantBidderForm: formControl,
              });
              this.jointVentures.push(newBidder);
              if (array.length === index + 1) {
                this.jointVentureBiddersLoading = false;
              }
            }
          );
        });
      }
      formGroupBidder.setValue({
        id: bidderWithLocations.id,
        name: bidderWithLocations.name,
        type: bidderWithLocations.type,
        nationality: bidderWithLocations.nationality,
        legalRepresentative: bidderWithLocations.legalRepresentative,
        economicSector: bidderWithLocations.economicSector,
        beneficiaryOwner: bidderWithLocations.beneficiaryOwner,
        address: bidderWithLocations.address,
        zipCode: bidderWithLocations.zipCode,
        location: bidderWithLocations.country,
      });
      return formGroupBidder;
    } else {
      return formGroupBidder;
    }
  }

  checkFormValue(filteredParticipantValue: Bidder): Bidder {
    if (filteredParticipantValue !== undefined) {
      return filteredParticipantValue;
    } else {
      return null;
    }
  }

  checkSelectedParticipant(): void {
    this.isBidderLoading = true;
    let filteredParticipant: Participant;

    this.subscriptionCollection.push(
      this.participantsStoreSvc
        .getStateByProcess$(this.participantProcessId)
        .subscribe((data) => {
          filteredParticipant = data.participants.find(
            (participant) =>
              participant.biddingProcessParticipantId === this.participantId
          );
          this.isBidderLoading = data.loading;
        })
    );

    if (filteredParticipant) {
      if (filteredParticipant.bidder.type === this.BidderEnumTypes.INDIVIDUAL) {
        this.hideAditionalFields = true;
      } else {
        this.hideAditionalFields = false;
      }
      this.bidder.setValue(
        this.populateBidderForm(filteredParticipant.bidder).value
      );
    } else if (this.bidderId) {
      this.searchBidderAndLocation(this.bidderId)
        .subscribe((bidderResponse) => {
          if (bidderResponse.type === this.BidderEnumTypes.INDIVIDUAL) {
            this.hideAditionalFields = true;
          } else {
            this.hideAditionalFields = false;
          }
          this.bidder.setValue(this.populateBidderForm(bidderResponse).value);
        })
        .add(() => (this.isBidderLoading = false));
    } else {
      this.isBidderLoading = false;
    }
  }

  customLengthBidderValidation(): void {
    if (this.jointVentures.length > 0) {
      this.jointVentures.controls.forEach((control) => {
        if (control instanceof UntypedFormGroup) {
          if (Object.entries(control.controls).length === 0) {
            control.setErrors({ nullable: true });
          } else {
            control.setErrors(null);
          }
        }
      });
    }
  }

  createForm(): UntypedFormGroup {
    const bidder = newBidderRegistrationForm();
    return new UntypedFormGroup({
      participantBidderForm: bidder,
      jointVentureBidders: new UntypedFormArray([]),
    });
  }

  bidderTypeChange(bidderType: number): void {
    if (bidderType === this.BidderEnumTypes.JOINT_VENTURE) {
      this.setDefaultJointVentureBidders();
      this.visibleSectionVenture = true;
    } else {
      this.visibleSectionVenture = false;
      this.deleteJointVentureBidders();
    }
    if (bidderType === this.BidderEnumTypes.INDIVIDUAL) {
      this.hideAditionalFields = true;
      this.bidder.get('legalRepresentative').reset();
      this.bidder.get('economicSector').reset();
      this.bidder.get('beneficiaryOwner').reset();
    } else {
      this.hideAditionalFields = false;
    }
  }

  setDefaultJointVentureBidders(): void {
    for (let i = 0; i < this.jointventureBiddersCounter; i++) {
      this.jointVentures.push(new UntypedFormGroup({}));
    }
  }

  addJointventureBidder(): void {
    this.jointventureBiddersCounter++;
    this.jointVentures.push(new UntypedFormGroup({}));
  }

  deleteJointVentureBidders(): void {
    for (let i = 0; i < this.jointventureBiddersCounter; i++) {
      this.jointVentures.removeAt(0);
    }
    this.jointventureBiddersCounter = 2;
  }

  deleteBidder(index: number): void {
    this.jointventureBiddersCounter--;
    this.jointVentures.removeAt(index);
  }

  removeJointventureBidder(index: number): void {
    this.jointVentures.removeAt(index);
    if (this.jointventureBiddersCounter > 2) {
      this.jointventureBiddersCounter--;
    }
  }

  isFormValid(): boolean {
    this.customLengthBidderValidation();
    if (!this.participantForm.valid) {
      this.participantForm.markAllAsTouched();
      this.formErrorCollection = [];
      this.validatorSVC.errorList = [];
      this.errorKeys = this.validatorSVC.validateFormGroupFields(
        this.participantForm
      );
      this.formErrorCollection = this.validatorSVC.validateForm(
        this.participantForm,
        this.errorDefinitions
      );
      if (this.formErrorCollection.length > 0) {
        document.getElementById('top').scrollIntoView();
      }
      return false;
    }

    this.formErrorCollection = [];
    this.validatorSVC.errorList = [];
    return true;
  }

  updateBidder(): void {
    if (this.isFormValid()) {
      this.bidder.markAsPristine();
      this.saveDisabled = true;
      const formValue = this.bidder.value;
      const bidderRequest: BiddingProcessBidderRequest =
        this.bidderRequest(formValue);

      const isJointVenture =
        Number(formValue.type) === this.BidderEnumTypes.JOINT_VENTURE;

      this.isSubmiting = true;
      this.bidderApi
        .updateBidder(this.bidderId, bidderRequest)
        .pipe(
          mergeMap((response) => {
            if (isJointVenture) {
              const jointVenturesIds = this.jointVentures.value.map(
                (group) => group.participantBidderForm.id
              );
              return this.bidderApi.updateBidderJointVentures(
                this.bidderId,
                jointVenturesIds
              );
            }

            return of(response);
          })
        )
        .subscribe(
          () => {
            this.showRequestSuccess('BIDDER.UPDATE_SUCCESS');
            this.router.navigate(['../../../'], {
              relativeTo: this.activatedRoute,
            });
            this.visibilityService.setVisiblityProcessHeader(true);
          },
          (resp) => {
            if (!!resp && !!resp.error && resp.error.status === 409) {
              this.showRequestError('BIDDER.DUPLICATED_NAME_NACIONALITY_ERROR');
            } else {
              this.showRequestError('BIDDER.UPDATE_ERROR');
            }
          }
        )
        .add(() => (this.isSubmiting = false));
    }
  }

  showRequestError(error = 'BIDDER.SAVE_ERROR'): void {
    const message = this.translate.instant(error);
    this.notificationGlobalService.showError(message, 'right', 'top', 7000);
    this.saveDisabled = false;
  }

  showRequestSuccess(success = 'BIDDER.SAVE_SUCCESS'): void {
    const message = this.translate.instant(success);
    this.notificationGlobalService.showSuccess(message, 'right', 'top', 7000);
  }

  submitBidderForm(): void {
    if (this.isFormValid()) {
      this.bidder.markAsPristine();
      this.saveDisabled = true;
      const formValue = this.bidder.value;
      const bidderRequest: BiddingProcessBidderRequest =
        this.bidderRequest(formValue);
      // check if bidder type === 0 is Joint Venture Bidder
      const isJointVenture =
        Number(formValue.type) === this.BidderEnumTypes.JOINT_VENTURE;

      this.isSubmiting = true;
      this.bidderApi
        .registerBidder(bidderRequest)
        .pipe(
          mergeMap((response) => {
            if (isJointVenture) {
              return this.registerJointVenture(response).pipe(
                map(() => response)
              );
            } else {
              return of(response);
            }
          })
        )
        .subscribe(
          (response) => {
            if (typeof response === 'string') {
              this.showRequestSuccess();
              this.router.navigate(['../'], {
                relativeTo: this.activatedRoute,
              });
              this.visibilityService.setVisiblityProcessHeader(true);
            } else {
              this.showRequestError();
            }
          },
          () => {
            this.showRequestError();
          }
        )
        .add(() => (this.isSubmiting = false));
    }
  }

  registerJointVenture(biddingProcessBidderId: string): Observable<unknown> {
    const jointVentureBiddersArray: string[] = [];
    for (let i = 0; i < this.jointventureBiddersCounter; i++) {
      const bidderForm = this.jointVentures
        .at(i)
        .get('participantBidderForm').value;

      // if joint venture bidder exist add bidder id to biddersOfJointVenture array
      if (bidderForm.id !== '') {
        jointVentureBiddersArray.push(bidderForm.id);
      }
    }
    return this.bidderApi.registerBidderJointVentureBidders(
      biddingProcessBidderId,
      jointVentureBiddersArray
    );
  }

  bidderRequest(bidderFormValue: BidderFormGroup): BiddingProcessBidderRequest {
    let location = null;
    if (
      bidderFormValue.address &&
      bidderFormValue.zipCode &&
      bidderFormValue.location
    ) {
      location = {
        address: bidderFormValue.address,
        zipCode: bidderFormValue.zipCode,
        country: bidderFormValue.location,
      };
    }

    return {
      name: bidderFormValue.name,
      type: Number(bidderFormValue.type),
      nationality: bidderFormValue.nationality,
      legalRepresentative: bidderFormValue.legalRepresentative,
      economicSector: bidderFormValue.economicSector,
      beneficiaryOwner: bidderFormValue.beneficiaryOwner,
      location,
    };
  }

  goBack(): void {
    this.router.navigate(['../'], {
      relativeTo: this.activatedRoute.parent,
    });
  }

  goBackFromDetails(): void {
    this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
  }

  edit(): void {
    this.isReadOnly = false;
    this.editMode = true;
    this.isDetailMode = false;
  }

  onNewJointVenture(): void {
    this.participantService.setBidderForm(this.participantForm);

    this.router.navigate(['./add-joint-venture'], {
      relativeTo: this.activatedRoute,
    });
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.bidder);
  }

  getStatusProcurementProcess(): void {
    this.subscriptionCollection.push(
      this.biddingProcessPlanStore
        .getOrLoadSelectedBiddingProcessById(this.participantProcessId)
        .subscribe((data) => {
          this.statusProcuperement =
            data.selectedBiddingProcessProcurementProcess?.status;
          if (
            this.statusProcuperement ===
            BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE
          ) {
            this.isProcurementComplete = true;
          }
        })
    );
  }
}
