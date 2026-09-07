import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  OnChanges,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { combineLatest, map, Subscription } from 'rxjs';
import {
  Bidder,
  Enumerator,
  Enums,
  MasterDataCountry,
  MasterDataCountryEnum,
} from '@core/models';
import { BidderValidationService } from '@core/services/validation';
import { VisibilityService } from '@core/services/view';
import { newBidderRegistrationForm } from '../bidder-registration-form/bidder-registration-form.form';
import { EnumsStoreService } from '@core/services/store-services';
import { BidderTypes, PermissionEnum } from '@core/enums';
import { ActivatedRoute } from '@angular/router';
import { EnumsmasterdataStoreService } from '@core/services/store-services/enumsMasterData/enumsmasterdata-store.service';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import { EnumsMasterDataState } from '@core/store';

@Component({
  selector: 'fi-joint-venture-bidder',
  templateUrl: './joint-venture-bidder.component.html',
})
export class JointVentureBidderComponent
  implements OnDestroy, OnChanges, OnInit
{
  @Input() searchPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeJointVenturePermission: PermissionEnum[] = [
    PermissionEnum.SPECIAL,
  ];
  @Input() jointventureBidderIndex: number;
  @Input() bidderForm = new UntypedFormGroup({});
  @Input() requiredErrorMessage = 'BIDDER.REQUIRED';
  @Input() isDetailMode: boolean;

  @Output() bidder: EventEmitter<any> = new EventEmitter();
  @Output() deleteJointBidder: EventEmitter<number> = new EventEmitter();
  @Output() onNewJointVenture: EventEmitter<boolean> = new EventEmitter();

  public bidderTypeList: Enumerator[];
  public economicSectorList: Enumerator[];
  public subscriptionCollection: Subscription[] = [];
  public memberCountries: MasterDataCountry[];
  public countries: MasterDataCountry[];
  public allCountries: MasterDataCountry[];
  public allUnfilterCountries: MasterDataCountry[];

  BidderEnumTypes = BidderTypes;

  public isEnumLoaded: boolean;
  public expanded = false;
  public hideAditionalFields = true;
  public isReadOnly = true;
  loading = false;

  constructor(
    readonly bidderValidationSvc: BidderValidationService,
    readonly enumStoreSvc: EnumsStoreService,
    readonly visibilityService: VisibilityService,
    readonly activateRoute: ActivatedRoute,
    private readonly enumStoreMasterDataSvc: EnumsmasterdataStoreService,
    private readonly preferencesstoreService: PreferencesstoreService
  ) {}

  get participantBidderForm() {
    if (this.bidderForm.get('participantBidderForm') !== null) {
      return this.bidderForm.get('participantBidderForm') as UntypedFormGroup;
    } else {
      return newBidderRegistrationForm();
    }
  }

  ngOnInit(): void {
    this.populateEnums();
  }

  ngOnChanges(): void {
    if (Object.entries(this.bidderForm.value).length > 0) {
      this.expanded = true;
      if (
        this.participantBidderForm.get('type').value ===
        this.BidderEnumTypes.INDIVIDUAL
      ) {
        this.hideAditionalFields = true;
      } else {
        this.hideAditionalFields = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  unsubscribeAll(): void {
    this.subscriptionCollection.forEach((el) => {
      el.unsubscribe();
    });
  }

  toogleExpanded(): void {
    this.expanded = !this.expanded;
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

  selectionChange(selection: Bidder): void {
    this.loading = true;

    if (selection?.type === this.BidderEnumTypes.INDIVIDUAL) {
      this.hideAditionalFields = true;
    } else {
      this.hideAditionalFields = false;
    }

    if (selection !== undefined) {
      setTimeout(() => {
        this.expanded = true;
        this.bidderForm.addControl(
          'participantBidderForm',
          newBidderRegistrationForm()
        );
        const { ...newSelection } = { ...selection };
        this.participantBidderForm.setValue({
          id: newSelection.id,
          name: newSelection.name,
          type: newSelection.type,
          nationality: newSelection.nationality,
          legalRepresentative: newSelection.legalRepresentative,
          economicSector: newSelection.economicSector,
          beneficiaryOwner: newSelection.beneficiaryOwner,
          address: newSelection.address ? newSelection.address : '',
          zipCode: newSelection.zipCode ? newSelection.zipCode : '',
          location: newSelection.country ? newSelection.country : '',
        });
        this.loading = false;
      }, 0);
    } else {
      this.bidderForm.removeControl('participantBidderForm');
    }
  }

  onNewBidder(): void {
    this.onNewJointVenture.emit(true);
  }

  bidderTypeChange(bidderType: number): void {
    if (bidderType === this.BidderEnumTypes.INDIVIDUAL) {
      this.hideAditionalFields = true;
      this.bidderForm
        .get('participantBidderForm')
        .get('legalRepresentative')
        .reset();
      this.bidderForm
        .get('participantBidderForm')
        .get('economicSector')
        .reset();
      this.bidderForm
        .get('participantBidderForm')
        .get('beneficiaryOwner')
        .reset();
    } else {
      this.hideAditionalFields = false;
    }
  }

  deleteJointVentureBidder(index: number): void {
    this.deleteJointBidder.emit(index);
  }
}
