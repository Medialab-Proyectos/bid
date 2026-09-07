import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Enums, AuditTrailActionVisibleInFI } from '@core/models';
import { ProjectStoreService } from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { SelectedProjectState } from '@core/store';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { Subscription } from 'rxjs';
import { exhaustMap, filter } from 'rxjs/operators';
import { AuditTrailsGetResponse, AuditTrailsContent } from '../../models';
import {
  FiTransactionsApiService,
  TransactionsFormService,
} from '../../services';
import { AppStateWithUsrPreferences } from '@core/store/preferences/reducers/preferences.reducer';
import { Store } from '@ngrx/store';

@Component({
  selector: 'fi-audit-trail',
  templateUrl: './audit-trail.component.html',
})
export class AuditTrailComponent implements OnInit, OnDestroy {
  private readonly suscription = new Subscription();

  auditTrails: AuditTrailsGetResponse = null;
  isLoading: boolean;
  enum = Enums;
  auditTrailActionVisibleInFI = AuditTrailActionVisibleInFI;
  transactionId = this.activatedRoute.snapshot.params.id;
  language: string;
  transactionNumber: string;

  constructor(
    readonly notificationGlobalService: NotificationGlobalService,
    readonly fiTransactionsApiService: FiTransactionsApiService,
    private readonly projectStoreService: ProjectStoreService,
    private readonly visibilityService: VisibilityService,
    private readonly activatedRoute: ActivatedRoute,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly transactionForService: TransactionsFormService
  ) {}

  ngOnInit(): void {
    this.getAuditTrail(this.transactionId);
    this.visibilityServices();
    this.getLanguage();
  }

  ngOnDestroy(): void {
    this.suscription.unsubscribe();
  }

  getAuditTrail(transactionId: number): void {
    this.isLoading = true;
    const sub = this.projectStoreService
      .selectedProject()
      .pipe(
        filter((res: SelectedProjectState) => res.selectedProject !== null),
        exhaustMap((res: SelectedProjectState) => {
          return this.fiTransactionsApiService.getAuditTrails(
            res?.selectedProject?.projectBucketId,
            transactionId
          );
        })
      )
      .subscribe(
        (data: AuditTrailsGetResponse) => {
          this.transactionNumber = data?.header?.transactionNumber[0];
          data.header.transactionNumber = this.addODPrefixToTransactionNumbers(
            data?.header.transactionNumber
          );

          this.auditTrails = data;
          this.isLoading = false;
        },
        () => {
          this.notificationGlobalService.showError(
            `TRANSACTION.AUDIT_TRAILS.ERROR.TABLE`
          );
          this.isLoading = false;
        }
      );

    this.suscription.add(sub);
  }

  visibilityServices(): void {
    this.visibilityService.setVisiblityProcessHeader(false);
    this.visibilityService.setVisiblityProjectHeader(false);
    this.visibilityService.breadcrumbService.set(
      '@audit-trail',
      'TRANSACTION.APPROVAL_HEADER.HEADER_TITLE'
    );
    this.visibilityService.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
  }

  addODPrefixToTransactionNumbers(transactionNumbers: string[]): string[] {
    return transactionNumbers.map((transactionNumber) => {
      return `OD${transactionNumber}`;
    });
  }

  getAuditTrailActionsVisibleInFI(
    auditTrailsFI: AuditTrailsContent[],
    auditTrailsCNVG: AuditTrailsContent[]
  ): AuditTrailsContent[] {
    var auditTrailsVisibleFI: AuditTrailsContent[] = [...auditTrailsFI];
    for (const actionVisible in this.auditTrailActionVisibleInFI) {
      let auditTrailCNVGFounds: AuditTrailsContent[];
      auditTrailCNVGFounds = auditTrailsCNVG?.filter(
        (item) => item.action.trim() === actionVisible.trim()
      );
      auditTrailCNVGFounds?.forEach((auditTrailCNVGFound) => {
        auditTrailsVisibleFI.push(auditTrailCNVGFound);
      });
    }
    return auditTrailsVisibleFI;
  }

  getLanguage(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe(
        (data) => (this.language = data.preferences.preferredLanguage)
      );
    this.suscription.add(sub);
  }

  downloadAudit(): void {
    this.isLoading = true;
    this.transactionForService
      .downloadAudit(this.transactionId, this.language, this.transactionNumber)
      .subscribe(
        () => {},
        () => {
          this.transactionForService.showErrorToast(
            'TRANSACTION.ERROR_GENERATING_PDF'
          );
        }
      )
      .add(() => (this.isLoading = false));
  }
}
