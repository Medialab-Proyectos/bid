import { Injectable } from '@angular/core';
import { Project } from '@core/models';
import { ProjectStoreService } from '@core/services/store-services';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, tap } from 'rxjs/operators';
import * as selectedProjectActions from '@core/store/selectedProject/actions/selectedProject.actions';
import { Convergencia, FormConvergencia } from '@core/models/Convergencia';
import { UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DocumentDomain } from '@core/enums';
import { DocumentFormatEnum } from '../../enums/document-format';
import {
  PreviewBiddingDocumentRequest,
  StoreBiddingDocumentRequest,
  UpdateBiddingDocumentRequest,
} from '../../models/request/bidding-document-request.model';
import { JsonFormModel, Publication } from '../../models/dynamic-form.model';
import { FormNameEnum } from '../../enums/form-name';
import { BiddingDocumentService } from '../bidding-document/bidding-document.service';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { DatePipe } from '@angular/common';
import { Comments } from '../../models/comment.model';
import { FormStatusEnum } from '../../enums/form-status.enum';
import { inputPhone } from '../../../../shared/components/input-phone/components/input-phone/input-phone-form.form';
@Injectable({
  providedIn: 'root',
})
export class DynamicFormsSharedService {
  constructor(
    readonly projectStore: ProjectStoreService,
    readonly store: Store<AppState>,
    readonly datePipe: DatePipe,
    readonly biddingDocumentService: BiddingDocumentService,
    readonly notificationGlobalService: NotificationGlobalService,
    readonly translate: TranslateService,
    public datepipe: DatePipe
  ) {}

  form: UntypedFormGroup = inputPhone();

  addOdataConvergence(
    odata: UntypedFormGroup,
    selectedProject: Project,
    lang: string,
    publications?: Publication[]
  ): FormConvergencia {
    let newFormData: FormConvergencia = null;

    if (!!odata) {
      const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();
      const convergence: Convergencia = {
        country: this.translate.instant(
          `ENUM.COUNTRY.${selectedProject.countryCode}`
        ),
        countryCode: selectedProject.countryCode,
        TotalFinanceCost: selectedProject.approvedAmount,
        projectName: selectedProject.name,
        executingAgency: selectedProject.executor,
        approvalNumber: selectedProject.contract,
        operationId: selectedProject.projectBucketId,
        operationNumber: selectedProject.operationNumber,
      };
      newFormData = {
        ...odata,
        convergence,
        language: lang,
        timeZone: resolvedOptions.timeZone,
        publications: publications,
      };
    }
    return newFormData;
  }

  getDomainByFormName(formName: FormNameEnum): DocumentDomain {
    if (formName === FormNameEnum.GPN) {
      return DocumentDomain.PROJECTBUCKET;
    } else {
      return DocumentDomain.BIDDINGPROCESSDOCUMENTGROUP;
    }
  }

  getParentIdByFormName(
    formName: FormNameEnum,
    projectBucketId: string,
    documentPackageId: string
  ): string {
    if (formName === FormNameEnum.GPN) {
      return projectBucketId;
    } else {
      return documentPackageId;
    }
  }

  deleteDocument(
    fiduciaryProcessDocumentId: string,
    domain: DocumentDomain
  ): Observable<any> {
    return this.biddingDocumentService
      .deleteGeneralProcurementDocument(fiduciaryProcessDocumentId, domain)
      .pipe(
        catchError((err) => {
          this.notificationGlobalService.showError(
            this.translate.instant('FORMS.TOAST.FORM_DELETE_ERROR')
          );
          return throwError(err);
        })
      );
  }

  storeDocument(
    jsonFormData: JsonFormModel,
    dynamicForm: UntypedFormGroup,
    formName: FormNameEnum,
    selectedProject: Project,
    biddingProcessProcurementProcessId: string,
    documentPackageId: string,
    lang: string
  ): Observable<any> {
    return this.biddingDocumentService
      .generateDocumentFile(
        this.buildStoreDocumentRequest(
          jsonFormData,
          dynamicForm,
          selectedProject,
          biddingProcessProcurementProcessId,
          lang
        )
      )
      .pipe(
        catchError((err) => {
          this.notificationGlobalService.showError(
            this.translate.instant('FORMS.TOAST.FORM_CREATE_ERROR')
          );
          return throwError(err);
        }),
        tap((_) => {
          this.notificationGlobalService.showSuccess(
            this.translate.instant('FORMS.TOAST.FORM_CREATE')
          );
        }),
        mergeMap((response) =>
          this.sendBidddingDocuments(
            response,
            formName,
            jsonFormData.idDocument,
            selectedProject.projectBucketId,
            documentPackageId
          )
        )
      );
  }

