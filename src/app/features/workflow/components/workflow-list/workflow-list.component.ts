import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { WorkflowStep } from '@fiduciary-interface/app/features/workflow/models/workflow.model';
import { BehaviorSubject, from, Observable, Subscription } from 'rxjs';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Institution } from '@fiduciary-interface/app/features/workflow/models/workflow-institution.model';
import { FormatSettings } from '@progress/kendo-angular-dateinputs';
import {
  CancelEvent,
  GridComponent,
  SaveEvent,
} from '@progress/kendo-angular-grid';
import { AssignedUser } from '@fiduciary-interface/app/features/workflow/models/assigned-user.model';
import {
  ODWorkflowSteps,
  WorkflowRowAction,
} from '@fiduciary-interface/app/features/workflow/enums';
import {
  DialogReturn,
  ModalService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { DialogResponse, Enumerator, Enums, ModalOptions } from '@core/models';
import { OnlineDisburmentWorkflowStepsEnum, PermissionEnum } from '@core/enums';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowStoreService } from '../../store/services/workflow-store.service';
import { MultiSelectComponent } from '@progress/kendo-angular-dropdowns';
import { delay, filter, map, switchMap, tap } from 'rxjs/operators';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { WorkflowODApiService } from '../../services';
import { PermissionService } from '@core/services/app/permission/permission.service';
import {
  Transaction,
  TransactionGetResponse,
} from '@fiduciary-interface/app/features/transactions/models';
import { SelectedProjectState } from '@core/store';
import { ProjectStoreService } from '@core/services/store-services';
import {
  FiTransactionsApiService,
  TransactionsFormService,
} from '@fiduciary-interface/app/features/transactions/services';

enum TypeActionStep {
  ADD = 'add',
  REMOVE = 'remove',
}

@Component({
  selector: 'fi-workflow-list',
  templateUrl: './workflow-list.component.html',
  providers: [DatePipe],
})
export class WorkflowListComponent implements OnChanges, OnDestroy {
  private readonly subscriptionList: Subscription = new Subscription();
  oldGridView: WorkflowStep[] = [];
  private oldActionsList: Enumerator[] = [];
  public gridView: BehaviorSubject<WorkflowStep[]> = new BehaviorSubject([]);
  public mySelection: string[] = [];
  public editedRowIndex: number;
  public formGroup: UntypedFormGroup;
  public actionList: Enumerator[] = [];
  public assignedUsers: AssignedUser[] = [];
  public oldAssignedUsers: AssignedUser[] = [];
  public isNewStep = false;
  public onEditForm = false;
  public datePickerFormat: FormatSettings = {
    displayFormat: 'dd/MM/yyyy',
    inputFormat: 'dd/MM/yyyy',
  };
  public prefix = 'ENUM';
  public workflowsStepsLoading = true;
  public canEdit: PermissionEnum[] = [PermissionEnum.WORKFLOW_MANAGEMENT];
  private FINAL_AUTHORIZE = 'Pending Final Authorize';

  transactions: Transaction[] = [];
  projectBucketId: string;
  isFinalAuthorize: boolean = false;

  @ViewChild('multiselect') set multiselect(_multi: MultiSelectComponent) {
    const contains = (value) => (s) =>
      s.userName.toLowerCase().indexOf(value.toLowerCase()) !== -1;

    _multi?.filterChange
      .asObservable()
      .pipe(
        switchMap((value) =>
          from([this.assignedUsers]).pipe(
            tap(() => (_multi.loading = true)),
            delay(500),
            map((data) => {
              return value.length === 0
                ? this.oldAssignedUsers
                : data.filter(contains(value));
            })
          )
        )
      )
      .subscribe((x) => {
        this.assignedUsers = x;
        _multi.loading = false;
      });
  }
  @ViewChild(GridComponent) kendoGrid: GridComponent;
  @Output() onSaveData: EventEmitter<any> = new EventEmitter();
  @Output('onSelectInstitution') selectInstitution: EventEmitter<any> =
    new EventEmitter();
  @Input() set data(value: WorkflowStep[]) {
    this.oldGridView = value;
    this.gridView.next(this.handleWorkflowStepOrder(this.oldGridView));
  }
  @Input('actionList') set actions(value: any[]) {
    this.actionList = [...value];
    this.oldActionsList = [...value];
  }
  @Input('assignedUsers') set users(value: any[]) {
    this.assignedUsers = [...value];
    this.oldAssignedUsers = [...value];
  }
  @Input() institutionList: Institution[] = [];
  @Input() isLoading = false;
  @Input() disableButtons = false;
  @Input() disableButtonSave = true;
  @Input() isUsersLoading = false;

