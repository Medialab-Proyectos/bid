import { Component, OnDestroy, OnInit } from '@angular/core';
import { FiTransactionsApiService } from '@fiduciary-interface/app/features/transactions/services';
import { Observable, Subscription, filter, forkJoin, map, take } from 'rxjs';
import {
  DisbursementBalances,
  DisbursementComponent,
  DisbursementDetail,
  DisbursementHeader,
} from '../../models';
import { PermissionEnum } from '@core/enums';
import {
  GetTransactionComponentsResponse,
  TransactionComponent,
  TransactionHeaderBalances,
} from '@fiduciary-interface/app/features/transactions/models';
import { TransactionsStoreService } from '@fiduciary-interface/app/features/transactions/store/services/transactions-store.service';
import { TransactionsTypes } from '@fiduciary-interface/app/features/transactions/enums';
import { ProjectStoreService } from '@core/services/store-services';

@Component({
  selector: 'fi-disbursement-container',
  templateUrl: './disbursement-container.component.html',
  styleUrls: [],
})
export class DisbursementContainerComponent implements OnInit, OnDestroy {
  viewDisburtsementTabPermission: PermissionEnum[] = [
    PermissionEnum.TRANSACTION_MANAGEMENT,
  ];
  downloadReportPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_DISBURSEMENT_INFORMATION,
  ];
  loading = true;
  balances: DisbursementBalances;
  header: DisbursementHeader;
  projectBucketId: string;

  readonly suscriptions: Subscription = new Subscription();

  constructor(
    private transactionSvc: FiTransactionsApiService,
    readonly transactionsStoreSvc: TransactionsStoreService,
    readonly projectStoreSvc: ProjectStoreService
  ) {}
  ngOnDestroy(): void {
    this.suscriptions.unsubscribe();
  }

  ngOnInit(): void {
    const sub = this.projectStoreSvc
      .selectedProject()
      .pipe(
        filter((data) => {
          return data.selectedProject !== null;
        })
      )
      .pipe(take(1))
      .pipe(
        map((data) => {
          this.projectBucketId = data.selectedProject.projectBucketId;
          return data;
        })
      )
      .subscribe(() => {
        this.getBalancesAndComponent();
      });
    this.suscriptions.add(sub);
  }

  getBalancesAndComponent(): void {
    const sub = forkJoin([
      this.getProjectBalances(),
      this.getTransactionComponents$(
        this.projectBucketId,
        TransactionsTypes.INFO
      ),
    ])
      .pipe(
        map((data) => {
          return {
            balances: {
              amountAssignIdb: data[1].amountAssignIdb,
              amountAssignLocalCounterpart:
                data[1].amountAssignLocalCounterpart,
              amountAssignCofinancing: data[1].amountAssignCofinancing,
              components: this.mapComponents(data[1].components),
              componentsTotalAmountCurrentIdb:
                data[1].componentsTotalAmountCurrentIdb,
              componentsTotalAmountCurrentLc:
                data[1].componentsTotalAmountCurrentLc,
              componentsTotalAmountCurrentCf:
                data[1].componentsTotalAmountCurrentCf,
              componentsTotalAmountDisbursedIdb:
                data[1].componentsTotalAmountDisbursedIdb,
              componentsTotalAmountDisbursedLc:
                data[1].componentsTotalAmountDisbursedLc,
              componentsTotalAmountDisbursedCf:
                data[1].componentsTotalAmountDisbursedCf,
              componentsTotalAmountAvailableIdb:
                data[1].componentsTotalAmountAvailableIdb,
              componentsTotalAmountAvailableLc:
                data[1].componentsTotalAmountAvailableLc,
              componentsTotalAmountAvailableCf:
                data[1].componentsTotalAmountAvailableCf,
              componentsTotalAmountProjectedIdb:
                data[1].componentsTotalAmountProjectedIdb,
              componentsTotalAmountProjectedLc:
                data[1].componentsTotalAmountProjectedLc,
              componentsTotalAmountProjectedCf:
                data[1].componentsTotalAmountProjectedCf,
            },
            header: {
              currentDisbInformation: data[0].currentDisbExpiration,
              cumulativeExtension: data[0].cumulativeExtension,
              totalAmountPendingJustification:
                data[0].totalAmountPendingJustification,
              minimumAmountPendingJustification:
                data[0].minimumAmountPendingJustification,
              advanceJustificationPercentage: data[0].toJustifyPercent,
              financialPeriodDeadline: data[0].financialPeriodDeadline,
              lastRequestNumber: data[0].lastRequestNumber,
              lastAdvanceFoundsAmount: data[0].lastAdvanceOfFoundsANTAmount,
              lastAdvanceFoundDate: data[0].lastAdvanceOfFoundsANTDate,
            },
          };
        })
      )
      .pipe(
        map((response: DisbursementDetail) => {
          const { components, ...rest } = response.balances;
          const orderComponents = components.sort((a, b) => a.code - b.code);
          const sortedBalances = {
            balances: { components: orderComponents, ...rest },
            header: response.header,
          };
          return sortedBalances;
        })
      )
      .subscribe({
        next: (data) => {
          this.balances = data.balances;
          this.header = data.header;
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
    this.suscriptions.add(sub);
  }

  mapComponents(components: TransactionComponent[]): DisbursementComponent[] {
    const disburtsementComponent: DisbursementComponent[] = [];
    components.forEach((c) => {
      let compo = {
        id: null,
        type: null,
        code: null,
        name: null,
        amountsDistribute: {
          distributeIbd: null,
          distributeLocalCounterpart: null,
          distributeCofinancing: null,
        },
        amountsProjectedAvailable: {
          distributeIbd: null,
          distributeLocalCounterpart: null,
          distributeCofinancing: null,
        },
        amountCurrent: {
          distributeIbd: null,
          distributeLocalCounterpart: null,
          distributeCofinancing: null,
        },
        projectedAvailableBalance: {
          distributeIbd: null,
          distributeLocalCounterpart: null,
          distributeCofinancing: null,
        },
        readOnly: null,
      };
      compo.id = c.id;
      compo.name = c.name;
      compo.code = c.code;
      compo.readOnly = c.readOnly;
      compo.type = c.type;
      compo.amountsDistribute = c.componentTableInformation[0];
      compo.amountsProjectedAvailable = c.componentTableInformation[1];
      compo.amountCurrent = c.componentTableInformation[2];
      compo.projectedAvailableBalance = c.componentTableInformation[3];
      disburtsementComponent.push(compo);
    });
    return disburtsementComponent;
  }

  getProjectBalances(): Observable<TransactionHeaderBalances> {
    return this.transactionSvc.getProjectBalances(this.projectBucketId).pipe(
      map((data: TransactionHeaderBalances) => {
        return data;
      })
    );
  }
  getTransactionComponents$(
    projectBucketId: string,
    transactionType: string
  ): Observable<GetTransactionComponentsResponse> {
    return this.transactionSvc
      .getTransactionComponents(projectBucketId, transactionType)
      .pipe(
        map((response: GetTransactionComponentsResponse) => {
          return response;
        })
      );
  }
}
