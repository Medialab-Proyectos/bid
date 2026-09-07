import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import {
  WorkflowCommentStatusEnum,
  WorkflowIdEntityType,
  WorkflowModuleEnum,
} from '@core/enums/workflow.enum';
import {
  DialogResponse,
  Enums,
  GetWorkflowDocumentResponse,
  ModalOptions,
  WorkflowDocument,
} from '@core/models';
import { WorkflowTriggerRequestBody } from '@core/models/requests/workflow-request.model';
import { EnumsStoreService } from '@core/services/store-services';
import {
  AppStateWithUsrPreferences,
  EnumState,
  AppStateWithWorkflowDocumentssState,
} from '@core/store';
import * as workflowDocActions from '@core/store/workflow-documents/actions/workflow-documents.actions';
import {
  DialogReturn,
  ModalService,
} from '@fiduciary-interface/app/shared/services/modal.service';
import { combineLatest, Observable, Subscription, throwError } from 'rxjs';
import { catchError, filter, mergeMap } from 'rxjs/operators';
import { ProcurementComment } from '../../../dialog-comments/models';
import { WorkflowButtonAction } from '../../models/flow-sticky-footer.model';
import { WorkflowSharedService } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { Store } from '@ngrx/store';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fi-flow-sticky-footer',
  templateUrl: './flow-sticky-footer.component.html',
})
export class FlowStickyFooterComponent implements OnInit, OnDestroy {
  readonly subscriptions = new Subscription();

  public displayFooter = false;
  public buttons: WorkflowButtonAction[] = [];
  public disableButtons = false;
  public commentLoading = false;
  private commentText = String();
  private selectedLanguage: string;
  private workflowModuleEnum: WorkflowModuleEnum;
  documentsLoading = false;
  displayAddDocument = false;

  constructor(
    private readonly router: Router,
    private readonly fiModalSvc: ModalService,
    private readonly enumSvc: EnumsStoreService,
    private readonly workflowSharedSvc: WorkflowSharedService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly serviceTranslate: TranslateService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly storeWorkflowDocs: Store<AppStateWithWorkflowDocumentssState>,
    private readonly translate: TranslateService
  ) {}

  public ngOnInit(): void {
    this.getCurrentLang();
    this.init();
    this.watchNavigation();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscriptions.add(sub);
  }

  public triggerAction(button: WorkflowButtonAction): void {
    this.disableButtons = true;
    button.loading = true;

    if (this.checkMandatoryComment(button)) {
      const body: WorkflowTriggerRequestBody = { ...button.body };
      if (!!this.commentText) {
        body.workflowComment = {
          text: this.commentText.replace(/<p>/, ``),
          visibility: true,
          status: WorkflowCommentStatusEnum.COMPLETED,
        };
      }

      this.workflowSharedSvc.triggerAction(
        { ...button, body },
        this.selectedLanguage,
        this.workflowModuleEnum
      );
    }
  }

