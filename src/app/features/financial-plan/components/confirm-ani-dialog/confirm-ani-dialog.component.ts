import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { AniConfirmSummary, AniRequestDraft } from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';

/** Last step of "Solicitar ANI": review the request before it is sent. */
@Component({
  selector: 'fi-confirm-ani-dialog',
  templateUrl: './confirm-ani-dialog.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class ConfirmAniDialogComponent extends DialogContentBase {
  projectBucketId: string;
  draft: AniRequestDraft;
  summary: AniConfirmSummary;
  saving = false;

  constructor(
    dialog: DialogRef,
    private readonly api: FinancialPlanApiService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {
    super(dialog);
  }

  cancel(): void {
    this.dialog.close();
  }

  confirm(): void {
    this.saving = true;
    this.api.requestAni(this.projectBucketId, this.draft).subscribe({
      next: () => {
        this.saving = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('FINANCIAL_PLAN.ACTIVE.ANI.CONFIRM_SUCCESS')
        );
        this.dialog.close({ confirmed: true });
      },
      error: () => {
        this.saving = false;
      },
    });
  }
}
