import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { FinancialPlanExchangeRate } from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';

/**
 * "Ajustar tasa de cambio", opened from the simulation step without leaving
 * it. Same editable table as the Información step. Currencies are never added
 * here by hand (26/10): a legacy contract in Canadian dollars, say, brings CAD
 * with it when recorded in "Incluir procesos potencialmente a ser
 * ejecutables", with the rate set there the first time.
 */
@Component({
  selector: 'fi-adjust-rate-dialog',
  templateUrl: './adjust-rate-dialog.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class AdjustRateDialogComponent extends DialogContentBase {
  projectBucketId: string;
  rates: FinancialPlanExchangeRate[] = [];
  lastUpdatedOn: string;

  saving = false;

  constructor(
    dialog: DialogRef,
    private readonly api: FinancialPlanApiService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {
    super(dialog);
  }

  /** Every currency needs a rate above zero: an empty one would convert its
   *  payments to nothing and the plan would come out short without saying so. */
  get canSave(): boolean {
    return this.rates.length > 0 && this.rates.every((rate) => !!rate.rateToUsd && rate.rateToUsd > 0);
  }

  cancel(): void {
    this.dialog.close();
  }

  save(): void {
    if (!this.canSave) {
      return;
    }
    this.saving = true;
    this.api.saveExchangeRates(this.projectBucketId, this.rates).subscribe({
      next: () => {
        this.saving = false;
        this.notificationSvc.showSuccess(
          this.translate.instant('FINANCIAL_PLAN.SIMULATION.ADJUST_RATE.SAVE_SUCCESS')
        );
        this.dialog.close({ confirmed: true });
      },
      error: () => {
        this.saving = false;
      },
    });
  }
}
