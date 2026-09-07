import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionActions } from '@core/enums';
import { ActionsService } from '@core/services/app/actions/actions.service';
import { WorkflowODApiService } from '@fiduciary-interface/app/features/workflow/services';
import { WorkflowStoreService } from '@fiduciary-interface/app/features/workflow/store/services/workflow-store.service';
import { environment } from '@fiduciary-interface/environments/environment';

@Directive({
  selector: '[fiDisabledByActions]',
})
export class DisabledByActionsDirective {
  constructor(
    private readonly actionsService: ActionsService,
    private readonly workflowODService: WorkflowODApiService,
    private readonly workflowStoreService: WorkflowStoreService,
    private readonly view: ViewContainerRef,
    private readonly template: TemplateRef<any>
  ) {
    this.workflowStoreService.getCurrentUser().subscribe((user) => {
      this.contract = user.contact;
    });
  }

  private contract: any;

  @Input() set fiDisabledByActions(permissions: PermissionActions[]) {
    if (
      this.actionsService.isCreateTransaction(permissions) ||
      this.actionsService.isEditTransaction(permissions) ||
      this.actionsService.hasWorkflowManagement(permissions)
    ) {
      this.view.createEmbeddedView(this.template);
    }

    if (
      !environment.permissionsByPass &&
      !this.actionsService.hasCanEditTransaction(permissions) &&
      !this.actionsService.hasCanNotEditTransaction(permissions) &&
      this.actionsService.hasWorkflowPermission(permissions)
    ) {
      this.handlePermissionsWithWorkflows();
    }

    if (!environment.permissionsByPass) {
      this.actionsService.handleTransactionStatus(permissions);
    }
  }

  private async handlePermissionsWithWorkflows() {
    this.workflowODService.getWorkflowData().subscribe((workflows) => {
      if (
        this.actionsService.isCurrentUserHasPermission(
          workflows,
          this.contract.email
        )
      ) {
        this.view.createEmbeddedView(this.template);
      } else {
        this.view.clear();
      }
    });
  }
}
