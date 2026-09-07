import { Component, OnInit, ViewChild } from '@angular/core';

import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { VisibilityService } from '@core/services/view';
import { Observable } from 'rxjs';
import { TransactionsTypes } from '../../enums';
import { TransactionDpbComponent } from '../transaction-dpb/transaction-dpb.component';

@Component({
  selector: 'fi-transaction-dps',
  templateUrl: './transaction-dps.component.html',
})
export class TransactionDpsComponent implements OnInit {
  transactionTitle: string;
  transactionType = TransactionsTypes.DPS;
  @ViewChild(TransactionDpbComponent) dpbComponent: TransactionDpbComponent;

  constructor(
    private readonly visibilitySvc: VisibilityService,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard
  ) {}

  ngOnInit(): void {
    this.visibilityServices();
  }

  visibilityServices(): void {
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.visibilitySvc.breadcrumbService.set('@dps', 'DPS');
    this.visibilitySvc.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );

    this.transactionTitle = 'BREADCRUMB.DPS';
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.dpbComponent.form);
  }
}
