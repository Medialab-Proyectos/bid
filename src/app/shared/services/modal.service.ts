import { Injectable, TemplateRef } from '@angular/core';
import {
  DialogAction,
  DialogCloseResult,
  DialogRef,
  DialogResult,
  DialogService,
} from '@progress/kendo-angular-dialog';
import { Observable } from 'rxjs';
import { DialogRequestComponent } from '../components/dialog-request/components/dialog-request.component';
import {
  ModalContent,
  DialogResponse,
  ModalOptions,
} from '@core/models/modal.model';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';
import { ProcurementComment } from '../components/dialog-comments/models';
import { Enumerator, GetWorkflowDocumentResponse } from '@core/models';
import { AppStateWithContact } from '@core/store';
import { Store } from '@ngrx/store';
import { DialogCommentsComponent } from '../components/dialog-comments/components/dialog-comments/dialog-comments.component';
import { GpnDateModalComponent } from '@fiduciary-interface/app/features/gpn/components/gpn-date-modal/gpn-date-modal.component';
import { DialogPlanCommentsComponent } from '../components/dialog-comments/components/dialog-plan-comments/dialog-plan-comments.component';
import { HistoricChangesContainerComponent } from '@fiduciary-interface/app/features/procurement/components/historic-changes-container/historic-changes-container.component';
import { ProcurementProcessVersion } from '@fiduciary-interface/app/features/procurement/models';
import { ModalInfoComponent } from '@fiduciary-interface/app/features/forms/components/modal/modal-info.component';
import { ModalConfirmComponent } from '@fiduciary-interface/app/features/forms/components/modal-confirm/modal-confirm.component';
import { DialogWithCommentComponent } from '../components/dialog-request-with-comments/components/dialog-with-comment/dialog-with-comment.component';
import { AddDocumentComponent } from '../components/dialog-documents/components/add-document.component';
import { WorkflowCommentsModalComponent } from '../components/workflow-comments-modal/workflow-comments-modal.component';
import {
  BiddingProcessPlanStatus,
  DelayedMilestoneTableTypeEnum,
} from '@core/enums';
import { DelayedMilestoneTableComponent } from '@fiduciary-interface/app/features/procurement/components/delayed-milestone-table/delayed-milestone-table.component';
import { UboModalComponent } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/components/modal/ubo-modal/ubo-modal.component';
import { UboModalStatusComponent } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/components/modal/ubo-modal-status/ubo-modal-status.component';
import { FormGroup } from '@angular/forms';
import { UBOForm } from '@core/models/ubo.model';
import { UBOBiddersResponse } from '@core/models/responses/ubo-response.model';
import { UboService } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/services/ubo.service';

export type DialogReturn = DialogCloseResult | DialogAction | DialogResponse;
export interface WorkflowModalComment {
  comment: string;
  result: ModalOptions;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  public readonly modalTypes = [
    DialogRequestComponent,
    GpnDateModalComponent,
    WorkflowCommentsModalComponent,
  ];
  optionsEnums = ModalOptions;

  constructor(
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService,
    readonly storeContact: Store<AppStateWithContact>,
    readonly uboService: UboService
  ) {
    this.getEmailData();
  }

  private email: string;

  getEmailData(): void {
    this.storeContact.subscribe((data) => {
      this.email = data.contact?.contact?.email;
    });
  }

  private translateOptions(options: DialogAction[]): DialogAction[] {
    options.forEach((el) => {
      el.text = this.translate.instant(el.text);
    });
    return options;
  }

  validateResponse(
    response: DialogResult,
    options: DialogAction[]
  ): ModalOptions {
    let result = this.optionsEnums.ACCEPT;
    if (response instanceof DialogCloseResult) {
      result = this.optionsEnums.CANCEL;
    } else {
      options.forEach((el) => {
        if (el.text === response.text) {
          result = this.optionsEnums.ACCEPT;
        } else {
          result = this.optionsEnums.CANCEL;
        }
      });
    }
    return result;
  }

