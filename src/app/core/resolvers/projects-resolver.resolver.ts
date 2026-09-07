import { Injectable } from '@angular/core';

import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { EnumsStoreService } from '@core/services/store-services';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { enumLocationValues } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ProjectsResolverResolver {
  constructor(
    readonly store: Store<AppState>,
    readonly enumStore: EnumsStoreService
  ) {}

  arrayOfEnumsLocations = enumLocationValues();
  enums = [
    'biddingProcessDocumentGroupCodes',
    'biddingProcessDocumentgroupResults',
    'biddingProcessDocumentGroupVisibilities', //no se usa
    'biddingProcessDocumentPackageCodes',
    'biddingProcessDocumentPackageStatuses',
    'biddingProcessMilestoneCodes',
    'biddingProcessMilestoneStatuses', //no se usa
    'biddingProcessPlanStatuses',
    'biddingProcessProcurementProcessProcurementMethods',
    'biddingProcessProcurementProcessGoodsReferences',
    'biddingProcessProcurementProcessCategories',
    'biddingProcessProcurementProcessStatuses',
    'biddingProcessProcurementProcessSupervisionMethods',
    'biddingProcessProcurementProcessSustainabilities',
    'fiduciaryProcessDocumentsStatuses',
    'fiduciaryProcessDocumentsTypes',
    'CommentViewType',
    'projectTaskTypes',
    'commentVisibilities',
  ];

  enumsWorkFlow = [
    'workflowActions',
    'onlineDisburmentWorkflowSteps',
    'onlineDisburmentWorkflowActions',
    'workflowSteps',
    'workflowRoles',
    'workflowTypes',
    'WorkFlowDocumentVisibilities',
  ];

  resolve(): void {
    this.enumStore
      .selectEnums()
      .pipe(
        map((data) => data.loading),
        filter((data) => !data),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.enumStore.loadEnum(this.enums);
        this.enumStore.loadEnum(this.enumsWorkFlow);
        this.enumStore.loadEnum(this.arrayOfEnumsLocations);
      });
  }
}
