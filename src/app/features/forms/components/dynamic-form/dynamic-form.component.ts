import { NotificationGlobalService } from './../../../../shared/services/notification-global.service';
import { NoaParticipantService } from './../../services/noa-participant/noa-participant.service';
import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { FormValidationService } from '@core/services/validation';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { FormStatusEnum } from '../../enums/form-status.enum';
import { JsonFormModel, Numeral } from '../../models/dynamic-form.model';
import { DynamicPreviewDialogComponent } from '../dynamic-preview-dialog/dynamic-preview-dialog.component';
import { Comments, DeclineAnswer } from '../../models/comment.model';
import { Router } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { GeneralProcurementDocumentsStoreService } from '@core/services/store-services';
import { Permission, Project, RoleObj } from '@core/models';
import {
  AppStateWithPermissions,
  AppStateWithUsrPreferences,
} from '@core/store';
import { Store } from '@ngrx/store';
import { from, of, Subscription } from 'rxjs';
import { DocumentFormatEnum } from '../../enums/document-format';
import { FormNameEnum } from '../../enums/form-name';
import { DynamicFormsSharedService } from '../../services/dynamic-form-shared/dynamic-form-shared.service';
import { mergeMap } from 'rxjs/operators';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { ParticipantNoa } from '../../models/participant-noa.model';
import { ParticipantsService } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-participants/services/participants.service';
import { ParticipantNoaResponse } from '../../models/response/participant-noa-response.model';
import { ParticipantsResult } from '@core/enums/participants-result.enum';
import { ParticipantNoaGet } from '../../models/response/participant-noa-detail-response.model';
import { RolEnum } from '@core/enums';
import { inputPhone } from '../../../../shared/components/input-phone/components/input-phone/input-phone-form.form';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'fi-dynamic-form',
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent implements OnInit {
  private readonly subscription = new Subscription();

  @Input() dynamicForm: UntypedFormGroup;
  @Input() jsonFormData: JsonFormModel;
  @Input() formStatus: FormStatusEnum = FormStatusEnum.VIEW;
  @Input() formName: FormNameEnum;
  @Input() selectedProject: Project;
  @Input() biddingDocumentId: string;
  @Input() fiduciaryProcessDocumentId: string;
  @Input() documentPackageId: string;
  @Input() biddingProcessPlanId: string; // procurementId
  @Input() biddingProcessProcurementProcessId: string;
  @Input() language: string;
  @Input() nameFile: string;

  public loading = false;
  public rolUser: RoleObj;
  public rolIdCode: string;

  FormStatusEnum = FormStatusEnum;
  FormNameEnum = FormNameEnum;
  formErrorCollection: FormErrorTranslateKey[] = [];
  showCommentsList: boolean[] = [];
  showCommentIndex: number;
  infoNumeralList: any[] = [];
  infoNumeral: any;
  listCommentsList: any = [];
  listComments: Comments[] = [];
  routerGpn: string;
  routerOtherForm: string;
  participants: ParticipantNoaResponse = {
    noaParticipants: [],
  };

  showParticipantsList: boolean;
  showParticipantsRejected: boolean;
  showParticipantsAwarded: boolean;
  hasEmptyYear: boolean;
  IS_REQUIRED_TEXT = 'required';
  form: UntypedFormGroup = inputPhone();

  public errorListTitle = this.translateService.instant(
    'FORMS.VALIDATIONS.TITLE'
  );

  constructor(
    private readonly translateService: TranslateService,
    private readonly formValidationService: FormValidationService,
    private readonly dialogService: DialogService,
    private readonly router: Router,
    public readonly datepipe: DatePipe,
    readonly gpnStore: GeneralProcurementDocumentsStoreService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly permissionService: PermissionService,
    private readonly dynamicFormsSharedService: DynamicFormsSharedService,
    private readonly fb: UntypedFormBuilder,
    private readonly participantsService: ParticipantsService,
    private readonly titlecasePipe: TitleCasePipe,
    private readonly noaParticipantsService: NoaParticipantService,
    private readonly notificationService: NotificationGlobalService,
    readonly storePermissions: Store<AppStateWithPermissions>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.showCommentsStates(this.jsonFormData.numerals);
    this.setComments();
    this.validatePhone();
    this.getRoles();

    if (
      this.formName === FormNameEnum.NOA_GOODS ||
      this.formName === FormNameEnum.NOA_FIRMS
    ) {
      this.getNoaParticipants(this.biddingProcessProcurementProcessId);
    }
  }

  getRoles() {
    this.rolUser = {
      roleType: '',
      roleIdCode: '',
      roleName: '',
    };

    this.subscription.add(
      this.storePermissions.select('permissions').subscribe((res) => {
        if (res?.permissions.length !== 0) {
          const permissions = res.permissions.filter(
            (x) => x.contractNumber === this.selectedProject.contract
          );
          const permission = this.findRoleInPermission(permissions);
          this.rolUser.roleIdCode = permission?.roleIdCode;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public goBack(): void {
    const newContract = encodeURIComponent(this.selectedProject.contract);
    const baseRoute = `/project/${this.selectedProject.operationNumber}/${newContract}`;

    const route =
      this.formName === FormNameEnum.GPN
        ? `${baseRoute}/gpn`
        : `${baseRoute}/procurement/${this.biddingProcessPlanId}/process/${this.biddingProcessProcurementProcessId}/doc-packages`;

    this.router.navigate([route]);
  }

  public onSubmit(): void {
    this.validateForm();
    this.validatePhone();
    if (this.formErrorCollection.length <= 0) {
      this.dynamicForm.markAsPristine();
      this.loading = true;
      let observable = of(null);

      switch (this.formStatus) {
        case FormStatusEnum.CREATE:
          observable = this.dynamicFormsSharedService.saveDocument(
            this.dynamicForm,
            this.jsonFormData,
            this.formName,
            this.selectedProject,
            this.language,
            this.fiduciaryProcessDocumentId,
            this.biddingProcessProcurementProcessId,
            this.documentPackageId
          );
          break;
        case FormStatusEnum.ADJUST:
        case FormStatusEnum.ADJUST_RETURNED:
          observable = this.dynamicFormsSharedService.adjustDocument(
            this.dynamicForm,
            this.formName,
            this.selectedProject,
            this.language,
            this.biddingDocumentId,
            this.biddingProcessProcurementProcessId,
            this.loadCommenList(),
            this.nameFile,
            this.formStatus,
            this.fiduciaryProcessDocumentId
          );
          break;
        case FormStatusEnum.REVIEW:
        case FormStatusEnum.REVIEW_TEAM_LEADER:
        case FormStatusEnum.VIEW:
          observable = this.dynamicFormsSharedService.adjustCommentDocument(
            this.dynamicForm,
            this.selectedProject,
            this.language,
            this.biddingDocumentId,
            this.biddingProcessProcurementProcessId,
            this.loadCommenList()
          );
          break;
      }

      this.dynamicForm.markAsPristine();
      const sub = observable
        .subscribe((_) => this.goBack())
        .add(() => (this.loading = false));
      this.subscription.add(sub);
    }
  }

  public loadCommenList(): Comments[] {
    const requestComments: Comments[] = [];
    for (const commentsPerNumeral of this.listCommentsList) {
      for (let index = 0; index < commentsPerNumeral.length; index++) {
        if (index === 0) {
          continue;
        }

        requestComments.push(commentsPerNumeral[index]);
      }
    }
    return requestComments;
  }

  public openDocumentPreviewDialog(): void {
    this.loading = true;

    this.validatePhone();
    const sub = this.dynamicFormsSharedService
      .openDocumentPreviewDialog(
        this.jsonFormData,
        this.dynamicForm,
        this.selectedProject,
        this.biddingProcessProcurementProcessId,
        this.language
      )
      .subscribe((response) => {
        const dialogRef = this.dialogService.open({
          title: this.translateService.instant('FORMS.DYNAMIC_FORM.PREVIEW'),
          content: DynamicPreviewDialogComponent,
          maxHeight: '90%',
          maxWidth: '70%',
          actions: [
            {
              text: this.translateService.instant('FORMS.DYNAMIC_FORM.CLOSE'),
              primary: true,
            },
          ],
        });
        dialogRef.content.instance.previewHTML = response;
      })
      .add(() => {
        this.loading = false;
      });
    this.subscription.add(sub);
  }

  public downloadDocumentHandler(): void {
    const types: DocumentFormatEnum[] = [DocumentFormatEnum.PDF];

    const sub = from(types)
      .pipe(
        mergeMap(() =>
          this.dynamicFormsSharedService.downloadDocument(
            this.fiduciaryProcessDocumentId,
            this.language,
            true
          )
        )
      )
      .subscribe();

    this.subscription.add(sub);
  }

  private validateForm(): void {
    const errorDefinitions = this.jsonFormData.errorDefinitions.reduce(
      (value: any, key: any) => {
        value[key.name] = this.translateService.instant(key.key);
        return value;
      },
      {}
    );

    this.formErrorCollection = this.formValidationService.validateForm(
      this.dynamicForm,
      errorDefinitions
    );
  }

  private setComments(): void {
    this.jsonFormData.numerals.forEach((element, index) => {
      if (element.comments !== null) {
        for (const comment of element.comments) {
          this.listCommentsList[index].push(comment);
        }
      } else {
        element.comments = [];
      }
    });
  }

  private showCommentsStates(numeral: Numeral[]) {
    for (const num of numeral) {
      this.showCommentsList.push(false);
      this.infoNumeralList.push({
        title: num.title,
        number: num.number,
      });
      this.listCommentsList.push([this.infoNumeralList]);
    }
  }

  eventComments(event) {
    this.listCommentsList[event.numeral - 1].push(event);
    this.jsonFormData.numerals[event.numeral - 1].comments.push(event);
  }

  eventEditComment(event) {
    this.listCommentsList[event.comment.numeral - 1][event.index] =
      event.comment;

    this.jsonFormData.numerals[event.comment.numeral - 1].comments[
      event.index - 1
    ] = event.comment;
  }

  eventDeclineComment(event) {
    this.listCommentsList[event.comment.numeral - 1].splice(event.index, 1);
    this.jsonFormData.numerals[event.comment.numeral - 1].comments.splice(
      event.index - 1,
      1
    );
  }

  eventDeclineAnswer(event: DeclineAnswer): void {
    const answer = this.listCommentsList[event.item.numeral - 1];
    answer[event.index].reply = null;
  }

  openReview(index: number) {
    this.infoNumeral = this.infoNumeralList[index];
    this.listComments = this.listCommentsList[index];
    for (let i = 0; i < this.showCommentsList.length; i++) {
      if (i !== index) {
        this.showCommentsList[i] = false;
      }
    }
    this.showCommentIndex = index;
    this.showCommentsList[index] = !this.showCommentsList[index];
  }

  participantFormList = this.fb.array([]);

  get participantsArray() {
    return this.dynamicForm.get('participants') as UntypedFormArray;
  }

  createParticipantsGroup(participant: ParticipantNoa): UntypedFormGroup {
    const {
      nationality,
      id,
      name,
      signatureDate,
      procurementName,
      totalScore,
      amount,
      result,
      rejectReason,
      contractScope,
    } = participant;

    this.hasEmptyYear = signatureDate.toString().includes('0001');

    let nationalityParsed =
      this.participantsService.setNationalities(nationality);
    nationalityParsed = this.titlecasePipe.transform(nationalityParsed);
    const form = this.fb.group({
      id: [id],
      bidderName: [{ value: name, disabled: true }],
      nationality: [{ value: nationalityParsed, disabled: true }],
      amount: [{ value: amount, disabled: true }],
      signatureDate: [{ value: new Date(signatureDate), disabled: true }],
      totalScore: [{ value: totalScore, disabled: true }],
      result: [{ value: result, disabled: true }],
      hasEmptyYear: [{ value: this.hasEmptyYear, disabled: true }],
      openingPrice: [{ value: amount, disabled: false }],
      evaluatedPrice: [{ value: amount, disabled: false }],
      rejectReason: [rejectReason],
      contractScope: [contractScope ? contractScope : procurementName],
    });
    return form;
  }

  initParticipantArray(): void {
    this.dynamicForm.addControl('participants', this.participantFormList);

    this.participants.noaParticipants
      ?.sort((a, b) => a.result - b.result)
      .forEach((p) => {
        this.participantsArray.push(this.createParticipantsGroup(p));
      });

    const array = this.participantsArray.controls;
    array.forEach((c) => {
      const result = c.get('result')?.value;
      if (
        this.showParticipantsList &&
        result === ParticipantsResult.PARTICIPANT
      ) {
        c.get('openingPrice').setValidators(Validators.required);
        c.get('evaluatedPrice').setValidators(Validators.required);
      }

      if (
        this.showParticipantsRejected &&
        result === ParticipantsResult.REJECTED
      ) {
        c.get('rejectReason').setValidators(Validators.required);
        c.get('openingPrice').setValidators(Validators.required);
      }

      if (
        this.showParticipantsAwarded &&
        result === ParticipantsResult.AWARDED
      ) {
        c.get('contractScope').setValidators(Validators.required);
      }
    });
  }

  getNoaParticipants(biddingProcessProcurementProcessId: string): void {
    this.noaParticipantsService
      .getNoaParticipants(biddingProcessProcurementProcessId)
      .subscribe({
        next: (participantNoaResponse: ParticipantNoaResponse) => {
          const participant = this.processParticipant(participantNoaResponse);

          this.participants = participant;
          this.visibilityParticipantSections(participant);

          if (this.formStatus === FormStatusEnum.CREATE) {
            this.initParticipantArray();
          } else {
            this.populateParticipants(this.jsonFormData);
          }
        },

        error: (_err) => {
          const errorMsg = this.translateService.instant(
            'FORMS.PARTICIPANTS.ERROR'
          );
          this.notificationService.showError(errorMsg);
        },
      });
  }

  showBtnPreview(comments: Comments[]): boolean {
    this.rolIdCode = this.rolUser?.roleIdCode;

    if (
      this.formStatus === FormStatusEnum.REVIEW ||
      this.formStatus === FormStatusEnum.VIEW ||
      this.formStatus === FormStatusEnum.REVIEW_TEAM_LEADER ||
      this.formStatus === FormStatusEnum.ADJUST_RETURNED
    ) {
      if (this.checkFormAndRolUserGPN()) {
        return true;
      }

      if (
        this.rolIdCode === RolEnum.Procurement_Fiduciary_Specialist ||
        this.isRolTeamLeader(this.rolIdCode)
      ) {
        return true;
      }

      for (const item of comments) {
        if (
          this.rolIdCode === item.userRole ||
          this.checkCommentFiduciarySpecialist(item) ||
          this.checkCommentTeamLeader(item)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  procesComment(comments: Comments[]): number {
    let count = 0;

    if (comments.length !== 0) {
      comments.forEach((item) => {
        if (this.rolUser.roleIdCode === item.userRole) {
          count++;
        } else {
          count++;
          if (
            this.isCoordinatorOrSpecialist(this.rolUser.roleIdCode) &&
            item.userRole === RolEnum.Procurement_Fiduciary_Specialist
          ) {
            count--;
          }
        }
      });
    }

    return count;
  }

  populateParticipants(jsonFormData: JsonFormModel): void {
    this.updateParticipantData(jsonFormData.participants);
    this.visibilityParticipantSections(this.participants);
    this.initParticipantArray();
  }

  visibilityParticipantSections(
    participantNoaResponse: ParticipantNoaResponse
  ): void {
    this.showParticipantsList = participantNoaResponse.noaParticipants?.some(
      (p) => p.result === ParticipantsResult.PARTICIPANT
    );
    this.showParticipantsRejected =
      participantNoaResponse.noaParticipants?.some(
        (p) => p.result === ParticipantsResult.REJECTED
      );

    this.showParticipantsAwarded = participantNoaResponse.noaParticipants?.some(
      (p) => p.result === ParticipantsResult.AWARDED
    );
  }

  updateParticipantData(participantNoaGet: ParticipantNoaGet[]): void {
    this.participants.noaParticipants =
      this.participants.noaParticipants.filter((participantNoa) =>
        participantNoaGet?.some(
          (participantNoaGet) => participantNoa.id === participantNoaGet.id
        )
      );

    participantNoaGet?.forEach((p) => {
      this.participants.noaParticipants.find(
        (noaP) => p.id === noaP.id
      ).contractScope = p.contractScope;
      this.participants.noaParticipants.find(
        (noaP) => p.id === noaP.id
      ).evaluatedPrice = p.evaluatedPrice;
      this.participants.noaParticipants.find(
        (noaP) => p.id === noaP.id
      ).rejectReason = p.rejectReason;
      this.participants.noaParticipants.find(
        (noaP) => p.id === noaP.id
      ).openingPrice = p.openingPrice;
    });
  }

  private checkFormAndRolUserGPN(): boolean {
    if (
      this.formName === FormNameEnum.GPN &&
      this.isRolTeamLeader(this.rolIdCode)
    ) {
      return true;
    }
    return false;
  }

  private checkCommentFiduciarySpecialist(item: Comments): boolean {
    if (
      this.isRolTeamLeader(this.rolIdCode) &&
      item.userRole === RolEnum.Procurement_Fiduciary_Specialist
    ) {
      return true;
    }
    return false;
  }

  private checkCommentTeamLeader(item: Comments): boolean {
    if (
      this.isCoordinatorOrSpecialist(this.rolIdCode) &&
      this.isRolTeamLeader(item.userRole)
    ) {
      return true;
    }
    return false;
  }

  handleRequiredLeyend(numeral: Numeral): Boolean {
    const hasLabel = !numeral.rows?.some((c) =>
      c.components.some(
        (k) => k.kendoLabel === null || k.kendoLabel?.for === null
      )
    );

    const isRequired = numeral.rows?.some((c) =>
      c.components.some((c) =>
        c.validators?.find((v) => v.name === this.IS_REQUIRED_TEXT)
      )
    );

    return hasLabel === false && isRequired === true;
  }

  validatePhone(): void {
    const getPhone = this.dynamicForm.get('phone');
    getPhone?.setValue(
      this.dynamicFormsSharedService.processPhoneNumber(getPhone.value)
    );
  }

  findRoleInPermission(permissions: Permission[]): Permission {
    const rolesPermitios: string[] = [
      RolEnum.Team_Leader,
      RolEnum.Alternate_TeamLeader,
      RolEnum.Procurement_Fiduciary_Specialist,
      RolEnum.External_Coordinator,
      RolEnum.External_Procurement_Specialist,
    ];

    const permission = permissions.filter((element) =>
      rolesPermitios.includes(element.roleIdCode)
    );

    return permission[0];
  }

  processParticipant(
    participantNoaResponse: ParticipantNoaResponse
  ): ParticipantNoaResponse {
    const noaParticipants = participantNoaResponse.noaParticipants.map(
      (obj) => {
        obj.amount = parseInt(obj.amount.toString().replace(',', ''));

        return obj;
      }
    );
    const participant: ParticipantNoaResponse = {
      noaParticipants: noaParticipants,
    };
    return participant;
  }

  isRolTeamLeader(rol: string): boolean {
    return rol === RolEnum.Team_Leader || rol === RolEnum.Alternate_TeamLeader;
  }

  isCoordinatorOrSpecialist(rol: string): boolean {
    return (
      rol === RolEnum.External_Coordinator ||
      rol === RolEnum.External_Procurement_Specialist
    );
  }

  checkBtnSave(): boolean {
    if (this.jsonFormData.dynamicActions.save) {
      if (
        this.isCoordinatorOrSpecialist(this.rolIdCode) &&
        this.formStatus === FormStatusEnum.VIEW
      ) {
        return true;
      } else if (this.formStatus !== FormStatusEnum.VIEW) {
        return true;
      }
    }
    return false;
  }

  handleTextSanitization(text: string): SafeHtml {
    const htmlTagRegex = /<(p|div|span|a)>/;
    if (htmlTagRegex.test(text)) {
      return this.sanitizer.bypassSecurityTrustHtml(text);
    }
    return text;
  }
}
