import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Enums, ProcurementProcessDetails, Project } from '@core/models';
import {
  BiddingProcessPlanStoreService,
  EnumsStoreService,
  ProjectStoreService,
} from '@core/services/store-services/';
import { VisibilityService, WindowSizeService } from '@core/services/view';
import { PermissionEnum } from '@core/enums/permission.enum';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AppStateWithProcurementProcessHeader } from '@core/store/procurement-process-header/reducers/procurementProcessHeader.reducer';
import { Store } from '@ngrx/store';
import * as actions from '@core/store/procurement-process-header/actions/procurementProcessHeader.actions';


@Component({
  selector: 'fi-procurement-process',
  templateUrl: './procurement-process.component.html',
  styleUrls: ['./procurement-process.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcurementProcessComponent implements OnInit, OnDestroy {
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;

  @Input() displayTabMenu = true;
  @Input() biddingProcessId = String();
  @Input() displayHeaderOnInit = true;
  public subscription = new Subscription();
  enum = Enums;
  public processDetails: ProcurementProcessDetails;
  isSelectedProcessLoading = true;
  isEnumLoading = true;
  isContractLoading = true;

  processStatus: number = null;
  supervisionMethod: number = null;
  procurementMethod: number = null;
  category: number = null;
  projectAmount: number;
  realAmount: number;

  public showMenuMobile = false;
  public show = true;
  public mobileView = false;
  public expandedHeader = false;
  public expandedInformation = false;
  public showHeader = true;
  public isHeaderLoading = true;
  contract: Project;
  detailsDataSubscription: Subscription;

  seeGeneralInfoButtonPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];


  constructor(
    private readonly windowSvc: WindowSizeService,
    private readonly activeRoute: ActivatedRoute,
    private readonly biddingProcessPlanStore: BiddingProcessPlanStoreService,
    private readonly visibilityService: VisibilityService,
    private readonly changeDectector: ChangeDetectorRef,
    private readonly projectStore: ProjectStoreService,
    private readonly enumsSvc: EnumsStoreService,
    private readonly router: Router,
    private readonly store: Store<AppStateWithProcurementProcessHeader>
  ) {}

  ngOnInit(): void {
    this.visibilityService.breadcrumbService.set(
      '@adquisitionProcess',
      'BREADCRUMB.ACQUISITION_PROCESS'
    );
    this.visibilityService.breadcrumbService.set(
      '@procurement',
      'BREADCRUMB.PROCUREMENT_MANAGEMENT'
    );
    this.visibilityService.breadcrumbService.set(
      '@addBidder',
      'BREADCRUMB.REGISTER_BIDDER'
    );
    this.visibilityService.breadcrumbService.set(
      '@detailBidder',
      'BREADCRUMB.DETAIL_BIDDER'
    );
    this.visibilityService.breadcrumbService.set(
      '@addJointVenture',
      'BREADCRUMB.REGISTER_JOINT_VENTURE'
    );

    if (this.displayHeaderOnInit) {
      this.visibilityService.setVisiblityProcessHeader(true);
      this.visibilityService.setVisiblityProjectHeader(false);

      if (this.router.url.includes('edit')) {
        this.visibilityService.breadcrumbService.set(
          '@editProcurement',
          'BREADCRUMB.EDIT_ACQUISITION_PROCESS'
        );
        this.visibilityService.breadcrumbService.set('@adquisitionProcess', {
          skip: true,
        });
        this.visibilityService.setVisiblityProcessHeader(false);
      }
    }
    this.getVisibilityData();
    this.initMobileConditionals();
    this.getProject();
    this.checkExpandInformation();
  }

  checkExpandInformation(): void {
    const sub = this.store
      .select('procurementProcessHeader')
      .subscribe((FocusComments) => {
        this.expandedInformation = FocusComments.FocusComments;
      });
    sub.unsubscribe();
  }

  ngAfterViewChecked(): void {
    this.changeDectector.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getProject(): void {
    this.subscription.add(
      this.projectStore.selectedProject().subscribe((data) => {
        if (data.selectedProject) {
          this.isContractLoading = data.loading;
          this.contract = data.selectedProject;
        }
      })
    );
  }

  getDetailData(): void {
    const subscription = this.biddingProcessPlanStore
      .getOrLoadSelectedBiddingProcessById(this.biddingProcessId)
      .subscribe((data) => {
        const selectedProcess = data.selectedBiddingProcessProcurementProcess;

        if (selectedProcess) {
          this.isSelectedProcessLoading = data.isSelectedProcessLoading;
          const biddingProcess = selectedProcess;
          this.projectAmount =
            data.selectedBiddingProcessProcurementProcess.projectAmount.estimatedAmount;
          this.realAmount = data.selectedBiddingProcessProcurementProcess.totalAcumulatedAmount;

          if (biddingProcess) {
            const newBiddingProcess: ProcurementProcessDetails = {
              id: biddingProcess?.id,
              code: biddingProcess?.code,
              category: biddingProcess.category.toString(),
              procurementMethod: biddingProcess.procurementMethod.toString(),
              supervisionMethod: biddingProcess.supervisionMethod.toString(),
              status: biddingProcess.status.toString(),
              sustainability: biddingProcess.sustainability?.toString(),
              name: biddingProcess.name,
              description: biddingProcess.description,
              justification: biddingProcess.justification,
              bafo: false,
              sepaId: biddingProcess.sepaPeclaId,
              manualId: biddingProcess.manualId,
              sustainabilityDescription:
                biddingProcess.sustainabilityDescription,
              deliverables: [],
            } as any;

            if (biddingProcess.comments && biddingProcess.comments.length > 0) {
              newBiddingProcess.comments = biddingProcess.comments?.map(
                (biddingComment) => {
                  return {
                    id: biddingComment.comment.id,
                    text: biddingComment.comment.text,
                    visibility: biddingComment.comment.visibility.toString(),
                  };
                }
              );
            }

            this.processStatus = biddingProcess.status;
            this.supervisionMethod = biddingProcess.supervisionMethod.id;
            this.procurementMethod = biddingProcess.procurementMethod.id;
            this.category = biddingProcess.category.id;

            this.processDetails = newBiddingProcess;
          }
        }
      });
    this.subscription.add(subscription);
    this.detailsDataSubscription = subscription;
    this.checkEnumsLoaded();
  }

  checkEnumsLoaded(): void {
    this.subscription.add(
      this.enumsSvc.selectEnums().subscribe((data) => {
        const categoriesEnum =
          data.enumsLoading[Enums.biddingProcessProcurementProcessCategories];
        const methodsEnum =
          data.enumsLoading[
            Enums.biddingProcessProcurementProcessProcurementMethods
          ];
        const supervisionEnum =
          data.enumsLoading[
            Enums.biddingProcessProcurementProcessSupervisionMethods
          ];
        const statusEnum =
          data.enumsLoading[Enums.biddingProcessProcurementProcessStatuses];

        this.isEnumLoading =
          categoriesEnum && methodsEnum && supervisionEnum && statusEnum;
      })
    );
  }

  getVisibilityData(): void {
    const subscription = this.biddingProcessPlanStore
      .headerProcess()
      .subscribe((data) => {
        this.showHeader = data?.headerProcess;
        this.isHeaderLoading = data?.isLoading;

        if (this.showHeader) {
          this.getParams();
        }
      });
    this.subscription.add(subscription);
  }

  getParams(): void {
    this.subscription.add(
      this.activeRoute.params.subscribe((data) => {
        if (!!data.processId) {
          this.biddingProcessId = data.processId;
        }

        if (this.detailsDataSubscription) {
          this.detailsDataSubscription.unsubscribe();
          this.isEnumLoading = true;
          this.isSelectedProcessLoading = true;
        }

        this.getDetailData();
      })
    );
  }

  onToggle(): void {
    this.show = !this.show;
  }

  initMobileConditionals(): void {
    this.subscription.add(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
        this.expandedHeader = !data.mobileView;
      })
    );
  }

  toogleExpandHeader(): void {
    this.expandedHeader = !this.expandedHeader;
  }

  toggleInformationGeneral(): void {
    this.expandedInformation = !this.expandedInformation;
    if (this.expandedInformation) {
      this.store.dispatch(actions.setFocusComments({ FocusComments: false }));
    }
  }

  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;

    if (element.offsetWidth < element.scrollWidth) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
}
