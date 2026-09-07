import { computed, inject, Injectable, signal } from '@angular/core';
import {
  BonusPostModel,
  Contract,
  ContractDocumentState,
  ContractPaymentScheduleResponse,
  ContractPostModel,
  ContractResponse,
  CostDistributionDetailPostModel,
  CostDistributionPostModel,
  DamagesPostModel,
  ExecutionOfWorksPostModel,
  FeesPostModel,
  GeneralInformationPostModel,
  GuaranteesPostModel,
  LotsPostModel,
} from '../rebrand-form/models';
import { FormType } from '@core/utils';
import {
  BiddingProcessProcurementProcess,
  Enumerator,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import { BehaviorSubject } from 'rxjs';
import { PaymentScheduleMode } from '../components/r-contracts-payment-schedule/r-contracts-payment-schedule.component';
import { TranslateService } from '@ngx-translate/core';
import { BiddingContractDocumentGroupCode } from '@core/enums';

const GROUP_CONFIGURATION = [
  {
    groupCode: BiddingContractDocumentGroupCode.OTHER,
    isUnique: false,
    descriptionRequired: true,
  },
  {
    groupCode: BiddingContractDocumentGroupCode.SIGNED_CONTRACT,
    isUnique: true,
    descriptionRequired: false,
  },
];

export interface ContractPreloadedData {
  paymentSchedule: ContractPaymentScheduleResponse[];
  contractData: ContractResponse;
  documents: FiduciaryProcessDocumentGroup[];
}

@Injectable({
  providedIn: 'root',
})
export class ContractRebrandService {
  private readonly translate = inject(TranslateService);
  private isSubmittedSubject = new BehaviorSubject<boolean>(false);
  public isFormSubmitted$ = this.isSubmittedSubject.asObservable();

  private contractSignDateSubject = new BehaviorSubject<string>(null);
  public contractSignDate$ = this.contractSignDateSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  private contractGroups = signal<FiduciaryProcessDocumentGroup[]>([]);
  public readonly contractGroupsSignal = this.contractGroups.asReadonly();

  private contractPreloadedData = signal<ContractPreloadedData>(null);
  public readonly contractPreloadedDataSignal =
    this.contractPreloadedData.asReadonly();

  private paymentScheduleMode = signal<PaymentScheduleMode | null>(null);
  public readonly paymentScheduleModeSignal =
    this.paymentScheduleMode.asReadonly();

  contractJustUpdated = signal<boolean>(false);
  public readonly contractJustUpdatedSignal =
    this.contractJustUpdated.asReadonly();

  private paymentScheduleFileUploadedSignal = signal<boolean>(false);
  public readonly paymentScheduleFileUploadedSignalReadonly =
    this.paymentScheduleFileUploadedSignal.asReadonly();

  _documentState = signal<ContractDocumentState>({
    pendingDocs: [],
    persistedDocs: [],
    availableTypes: [],
    groupsWDocuments: [],
    groupEnum: [],
    loading: false,
  });

  setContractJustUpdated(value: boolean) {
    this.contractJustUpdated.set(value);
  }

  setPaymentScheduleFileUploaded(value: boolean) {
    this.paymentScheduleFileUploadedSignal.set(value);
  }

  setPaymentScheduleMode(mode: PaymentScheduleMode | null) {
    this.paymentScheduleMode.set(mode);
  }

  setPreloadedData(data: ContractPreloadedData) {
    this.contractPreloadedData.set(data);
  }

  updateContractData(data: ContractResponse) {
    this.contractPreloadedData.update((current) => ({
      ...current,
      contractData: data,
    }));
  }

  updatePaymentSchedule(data: ContractPaymentScheduleResponse[]) {
    this.contractPreloadedData.update((current) => ({
      ...current,
      paymentSchedule: data,
    }));
  }

  updateDocumentGroups(data: FiduciaryProcessDocumentGroup[]) {
    this.contractPreloadedData.update((current) => ({
      ...current,
      documents: data,
    }));
  }

  setContractGroups(groups: FiduciaryProcessDocumentGroup[]) {
    this.contractGroups.set(groups);
  }

  setSignDate(date: string) {
    this.contractSignDateSubject.next(date);
  }

  isSubmitted(isSubmitted: boolean) {
    this.isSubmittedSubject.next(isSubmitted);
  }

  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  mapFormToMakeRequest(
    procurementProcess: BiddingProcessProcurementProcess,
    contract: FormType<Contract>
  ): ContractPostModel {
    return {
      procurementProcess: procurementProcess?.id,
      processParticipant:
        contract.controls.participants.controls.selectedParticipantId.getRawValue(),
      generalInformation: this.mapGeneralInformation(contract),
      costDistributions: this.mapCostDistribution(contract),
      lots: this.mapLots(contract),
      fees: this.mapFees(contract),
      executionOfWorks: this.mapExecutionWorks(contract),
      additionalInformation: {
        liquidationOfDamage: this.mapDamages(contract),
        guarantees: this.mapGuarantees(contract),
        bonus: this.mapBonus(contract),
      },
    };
  }

  private mapFees(contract: FormType<Contract>): FeesPostModel[] {
    const controls = contract.controls.fees.controls.fees.getRawValue();
    return controls.map((fee, index) => ({
      concept: fee.concept,
      currency: fee.currency,
      hours: fee.hours,
      usdEquivalent: fee.subtotal,
      order: index + 1,
    }));
  }

  private mapGeneralInformation(
    contract: FormType<Contract>
  ): GeneralInformationPostModel {
    const controls = contract.controls.generalInfo.controls;

    return {
      name: controls.contractName.getRawValue(),
      objective: controls.contractObjective.getRawValue(),
      signatureDate: controls.signatureDate.getRawValue(),
      startDate: controls.startDate.getRawValue(),
      endDate: controls.endDate.getRawValue(),
      internalControlNumber: controls.internalControlNumber.getRawValue(),
      contractType: controls.contractType.getRawValue(),
      hasAdvancedPayment: controls.hasAdvancePayment.getRawValue(),
      conflictResolutionMethod: controls.conflictResolutionMethod.getRawValue(),
      applicableLaw: controls.applicableLaw.getRawValue(),
      goodsOrigins: controls?.goodsSource?.getRawValue() ?? [],
      justification: controls?.justification?.getRawValue() ?? '',
      conflictResolutionJustification:
        controls?.conflictResolutionJustification?.getRawValue() ?? null,
    };
  }

  private mapCostDistribution(
    contract: FormType<Contract>
  ): CostDistributionPostModel[] {
    const currencies =
      contract.controls.costDistribution.controls.currencies.getRawValue();
    const result: CostDistributionPostModel[] = [];
    currencies.forEach((cd) => {
      cd.componentsArray.forEach((c) => {
        result.push({
          currency: cd.currency,
          componentId: c.component,
          costDistributionDetails: this.mapCostDistributionDetails(
            c.products,
            cd.equivalentUsd,
            cd.equivalentUsdApproval,
            cd.numberOfDecimal
          ),
        });
      });
    });

    return result;
  }

  roundToNumber(number: number, equivalent: number, decimals: number): number {
    return Number((number / equivalent).toFixed(decimals));
  }

  private mapCostDistributionDetails(
    products: any[],
    equivalentUsd: number,
    equivalentUsdApproval: number,
    decimals: number
  ): CostDistributionDetailPostModel[] {
    return products.map((p) => ({
      productId: p.output,
      idbTotal: p.bidAmount,
      lcTotal: p.localCounterPartAmount,
      cfTotal: p.cofinancingAmount,
      idbUsdEquivalent: this.roundToNumber(
        p.bidAmount,
        equivalentUsd,
        decimals
      ),
      lcUsdEquivalent: this.roundToNumber(
        p.localCounterPartAmount,
        equivalentUsd,
        decimals
      ),
      cfUsdEquivalent: this.roundToNumber(
        p.cofinancingAmount,
        equivalentUsd,
        decimals
      ),
      idbEquivalentCurrency: this.roundToNumber(
        p.bidAmount,
        equivalentUsdApproval,
        decimals
      ),
      lcEquivalentCurrency: this.roundToNumber(
        p.localCounterPartAmount,
        equivalentUsdApproval,
        decimals
      ),
      cfEquivalentCurrency: this.roundToNumber(
        p.cofinancingAmount,
        equivalentUsdApproval,
        decimals
      ),
    }));
  }

  private mapDamages(contract: FormType<Contract>): DamagesPostModel | null {
    const damagesControl =
      contract.controls.additionalInformation?.controls.damages.controls[0]
        ?.controls;

    if (!damagesControl) return null;

    return {
      liquidationOfDamageTypeId:
        damagesControl.liquidatedDamageType.getRawValue(),
      maximumPercentage: damagesControl.maximumPercentage.getRawValue(),
      paymentFrequencyTypeId: damagesControl.paymentFrequencyType.getRawValue(),
      percentage: damagesControl.percentage.getRawValue(),
    };
  }

  private mapBonus(contract: FormType<Contract>): BonusPostModel | null {
    const bonusControl =
      contract.controls.additionalInformation?.controls.bonus.controls[0]
        ?.controls;

    if (!bonusControl) return null;

    return {
      bonusTypeId: bonusControl.paymentFrequencyType.getRawValue(),
      maximumPercentage: bonusControl.maximumPercentage.getRawValue(),
      paymentFrequencyTypeId: bonusControl.paymentFrequencyType.getRawValue(),
      percentage: bonusControl.percentage.getRawValue(),
    };
  }

  private mapGuarantees(contract: FormType<Contract>): GuaranteesPostModel[] {
    const guarantees =
      contract.controls.additionalInformation.controls.guarantees.getRawValue();

    return guarantees.map((g) => ({
      guaranteeTypeId: g.guaranteeType,
      currency: g.currency,
      amount: g.amount,
      usdEquivalentAmount: g.usdEquivalentAmount,
      issueDate: g.startDate,
      endDate: g.endDate,
    }));
  }

  private mapExecutionWorks(
    contract: FormType<Contract>
  ): ExecutionOfWorksPostModel[] {
    const locations =
      contract.controls.executionPlace.controls.locations.getRawValue();

    return locations.map((loc) => ({
      address: loc.address,
      postalCode: loc.zipCode,
      countryCode: loc.country,
      locality: loc.locality,
    }));
  }

  private mapLots(contract: FormType<Contract>): LotsPostModel[] {
    const lots = contract.controls.lots.controls.lots.getRawValue();

    return lots.map((lot) => ({
      lotNumber: lot.name,
      unit: lot.unit,
      currency: lot.currency,
      amount: lot.amount,
    }));
  }

  initializeDocumentState(
    groupEnum: Enumerator[],
    groupsWDocuments: FiduciaryProcessDocumentGroup[]
  ) {
    this._documentState.update((state) => ({
      ...state,
      groupEnum,
      groupsWDocuments,
      persistedDocs: groupsWDocuments.reduce(
        (acc: FiduciaryProcessDocument[], group) => {
          return acc.concat(group.fiduciaryProcessDocuments);
        },
        []
      ),
    }));
  }

  updatePendingDocs(files: FiduciaryProcessDocument[]) {
    this._documentState.update((state) => ({
      ...state,
      pendingDocs: [...state.pendingDocs, ...files],
    }));
  }

  removePendingDocument(documentName: string) {
    this._documentState.update((state) => ({
      ...state,
      pendingDocs: state.pendingDocs.filter((d) => d.name !== documentName),
    }));
  }

  removeDocumentFromState(documentId: string) {
    this._documentState.update((state) => ({
      ...state,
      persistedDocs: state.persistedDocs.filter((d) => d.id !== documentId),
      groupsWDocuments: state.groupsWDocuments.map((group) => ({
        ...group,
        fiduciaryProcessDocuments: group.fiduciaryProcessDocuments.filter(
          (d) => d.id !== documentId
        ),
      })),
    }));
  }

  getGroup(event: FiduciaryProcessDocument) {
    return this._documentState().groupsWDocuments.find(
      (g) => g.groupCode === event.groupCode
    );
  }

  setLoadingState(isLoading: boolean) {
    this._documentState.update((state) => ({
      ...state,
      loading: isLoading,
    }));
  }

  updateDocOnSelectChange(
    isNewFile: boolean,
    event: FiduciaryProcessDocument,
    updatedDoc,
    uploadResponse,
    previousId: string
  ) {
    this._documentState.update((state) =>
      isNewFile
        ? this.handleNewFileUpload(state, event.name, updatedDoc)
        : this.handleFileEdit(
            state,
            uploadResponse.documentId,
            updatedDoc,
            previousId
          )
    );
  }

  documentAlreadyExists(fileList) {
    return fileList
      .map((d) => d.name)
      .some((item) =>
        [
          ...this._documentState().pendingDocs,
          ...this._documentState().persistedDocs,
        ]
          .map((d) => d.name)
          .includes(item)
      );
  }

  private handleNewFileUpload(
    state: ContractDocumentState,
    fileName: string,
    newDoc: FiduciaryProcessDocument
  ): ContractDocumentState {
    return {
      ...state,
      pendingDocs: state.pendingDocs.filter((doc) => doc.name !== fileName),
      persistedDocs: [...state.persistedDocs, newDoc],
      groupsWDocuments: state.groupsWDocuments.map((group) =>
        group.groupCode === newDoc.groupCode
          ? {
              ...group,
              fiduciaryProcessDocuments: [
                ...group.fiduciaryProcessDocuments,
                newDoc,
              ],
            }
          : group
      ),
    };
  }

  private handleFileEdit(
    state: ContractDocumentState,
    documentId: string,
    updatedDoc: FiduciaryProcessDocument,
    previousId: string
  ): ContractDocumentState {
    const idsToRemove = new Set([previousId, documentId]);

    return {
      ...state,
      persistedDocs: [
        ...state.persistedDocs.filter((d) => !idsToRemove.has(d.id)),
        updatedDoc,
      ],
      groupsWDocuments: state.groupsWDocuments.map((group) => {
        const filteredDocs = group.fiduciaryProcessDocuments.filter(
          (d) => !idsToRemove.has(d.id)
        );

        return group.groupCode === updatedDoc.groupCode
          ? {
              ...group,
              fiduciaryProcessDocuments: [...filteredDocs, updatedDoc],
            }
          : {
              ...group,
              fiduciaryProcessDocuments: filteredDocs,
            };
      }),
    };
  }

  getError(): string {
    const { pendingDocs, groupsWDocuments } = this._documentState();

    if (pendingDocs.length > 0) {
      return this.translate.instant('R.CONTRACTS.DOCUMENTS.PENDING_DOCS');
    }

    const mandatoryGroup = groupsWDocuments.find((g) => g.isMandatory);

    if (
      !mandatoryGroup ||
      mandatoryGroup.fiduciaryProcessDocuments.length === 0
    ) {
      return this.translate.instant(
        'R.CONTRACTS.DOCUMENTS.MANDATORY_DOCS_REQUIRED'
      );
    }

    return '';
  }

  isValidOperation(
    state: ContractDocumentState,
    group: FiduciaryProcessDocumentGroup,
    isEditingDescription: boolean,
    doc?: FiduciaryProcessDocument
  ): boolean {
    const config = GROUP_CONFIGURATION.find(
      (g) => g.groupCode === group.groupCode
    );
    if (!config) return true;
    if (config.isUnique) {
      const interestGroup = state.groupsWDocuments.find(
        (g) => g.groupCode === group.groupCode
      );
      const docsOfGroup = interestGroup?.fiduciaryProcessDocuments || [];

      if (docsOfGroup.length > 0) {
        if (isEditingDescription) {
          return true;
        }
        return false;
      }
    }
    if (config.descriptionRequired && doc) {
      return !!doc.description?.trim();
    }
    return true;
  }

  updateState(
    isNewFile: boolean,
    event: FiduciaryProcessDocument,
    isEditingDescription: boolean
  ) {
    this._documentState.update((state) => ({
      ...state,
      pendingDocs: isNewFile
        ? state.pendingDocs.map((d) =>
            d.name === event.name ? { ...d, groupCode: null } : d
          )
        : state.pendingDocs,
      persistedDocs: !isNewFile
        ? state.persistedDocs.map((d) =>
            d.id === event.id
              ? {
                  ...d,
                  groupCode: isEditingDescription
                    ? d.groupCode
                    : event.previousGroupCode,
                }
              : d
          )
        : state.persistedDocs,
    }));
  }

  public allDocuments = computed(() => [
    ...this._documentState().pendingDocs,
    ...this._documentState().persistedDocs,
  ]);

  public groupEnums = computed(() => this._documentState().groupEnum);

  public isLoading = computed(() => this._documentState().loading);

  public mandatoryDocs = computed(() =>
    this._documentState().groupsWDocuments?.filter((g) => g.isMandatory)
  );

  public optionalDocs = computed(() =>
    this._documentState().groupsWDocuments?.filter((g) => !g.isMandatory)
  );

  public canProceed = computed(
    () =>
      this._documentState().pendingDocs.length === 0 &&
      this._documentState().groupsWDocuments.filter((g) => g.isMandatory)[0]
        ?.fiduciaryProcessDocuments.length >= 1
  );
}