  buildStoreDocumentRequest(
    jsonFormData: JsonFormModel,
    dynamicForm: UntypedFormGroup,
    selectedProject: Project,
    biddingProcessProcurementProcessId: string,
    lang: string
  ): StoreBiddingDocumentRequest {
    return {
      documentType: jsonFormData.type,
      documentFormatType: DocumentFormatEnum.PDF,
      documentInfo: JSON.stringify(
        this.addOdataConvergence(
          this.buildOdataForm(dynamicForm, biddingProcessProcurementProcessId),
          selectedProject,
          lang,
          jsonFormData.publications
        )
      ),
      biddingDocumentId: jsonFormData.idDocument,
    };
  }

  updateDocument(
    dynamicForm: UntypedFormGroup,
    selectedProject: Project,
    lang: string,
    biddingProcessProcurementProcessId: string,
    biddingDocumentId: string,
    requestComments
  ): Observable<any> {
    return this.biddingDocumentService
      .updateDocument(
        biddingDocumentId,
        this.buildUpdateDocumentRequest(
          dynamicForm,
          selectedProject,
          requestComments,
          biddingProcessProcurementProcessId,
          lang
        )
      )
      .pipe(
        catchError((err) => {
          this.notificationGlobalService.showError(
            this.translate.instant('FORMS.TOAST.FORM_UPDATE_ERROR')
          );
          return throwError(err);
        }),
        tap((_) => {
          this.notificationGlobalService.showSuccess(
            this.translate.instant('FORMS.TOAST.FORM_UPDATE')
          );
        })
      );
  }

  buildUpdateDocumentRequest(
    dynamicForm: UntypedFormGroup,
    selectedProject: Project,
    requestComments: any[],
    biddingProcessProcurementProcessId: string,
    lang: string
  ): UpdateBiddingDocumentRequest {
    return {
      jsonFormModel: JSON.stringify(
        this.addOdataConvergence(
          this.buildOdataForm(dynamicForm, biddingProcessProcurementProcessId),
          selectedProject,
          lang
        )
      ),
      comments: requestComments,
    };
  }

  buildOdataForm(
    dynamicForm: UntypedFormGroup,
    biddingProcessProcurementProcessId: string
  ): UntypedFormGroup {
    let newForm = this.proceesHoursForm(dynamicForm);

    let odataForm = newForm;
    if (!!biddingProcessProcurementProcessId) {
      odataForm = {
        biddingProcessProcurementProcessId,
        ...newForm,
      };
    }
    return odataForm;
  }

  checkExistsFiduciaryDocument(
    fiduciaryProcessDocumentId: string,
    domain: DocumentDomain,
    jsonFormData: JsonFormModel,
    formName: FormNameEnum,
    dynamicForm: UntypedFormGroup,
    selectedProject: Project,
    biddingProcessProcurementProcessId: string,
    documentPackageId: string,
    lang: string
  ): Observable<any> {
    if (!!fiduciaryProcessDocumentId) {
      return this.deleteDocument(fiduciaryProcessDocumentId, domain).pipe(
        mergeMap((_) =>
          this.storeDocument(
            jsonFormData,
            dynamicForm,
            formName,
            selectedProject,
            biddingProcessProcurementProcessId,
            documentPackageId,
            lang
          )
        )
      );
    } else {
      return this.storeDocument(
        jsonFormData,
        dynamicForm,
        formName,
        selectedProject,
        biddingProcessProcurementProcessId,
        documentPackageId,
        lang
      );
    }
  }