  /**
   * This is a variation of the openWorkFlowCommentsModal method below.
   * It is a workaround so the workflow comments dialog closes only after successfully sending a procurement plan for approval in the Procurement Section
   *
   * Variations:
   * - No title text, this prevents showing the close button so user don't close the modal after clicking "Send for approval" button
   * - Custom actions to manage the logic of sending an approval and closing the modal only when the approval has been sent
   * @param modalText - Text to show in the modal body
   * @param customActions - TemplateRef including the custom actions buttons for the modal, these are declared in the procurement.component.html
   * @param type - The type of modal to use. By default is WorkflowCommentsModal
   * @returns a reference object to the opened dialog
   */
  openCustomWorkFlowCommentsModal(
    modalKeyTitle: string,
    modalText: ModalContent[],
    customActions?: TemplateRef<unknown>,
    type = this.modalTypes[2]
  ) {
    const dialogRef: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: type,
      actions: customActions,
      width: 720,
      preventAction: (ev) => ev instanceof DialogCloseResult,
    });
    const content = dialogRef.content.instance;
    content.content = modalText;

    return dialogRef;
  }

  openWorkFlowCommentsModal(
    modalKeyTitle: string,
    options: DialogAction[],
    modalText: ModalContent[],
    type = this.modalTypes[2]
  ): Observable<string> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: type,
      actions: this.translateOptions(options),
      width: 720,
    });
    const content = dialog.content.instance;
    content.content = modalText;
    return dialog.result
      .pipe(
        map((response) => {
          let comment: string = content.myForm.value.editor;
          return {
            comment,
            result: this.validateResponse(response, options),
          };
        })
      )
      .pipe(filter((data) => data.result === ModalOptions.ACCEPT))
      .pipe(map((data) => data.comment));
  }

  /**
    @param {string} modalKeyTitle - The key for modal title
    @param {string} options - Options to be show in the modal footer
    @param {string[]} modalText - array of keys to be shown in the modal body
  */
  open(
    modalKeyTitle: string,
    options: DialogAction[],
    modalText: ModalContent[],
    type = this.modalTypes[0]
  ): Observable<DialogReturn> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: type,
      actions: this.translateOptions(options),
      width: 720,
    });

    const content = dialog.content.instance;
    content.content = modalText;
    return dialog.result.pipe(
      map((response) => {
        if (type !== this.modalTypes[0]) {
          return response;
        }

        return {
          ...response,
          result: this.validateResponse(response, options),
        };
      })
    );
  }

  /**
    @param {string} modalKeyTitle - The key for modal title
    @param {string} options - Options to be show in the modal footer
    @param {string[]} modalText - array of keys to be shown in the modal body
  */
  openDialogOpenDate(
    modalKeyTitle: string,
    date: Date,
    options: DialogAction[] = []
  ): Observable<GpnDateModalComponent> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: GpnDateModalComponent,
      actions: this.translateOptions(options),
      width: 720,
    });

    const content = dialog.content.instance;
    content.defaultDate = date;

    return dialog.result.pipe(
      map((response: GpnDateModalComponent) => {
        return response;
      })
    );
  }

  /**
    @param {string} modalKeyTitle - The key for modal title
    @param {string} options - Options to be show in the modal footer
    @param {ProcurementComment} commentList - Array of comments
  */
  openComments(
    modalKeyTitle: string,
    options: DialogAction[],
    commentList: ProcurementComment[],
    displayVisibility = true,
    text = String()
  ): Observable<DialogReturn> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: DialogCommentsComponent,
      actions: this.translateOptions(options),
      width: 720,
      height: '90%',
      preventAction: (ev: DialogAction, dialog) => {
        const formGroup = dialog.content.instance.formGroup;
        if (!formGroup.valid && ev.cssClass === 'k-primary') {
          formGroup.get('text').markAsTouched();
          formGroup.get('visibility').markAsTouched();
          return !formGroup.valid;
        }
      },
    });

    const content = dialog.content.instance;
    content.text = text;
    content.commentList = commentList;
    content.displayVisbility = displayVisibility;

    return dialog.result.pipe(
      map((response) => ({
        ...response,
        result: this.validateResponse(response, options),
        content,
      }))
    );
  }

  openWorkflowDocuments(
    modalKeyTitle: string,
    options: DialogAction[],
    documentsList: GetWorkflowDocumentResponse[]
  ): Observable<DialogReturn> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: AddDocumentComponent,
      actions: this.translateOptions(options),
      width: 720,
      height: '90%',
    });

    const content = dialog.content.instance;
    content.workflowDocuments = documentsList;

    return dialog.result.pipe(
      map((response) => ({
        ...response,
        result: this.validateResponse(response, options),
        content,
      }))
    );
  }

  /**
    @param {string} modalKeyTitle - The key for modal title
    @param {string} options - Options to be show in the modal footer
    @param {ProcurementComment} commentList - Array of comments
  */
  openPlansComments(
    planStatus: BiddingProcessPlanStatus,
    modalKeyTitle: string,
    options: DialogAction[],
    commentList: ProcurementComment[],
    visibility: Enumerator[],
    displayVisibility = true,
    text = String()
  ): Observable<DialogReturn> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: DialogPlanCommentsComponent,
      actions: this.translateOptions(
        planStatus !== BiddingProcessPlanStatus.IN_SYNC ? options : []
      ),
      width: 770,
      height: '90%',
      preventAction: (ev: DialogAction, dialog) => {
        if (ev.cssClass === 'k-primary') {
          dialog.content.instance.generalForm
            .get('comments')
            .controls.forEach((control) => {
              control.get('text').markAsTouched();
            });
          return dialog.content.instance.generalForm.get('comments').invalid;
        }
      },
    });

    const content = dialog.content.instance;
    content.userEmail = this.email;
    content.text = text;
    content.commentList = commentList;
    content.displayVisbility = displayVisibility;
    content.visibility = visibility;
    content.planStatus = planStatus;

    return dialog.result.pipe(
      map((response) => ({
        ...response,
        result: this.validateResponse(response, options),
        content,
      }))
    );
  }

  /**
  @param {string} modalKeyTitle - The key for modal title
  @param {string} options - Options to be show in the modal footer
  @param {string[]} modalText - array of keys to be shown in the modal body
  */
  openDialogWithComments(
    modalKeyTitle: string,
    options: DialogAction[],
    modalText: ModalContent[]
  ): Observable<DialogReturn> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: DialogWithCommentComponent,
      actions: this.translateOptions(options),
      width: 720,
      preventAction: (ev: DialogAction, dialog) => {
        if (ev.cssClass === 'k-primary k-align-text submit-button-modal') {
          dialog.content.instance._commentsForm.controls[
            'comment'
          ].markAsTouched();

          return dialog.content.instance._commentsForm.invalid;
        }
      },
    });

    const content = dialog.content.instance;
    content.content = modalText;
    return dialog.result.pipe(
      map((response) => {
        return {
          ...response,
          result: this.validateResponse(response, options),
          comments: content._commentsForm.value,
        };
      })
    );
  }

  openModalHistoricChanges(
    data: ProcurementProcessVersion
  ): Observable<DialogResult> {
    const dialog: DialogRef = this.dialogService.open({
      title: '   ',
      content: HistoricChangesContainerComponent,
      actions: [],
      width: 1180,
      height: '90%',
    });
    const content = dialog.content.instance;
    content.data = data;
    return dialog.result;
  }

  /**
    @param {string} modalKeyTitle - The key for modal title
    @param {string} options - Options to be show in the modal footer
    @param {string[]} modalText - array of keys to be shown in the modal body
  */
  openDialogChangeDate(
    modalKeyTitle: string,
    date: string,
    termDays: number,
    groupText: string,
    options: DialogAction[] = []
  ): Observable<ModalInfoComponent> {
    console.log(date);
    const oneDbDay = 1;
    let fecha = new Date();
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: ModalInfoComponent,
      actions: this.translateOptions(options),
      width: 720,
    });
    const content = dialog.content.instance;
    fecha.setDate(fecha.getDate() + termDays + oneDbDay);
    content.min = new Date(fecha);
    content.defaultDate = fecha;
    content.numberDay = termDays;
    content.groupText = groupText;
    return dialog.result.pipe(
      map((response: ModalInfoComponent) => {
        return response;
      })
    );
  }
  /**
      @param {string} modalKeyTitle - The key for modal title
      @param {string} options - Options to be show in the modal footer
      @param {string[]} modalText - array of keys to be shown in the modal body
    */
  openModalConfirm(
    modalKeyTitle: string,
    groupText: string,
    options: DialogAction[] = []
  ): Observable<ModalConfirmComponent> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: ModalConfirmComponent,
      actions: this.translateOptions(options),
      width: 720,
    });
    const content = dialog.content.instance;
    content.groupText = groupText;
    return dialog.result.pipe(
      map((response: ModalConfirmComponent) => {
        return response;
      })
    );
  }

  openModalDelayedMilestoneTable(
    modalKeyTitle: string,
    data: string[][][],
    delayeMilestoneTableType: DelayedMilestoneTableTypeEnum,
    options: DialogAction[] = []
  ): Observable<DelayedMilestoneTableComponent> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: DelayedMilestoneTableComponent,
      actions: this.translateOptions(options),
      width: 720,
    });
    const content = dialog.content.instance;
    content.milestonesDelayed = data;
    content.dialog = dialog;
    content.tableTye = delayeMilestoneTableType;

    return dialog.result.pipe(
      map((response: DelayedMilestoneTableComponent) => {
        return response;
      })
    );
  }

  openDialogUBO(
    modalKeyTitle: string,
    options: DialogAction[] = [],
    uboBidders: UBOBiddersResponse
  ): Observable<DialogReturn> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: UboModalComponent,
      actions: this.translateOptions(options),
      width: 720,
      height: '90%',
      preventAction: (ev: DialogAction, dialog) => {
        const formGroup: FormGroup<UBOForm> = dialog.content.instance.UBOForm;
        const primaryBtn = String(ev.cssClass).includes('k-primary');
        const preventClose = !this.uboService.hasEmailsToSent(
          formGroup,
          primaryBtn
        );
        if ((!formGroup.valid || preventClose) && primaryBtn) {
          formGroup.controls.bidders.controls.forEach((b) => {
            b.controls.emails.controls.forEach((e) => {
              e.controls.email.markAllAsTouched();
              e.controls.fullName.markAllAsTouched();
            });
          });

          return !formGroup.valid || preventClose;
        }
      },
    });
    const content = dialog.content.instance;
    content.uboBidders = uboBidders;

    return dialog.result.pipe(
      map((response: DialogReturn) => {
        return {
          ...response,
          result: this.validateResponse(response, options),
          content: content?.UBOForm,
        };
      })
    );
  }

  openDialogUBOCheckEmailStatus(
    modalKeyTitle: string,
    options: DialogAction[] = [],
    bidders: UBOBiddersResponse,
    selectedLang: string
  ): Observable<DialogReturn> {
    const dialog: DialogRef = this.dialogService.open({
      title: this.translate.instant(modalKeyTitle),
      content: UboModalStatusComponent,
      actions: this.translateOptions(options),
      width: 720,
      height: '90%',
    });
    const content = dialog.content.instance;
    content.bidders = bidders.bidders;
    content.selectedLang = selectedLang;

    return dialog.result.pipe(
      map((response: UboModalStatusComponent) => {
        return {
          ...response,
          result: this.validateResponse(response, options),
        };
      })
    );
  }
}
