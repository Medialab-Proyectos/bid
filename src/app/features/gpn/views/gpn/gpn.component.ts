import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { VisibilityService } from '@core/services/view';
import {
  GeneralProcurementDocumentsStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  DocumentsPermissions,
  FiduciaryProcessDocument,
  Project,
  DiscloseDocument,
  WorkflowLastStepResponse,
  DialogResponse,
  ModalOptions,
} from '@core/models';
import {
  DocumentDomain,
  FiduciaryProcessDocumentsStatuses,
  PermissionEnum,
  WorkflowCommentStatusEnum,
  WorkflowEntityScreen,
  WorkflowIdEntityType,
  WorkflowModuleEnum,
} from '@core/enums';

import {
  DialogReturn,
  FileService,
  ModalService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { FileSaverService } from 'ngx-filesaver';
import { GeneralProcurementDocumentsApiService } from '@core/services/apis';
import {
  AppStateWithContact,
  AppStateWithUsrPreferences,
  ContactState,
  UsrPreferencesState,
} from '@core/store';
import { Store } from '@ngrx/store';
import { PermissionService } from '@core/services/app/permission/permission.service';
import {
  WorkflowGPNService,
  WorkflowSharedService,
} from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { FormRequestDataGPN } from '@fiduciary-interface/app/features/forms/models/form-request-data';
import { FormNameEnum } from '@fiduciary-interface/app/features/forms/enums/form-name';
import { BussinessRulesFormService } from '@fiduciary-interface/app/features/forms/services/bussiness-rules/bussiness-rules.service';
import { BussinessRulesFunctionEnum } from '@fiduciary-interface/app/features/forms/enums/bussiness-rules-form.enum';
import { BtnBusinessRule } from '@core/models/btnBusinessRules';
import { BiddingDocumentService } from '@fiduciary-interface/app/features/forms/services/bidding-document/bidding-document.service';
import { WorkflowButtonAction } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/models';
import { ActionButton } from '@fiduciary-interface/app/core/enums/action.button.enum';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { JsonFormModel } from '@fiduciary-interface/app/features/forms/models/dynamic-form.model';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { FormStatusEnum } from '@fiduciary-interface/app/features/forms/enums/form-status.enum';
import { BussinessRulesRequest } from '@fiduciary-interface/app/features/forms/models/request/bussiness-rules-form-request.model';
import { inputPhone } from '../../../../shared/components/input-phone/components/input-phone/input-phone-form.form';
@Component({
  selector: 'fi-gpn',
  templateUrl: './gpn.component.html',
  providers: [TranslatePipe],
})
export class GpnComponent implements OnInit, OnDestroy {
  readonly suscriptionsCollection: Subscription[] = [];

  public documentsList: FiduciaryProcessDocument[];
  public expanded = true;
  public loading = true;
  public loadingBr = true;
  public selectedProject: Project;
  public selectedProjectLoading = true;
  private isInternalUser = false;
  public resultBr: BussinessRulesFunctionEnum;
  public btnBusiness: BtnBusinessRule;
  projectContractId;

  public projectBucketId: string;
  private instAcronym: string;
  private selectedLanguage: string;
  private stepWork: WorkflowLastStepResponse;
  private sendUpdateDocumente: boolean;
  public documentPermission: DocumentsPermissions = {
    download: true,
    delete: true,
  };
  private readonly formName = FormNameEnum.GPN;
  private readonly availablePermissions: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  public dynamicForm: UntypedFormGroup = this.fb.group({});
  public jsonFormData: JsonFormModel = null;
  public formStatus = FormStatusEnum.CREATE;
  public language = String();
  public testGPNTooltip: string;
  form: UntypedFormGroup = inputPhone();

  constructor(
    readonly gpnApiService: GeneralProcurementDocumentsApiService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    readonly router: Router,
    readonly gpnStore: GeneralProcurementDocumentsStoreService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly translate: TranslateService,
    readonly fileServices: FileService,
    private readonly visibilitySvc: VisibilityService,
    private readonly fileSaverService: FileSaverService,
    readonly storeContact: Store<AppStateWithContact>,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly storeProject: ProjectStoreService,
    readonly permissionSvc: PermissionService,
    readonly workflowGPNSvc: WorkflowGPNService,
    readonly workflowSharedSvc: WorkflowSharedService,
    private readonly brFormService: BussinessRulesFormService,
    readonly biddingDocumentService: BiddingDocumentService,
    readonly fiModalSvc: ModalService,
    private readonly fb: UntypedFormBuilder,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard
  ) {}

  ngOnInit(): void {
    this.loadSelectedProject();
    this.getLanguage();
    this.getUserVisiblity();
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.visibilitySvc.breadcrumbService.set('@gpn', 'BREADCRUMB.GPN');
    this.initValues();

    this.getCurrentLang();

    const subRefresDocument = this.workflowSharedSvc
      .getRefrechDocument$()
      .subscribe((response) => {
        if (response) {
          this.loadSelectedProject();
        }
      });

    this.suscriptionsCollection.push(subRefresDocument);

    const sub = this.workflowSharedSvc
      .getActionUpdateDocument$()
      .pipe(filter((value) => value !== null))
      .subscribe((response) => {
        if (response) {
          this.changeStatus(response);
          this.discloseDocument();
          this.clearButtonsAndBussnesRule();
          sub.unsubscribe();
        }
      });
    this.suscriptionsCollection.push(sub);
  }

  ngOnDestroy(): void {
    this.suscriptionsCollection.forEach((el) => {
      el.unsubscribe();
    });
  }

  public getUserVisiblity(): void {
    const sub = this.getContact()
      .pipe(filter((data) => !!data?.contact))
      .subscribe((data) => {
        this.isInternalUser = data.contact.is_internal;
      });

    this.suscriptionsCollection.push(sub);
  }

  public getCurrentLang(): void {
    const sub = this.getPreferences().subscribe((data) => {
      if (data.preferences.preferredLanguage !== null) {
        this.selectedLanguage = data.preferences.preferredLanguage;
      }
    });

    this.suscriptionsCollection.push(sub);
  }

  public loadDataFromStore(): void {
    this.gpnStore.getGeneralProcurementDocumentsAction(
      this.projectBucketId,
      DocumentDomain.PROJECTBUCKET
    );
  }

  public initValues(): void {
    const sub = this.gpnStore
      .getState()
      .pipe(
        map((state) => {
          this.loading = state.loading;
          return state.generalProcurementDocuments.map((gpnDocument) => {
            return {
              relationalId: gpnDocument.relationalId,
              id: gpnDocument.id,
              status: gpnDocument.status,
              type: gpnDocument.type,
              operationsDocumentId: gpnDocument.operationsDocumentId,
              blobId: String(),
              ezshareNumber: gpnDocument.ezshareNumber,
              name: gpnDocument.name,
              created: gpnDocument.created,
              createdBy: gpnDocument.createdBy,
              modified: gpnDocument.modified,
              biddingDocumentId: gpnDocument.biddingDocumentId,
              description: gpnDocument.description,
            };
          });
        })
      )
      .subscribe((documents) => {
        this.documentsList = [...documents].filter(
          (x) => x.status !== FiduciaryProcessDocumentsStatuses.deleted
        );
        if (this.loading === false && this.selectedProject) {
          this.loadWorkflowActions();
        }
      });

    this.suscriptionsCollection.push(sub);
  }

  public loadSelectedProject(): void {
    const sub = this.storeProject
      .selectedProject()
      .pipe(
        filter((state) => !!state.selectedProject),
        tap((state) => {
          this.selectedProject = state.selectedProject;
          this.projectBucketId = state.selectedProject.projectBucketId;
          this.instAcronym = state.selectedProject.executorAcronym;
          this.projectContractId = state.selectedProject.contract;
          this.selectedProjectLoading = state.loading;
        })
      )
      .subscribe((_) => {
        this.loadDataFromStore();
      });

    this.suscriptionsCollection.push(sub);
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.dynamicForm);
  }

  public previewDoc(): void {
    this.loading = true;
    this.brFormService
      .getPreview(
        this.documentsList[0],
        this.formStatus,
        this.formName,
        this.selectedProject.operationNumber,
        this.language,
        this.selectedProject,
        null
      )
      .subscribe(
        (response) => {
          this.loading = response;
        },
        () => {
          this.loading = false;
        }
      );
  }

  getLanguage(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        this.language = data.preferences.preferredLanguage;
      });
    this.suscriptionsCollection.push(sub);
  }

  public downloadDoc(document: FiduciaryProcessDocument): void {
    this.loading = true;
    const sub = this.biddingDocumentService
      .downloadDocument(document.id, this.language)
      .subscribe({
        next: (res) => {
          this.fileSaverService.save(
            new Blob([new Uint8Array(res.body).buffer]),
            document.name
          );
        },
        error: () => {
          this.showErrorToast(
            'SHARED.DOCUMENT.DOCUMENT_FINISHED.ERROR_DOWNLOAD'
          );
        },
        complete: () => {
          this.loading = false;
        },
      });

    this.suscriptionsCollection.push(sub);
  }

  public deleteAction(event: string): void {
    const sub = this.handleWarningModal().subscribe((data: DialogResponse) => {
      if (data.result === ModalOptions.ACCEPT) {
        this.deleteDoc(event);
      }
    });
    this.suscriptionsCollection.push(sub);
  }

  handleWarningModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      'GPN.MODAL.TITLE',
      [
        { text: 'GPN.MODAL.OPTION.NO' },
        {
          text: 'GPN.MODAL.OPTION.YES',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'GPN.MODAL.OPTION.CONTENT',
          bold: false,
        },
      ]
    );
  }

  public deleteDoc(event: string): void {
    const document = this.documentsList.find((doc) => doc.id === event);
    if (
      document.status ===
        FiduciaryProcessDocumentsStatuses.draftUploadedBlobStorage ||
      document.status === FiduciaryProcessDocumentsStatuses.rejected ||
      document.status === FiduciaryProcessDocumentsStatuses.undisclosed ||
      document.status === FiduciaryProcessDocumentsStatuses.ReturnWithComment
    ) {
      this.gpnStore.deleteGeneralProcurementDocumentAction(document.id);
      this.clearButtonsAndBussnesRule();
    }
  }

  public requestPublication(): void {
    this.openModalWorkflowComment().subscribe((data) => {
      const documentId = this.documentsList[0].id;
      this.loading = true;

      this.gpnStore.getState().pipe(
        map((state) => {
          state.loading = true;
        })
      );
      this.changeStatus(null);
      this.launchWorkflow(data)
        .pipe(
          mergeMap((_) =>
            this.gpnApiService.submitForDisclosure(
              documentId,
              this.projectBucketId,
              DocumentDomain.PROJECTBUCKET
            )
          )
        )
        .subscribe({
          next: () => {
            this.loadSelectedProject();
          },
          error: () => {
            this.showErrorToast('GPN.DISCLOSURE_ERROR');
          },
        });
    });
  }

  openModalWorkflowComment(): Observable<string> {
    return this.fiModalSvc.openWorkFlowCommentsModal(
      'WORKFLOWS.COMMENTS_MODAL.GPN.TITLE',
      [
        { text: 'WORKFLOWS.COMMENTS_MODAL.GPN.CANCEL.BTN' },
        {
          text: 'WORKFLOWS.COMMENTS_MODAL.GPN.CONFIRM_BTN',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'WORKFLOWS.COMMENTS_MODAL.GPN.TEXT',
          bold: false,
        },
      ]
    );
  }

  public redirectGPN(event: any): void {
    if (event.result === BussinessRulesFunctionEnum.PENDINGPUBLICATION) {
      this.openModalConfirm(this.documentsList[0]?.biddingDocumentId);
    } else {
      this.generateDocumentGPN();
    }
  }

  public generateDocumentGPN(): void {
    const formStatus = this.brFormService.filterBussinessRules(this.resultBr);

    const formRequestData: FormRequestDataGPN = {
      formName: this.formName, //GroupNameTextEnum.BIDDINDG_DOC_AMENDMENTS,
      formStatus,
      operationNumber: this.selectedProject.operationNumber,
      projectBucketId: this.selectedProject.projectBucketId,
      biddingDocumentId: this.documentsList[0]?.biddingDocumentId,
      fiduciaryProcessDocumentId: this.documentsList[0]?.id,
      nameFile: this.documentsList[0]?.name,
    };

    this.router.navigate([`../../../../forms`], {
      relativeTo: this.activatedRoute,
      queryParams: formRequestData,
    });
  }

  private checkShouldDisplayGPNButton(): void {
    this.resultBr = undefined;
    this.btnBusiness = undefined;
    if (
      this.documentsList.length !== 0 &&
      this.documentsList[0]?.biddingDocumentId === ''
    ) {
      return;
    }

    const gpnStatus = this.documentsList[0]?.status;

    if (this.selectedProject !== undefined) {
      const bussinessRules: BussinessRulesRequest = {
        document: this.formName,
        documentStatus: this.brFormService.mapStatusDocument(gpnStatus),
        workflowStep: this.stepWork?.actionSelected,
      };

      const sub = this.brFormService
        .getFunction(this.projectContractId, bussinessRules)
        .pipe(
          filter((data) => !!data && !!data.result),
          map((data) => data.result)
        )
        .subscribe((result) => {
          this.resultBr = result;
          this.btnBusiness = this.brFormService.createButton(
            this.resultBr,
            this.formName
          );

          this.createTextTooltip(result.toUpperCase());
        });
      this.loadingBr = false;
      this.suscriptionsCollection.push(sub);
    }
  }

  checkHaveSomePermissions(): boolean {
    return (
      this.permissionSvc.haveSomePermissions(this.availablePermissions) &&
      !this.isInternalUser
    );
  }

  public showErrorToast(message: string): void {
    this.notificationGlobalSvc.showError(
      this.translate.instant(message),
      'right',
      'top',
      7000
    );
  }

  private showSuccessToast(message: string): void {
    this.notificationGlobalSvc.showSuccess(
      this.translate.instant(message),
      'right',
      'top',
      7000
    );
  }

  public launchWorkflow(comment: string): Observable<any> {
    return this.workflowSharedSvc.getFirstRoleName().pipe(
      switchMap((firstRoleName) => {
        return this.workflowGPNSvc
          .launch(
            {
              projectBucketId: this.projectBucketId,
              isInternalVisibility: true,
              instAcronym: this.instAcronym,
              entityTypeId: this.documentsList[0].relationalId,
              businessRulesRequest: {
                factors: {
                  workflowSection:
                    WorkflowEntityScreen.GENERAL_PROCUREMENT_NOTICE,
                },
              },
              role: firstRoleName,
              workflowComment: {
                text: comment,
                visibility: true,
                status: WorkflowCommentStatusEnum.COMPLETED,
              },
            },
            this.selectedLanguage,
            WorkflowModuleEnum.GENERAL_PROCUREMENT_NOTICE
          )
          .pipe(
            catchError((_) => {
              this.showErrorToast('WORKFLOW.TOAST.LAUNCH.ERROR');
              return throwError(String());
            }),
            tap((_) => {
              this.showSuccessToast('WORKFLOW.TOAST.GPN_LAUNCH.SUCCESS');
            })
          );
      })
    );
  }

  private loadWorkflowActions(): void {
    if (!!this.documentsList[0]?.id) {
      this.workflowSharedSvc.loadActions(
        {
          body: {
            entityTypeId: this.documentsList[0].relationalId,
            projectBucketId: this.projectBucketId,
            idEntityType: WorkflowIdEntityType.PROJECT_BUCKET,
          },
          projectContractId: this.projectContractId,
          instAcronym: this.instAcronym,
        },
        {},
        FormNameEnum.GPN
      );

      const sub = this.workflowSharedSvc
        .getStepWorkFlow$()
        .subscribe((response) => {
          if (response) {
            this.stepWork = response;
            this.workflowSharedSvc.setStepWorkFlow(null);
            sub.unsubscribe();
          }
          this.checkShouldDisplayGPNButton();
        });
      this.suscriptionsCollection.push(sub);
    } else {
      this.checkShouldDisplayGPNButton();
    }
  }

  private clearButtonsAndBussnesRule() {
    this.resultBr = undefined;
    this.btnBusiness = undefined;
  }

  public getContact(): Observable<ContactState> {
    return this.storeContact.select('contact');
  }

  public getPreferences(): Observable<UsrPreferencesState> {
    return this.storePreferences.select('preferences');
  }

  public changeStatus(action: WorkflowButtonAction): void {
    let status = 0;
    switch (action?.id) {
      case ActionButton.APPROVE:
        status = FiduciaryProcessDocumentsStatuses.pendingDisclose;
        break;
      case ActionButton.RETURN_WITH_COMMENTS:
        status = FiduciaryProcessDocumentsStatuses.ReturnWithComment;
        break;
      default:
        status = FiduciaryProcessDocumentsStatuses.underReview;
        break;
    }

    const document = {
      documents: [{ id: this.documentsList[0]?.id, status }],
    };
    const sub = this.biddingDocumentService
      .updateStatusDocument(document)
      .pipe(map((data) => data))
      .subscribe((_) => {
        if (!this.sendUpdateDocumente) {
          this.loadSelectedProject();
          this.workflowSharedSvc.setActionUpdateDocument(null);
        }
        this.sendUpdateDocumente = true;
      });
    this.suscriptionsCollection.push(sub);
  }

  discloseDocument(): void {
    const discloseDocument: DiscloseDocument = {
      language: this.selectedLanguage,
      stageCode: 'GPN',
    };

    const gptS = this.gpnApiService
      .sendDisclosure(this.documentsList[0]?.id, discloseDocument)
      .subscribe(
        (_) => {},
        (_) => {}
      );
    this.suscriptionsCollection.push(gptS);
  }

  createTextTooltip(result: string): void {
    if (
      result === BussinessRulesFunctionEnum.GENERATE ||
      result === BussinessRulesFunctionEnum.ADJUST
    ) {
      this.testGPNTooltip = 'SHARED.DOCUMENT.UPLOAD_FILES_TOOLTIP';
    } else {
      this.testGPNTooltip = '';
    }
  }

  openModalConfirm(idDocument: string) {
    this.fiModalSvc
      .openModalConfirm(
        this.translate.instant(
          'BIDDINDG.PENDINGPUBLICATION.MODAL.PUBLICATION_TITLE'
        ),
        this.translate.instant('FORMS.FORMS_TABS.GPN_NAME')
      )
      .subscribe((response) => {
        if (response.confirm) {
          this.sendToPublication(idDocument);
        }
      });
  }

  private sendToPublication(idDocument: string): void {
    const sub = this.biddingDocumentService
      .sendToPublication(idDocument)
      .subscribe(() => {
        this.loadSelectedProject();
      });
    this.suscriptionsCollection.push(sub);
  }
}
