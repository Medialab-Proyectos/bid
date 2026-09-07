import { Injectable } from '@angular/core';
import { PermissionActions } from '@core/enums';
import { WorkflowStep } from '@fiduciary-interface/app/features/workflow/models';
import { WorkflowODApiService } from '@fiduciary-interface/app/features/workflow/services';
import { WorkflowStoreService } from '@fiduciary-interface/app/features/workflow/store/services/workflow-store.service';
import { Observable, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  private boolSubject = new Subject<boolean>();
  public readOnly$ = this.boolSubject.asObservable();
  private contract: any;
  private DISABLE_FORM = true;

  constructor(
    readonly workflowODService: WorkflowODApiService,
    private readonly workflowStoreService: WorkflowStoreService
  ) {
    this.workflowStoreService.getCurrentUser().subscribe((user) => {
      this.contract = user.contact;
    });
  }

  public handleTransactionStatus(permissions: PermissionActions[]): void {
    this.currentUserExistsInWorkflow()
      .pipe(take(1))
      .subscribe((currentUserExistsInWorkflow: boolean) => {
        return this.handlePermissionStatus(
          permissions,
          currentUserExistsInWorkflow
        );
      });
  }

  private handlePermissionStatus(
    permissions: PermissionActions[],
    currentUserExistsInWorkflow: boolean
  ): void {
    if (this.isCreateTransaction(permissions)) {
      if (
        this.hasTransactionPermission(permissions) == true &&
        currentUserExistsInWorkflow == true
      ) {
        return this.boolSubject.next(!this.DISABLE_FORM);
      }

      if (
        this.hasTransactionPermission(permissions) == true &&
        currentUserExistsInWorkflow == false
      ) {
        return this.boolSubject.next(this.DISABLE_FORM);
      }

      if (this.hasViewPermission(permissions) == true) {
        return this.boolSubject.next(this.DISABLE_FORM);
      }
    } else if (this.isEditTransaction(permissions)) {
      if (
        this.hasTransactionPermission(permissions) == true &&
        this.hasCanEditTransaction(permissions) == true &&
        currentUserExistsInWorkflow == true
      ) {
        return this.boolSubject.next(!this.DISABLE_FORM);
      }

      if (
        this.hasTransactionPermission(permissions) == true &&
        this.hasCanEditTransaction(permissions) == true &&
        currentUserExistsInWorkflow == false
      ) {
        return this.boolSubject.next(this.DISABLE_FORM);
      }

      if (
        this.hasTransactionPermission(permissions) == true &&
        this.hasCanNotEditTransaction(permissions) == true
      ) {
        return this.boolSubject.next(this.DISABLE_FORM);
      }

      if (this.hasViewPermission(permissions) == true) {
        return this.boolSubject.next(this.DISABLE_FORM);
      }
    } else {
      if (
        this.isCreateTransaction(permissions) ||
        this.isEditTransaction(permissions)
      ) {
        return this.boolSubject.next(currentUserExistsInWorkflow);
      }
    }
  }

  public currentUserExistsInWorkflow(): Observable<boolean> {
    return this.workflowODService
      .getWorkflowData()
      .pipe(
        map((data) =>
          this.isCurrentUserHasPermission(data, this.contract.email)
        )
      );
  }

  public isCurrentUserHasPermission(
    workflowConfiguration: WorkflowStep[],
    currentUser: string
  ): boolean {
    const assignedUsers = workflowConfiguration?.find(
      (workflow) => workflow.step === 0
    )?.assignedUsers;

    return assignedUsers.some((assignedUsers) => {
      return (
        assignedUsers.email.toLocaleLowerCase().trim() ===
        currentUser.toLocaleLowerCase().trim()
      );
    });
  }

  public hasViewPermission(permissions: PermissionActions[]): boolean {
    return permissions.includes(PermissionActions.VIEW_DISBURSEMENT_ACTION);
  }

  public isCreateTransaction(permissions: PermissionActions[]): boolean {
    return permissions.includes(PermissionActions.IS_CREATE);
  }

  public isEditTransaction(permissions: PermissionActions[]): boolean {
    return permissions.includes(PermissionActions.IS_EDIT);
  }

  public hasTransactionPermission(permissions: PermissionActions[]): boolean {
    return permissions.includes(PermissionActions.TRANSACTION_ACTION);
  }

  public hasCanEditTransaction(permissions: PermissionActions[]): boolean {
    return permissions.includes(PermissionActions.CAN_EDIT);
  }

  public hasCanNotEditTransaction(permissions: PermissionActions[]): boolean {
    return permissions.includes(PermissionActions.CAN_NOT_EDIT);
  }

  public hasWorkflowPermission(permissions: PermissionActions[]): boolean {
    return permissions.includes(PermissionActions.WORKFLOW_PERMISSION);
  }

  public hasWorkflowManagement(permissions: PermissionActions[]): boolean {
    return permissions.includes(PermissionActions.WORKFLOW_MANAGEMENT);
  }
}