  enum = Enums;

  private readonly MAX_NUMBER_OF_STEPS = 5;
  public menuItems: WorkflowRowAction[] = [
    WorkflowRowAction.EDIT,
    WorkflowRowAction.DELETE,
  ];
  public disableButtonWhenSaved = false;
  public checkEditActivate = true;
  public disableIfNotWorkflowActive = false;
  public errorToast = false;
  @Output() formEmmiter = new EventEmitter<UntypedFormGroup>();

  constructor(
    readonly notificationGlobalService: NotificationGlobalService,
    readonly workflowStoreService: WorkflowStoreService,
    readonly workflowService: WorkflowODApiService,
    readonly permissionService: PermissionService,
    readonly translate: TranslateService,
    readonly modalService: ModalService,
    private readonly ifdatePipe: IFDatePipe,
    readonly projectStoreSvc: ProjectStoreService,
    readonly fiTransactionsApiService: FiTransactionsApiService,
    readonly transactionsFormService: TransactionsFormService
  ) {
    this.workflowActive();
    this.processSelectedProject();
  }

  ngOnDestroy(): void {
    this.subscriptionList.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.oldGridView = changes.data.currentValue;
    }
  }

  valueChange(): void {
    this.assignedUsers = this.oldAssignedUsers;
  }

  public onDateStateChange($event: any): void {
    console.log($event);
  }

  public onEditHandler($event: any): void {
    console.log($event);
  }

  public onCancelHandler({ sender, rowIndex }: CancelEvent): void {
    this.closeEditor(sender, rowIndex);

    if (this.isNewStep) {
      const currentData = [...(sender.data['data'] as any[])];
      currentData.splice(rowIndex, 1);
      this.gridView.next(currentData);
    }

    this.isNewStep = false;
  }

  public onSaveHandler({
    sender,
    rowIndex,
    formGroup,
    dataItem,
  }: SaveEvent): void {
    const newValues = formGroup.value as WorkflowStep;
    const newItem = { ...dataItem, ...newValues };
    const currentData = [...(sender.data['data'] as WorkflowStep[])];
    currentData[rowIndex] = newItem;
    this.gridView.next(currentData);
    sender.closeRow(rowIndex);
    this.isNewStep = false;
  }

  public onRemoveHandler($event: any): void {
    console.log($event);
  }

  public onAddHandler(): void {
    if (this.isNewStep) {
      return;
    }

    this.isNewStep = true;
    this.closeEditor(this.kendoGrid);
    this.setWorkflowSteps();
    this.disableButtons = true;

    const lenght = [...(this.kendoGrid.data['data'] as any[])].length;
    const newItem: WorkflowStep = {
      id: null,
      step: null,
      institutionCode: null,
      assignedUsers: null,
      lastUpdate: null,
      taskDescription: null,
      order: lenght,
    };

    this.formGroup = this.createFormGroup(newItem);
    let currentData = [...(this.kendoGrid.data['data'] as any[])];
    currentData.splice(-1, 0, newItem);
    const newRowIndex = currentData.length - 2;
    this.gridView.next(currentData);
    this.kendoGrid.editRow(newRowIndex, this.formGroup);
    this.editedRowIndex = newRowIndex;
    this.disableButtonSave = false;

    const sub = this.formGroup.valueChanges.subscribe(() =>
      this.formEmmiter.emit(this.formGroup)
    );
    this.subscriptionList.add(sub);
  }

  private setWorkflowSteps(): void {
    const currentData = [...(this.kendoGrid.data['data'] as WorkflowStep[])];
    this.actionList = this.oldActionsList.filter(
      (o) => !currentData.some((c) => c.step === o.id)
    );
  }

  closeEditor(grid: GridComponent, rowIndex = this.editedRowIndex): void {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  workflowActive(): void {
    this.workflowService.getWorkflowActive().subscribe((data) => {
      this.disableIfNotWorkflowActive = data?.workflowsActive?.length !== 0;
    });
  }

  createFormGroup(dataItem: WorkflowStep): UntypedFormGroup {
    return new UntypedFormGroup({
      id: new UntypedFormControl(dataItem?.id),
      step: new UntypedFormControl(
        { value: dataItem?.step, disabled: dataItem.isMandatory },
        Validators.required
      ),
      institutionCode: new UntypedFormControl(
        dataItem?.institutionCode,
        Validators.required
      ),
      assignedUsers: new UntypedFormControl(
        dataItem?.assignedUsers,
        Validators.required
      ),
      taskDescription: new UntypedFormControl(dataItem?.taskDescription ?? ''),
      lastUpdate: new UntypedFormControl({
        value: dataItem?.lastUpdate || this.ifdatePipe.transform(new Date()),
        disabled: true,
      }),
    });
  }

  public onSelectItem($event): void {
    console.log($event);
  }

  public handleMenuOptions(
    dataItem: WorkflowStep,
    disableIfNotWorkflowActive = false
  ): WorkflowRowAction[] {
    if (
      dataItem.step === ODWorkflowSteps.ENTER_AND_SUBMIT ||
      dataItem.step === ODWorkflowSteps.FINAL_AUTHORIZE ||
      disableIfNotWorkflowActive === true
    ) {
      return this.menuItems.filter((o) => o !== WorkflowRowAction.DELETE);
    }
    return this.menuItems;
  }

  public onOpenMenu(
    menuOption: WorkflowRowAction,
    dataItem: WorkflowStep,
    rowIndex: number
  ): void {
    this.closeEditor(this.kendoGrid);
    switch (menuOption) {
      case WorkflowRowAction.EDIT:
        this.disableButtonWhenSaved = false;
        this.onEditRow(dataItem, rowIndex);
        break;
      case WorkflowRowAction.DELETE:
        if (!dataItem.isMandatory) {
          this.disableButtonWhenSaved = false;
          this.onDeleteRow(rowIndex);
        }
        break;
      default:
        break;
    }
  }

  public onSave(rowIndex: number): void {
    const oldLenth = this.oldGridView.length;
    const actualLength = this.kendoGrid.data['data'].length;
    if (!this.onEditForm) {
      this.oldGridView = this.addItem(
        rowIndex,
        this.oldGridView,
        this.formGroup.value
      );
    }

    if (this.oldGridView[rowIndex].id === null) {
      if (oldLenth !== actualLength) {
        this.oldGridView = this.updateOrderParameter(
          this.oldGridView,
          rowIndex,
          TypeActionStep.ADD
        );
      }
    }
    this.formGroup.value.lastUpdate = new Date();

    if (
      !this.formGroup.value.order &&
      this.oldGridView[rowIndex].step !==
        OnlineDisburmentWorkflowStepsEnum.EnterAndSubmit &&
      this.oldGridView[rowIndex].step !==
        OnlineDisburmentWorkflowStepsEnum.FinalAuthorize
    ) {
      this.formGroup.value.order = rowIndex + 1;
    }

    if (
      this.oldGridView[rowIndex].step ===
        OnlineDisburmentWorkflowStepsEnum.EnterAndSubmit ||
      this.oldGridView[rowIndex].step ===
        OnlineDisburmentWorkflowStepsEnum.FinalAuthorize
    ) {
      if (!this.formGroup.value.step) {
        this.formGroup.value.step = this.oldGridView[rowIndex].step;
      }
      if (!this.formGroup.value.isMandatory) {
        this.formGroup.value.isMandatory =
          this.oldGridView[rowIndex].isMandatory;
      }
    }

    if (
      this.onEditForm &&
      this.shallowEqual(this.oldGridView[rowIndex], this.formGroup.value)
    ) {
      this.disableButtonSave = false;
      this.oldGridView.splice(rowIndex, 1, {
        ...this.formGroup.value,
        order: this.oldGridView[rowIndex].order,
      });
    }

    this.errorToast = false;
    this.disableButtonWhenSaved = true;
    this.gridView.next([...this.oldGridView]);
  }

  shallowEqual(
    oldWorkFlowStep: WorkflowStep,
    newWorkFlowStep: WorkflowStep
  ): boolean {
    if (oldWorkFlowStep.step !== newWorkFlowStep.step) {
      return true;
    }
    if (oldWorkFlowStep.institutionCode !== newWorkFlowStep.institutionCode) {
      return true;
    }
    if (oldWorkFlowStep.taskDescription !== newWorkFlowStep.taskDescription) {
      return true;
    }
    if (
      oldWorkFlowStep.assignedUsers.length !==
      newWorkFlowStep.assignedUsers.length
    ) {
      return true;
    } else {
      for (
        let index = 0;
        index < oldWorkFlowStep.assignedUsers.length;
        index++
      ) {
        const element = Object.keys(oldWorkFlowStep.assignedUsers[index]);
        for (const key of element) {
          if (
            oldWorkFlowStep.assignedUsers[index][key] !==
            newWorkFlowStep.assignedUsers[index][key]
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public onSaveWorkflow(): void {
    if (this.isNewStep) {
      return;
    }

    if (this.isValid()) {
      this.onSaveData.emit(this.kendoGrid.data['data']);
      this.disableButtonWhenSaved = true;
      this.disableButtonSave = true;
    } else {
      this.showErrorToast('TRANSACTION.WORKFLOWCONFIGURATION.UPDATE.INVALID');
    }
  }

  isValid(): boolean {
    const currentData = [...this.kendoGrid.data['data']] as WorkflowStep[];
    const mandatoryRequired = 2;
    let totalMandatory = 0;

    currentData.forEach((item) => {
      if (
        (item.assignedUsers && item.assignedUsers.length === 0) ||
        item.institutionCode === null ||
        item.institutionCode === ''
      ) {
        return false;
      }
      if (item.isMandatory) {
        totalMandatory += 1;
      }
    });

    if (totalMandatory < mandatoryRequired) {
      return false;
    }

    return true;
  }

  public onCancelWorkflow(): void {
    this.closeEditor(this.kendoGrid, this.editedRowIndex);
    this.disableButtonWhenSaved = true;

    this.disableButtonSave = true;
    this.subscriptionList.add(
      this.workflowStoreService.getWorkflow().subscribe((data) => {
        this.oldGridView = [...data.workflowSteps];
        this.gridView.next(
          this.handleWorkflowStepOrder([...data.workflowSteps])
        );
        this.isNewStep = false;
      })
    );
  }

  public onSelectInstitution(institutionCode: string): void {
    if (this.checkEditActivate === false) {
      this.assignedUsers = [];
      this.formGroup.get('assignedUsers').setValue([]);
    }
    this.selectInstitution.emit(institutionCode);
    this.checkEditActivate = false;
  }

  deleteRowModal(): Observable<DialogReturn> {
    return this.modalService.open(
      'TRANSACTION.WORKFLOW.MODAL.DELETE.TITLE',
      [
        { text: 'TRANSACTION.MODAL.OPTION.NO' },
        {
          text: 'TRANSACTION.MODAL.OPTION.YES',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'TRANSACTION.WORKFLOW.MODAL.DELETE.CONTENT',
          bold: false,
        },
      ]
    );
  }

  onDeleteRow(rowIndex: number): void {
    this.deleteRowModal().subscribe((data: DialogResponse) => {
      if (data.result === ModalOptions.ACCEPT) {
        this.deleteRow(rowIndex);
      }
    });
  }

  deleteRow(rowIndex: number): void {
    this.disableButtonSave = false;
    this.oldGridView = this.updateOrderParameter(
      this.oldGridView,
      rowIndex,
      TypeActionStep.REMOVE
    );
    this.oldGridView.splice(rowIndex, 1);
    this.gridView.next(this.handleWorkflowStepOrder([...this.oldGridView]));
  }

  updateOrderParameter(
    gridData: WorkflowStep[],
    index: number,
    actionType: TypeActionStep
  ): WorkflowStep[] {
    return gridData.map((g: WorkflowStep, i: number) => {
      let order;
      if (actionType === TypeActionStep.REMOVE) {
        if (i > index) {
          order = g.order - 1;
          return { ...g, order };
        } else {
          return g;
        }
      } else {
        if (i >= index + 1) {
          order = g.order + 1;
          return { ...g, order };
        } else {
          return g;
        }
      }
    });
  }

  onEditRow(dataItem: WorkflowStep, rowIndex: number): void {
    this.onEditForm = true;
    this.disableButtons = true;
    this.formGroup = this.createFormGroup(dataItem);
    this.editedRowIndex = rowIndex;
    this.checkEditActivate = true;
    this.formGroup.controls.lastUpdate.setValue(
      this.ifdatePipe.transform(dataItem.lastUpdate)
    );
    this.kendoGrid.editRow(rowIndex, this.formGroup);
    const currentAction = this.oldActionsList.find(
      (o) => o.id === dataItem.step
    );

    if (currentAction !== undefined) {
      const existCurrentAction = this.actionList.some(
        (i) => i.id === currentAction.id
      );
      if (!existCurrentAction) {
        this.actionList.push(currentAction);
      }
    }

    if (this.actionList.length < this.MAX_NUMBER_OF_STEPS) {
      this.actionList = [...this.oldActionsList];
    }

    this.oldGridView.forEach((item) => {
      if (item.step !== currentAction.id) {
        const position = this.actionList.findIndex(
          (action) => action.id === item.step
        );
        this.actionList.splice(position, 1);
      }
    });

    this.onSelectInstitution(dataItem.institutionCode);

    const sub = this.formGroup.valueChanges.subscribe(() =>
      this.formEmmiter.emit(this.formGroup)
    );
    this.subscriptionList.add(sub);
  }

  handleWorkflowStepOrder(dataItems: WorkflowStep[]): WorkflowStep[] {
    return dataItems.sort((a, b) => a.order - b.order);
  }

  showErrorToast(literal: string): void {
    const message = this.translate.instant(literal);
    this.notificationGlobalService.showError(message);
  }

  addItem(rowIndex, arr, newItem): WorkflowStep[] {
    arr.splice(rowIndex, 0, newItem);
    return arr;
  }

  get hideCreateStepsButton(): boolean {
    return this.gridView.value?.length >= this.MAX_NUMBER_OF_STEPS;
  }

  processSelectedProject(): void {
    const sub = this.projectStoreSvc
      .selectedProject()
      .pipe(
        filter((res: SelectedProjectState) => res.selectedProject !== null),
        switchMap((res: SelectedProjectState) => {
          this.projectBucketId = res.selectedProject.projectBucketId;
          return this.fiTransactionsApiService
            .getProjectTransactions(res.selectedProject.projectBucketId)
            .pipe(map((data: TransactionGetResponse) => data.transactions));
        })
      )
      .subscribe({
        next: (transaction) => {
          this.transactions = transaction;
          this.isLoading = false;
        },
        error: () => {
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.ERRORS.LIST'
          );
          this.isLoading = false;
        },
      });
    this.isFinalAuthorize = this.transactions.some((data) => {
      if (data.status === this.FINAL_AUTHORIZE) {
        return (this.isFinalAuthorize = true);
      }
    });
    this.subscriptionList.add(sub);
  }
}