  public addDocuments(): void {
    this.documentsLoading = true;
    this.workflowSharedSvc
      .getDocuments()
      .pipe(
        mergeMap((documents: GetWorkflowDocumentResponse[]) => {
          const docs: WorkflowDocument[] = documents.map((d) => ({
            id: d.fiduciaryProcessDocumentId,
            name: d.fileName,
            created: new Date(d.created),
            description: d.description,
            newDescription: d.description,
            visibility: d.visibility,
          }));
          this.documentsLoading = false;
          this.storeWorkflowDocs.dispatch(
            workflowDocActions.setWorkFlowsDocumentsAndInstance({
              docs,
              instanceId: this.workflowSharedSvc.workflowInstaceId,
            })
          );
          return this.openDocumentsModal(documents);
        }),
        catchError((err) => {
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.DOCUMENTS.GET.ERROR')
          );
          return throwError(err);
        })
      )
      .subscribe(
        () => {},
        () => {}
      )
      .add(() => {
        this.disableButtons = false;
        this.buttons.forEach((btn) => (btn.loading = false));
      });
  }

  public addComment(): void {
    this.commentLoading = true;
    this.workflowSharedSvc
      .getComments()
      .pipe(
        mergeMap((comments: ProcurementComment[]) => {
          this.commentLoading = false;
          return this.openCommentsModal(comments);
        }),
        catchError((err) => {
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.COMMENTS.GET.ERROR')
          );
          return throwError(err);
        })
      )
      .subscribe((data: DialogResponse) => {
        if (data.result === ModalOptions.ACCEPT) {
          this.commentText = data.content.formGroup.get('text').value;
        }
      })
      .add(() => {
        this.disableButtons = false;
        this.buttons.forEach((btn) => (btn.loading = false));
      });
  }

  private checkMandatoryComment(button: WorkflowButtonAction): boolean {
    if (
      button.mandatoryComment &&
      String(this.commentText).trim().length === 0
    ) {
      this.addComment();
      return false;
    }
    return true;
  }

  private openCommentsModal(
    comments: ProcurementComment[]
  ): Observable<DialogReturn> {
    return this.fiModalSvc.openComments(
      'COMMENTS.WORKFLOWS.TITLE',
      [
        { text: 'COMMENTS.CANCEL' },
        {
          text: 'COMMENTS.SUBMIT_COMMENT',
          cssClass: 'k-primary submitCommentBtnSize',
        },
      ],
      comments,
      false,
      this.commentText
    );
  }

  private openDocumentsModal(
    documents: GetWorkflowDocumentResponse[]
  ): Observable<DialogReturn> {
    return this.fiModalSvc.openWorkflowDocuments(
      'DOCUMENTS.WORKFLOWS.TITLE',
      [
        {
          text: 'WORKFLOW.ADD_DOCUMENTS.RETURN_PREVIOUS_SCREEN',
          cssClass: 'k-primary',
        },
      ],
      documents
    );
  }

  private init(): void {
    const sub = combineLatest([
      this.workflowSharedSvc.getButtonActions$(),
      this.getWorkflowActionsEnum(),
    ]).subscribe((data) => {
      this.displayFooter = data[0].actions.length > 0;
      this.buttons = this.mapButtonsAction(data[0].actions, data[1]);
      this.displayAddDocument = data[0].workflowDocument;
      this.commentText = String();
      this.disableButtons = false;
    });
    this.subscriptions.add(sub);
  }

  private getWorkflowActionsEnum(): Observable<EnumState> {
    return this.enumSvc
      .selectEnums()
      .pipe(
        filter(
          (data) =>
            data.enumsLoaded[Enums.workflowActions] &&
            data.enumsLoaded[Enums.onlineDisburmentWorkflowActions]
        )
      );
  }

  private mapButtonsAction(
    buttons: WorkflowButtonAction[],
    state: EnumState
  ): WorkflowButtonAction[] {
    return buttons.map((b) => {
      let buttonText;
      switch (b.idEntityType) {
        case WorkflowIdEntityType.PROCUREMENT_PLAN:
        case WorkflowIdEntityType.DOCUMENT_PACKAGE:
        case WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT:
          this.workflowModuleEnum = WorkflowModuleEnum.BIDDING_PROCESS;
          buttonText = state.workflowActions.find((e) => e.id === b.id)?.name;
          break;
        case WorkflowIdEntityType.FINANCIAL_TRANSACTION:
          this.workflowModuleEnum = WorkflowModuleEnum.ONLINE_DISBURSEMENT;
          buttonText = state.onlineDisburmentWorkflowActions.find(
            (e) => e.id === b.id
          )?.name;
          break;
        case WorkflowIdEntityType.PROJECT_BUCKET:
          this.workflowModuleEnum =
            WorkflowModuleEnum.GENERAL_PROCUREMENT_NOTICE;
          buttonText = state.workflowActions.find((e) => e.id === b.id)?.name;
          break;
        default:
          buttonText = b.text;
          break;
      }
      b.text = buttonText;
      return b;
    });
  }

  private watchNavigation(): void {
    const sub = this.router.events.subscribe((event) => {
      if (
        event instanceof ActivationEnd &&
        (!('canDisplayWorkflow' in event.snapshot.data) ||
          !event.snapshot.data.canDisplayWorkflow)
      ) {
        if (!!this.commentText?.trim()) {
          this.notificationGlobalService.showError(
            this.serviceTranslate.instant('WORKFLOW.TOAST.COMMENTS_ALERT'),
            'right',
            'top',
            7000
          );
        }
        this.commentText = null;
        this.workflowSharedSvc.setButtonActions([], false);
      }
    });
    this.subscriptions.add(sub);
  }
}
