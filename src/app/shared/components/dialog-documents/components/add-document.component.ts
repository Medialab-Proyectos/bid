import { Component, Input, OnInit } from '@angular/core';
import {
  DocEnum,
  PermissionEnum,
  WorkflowDocumentVisibility,
} from '@core/enums';
import {
  BiddingProcessProcurementProcess,
  Enumerator,
  ErrorResponse,
  PostWorkflowDocumentResponse,
  WorkflowDocument,
} from '@core/models';
import { WorkflowApiService } from '@core/services/apis';
import { FileInfo } from '@progress/kendo-angular-upload';
import { WorkflowSharedService } from '../../flows-sticky-footer/services';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import {
  AppState,
  AppStateWithWorkflowDocumentssState,
  workflowDocumentsByInstanceState,
} from '@core/store';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as workflowActions from '@core/store/workflow-documents/actions/workflow-documents.actions';
import { WorkflowDocumentsStoreService } from '@core/services/store-services/workflow-documents/workflow-documents-store.service';

@Component({
  selector: 'fi-add-document',
  templateUrl: './add-document.component.html',
  styleUrls: [],
})
export class AddDocumentComponent implements OnInit {
  @Input() workflowDocuments;
  public loading = false;
  hasDocumentWithVisibilityZero = false;
  hasDocuments = false;
  private readonly subscription = new Subscription();

  _mode = DocEnum.WORKFLOWS;
  editPermissions: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];

  cleanSelection: any;
  procurementProcess: BiddingProcessProcurementProcess;

  workflowDocs: WorkflowDocument[] = [];

  workflowDropDownOptions: Enumerator[] = [];

  constructor(
    readonly workflowApi: WorkflowApiService,
    readonly workflowSharedService: WorkflowSharedService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    readonly store: Store<AppState>,
    readonly storeWorkflowDocs: Store<AppStateWithWorkflowDocumentssState>,
    readonly workflowDocumentsStoreService: WorkflowDocumentsStoreService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.store.pipe(select('enums')).subscribe((enumsState) => {
        if (enumsState && enumsState.WorkFlowDocumentVisibilities) {
          this.workflowDropDownOptions =
            enumsState.WorkFlowDocumentVisibilities;
        }
      })
    );
    this.subscription.add(
      this.getWorkflowDocsByInstance().subscribe((workflowDocuments) => {
        this.loading = workflowDocuments?.loading;
        const newDocs = workflowDocuments.workflowDocuments.map((d) => {
          return { ...d };
        });
        this.workflowDocs = newDocs;
        this.hasDocumentWithVisibilityZero = this.checkDocsWithVisbilityZero(
          this.workflowDocs
        );
        this.hasDocuments = this.workflowDocs.length > 0;
      })
    );
  }

  getWorkflowDocsByInstance(): Observable<workflowDocumentsByInstanceState> {
    const instanceId = this.workflowSharedService.workflowInstaceId;
    return this.store
      .pipe(select('workflowDocuments'))
      .pipe(map((data) => data.WorkflowDocumentsByInstanceId[instanceId]));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  checkDocsWithVisbilityZero(docs: WorkflowDocument[]): boolean {
    return docs.some(
      (doc) => doc.visibility === WorkflowDocumentVisibility.PUBLIC
    );
  }

  uploadDocs(event: FileInfo[]): void {
    this.loading = true;

    const uploadObservables = event.map((file) => {
      return this.workflowApi
        .uploadWorkflowDocuments(
          this.workflowSharedService.workflowInstaceId,
          file
        )
        .pipe(
          catchError((error: ErrorResponse) => {
            // Puedes manejar las fallas aquí y almacenar las que fallaron si es necesario
            console.error('Error uploading document:', error);
            return of(null); // Retorna un Observable vacío para continuar con las otras cargas
          })
        );
    });

    forkJoin(uploadObservables).subscribe(
      (responses: (PostWorkflowDocumentResponse | null)[]) => {
        let notUploadedDoc = true;
        responses.forEach((response) => {
          if (response !== null) {
            notUploadedDoc = false;
            const workflowDoc = {
              id: response.Id,
              name: response.NewFileName,
              created: response.CreationDate,
              description: response.Description,
              newDescription: response.Description,
              visibility: response.Visibility,
            };
            this.workflowDocumentsStoreService.addWorkflowDocumentAction(
              this.workflowSharedService.workflowInstaceId,
              workflowDoc
            );
          }
        });

        this.hasDocuments = this.workflowDocs.length > 0;
        this.loading = false;
        if (notUploadedDoc) {
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.ADD_DOCUMENT.DUPLICATE_NAME_ERROR')
          );
        } else {
          this.notificationGlobalService.showSuccess(
            this.translate.instant('WORKFLOW.ADD_DOCUMENT.SUCCESS')
          );
        }
      },
      (error: ErrorResponse) => {
        // Este callback se ejecutará solo si hay un error que no fue manejado en catchError
        if (error.status === 403) {
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.ADD_DOCUMENT.DUPLICATE_NAME_ERROR')
          );
        } else {
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.ADD_DOCUMENT.ERROR')
          );
        }
        this.loading = false;
      }
    );
  }

  deleteFileAction(event): void {
    this.workflowDocumentsStoreService.deleteWorkflowDocumentAction(
      this.workflowSharedService.workflowInstaceId,
      event.id
    );
  }

  changenWorkflowDocsVisibility({ newVisibility, document }): void {
    this.workflowDocumentsStoreService.updateWorkflowDocumentVisibilityAction(
      this.workflowSharedService.workflowInstaceId,
      document.id,
      newVisibility
    );
  }

  changeDescriptionWorkflowDocs(item: WorkflowDocument): void {
    this.storeWorkflowDocs.dispatch(
      workflowActions.updateWorkflowDocumentNewDescription({
        docId: item.id,
        instanceId: this.workflowSharedService.workflowInstaceId,
        newDescription: item.newDescription,
      })
    );
  }
}
