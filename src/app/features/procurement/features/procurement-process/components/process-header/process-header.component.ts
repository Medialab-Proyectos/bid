import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import {
  BiddingProcessProcurementProcessDetail,
  Enumerator,
  Enums,
  KeyValue,
  KeyValueInput,
} from '@core/models';
import { EnumsStoreService } from '@core/services/store-services';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { ProcurementProcessFormService } from '../../services/procurement-process-form.service';
import { createProcurementForm } from '../procurement-form/procurement.form';
import { createProcessOutputs } from '../../procurement-process.form';
import {
  FormConfig,
  ModeOfProcurementForm,
} from '../../models/form-config.model';
import { Store } from '@ngrx/store';
import { AppStateWithProcurementProcessHeader } from '@core/store/procurement-process-header/reducers/procurementProcessHeader.reducer';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { removeRequired } from '@core/utils';
import { EnumState } from '@core/store';

@Component({
  selector: 'fi-process-header',
  templateUrl: './process-header.component.html',
})
export class ProcessHeaderComponent implements OnInit, OnDestroy {
  CLASS = 'c-procurement-form';

  @Input() biddingProcessId: string;
  allProcessData: BiddingProcessProcurementProcessDetail;
  private readonly subscription = new Subscription();
  public taskTypes: Enumerator[];
  isLoading = true;

  form: UntypedFormGroup = createProcurementForm();
  outputsAsigned: UntypedFormArray = new UntypedFormArray([]);
  public selectedOutputs$: Observable<any>;

  isEnumLoaded = false;

  procurementMethods$: Observable<Array<KeyValue>>;
  supervisionMethods$: Observable<Array<KeyValue>>;

  public attributeCountry: KeyValueInput;
  public attributeCategory: KeyValueInput;
  public attributeProcurementMethod: KeyValueInput;
  public attributeSupervisionMethod: KeyValueInput;
  milestonesCode: Enumerator[];

  justificationVisibility: boolean;
  goodsReferenceVisibility: boolean;

  formConfig: FormConfig = {
    commentsSection: {
      isDisabled: false,
    },
    costDistributionSection: {
      isDisabled: false,
    },
    outputsSection: {
      isDisabled: false,
    },
    milestoneSection: {
      isActualDateDisabled: false,
      isActualDateVisible: false,
      isEstimatedDateDisabled: false,
      isEstimatedDateVisible: false,
      isReEstimatedDateDisabled: false,
      isReEstimatedDateVisible: false,
      disabledRestimatedDates: [],
    },
    mode: ModeOfProcurementForm.READ,
  };
  focusComments = false;

  constructor(
    private readonly enumStoreSvc: EnumsStoreService,
    private readonly biddingProcessFormSvc: ProcurementProcessFormService,
    private readonly store: Store<AppStateWithProcurementProcessHeader>
  ) {}

  ngOnInit(): void {
    this.setAttributeCountry();
    this.populateForm();
    this.subscription.add(
      this.store
        .select('procurementProcessHeader')
        .subscribe((FocusComments) => {
          this.focusComments = FocusComments.FocusComments;
        })
    );
  }

  setAttributeCountry(): void {
    this.subscription.add(
      this.biddingProcessFormSvc.projectStoreSvc
        .selectedProject()
        .subscribe((data) => {
          if (data.selectedProject) {
            this.attributeCountry = {
              key: 'countryCode',
              value: data.selectedProject.countryCode,
            };
          }
        })
    );
  }

  /**
   * Preloads all necessary information by chaining multiple asynchronous operations.
   *
   * The information includes:
   * - Loading all enums required for the screen.
   * - Loading procurement process details.
   * - Initializing dropdowns and other UI elements.
   * - Preparing the necessary parameters to make requests to the settings endpoint.
   *
   * @returns {Observable<any>} An observable that emits the final processed data after all steps are completed.
   */
  preloadAllInfo() {
    return this.enumStoreSvc.selectEnums().pipe(
      filter((data) => this.areEnumsLoaded(data)),
      switchMap((data) => this.asignEnumData(data)),
      switchMap(() => this.loadProcurementProcessDetail()),
      tap((data) => {
        this.isLoading = true;
        this.allProcessData = data;
        this.initDropdowns(data);
      }),
      switchMap((processData) => this.loadAllFormData(processData))
    );
  }

  private areEnumsLoaded(data: EnumState): boolean {
    const requiredEnums = [
      Enums.biddingProcessProcurementProcessCategories,
      Enums.biddingProcessProcurementProcessSupervisionMethods,
      Enums.biddingProcessProcurementProcessProcurementMethods,
      Enums.projectTaskTypes,
      Enums.commentVisibilities,
      Enums.biddingProcessMilestoneCodes,
      Enums.biddingProcessProcurementProcessGoodsReferences,
    ];

    return requiredEnums.every((enumKey) => data.enumsLoaded[enumKey]);
  }

