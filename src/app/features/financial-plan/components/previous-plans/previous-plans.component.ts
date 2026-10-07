import { Component, Input, OnInit } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ActiveFinancialPlan } from '../../models/financial-plan.model';
import { FinancialPlanApiService } from '../../services/financial-plan-api.service';
import { PreviousPlanDetailDialogComponent } from '../previous-plan-detail-dialog/previous-plan-detail-dialog.component';

/**
 * "Planes anteriores": every plan a confirmation has ever replaced, oldest
 * first. Opening one opens the read-only "Plan Financiero {id}" dialog --
 * same cash-flow table "Plan activo" shows for the current one, but with no
 * control on it that could change anything: no download... actually it does
 * keep "Descargar Plan Financiero" (the Figma reference's own one exception
 * -- exporting a copy doesn't change the record itself), but no component
 * drill-down, no "Simular nuevo Plan Financiero", no "Solicitar ANI". A past
 * plan is a record, not a working document.
 */
@Component({
  selector: 'fi-previous-plans',
  templateUrl: './previous-plans.component.html',
  styleUrls: ['../../financial-plan.shared.scss'],
})
export class PreviousPlansComponent implements OnInit {
  @Input() projectBucketId: string;

  plans: ActiveFinancialPlan[] = [];
  loading = false;

  constructor(
    private readonly api: FinancialPlanApiService,
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.getPreviousPlans(this.projectBucketId).subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loading = false;
      },
      error: () => {
        this.plans = [];
        this.loading = false;
      },
    });
  }

  trackPlan(_index: number, plan: ActiveFinancialPlan): string {
    return plan.id;
  }

  advanceTotal(plan: ActiveFinancialPlan): number {
    return plan.advanceAmount.reduce((sum, value) => sum + value, 0);
  }

  statusLabel(plan: ActiveFinancialPlan): string {
    return plan.status === 'REJECTED'
      ? 'FINANCIAL_PLAN.PREVIOUS.STATUS_REJECTED'
      : 'FINANCIAL_PLAN.PREVIOUS.STATUS_COMPLETED';
  }

  openPlan(plan: ActiveFinancialPlan): void {
    const dialog = this.dialogService.open({
      title: this.translate.instant('FINANCIAL_PLAN.PREVIOUS.DETAIL_TITLE', { id: plan.id }),
      content: PreviousPlanDetailDialogComponent,
      cssClass: 'fp-modal',
      width: 1150,
    });

    const instance = dialog.content.instance as PreviousPlanDetailDialogComponent;
    instance.plan = plan;
  }
}
