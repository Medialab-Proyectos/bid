import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DynamicFormBuildService } from '../../services/dynamic-form/dynamic-form-build.service';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import { JsonFormModel } from '../../models/dynamic-form.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormStatusEnum } from '../../enums/form-status.enum';
import { ProjectStoreService } from '@core/services/store-services';
import { Project } from '@core/models';
import { AppState, AppStateWithUsrPreferences } from '@core/store';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { VisibilityService } from '@core/services/view';
import { FormNameEnum } from '../../enums/form-name';
import { DynamicFormsSharedService } from '../../services/dynamic-form-shared/dynamic-form-shared.service';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { GroupNameTextEnum } from '@core/enums/groupCode.enum';
import { CategoryProcurement } from '@core/enums';

@Component({
  selector: 'fi-create-dynamic-form',
  templateUrl: './create-dynamic-form.component.html',
})
export class CreateDynamicFormComponent implements OnInit, AfterViewChecked {
  private readonly subscription = new Subscription();

  public dynamicForm: UntypedFormGroup = this.fb.group({});
  public jsonFormData: JsonFormModel = null;
  public formStatus = FormStatusEnum.CREATE;
  public formName: FormNameEnum;
  public selectedProject: Project;

  public projectBucketId = String();
  public biddingProcessPlanId = String();
  public biddingProcessProcurementProcessId = String();
  public biddingDocumentId = String();
  public fiduciaryProcessDocumentId = String();

  public documentPackageId = String();

  public formErrorCollection: FormErrorTranslateKey[] = [];
  public operationNumber = String();
  public language = String();
  public selectedProjectLoading = true;
  public loading = true;
  public colorLabel = {
    color: String(),
  };
  public nameFile: string;
  procurementProcessName: string;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly dynamicFormBuildService: DynamicFormBuildService,
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    readonly projectStore: ProjectStoreService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly store: Store<AppState>,
    private readonly visibilitySvc: VisibilityService,
    private readonly dynamicFormsSharedService: DynamicFormsSharedService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard
  ) {}

  ngOnInit(): void {
    this.visibilitySvc.setVisiblityProcessHeader(false);
    this.visibilitySvc.setVisiblityProjectHeader(false);
    this.getLanguage();
  }
  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngDestroy(): void {
    this.subscription.unsubscribe();
  }

  private init(): void {
    this.dynamicForm = this.fb.group({});
    this.formErrorCollection = [];
    this.loading = true;
    const sub = this.getQueryParams().subscribe((_) =>
      this.getSelectedProjectData()
    );
    this.subscription.add(sub);
  }

  private getQueryParams(): Observable<any> {
    return this.activatedRoute.queryParams.pipe(
      tap((queryParams) => {
        this.procurementProcessName = queryParams.categoryName;
        const form = this.mapFormBidding(queryParams.formName);

        this.formName = form;
        this.formStatus =
          queryParams.formStatus === undefined
            ? FormStatusEnum.VIEW
            : (Number(queryParams.formStatus) as FormStatusEnum);
        this.operationNumber = queryParams.operationNumber;

        this.fiduciaryProcessDocumentId =
          queryParams.fiduciaryProcessDocumentId;
        this.biddingDocumentId = queryParams.biddingDocumentId;
        this.nameFile = queryParams.nameFile;

        if (form) {
          this.biddingProcessPlanId = queryParams.biddingProcessPlanId;
          this.biddingProcessProcurementProcessId =
            queryParams.biddingProcessProcurementProcessId;
          this.documentPackageId = queryParams.documentPackageId;
        }
      })
    );
  }

  getSelectedProjectData(): void {
    const sub = this.dynamicFormsSharedService
      .getSelectedProjectData$(this.operationNumber)
      .pipe(
        tap((_) => {
          this.visibilitySvc.setVisiblityProcessHeader(
            !!this.biddingProcessProcurementProcessId
          );
          this.visibilitySvc.setVisiblityProjectHeader(
            !this.biddingProcessProcurementProcessId
          );
        })
      )
      .subscribe((project: Project) => {
        if (!!project) {
          this.selectedProject = project;
          this.projectBucketId = this.selectedProject.projectBucketId;
          this.selectedProjectLoading = false;

          if (this.formStatus !== FormStatusEnum.CREATE) {
            this.getDynamicFormPerDocumentId();
          } else {
            this.getDynamicForm();
          }
        }
      });
    this.subscription.add(sub);
  }

  // TODO: map error and add a catcherr
  getDynamicForm(): void {
    this.dynamicFormBuildService
      .getDynamicForm(
        this.formName,
        this.operationNumber,
        this.language,
        this.biddingProcessProcurementProcessId
      )
      .subscribe((response) => {
        if (response !== null) {
          this.jsonFormData = response;
          this.dynamicFormBuildService.generateForm(
            this.jsonFormData,
            this.dynamicForm,
            this.formStatus
          );

          this.loading = false;
        } else {
          this.router.navigate(['../../'], {
            relativeTo: this.activatedRoute,
          });
        }
      });
  }

  // TODO: map error and add a catcherr
  getDynamicFormPerDocumentId(): void {
    this.dynamicFormBuildService
      .getDynamicFormById(this.biddingDocumentId)
      .subscribe((response) => {
        if (response !== null) {
          this.jsonFormData = response;
          this.dynamicFormBuildService.generateForm(
            this.jsonFormData,
            this.dynamicForm,
            this.formStatus
          );
          this.loading = false;
        } else {
          this.router.navigate(['../../../dashboard'], {
            relativeTo: this.activatedRoute,
          });
        }
      });
  }

  getLanguage(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        this.language = data.preferences.preferredLanguage;
        setTimeout(() => {
          this.init();
        });
      });
    this.subscription.add(sub);
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.dynamicForm);
  }

  mapFormBidding(formName: string): FormNameEnum {
    let translateForm: FormNameEnum;
    switch (formName) {
      case GroupNameTextEnum.BIDDINDG_DOC_STANDARD_DOC_TERMS_REF:
        translateForm = FormNameEnum.EOI;
        break;
      case GroupNameTextEnum.BIDDINDG_DOC_AWARD:
        translateForm = FormNameEnum.NOA_FIRMS;
        break;
      case GroupNameTextEnum.BIDDINDG_DOC_CONT_AWART_NOTI:
        translateForm = FormNameEnum.NOA_GOODS;
        break;
    }

    if (formName === GroupNameTextEnum.BIDDINDG_DOC_SPECIFIC) {
      if (this.procurementProcessName === CategoryProcurement.PROCT_GOODS) {
        translateForm = FormNameEnum.SPN_GOODS;
      } else {
        translateForm = FormNameEnum.SPN_MINOR_WORKS;
      }
    }

    if (formName === 'GPN') {
      translateForm = FormNameEnum.GPN;
    }
    return translateForm;
  }
}