  generateDocument(response, format = DocumentFormatEnum.PDF): void {
    const nameFile = response.headers
      .get('content-disposition')
      .split(';')[1]
      .split('filename')[1]
      .split('=')[1]
      .trim();
    this.biddingDocumentService.success(response, nameFile, format);
  }

  // TODO: type the response
  sendBidddingDocuments(
    response,
    formName: FormNameEnum,
    biddingDocumentId: string,
    projectBucketId: string,
    documentPackageId: string
  ): Observable<any> {
    return this.biddingDocumentService
      .sendDocuments(
        this.getParentIdByFormName(
          formName,
          projectBucketId,
          documentPackageId
        ),
        this.getDomainByFormName(formName),
        biddingDocumentId,
        response.body,
        `${this.datePipe.transform(new Date(), 'yyyy-MM-dd')}.pdf`
      )
      .pipe(
        catchError((err) => {
          this.notificationGlobalService.showError(
            this.translate.instant('FORMS.TOAST.FORM_CREATE_ERROR')
          );
          return throwError(err);
        })
      );
  }

  buildPreviewDocumentRequest(
    jsonFormData: JsonFormModel,
    dynamicForm: UntypedFormGroup,
    selectedProject: Project,
    biddingProcessProcurementProcessId: string,
    lang: string
  ): PreviewBiddingDocumentRequest {
    return {
      documentType: jsonFormData.type,
      documentInfo: JSON.stringify(
        this.addOdataConvergence(
          this.buildOdataForm(dynamicForm, biddingProcessProcurementProcessId),
          selectedProject,
          lang,
          jsonFormData.publications
        )
      ),
      biddingDocumentId: jsonFormData.idDocument,
    };
  }

  public getSelectedProjectData$(operationNumber: string): Observable<Project> {
    return this.projectStore.projects().pipe(
      filter((data) => !!data?.newProjects && !!operationNumber),
      map((data) =>
        data.newProjects.find((p) => p.operationNumber === operationNumber)
      ),
      tap((project) => {
        this.store.dispatch(
          selectedProjectActions.setSelectedProjectSuccess({
            SelectedProject: project,
          })
        );
      })
    );
  }

  public openDocumentPreviewDialog(
    jsonFormData: JsonFormModel,
    dynamicForm: UntypedFormGroup,
    selectedProject: Project,
    biddingProcessProcurementProcessId: string,
    lang: string
  ): Observable<any> {
    return this.biddingDocumentService
      .getPreviewHtml(
        this.buildPreviewDocumentRequest(
          jsonFormData,
          dynamicForm,
          selectedProject,
          biddingProcessProcurementProcessId,
          lang
        )
      )
      .pipe(
        catchError((err) => {
          this.notificationGlobalService.showError(
            this.translate.instant('FORMS.TOAST.FORM_PREVIEW_ERROR')
          );
          return throwError(err);
        })
      );
  }

  public downloadDocument(
    fiduciaryProcessDocumentId: string,
    lang: string,
    canDownload: boolean
  ): Observable<any> {
    return this.biddingDocumentService
      .downloadDocument(fiduciaryProcessDocumentId, lang)
      .pipe(
        tap((response) => {
          if (canDownload) {
            this.generateDocument(response);
          }
        }),
        catchError((err) => {
          this.notificationGlobalService.showError(
            this.translate.instant('FORMS.TOAST.FORM_DOWNLOAD_ERROR')
          );
          return throwError(err);
        })
      );
  }

  public saveDocument(
    dynamicForm: UntypedFormGroup,
    jsonFormData: JsonFormModel,
    formName: FormNameEnum,
    selectedProject: Project,
    lang: string,
    fiduciaryProcessDocumentId = String(),
    biddingProcessProcurementProcessId = String(),
    documentPackageId = String()
  ): Observable<any> {
    return this.checkExistsFiduciaryDocument(
      fiduciaryProcessDocumentId,
      this.getDomainByFormName(formName),
      jsonFormData,
      formName,
      dynamicForm,
      selectedProject,
      biddingProcessProcurementProcessId,
      documentPackageId,
      lang
    );
  }

