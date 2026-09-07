import {
  Component,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  ChangeDetectorRef,
  AfterViewChecked,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { newParticipantForm } from './participant-form.form';

import { BidderApiService } from '@core/services/apis';
import { EnumsStoreService } from '@core/services/store-services';
import {
  Bidder,
  Participant,
  Enums,
  EvaluationParticipantsResponse,
  Currency,
  ParticipantResponse,
  MasterDataType,
  MasterData,
  MasterDataCountry,
} from '@core/models';
import { ParticipantsService } from './../../services/participants.service';
import { ParticipantMenuOptionsEnum } from '@core/enums/menu-options.enum';

import { Subscription } from 'rxjs';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { EvaluationParticipantsConfig, PermissionEnum } from '@core/enums';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { ParticipantConfig } from '../../models/participant-config.model';
import { TitleCasePipe } from '@angular/common';
import { EnumsmasterdataStoreService } from '@core/services/store-services/enumsMasterData/enumsmasterdata-store.service';
import { ParticipantsResult } from '@core/enums/participants-result.enum';

@Component({
  selector: 'fi-participant',
  templateUrl: './participant.component.html',
  providers: [TitleCasePipe],
})
export class ParticipantComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewChecked
{
  @Input() participantIndex: number;
  @Input() participant: ParticipantResponse;
  @Input() participanstsList: Participant[];
  @Input() readonly: boolean;
  @Input() currencyList: Currency[];
  @Input() allCountries: MasterDataCountry[];
  @Input() set configValues(config: EvaluationParticipantsResponse) {
    this.optionsResult = config.availableResults;
    if (this.resultOptionsList && this.resultOptionsList.length >= 1) {
      this.resultOptionsListAvailable = this.resultOptionsList.filter(
        (objeto) => this.optionsResult.find((or) => objeto.id === or.id)
      );
    }
    this.setFieldsConfig(config);
  }

  @Output() stopEditing = new EventEmitter<boolean>();
  @Output() addedParticipant = new EventEmitter<{
    participant: Participant;
    form: any;
  }>();
  @Output() participantOption = new EventEmitter<unknown>();
  @Output() isRowDisabled = new EventEmitter();

  @Output() participantConfig = new EventEmitter<ParticipantConfig>();

  @Output() formEmmiter = new EventEmitter<Object>();

  @Output() selectedValue = new EventEmitter<Object>();

  public participantsSuggestionList: Array<Bidder> = [];
  private readonly subscriptions = new Subscription();
  public isParticipant = false;
  public disabledFields = true;
  public participantForm: UntypedFormGroup = newParticipantForm();
  public resultOptionsList: MasterData[];
  public isloading: boolean;
  public searchText = 0;
  public enum = Enums;
  public isFilled = false;
  public disableBidderSearch: boolean;
  option = EvaluationParticipantsConfig;
  public showTechScore = true;
  public showFinancialScore = true;
  public showOverallScore = true;
  public showAwardedAmount = true;
  public removeOption = ['PARTICIPANT.REMOVE'];
  isAmountRequired: boolean;
  numberOfDecimals = 2;
  public resultOptionsListAvailable: MasterData[];
  optionsResult: MasterData[] = [];
  public DEFAULT_CURRENCY = 'USD';
  rejectedReasons: number[];
  memberCountries: MasterDataCountry[];
  beneficiaryCountries: MasterDataCountry[];
  loadedCountries = false;

  saveButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  addBidderButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  rejectedReasonsVisibility: boolean;
  justificationEligibilityVisibility: boolean;

  justificationOptions = [];

  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    readonly enumStoreSvc: EnumsStoreService,
    private readonly enumMasterDataStoreSvc: EnumsmasterdataStoreService,
    private readonly bidderApi: BidderApiService,
    private readonly changeDectector: ChangeDetectorRef,
    private readonly permissionSvc: PermissionService,
    private readonly participantSvc: ParticipantsService,
    private readonly titlecasePipe: TitleCasePipe
  ) {}

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'startsWith',
  };

  get bidder() {
    return this.participantForm.get('bidder') as UntypedFormControl;
  }

  get wTechScore() {
    return this.participantForm.get('weighedTechScore') as UntypedFormControl;
  }

  get wFinancialScore() {
    return this.participantForm.get(
      'weighedFinancialScore'
    ) as UntypedFormControl;
  }

  get participantAmount() {
    return this.participantForm.get('participantAmount') as UntypedFormControl;
  }

  get participantResult() {
    return this.participantForm.get('result') as UntypedFormControl;
  }

  get wTotalScore() {
    return this.participantForm.get('totalScore') as UntypedFormControl;
  }

  get justificationEligibility() {
    return this.participantForm.get(
      'justificationEligibility'
    ) as UntypedFormControl;
  }

  get rejectedReason() {
    return this.participantForm.get('rejectedReasons') as UntypedFormControl;
  }

  get participantNationality() {
    return this.participantForm.get('nationality') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.populateResultEnums();
    this.populateResultMasterData();
    this.calculateTotalScore();

    const sub = this.participantForm.valueChanges.subscribe(() => {
      const form = this.participantForm;
      const index = this.participantIndex;
      const newParticipant = this.handleBiddingParticipantObject();

      return this.formEmmiter.emit({ form, newParticipant, index });
    });
    this.subscriptions.add(sub);
    this.validateResult();
    this.validateNationalityJustification();
    this.validateJustification();
  }

  validateResult(): void {
    this.subscriptions.add(
      this.participantResult.valueChanges.subscribe((result) => {
        this.resultChange(result);
      })
    );
  }

  validateNationalityJustification(): void {
    this.subscriptions.add(
      this.bidder.valueChanges.subscribe((data) => {
        if (this.validateBidder(data)) {
          if (
            !this.allCountries.find((c) => c.id === data.nationality).isMember
          ) {
            this.justificationEligibilityVisibility = true;
          }
        }
      })
    );
  }

  validateBidder(bidder: any): boolean {
    return bidder !== undefined && bidder !== null && bidder?.searchName !== '';
  }

  validateJustification(): void {
    this.subscriptions.add(
      this.bidder.valueChanges.subscribe((data) => {
        const nationality = this.allCountries.find(
          (c) => c.id === data?.nationality
        );
        if (this.validateBidder(data) && nationality && !nationality.isMember) {
          this.justificationEligibility.setValidators([Validators.required]);
        } else {
          this.justificationEligibility.clearValidators();
        }
        this.justificationEligibility.updateValueAndValidity();
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readonly'] && this.readonly) {
      setTimeout(() => {
        this.participantForm.disable();
      }, 500);
    }
    if (this.participant && this.allCountries.length > 0) {
      this.fillParticipant({ ...this.participant });
      if (this.bidder.value.searchName !== '') {
        this.disableBidderSearch = true;
        this.isFilled = true;
        this.rejectedReasons = this.participant.rejectedReasons.map(
          (rr) => rr.id
        );
      } else {
        this.disableBidderSearch = false;
        this.checkPermissionSearchField();
      }
    }
  }

  ngAfterViewChecked(): void {
    this.changeDectector.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setFieldsConfig(config: EvaluationParticipantsResponse): void {
    if (config) {
      const technicalScoreConfig = this.checkConfig(config.technicalScore);
      this.wTechScore.setValidators(technicalScoreConfig.validators);
      this.showTechScore = technicalScoreConfig.showField;

      const financialScoreConfig = this.checkConfig(config.financialScore);
      this.wFinancialScore.setValidators(financialScoreConfig.validators);
      this.showFinancialScore = financialScoreConfig.showField;

      const overallScoreConfig = this.checkConfig(config.overallScore);
      this.wTotalScore.setValidators([
        ...overallScoreConfig.validators,
        Validators.max(100),
      ]);
      this.showOverallScore = overallScoreConfig.showField;

      const awardedAmountConfig = this.checkConfig(config.awardedAmount);
      if (awardedAmountConfig.validators.length !== 0) {
        this.participantAmount.setValidators([
          ...awardedAmountConfig.validators,
          this.participantAmountValidator,
        ]);
      }

      if (config.awardedAmount === EvaluationParticipantsConfig.Required) {
        this.isAmountRequired = true;
      }

      this.showAwardedAmount = awardedAmountConfig.showField;
      this.participantForm.reset();

      this.participantConfig.emit(config);
    }
  }

  participantAmountValidator(control: AbstractControl) {
    const participantAmount = control.value;
    if (!participantAmount || !participantAmount.amount) {
      return {
        participantAmountRequired: true,
      };
    }

    return null;
  }

  checkConfig(config: EvaluationParticipantsConfig) {
    let validators = [];
    let showField = false;
    switch (config) {
      case this.option.NotApplicable:
        {
          validators = [];
          showField = false;
        }
        break;
      case this.option.Optional:
        {
          validators = [];
          showField = true;
        }
        break;
      case this.option.Required:
        {
          validators = [Validators.required];
          showField = true;
        }
        break;
    }
    return { validators, showField };
  }

  handleBiddingParticipantObject(newCurrency = null): ParticipantResponse {
    const rawValue = this.participantForm.getRawValue();

    return {
      biddingProcessBidderId: this.participant.biddingProcessBidderId,
      biddingProcessParticipantId: this.participant.biddingProcessParticipantId,
      weighedTechScore: rawValue.weighedTechScore,
      weighedFinancialScore: rawValue.weighedFinancialScore,
      totalScore: rawValue.totalScore,
      amount: rawValue.participantAmount?.amount,
      currency: newCurrency ?? rawValue.currency,
      result: rawValue.result,
      biddingContractAwarded: this.participant.biddingContractAwarded,
      biddingProcessDocumentAwarded:
        this.participant.biddingProcessDocumentAwarded,
      amountUsd: rawValue.amountUsd,
      allowToEdit: this.participant.allowToEdit,
      justificationEligibility: '',
      bidder: rawValue.bidder,
      options: this.participant.options,
    };
  }

  onCurrencyChange(newCurrency: string) {
    const index = this.participantIndex;
    const newValue = this.handleBiddingParticipantObject(newCurrency);

    this.selectedValue.emit({ newValue, newCurrency, index });
  }

  selectionChange(selection: Bidder): void {
    if (selection !== undefined) {
      this.bidder.setValue(selection);
      this.participantNationality.setValue(selection.nationality);
      this.participant = this.participantForm.getRawValue();
      this.participant.allowToEdit = true;
      this.disabledFields = false;
      this.checkPermissionFields();
      this.isFilled = true;
      this.fillParticipant({ ...this.participant });
      this.validateJustificationEligibility(selection);
    } else {
      this.participantForm.reset();
      this.rejectedReasonsVisibility = false;
      this.justificationEligibilityVisibility = false;
      this.disabledFields = true;
      this.isFilled = false;
    }
  }

  validateJustificationEligibility(bidder: Bidder): void {
    this.justificationEligibilityVisibility = !this.allCountries.find(
      (c) => c.id === bidder.nationality
    ).isMember;
  }

  checkPermissionFields() {
    const aviablePermissons: PermissionEnum[] = [
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    ];
    const hasPermission = this.permissionSvc
      .getPermissions()
      .some((permission) => aviablePermissons.includes(permission));
    if (!this.disabledFields && !hasPermission) {
      this.disabledFields = true;
      this.participantAmount.disable();
    }
  }

  checkPermissionSearchField() {
    const aviablePermissons: PermissionEnum[] = [
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    ];
    const hasPermission = this.permissionSvc
      .getPermissions()
      .some((permission) => aviablePermissons.includes(permission));
    if (!this.disableBidderSearch && !hasPermission) {
      this.disableBidderSearch = true;
    }
  }

  filterChangeSearchBidder(filter: string): void {
    this.searchText = filter.length;
    if (filter.length >= 3) {
      this.isloading = true;
      this.bidderApi
        .searchBidderByName(filter)
        .subscribe((bidders) => {
          const filteredBidder: Bidder[] = bidders.biddingProcessBidders;
          filteredBidder.forEach((bidder) => {
            const nationality = this.allCountries.find(
              (c) => c.id === bidder.nationality
            )?.name;
            const titleCaseNationality =
              this.titlecasePipe.transform(nationality);
            bidder.searchName =
              bidder.name && `${bidder.name} / ${titleCaseNationality}`;
          });
          const nonRepeteadBidders = filteredBidder.filter(
            (b) => !this.participanstsList.some((p) => p?.bidder?.id === b.id)
          );
          this.participantsSuggestionList = nonRepeteadBidders;
        })
        .add(() => (this.isloading = false));
    }
  }

  fillParticipant(participant: ParticipantResponse): void {
    const defaultCurrency =
      (this.participanstsList && this.participanstsList[0]?.currency) ??
      this.DEFAULT_CURRENCY;
    if (participant) {
      const inputCurrencyData: any = {
        amount: participant.amount === undefined ? null : participant.amount,
        currency: {
          currency: participant?.currency ?? defaultCurrency,
          isHard: true,
          isBorrowing: false,
          numberOfDecimals: this.numberOfDecimals,
        },
      };

      participant.bidder = { ...participant.bidder };
      participant.bidder.searchName = participant.bidder.name
        ? participant.bidder.name
        : '';
      this.participantsSuggestionList.push(participant.bidder);

      const titleCaseNationality = this.titlecasePipe.transform(
        this.allCountries?.find((c) => c.id === participant.bidder.nationality)
          ?.name
      );
      this.participantNationality.setValue(titleCaseNationality);

      this.wTechScore.setValue(participant.weighedTechScore);
      this.wFinancialScore.setValue(participant.weighedFinancialScore);
      this.wTotalScore.setValue(participant.totalScore);
      this.participantAmount.setValue(inputCurrencyData);
      this.participantResult.setValue(participant.result?.id);
      this.bidder.setValue(participant.bidder);
      this.participantForm.get('amountUsd').setValue(participant.amountUsd);
      this.participantForm
        .get('justificationEligibility')
        .setValue(
          participant.justificationEligibility
            ? participant.justificationEligibility
            : ''
        );
      this.rejectedReason.setValue(
        participant.rejectedReasons?.map((rr) => rr.id)
      );
      this.isParticipant = this.participantForm.value.bidder !== null;
      this.disabledFields = !this.isParticipant;
      this.checkPermissionFields();
    }

    this.participantForm.markAsPristine();
  }

  handleCurrencyStatus(): boolean {
    const currencyIdx = this.participantIndex;
    if (currencyIdx === 0) {
      return false;
    }
    return true;
  }

  calculateTotalScore(): void {
    const subWTech = this.wTechScore.valueChanges.subscribe((val) => {
      this.setTotalScore(
        !!val ? Number(val) : 0,
        !!this.wFinancialScore.value ? Number(this.wFinancialScore.value) : 0
      );
    });

    const subWFinancial = this.wFinancialScore.valueChanges.subscribe((val) => {
      this.setTotalScore(
        !!this.wTechScore.value ? Number(this.wTechScore.value) : 0,
        !!val ? Number(val) : 0
      );
    });

    this.subscriptions.add(subWTech);
    this.subscriptions.add(subWFinancial);
  }

  setTotalScore(techScore: number, financialScore: number): void {
    const sum = techScore + financialScore;
    this.wTotalScore.setValue(sum);
  }

  fixDecimals(formValue) {
    const fixToTwoDecimals = (value?: number): number =>
      Number(value?.toFixed(2));

    return {
      ...formValue,
      weighedTechScore: fixToTwoDecimals(formValue.weighedTechScore),
      weighedFinancialScore: fixToTwoDecimals(formValue.weighedFinancialScore),
      totalScore: fixToTwoDecimals(formValue.totalScore),
    };
  }

  saveParticipant(): void {
    this.addedParticipant.emit({
      participant: this.participant,
      form: this.fixDecimals(this.participantForm.getRawValue()),
    });
  }

  populateResultEnums(): void {
    this.subscriptions.add(
      this.enumMasterDataStoreSvc
        .getStoreMasterDataByEnum(MasterDataType.ParticipantResult)
        .subscribe((data) => {
          this.resultOptionsList = data;
          this.resultOptionsListAvailable = this.resultOptionsList.filter((e) =>
            this.optionsResult.find((op) => op.id === e.id)
          );
        })
    );
  }

  populateResultMasterData(): void {
    this.subscriptions.add(
      this.enumMasterDataStoreSvc
        .getStoreMasterDataByEnum(MasterDataType.ParticipantRejectedReason)
        .subscribe((data) => {
          this.justificationOptions = data;
        })
    );
  }

  itemOption(action: ParticipantMenuOptionsEnum): void {
    this.participantOption.emit({
      index: this.participantIndex,
      participant: this.participant,
      action,
    });
  }

  removeRow(): void {
    this.isRowDisabled.emit();
  }

  onNewParticipant(): void {
    this.participantSvc.setBidderForm(null);
    this.router.navigate(['add-bidder'], {
      state: { data: this.participant },
      relativeTo: this.activeRoute,
    });
  }

  blur(): void {
    this.isloading = true;
    this.searchText = 0;
  }

  getOptionsByPermission(
    opts: ParticipantMenuOptionsEnum[]
  ): ParticipantMenuOptionsEnum[] {
    let options = [...opts];

    if (
      !this.permissionSvc.hasPermission(
        PermissionEnum.VIEW_PROCUREMENT_INFORMATION
      ) &&
      !this.permissionSvc.hasPermission(
        PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
      )
    ) {
      options = options.filter((opt) => opt !== ParticipantMenuOptionsEnum.SEE);
    }

    if (
      !this.permissionSvc.hasPermission(
        PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
      )
    ) {
      options = options.filter(
        (opt) => opt !== ParticipantMenuOptionsEnum.REMOVE
      );
    }

    return options;
  }

  justificationChange(event): void {
    this.participantForm
      .get('justification')
      .patchValue(event.map((c) => c.id));
  }

  rejectedReasonValid(): boolean {
    const { invalid, dirty, touched } =
      this.participantForm.controls.rejectedReasons;
    return invalid && (dirty || touched);
  }

  resultChange(event: number): void {
    const rejectedReasonsControl = this.rejectedReason;
    this.rejectedReasonsVisibility = event === ParticipantsResult.REJECTED;

    rejectedReasonsControl.setValidators(
      this.rejectedReasonsVisibility ? [Validators.required] : null
    );
    rejectedReasonsControl.updateValueAndValidity();
  }
}
