import { Component } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { FinancialPlanExchangeRate } from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';

/**
 * "Ajustar tasa de cambio", opened from the simulation step without leaving
 * it: picking a currency is what unlocks its own rate for editing, so a rate
 * can't be changed by accident while only meaning to review it.
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

  selected = new Set<string>();
  saving = false;

  constructor(
    dialog: DialogRef,
    private readonly api: FinancialPlanApiService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService
  ) {
    super(dialog);
  }

  isSelected(currency: string): boolean {
    return this.selected.has(currency);
  }

  toggle(currency: string): void {
    if (this.selected.has(currency)) {
      this.selected.delete(currency);
    } else {
      this.selected.add(currency);
    }
  }

  get canSave(): boolean {
    return this.selected.size > 0;
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