  private asignEnumData(data: EnumState): Observable<EnumState> {
    this.taskTypes = data.projectTaskTypes;
    this.milestonesCode = data.biddingProcessMilestoneCodes;
    this.isEnumLoaded = true;
    return of(data);
  }

  private loadProcurementProcessDetail(): Observable<BiddingProcessProcurementProcessDetail> {
    return this.biddingProcessFormSvc.getProcurementProcessDetail(
      this.biddingProcessId
    );
  }

  /**
   * Loads all necessary form data for the bidding process, including procurement methods,
   * supervision methods, available outputs, and field visibility settings.
   *
   * @param processData - The detailed information of the bidding process.
   * @returns An Observable containing an object with processData, procurement methods,
   *          supervision methods, available outputs, and field visibility settings.
   */
  private loadAllFormData(
    processData: BiddingProcessProcurementProcessDetail
  ): Observable<{
    processData: BiddingProcessProcurementProcessDetail;
    procurementMethods: KeyValue[];
    supervisionMethods: KeyValue[];
    availableOutputs: { name: string; id: string }[];
    fieldsVisibility: {
      justificationVisibility: boolean;
      goodsReferenceVisibility: boolean;
    };
  }> {
    return forkJoin({
      procurementMethods: this.getProcurementMethods(),
      supervisionMethods: this.getSupervisionMethods(),
      availableOutputs: this.biddingProcessFormSvc.getAvailableOutputs(
        processData.outputs.componentId,
        this.taskTypes
      ),
      fieldsVisibility: this.biddingProcessFormSvc.getFieldsVisibility(
        this.attributeCountry,
        this.attributeCategory,
        this.attributeProcurementMethod,
        this.attributeSupervisionMethod,
        this.allProcessData,
        this.form
      ),
    }).pipe(
      map((results) => ({
        processData,
        ...results,
      }))
    );
  }

  populateForm(): void {
    this.subscription.add(
      this.preloadAllInfo()
        .pipe(take(1))
        .subscribe({
          next: (data) => {
            this.justificationVisibility =
              data.fieldsVisibility.justificationVisibility;
            this.goodsReferenceVisibility =
              data.fieldsVisibility.goodsReferenceVisibility;
            this.procurementMethods$ = of(data.procurementMethods);
            this.supervisionMethods$ = of(data.supervisionMethods);
            this.selectedOutputs$ = of(data.availableOutputs);
            this.biddingProcessFormSvc.fillForm(
              this.form,
              data.processData,
              this.milestonesCode
            );
            removeRequired(`.${this.CLASS} .fi-kendo-label--required`);
          },
          error: () => {},
          complete: () => {
            this.isLoading = false;

            if (this.focusComments) {
              this.focusCommentsSection();
            }
          },
        })
    );
  }

  focusCommentsSection(): void {
    setTimeout(() => {
      document.getElementById('commentsSection').scrollIntoView();
    }, 1500);
  }

  initDropdowns(data: BiddingProcessProcurementProcessDetail): void {
    this.attributeCategory = {
      key: 'category',
      value: data.process.category.name,
    };
    this.attributeProcurementMethod = {
      key: 'procurementMethod',
      value: data.process.procurementMethod.name,
    };
    this.attributeSupervisionMethod = {
      key: 'supervisionMethod',
      value: data.process.supervisionMethod.name,
    };
  }

  getProcurementMethods(): Observable<KeyValue[]> {
    const differentiatorParameter: KeyValueInput = {
      key: 'onlyMethods',
      value: 1,
    };
    return this.biddingProcessFormSvc.queryProcurementMethods(
      this.attributeCountry,
      this.attributeCategory,
      differentiatorParameter
    );
  }

  getSupervisionMethods(): Observable<KeyValue[]> {
    return this.biddingProcessFormSvc.querySupervisionMethods(
      this.attributeCountry,
      this.attributeCategory,
      this.attributeProcurementMethod
    );
  }

  getOutputs(
    data: BiddingProcessProcurementProcessDetail,
    onInit: boolean
  ): void {
    if (onInit) {
      data.outputs.outputs.forEach((data) => {
        const Output = createProcessOutputs();
        Output.setValue({
          id: data.ouputId,
          percentage: data.percentageAssigned,
        });
        this.outputsAsigned.push(Output);
      });
    }
    this.selectedOutputs$ = this.biddingProcessFormSvc.getAvailableOutputs(
      data.outputs.componentId,
      this.taskTypes
    );
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