  public adjustDocument(
    dynamicForm: UntypedFormGroup,
    formName: FormNameEnum,
    selectedProject: Project,
    lang: string,
    biddingDocumentId = String(),
    biddingProcessProcurementProcessId = String(),
    requestComments: Comments[],
    nameFile: string,
    formStatus: FormStatusEnum,
    fiduciaryProcessDocumentId = String()
  ): Observable<any> {
    return this.updateDocument(
      dynamicForm,
      selectedProject,
      lang,
      biddingProcessProcurementProcessId,
      biddingDocumentId,
      requestComments
    ).pipe(
      mergeMap((_) =>
        this.downloadDocument(fiduciaryProcessDocumentId, lang, false)
      ),
      mergeMap((resp) => {
        if (formStatus === FormStatusEnum.ADJUST_RETURNED) {
          return this.updateDocumentReturnedWithComment(
            fiduciaryProcessDocumentId,
            resp,
            nameFile
          );
        } else {
          return this.updateBlobDocument(formName, resp, nameFile);
        }
      })
    );
  }

  adjustCommentDocument(
    dynamicForm: UntypedFormGroup,
    selectedProject: Project,
    lang: string,
    biddingDocumentId = String(),
    biddingProcessProcurementProcessId = String(),
    requestComments: Comments[]
  ): Observable<any> {
    return this.updateDocument(
      dynamicForm,
      selectedProject,
      lang,
      biddingProcessProcurementProcessId,
      biddingDocumentId,
      requestComments
    ).pipe(
      catchError((err) => {
        this.notificationGlobalService.showError(
          this.translate.instant('FORMS.TOAST.FORM_SAVE_ERROR')
        );
        return throwError(err);
      })
    );
  }

  updateBlobDocument(formName: FormNameEnum, document: any, nameFile: string) {
    return this.biddingDocumentService.updateBlobDocument(
      this.getDomainByFormName(formName),
      document,
      nameFile
    );
  }

  updateDocumentReturnedWithComment(
    fiduciaryProcessDocumentId: string,
    document: any,
    nameFile: string
  ) {
    return this.biddingDocumentService.updateDocumentReturnedWithComments(
      fiduciaryProcessDocumentId,
      document,
      nameFile
    );
  }

  processPhoneNumber(phone: any): UntypedFormGroup {
    if (typeof phone === 'string' && phone !== '') {
      const dataNumber = phone.split(' ');
      if (dataNumber.length === 2) {
        this.form.setValue({
          number: dataNumber[1],
          dialCode: dataNumber[0],
        });
      } else {
        if (dataNumber.length === 3) {
          this.form?.setValue({
            number: dataNumber[2],
            dialCode: `${dataNumber[0]} ${dataNumber[1]}`,
          });
        }
      }
      return this.form.value;
    } else if (typeof phone === 'object' && phone !== null) {
      this.form?.setValue({
        number: phone?.number,
        dialCode: phone?.dialCode,
      });
      return this.form.value;
    }
    return null;
  }

  proceesHoursForm(dynamicForm: UntypedFormGroup): any {
    let newDynamicForm = dynamicForm.getRawValue();
    for (const property in newDynamicForm) {
      if (
        property === 'officeHoursFrom' ||
        property === 'officeHoursTo' ||
        property === 'offerDate'
      ) {
        if (newDynamicForm[property] instanceof Date) {
          const date = new Date(newDynamicForm[property]);
          const strDate = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
          newDynamicForm[property] = strDate;
        } else if (newDynamicForm[property].includes('Z')) {
          const strDate = newDynamicForm[property];
          const [dateValues, timeValues] = strDate.split('T');

          const [year, month, day] = dateValues.split('-');
          const [hours, minutes, seconds] = timeValues
            .replace('Z', '')
            .split(':');

          const newDateZ = new Date(
            +year,
            +month - 1,
            +day,
            +hours,
            +minutes,
            +seconds
          );
          newDynamicForm[property] = this.datePipe.transform(
            newDateZ,
            'yyyy-MM-dd HH:mm:ss'
          );
        } else {
          newDynamicForm[property] = this.datepipe.transform(
            newDynamicForm[property],
            'yyyy-MM-dd HH:mm:ss'
          );
        }
      }
    }
    return newDynamicForm;
  }
}
