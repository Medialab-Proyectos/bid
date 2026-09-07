import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import {
  BidderFormGroup,
  BiddingProcessBidderRequest,
  Enumerator,
  Enums,
  MasterDataCountry,
  MasterDataCountryEnum,
} from '@core/models';
import { EnumsStoreService } from '@core/services/store-services';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { BidderTypes, PermissionEnum } from '@core/enums';
import { newBidderRegistrationForm } from '../../components/bidder-registration-form/bidder-registration-form.form';
import { VisibilityService } from '@core/services/view';
import { ActivatedRoute, Router } from '@angular/router';
import { FormValidationService } from '@core/services/validation';
import { BidderApiService } from '@core/services/apis';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { EnumsmasterdataStoreService } from '@core/services/store-services/enumsMasterData/enumsmasterdata-store.service';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import { EnumsMasterDataState } from '@core/store';

@Component({
  selector: 'fi-new-joint-venture',
  templateUrl: './new-joint-venture.component.html',
})
export class NewJointVentureComponent implements OnInit, OnDestroy {
  public participantForm: UntypedFormGroup;
  public requiredErrorMessage = 'BIDDER.REQUIRED';
  public bidderTypeList: Enumerator[];
  public economicSectorList: Enumerator[];
  public subscriptionCollection: Subscription[] = [];
  public memberCountries: MasterDataCountry[];
  public countries: MasterDataCountry[];
  public allCountries: MasterDataCountry[];
  public allUnfilterCountries: MasterDataCountry[];

  public formErrorCollection: FormErrorTranslateKey[] = [];
  public errorKeys: FormErrorTranslateKey[] = [];
  public errorDefinitions = {
    'name-required': 'BIDDER.VALIDATION_ERRORS_NAME',
    'type-required': 'BIDDER.VALIDATION_ERRORS_TYPE',
    'nationality-required': 'BIDDER.VALIDATION_ERRORS_NATIONALITY',
  };
  BidderEnumTypes = BidderTypes;

  public isEnumLoaded = false;
  public saveDisabled = false;
  public isSubmiting: boolean;

  viewNewJointVenturePermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  cancelButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  saveButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  constructor(
    public readonly translate: TranslateService,
    private readonly visibilityService: VisibilityService,
    private readonly enumStoreSvc: EnumsStoreService,
    private readonly validatorSVC: FormValidationService,
    readonly bidderApi: BidderApiService,
    readonly notificationGlobalService: NotificationGlobalService,
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard,
    private readonly enumStoreMasterDataSvc: EnumsmasterdataStoreService,
    private readonly preferencesstoreService: PreferencesstoreService
  ) {}

  ngOnInit(): void {
    this.visibilityService.setVisiblityProjectHeader(false);
    this.visibilityService.setVisiblityProcessHeader(false);
    this.populateEnums();
    this.participantForm = this.createForm();
  }

  get bidder(): UntypedFormGroup {
    return this.participantForm.get(
      'participantBidderForm'
    ) as UntypedFormGroup;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.subscriptionCollection.forEach((el) => {
      el.unsubscribe();
    });
  }

  createForm(): UntypedFormGroup {
    const bidder = newBidderRegistrationForm();
    return new UntypedFormGroup({
      participantBidderForm: bidder,
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

        this.bidderTypeList = data[0].biddingProcessBidderTypes.filter(
          (t) => t.id === 1 || t.id === 3
        );
        this.economicSectorList = data[0].biddingProcessBidderEconomicSectors;
        this.memberCountries = this.mapCountryData(
          this.handleMemberCountries(data[1], 'isMember'),
          lang
        );
        this.countries = this.mapCountryData(
          this.handleMemberCountries(data[1], 'isBeneficiary'),
          lang
        );
        this.allCountries = [...this.memberCountries, ...this.countries];
        this.allUnfilterCountries = this.mapCountryData(
          data[1].countries,
          lang
        );
        this.isEnumLoaded = bidderTypesEnum && economicSectorsEnum && countries;
      })
    );
  }

  mapCountryData(
    data: MasterDataCountryEnum[],
    lang: string
  ): MasterDataCountry[] {
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

  handleMemberCountries(
    state: EnumsMasterDataState,
    prop: string
  ): MasterDataCountryEnum[] {
    return state.countries.filter((e) => e[prop]);
  }

  isFormValid(): boolean {
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

  submitBidder(): void {
    if (this.isFormValid()) {
      this.saveDisabled = true;
      this.isSubmiting = true;
      const formValue = this.bidder.value;
      const bidderRequest: BiddingProcessBidderRequest =
        this.bidderRequest(formValue);

      this.bidder.markAsPristine();
      this.bidderApi
        .registerBidder(bidderRequest)
        .subscribe(
          (response) => {
            if (typeof response === 'string') {
              this.showRequestSuccess();
              this.router.navigate(['..'], {
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

  showRequestError(error = 'BIDDER.SAVE_ERROR'): void {
    const message = this.translate.instant(error);
    this.notificationGlobalService.showError(message, 'right', 'top', 7000);
    this.saveDisabled = false;
  }

  showRequestSuccess(success = 'BIDDER.SAVE_SUCCESS'): void {
    const message = this.translate.instant(success);
    this.notificationGlobalService.showSuccess(message, 'right', 'top', 7000);
  }

  goBack(): void {
    this.router.navigate(['..'], {
      relativeTo: this.activatedRoute,
    });
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.participantForm);
  }
}
