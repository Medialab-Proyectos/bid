import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { FormValidationService } from '@core/services/validation';
import { VisibilityService, WindowSizeService } from '@core/services/view';
import { ActivatedRoute, Router } from '@angular/router';
import { createProcurementForm } from '../../components/procurement-form/procurement.form';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import { BiddingProcessPlanService } from '@core/services/apis';
import {
  EnumsStoreService,
  ProjectStoreService,
  BiddingProcessPlanStoreService,
} from '@core/services/store-services';
import { ProcurementProcessFormService } from '../../services/procurement-process-form.service';
import { CreateBiddingProcessRequest } from '@core/models';
import { errorDefinitions } from '../process-form-validationsKeys';
import {
  FormConfig,
  ModeOfProcurementForm,
} from '../../models/form-config.model';
import { PermissionEnum } from '@core/enums';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';

@Component({
  selector: 'fi-create-procurement-process',
  templateUrl: './create-procurement-process.component.html',
  styles: ['.hide { display:none; }'],
})
export class CreateProcurementProcessComponent implements OnInit, OnDestroy {
  @ViewChild('divForm') divForm: ElementRef;
  private readonly subscription = new Subscription();
  hidden = false;
  mobileView = false;
  isButtonDisabled = false;
  isLoading = true;
  public errorListTitle = 'COMMON.VALIDATION_ERRORS_TITLE';
  public errorKeys: FormErrorTranslateKey[] = [];
  formErrorCollection: FormErrorTranslateKey[] = [];
  form: UntypedFormGroup = createProcurementForm();

  projectBucketId: string;
  procurementProcess: CreateBiddingProcessRequest;
  countryCode: string;

  formConfig: FormConfig = {
    commentsSection: {
      isDisabled: !this.hasEditCommentPermission(),
    },
    costDistributionSection: {
      isDisabled: false,
    },
    outputsSection: {
      isDisabled: false,
    },
    milestoneSection: {
      isActualDateDisabled: false,
      isActualDateVisible: false,
      isEstimatedDateDisabled: false,
      isEstimatedDateVisible: true,
      isReEstimatedDateDisabled: true,
      isReEstimatedDateVisible: false,
      disabledRestimatedDates: [],
    },
    mode: ModeOfProcurementForm.CREATE,
  };

  createProcessButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  createProcessAddAnotherButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  cancelButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  constructor(
    private readonly formSvc: FormValidationService,
    private readonly windowService: WindowSizeService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly visibilityService: VisibilityService,
    private readonly biddingProcessPlanSvc: BiddingProcessPlanService,
    private readonly projectStore: ProjectStoreService,
    private readonly procurementProcessFormSvc: ProcurementProcessFormService,
    private readonly procurementStore: BiddingProcessPlanStoreService,
    readonly enumStoreSvc: EnumsStoreService,
    private readonly permissionSvc: PermissionService,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard
  ) {}

  ngOnInit(): void {
    this.initMobileConditionals();
    this.getprojectBucketId();
    this.visibilityService.setVisiblityProjectHeader(false);
    this.visibilityService.setVisiblityProcessHeader(true);
    this.visibilityService.breadcrumbService.set(
      '@createProcurement',
      'BREADCRUMB.NEW_ACQUISITION_PROCESS'
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getprojectBucketId(): void {
    const sub = this.projectStore.selectedProject().subscribe((data) => {
      if (data && data.selectedProject) {
        this.isLoading = data.loading;
        this.projectBucketId = data.selectedProject.projectBucketId;
        this.countryCode = data.selectedProject.countryCode;
      }
    });
    this.subscription.add(sub);
  }

  initMobileConditionals(): void {
    this.subscription.add(
      this.windowService.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  navigateToProcurement(): void {
    this.router.navigate(['.'], {
      relativeTo: this.activatedRoute.parent.parent,
    });
  }

  submit(navigate: boolean): void {
    this.isButtonDisabled = true;
    this.formSvc.errorList = [];
    this.formErrorCollection = this.formSvc.validateForm(
      this.form,
      errorDefinitions
    );
    this.subscription.add(
      this.enumStoreSvc.selectEnums().subscribe((data) => {
        if (
          data.biddingProcessProcurementProcessCategories &&
          data.biddingProcessProcurementProcessProcurementMethods &&
          data.biddingProcessProcurementProcessSupervisionMethods &&
          data.biddingProcessMilestoneCodes
        ) {
          this.procurementProcess =
            this.procurementProcessFormSvc.procurementRequest(
              this.form,
              this.countryCode,
              data.biddingProcessProcurementProcessCategories,
              data.biddingProcessProcurementProcessProcurementMethods,
              data.biddingProcessProcurementProcessSupervisionMethods,
              data.biddingProcessMilestoneCodes
            );
          if (this.formErrorCollection.length === 0) {
            this.form.markAsPristine();
            if (navigate) {
              this.isLoading = true;
            } else {
              this.divForm.nativeElement.classList.add('hide');
              this.hidden = true;
            }
            this.biddingProcessPlanSvc
              .createBiddingProcessProcurementProcess(
                this.projectBucketId,
                this.procurementProcess
              )
              .subscribe(
                (response: string) => {
                  if (typeof response === 'string') {
                    this.isButtonDisabled = false;
                    this.procurementStore.reloadProcessesAction();
                    this.procurementProcessFormSvc.successMessage();
                    if (navigate) {
                      this.navigateToProcurement();
                    }
                  } else {
                    this.procurementProcessFormSvc.errorMessage();
                    this.isButtonDisabled = false;
                    throw new Error('Data is not an string');
                  }
                },
                () => {
                  this.procurementProcessFormSvc.errorMessage();
                  this.isButtonDisabled = false;
                }
              )
              .add(() => {
                this.isLoading = false;
                this.hidden = false;
                this.divForm.nativeElement.classList.remove('hide');
              });
          } else {
            this.isButtonDisabled = false;
            document.getElementById('top').scrollIntoView();
          }
        }
      })
    );
  }

  hasEditCommentPermission(): boolean {
    const enterCommentPermission = this.permissionSvc.hasPermission(
      PermissionEnum.ENTERPROCUREMENTCOMMENTS
    );
    const updateProcurementInfo = this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
    return !(enterCommentPermission || updateProcurementInfo);
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }
}
