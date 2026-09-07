import { Component, OnInit, ViewChild } from '@angular/core';
import { TransactionsTypes } from '../../enums';
import { TransactionDpbComponent } from '../transaction-dpb/transaction-dpb.component';
import { VisibilityService } from '@core/services/view';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'fi-transaction-dpi',
  templateUrl: './transaction-dpi.component.html',
  styleUrls: [],
})
export class TransactionDpiComponent implements OnInit {
  transactionTitle: string;
  transactionType = TransactionsTypes.DPI;
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
    this.visibilitySvc.breadcrumbService.set('@dpi', 'DPI');
    this.visibilitySvc.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
    this.transactionTitle = 'BREADCRUMB.DPI';
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.dpbComponent.form);
  }
}
