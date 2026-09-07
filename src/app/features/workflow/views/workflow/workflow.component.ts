import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { WorkflowStoreService } from '@fiduciary-interface/app/features/workflow/store/services/workflow-store.service';
import { ProjectStoreService } from '@core/services/store-services';
import { Contact, Enumerator, Project } from '@core/models';
import { WORKFLOWSTEPS } from '@fiduciary-interface/app/features/workflow/mocks';
import {
  AssignedUser,
  Institution,
  WorkflowConfig,
  WorkflowStep,
} from '@fiduciary-interface/app/features/workflow/models';
import { WorkflowODApiService } from '@fiduciary-interface/app/features/workflow/services';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { PermissionEnum } from '@core/enums';
import { VisibilityService } from '@core/services/view';
import {
  AppState,
  AppStateWithActivitiesSelectedProject,
  AppStateWithSelectedProject,
  AppStateWithUsrPreferences,
} from '@core/store';
import { Store } from '@ngrx/store';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as selectedProjectActions from '@core/store/selectedProject/actions/selectedProject.actions';
import * as activitiesSelectedProjectActions from '@core/store/activitiesSelectedProject/actions/activitiesSelectedProject.actions';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'fi-workflow',
  templateUrl: './workflow.component.html',
})
export class WorkflowComponent implements OnInit, OnDestroy {
  public workflowConfiguration: WorkflowStep[] = WORKFLOWSTEPS;
  public actionList: Enumerator[] = [];
  public institutionList: Institution[] = [];
  public currentUser!: Contact;
  public assignedUsers: AssignedUser[] = [];
  public projectBucketId: string;
  public executorAcronym: string;
  public isLoading = true;
  public disableButtons = true;
  public contact: AssignedUser;
  public displayWorkflowPermission = [
    PermissionEnum.VIEW_DISBURSEMENT_INFORMATION,
  ];
  private readonly subscriptionList: Subscription = new Subscription();
  private selectedLanguage: string;
  isUsersLoading: boolean;

  usersRolUpdated: string[] = [];
  usersInstitutionUpdated: string[] = [];
  usersRolUpdatedErrorMsg: string;
  usersInstitutionUpdatedErrorMsg: string;

  form: UntypedFormGroup;

  projectCollection: Project[] = [];

  constructor(
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    readonly workflowStoreService: WorkflowStoreService,
    readonly projectStoreService: ProjectStoreService,
    readonly workflowODService: WorkflowODApiService,
    private readonly visibilitySvc: VisibilityService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard,
    readonly storeProject: ProjectStoreService,
    readonly activatedRoute: ActivatedRoute,
    readonly store: Store<AppState>,
    readonly storeSelectedProject: Store<AppStateWithSelectedProject>,
    readonly storeActivitiesSelectedProject: Store<AppStateWithActivitiesSelectedProject>
  ) {
    this.getUserData();
  }

  ngOnDestroy(): void {
    this.subscriptionList.unsubscribe();
    this.workflowStoreService.resetWorkflow();
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.getCurrentLang();
    this.getWorkflowActions();
    this.loadWorkflowsInit();
    this.getWorkflow();
    this.visibilityServices();
  }

  loadWorkflowsInit(): void {
    const sub = this.projectStoreService
      .projects()
      .pipe(
        filter((data) => data.projects !== null && data.projects.length > 0)
      )
      .subscribe(() => this.setSelectedProject());

    const subs = this.projectStoreService
      .selectedProject()
      .pipe(filter((data) => data.selectedProject !== null))
      .subscribe(() => {
        this.setWorkflowStore();
        this.setWorkflowInstitutionStore();
      });

    this.subscriptionList.add(sub);
    this.subscriptionList.add(subs);
  }

  setSelectedProject(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('code');
    const contract = this.activatedRoute.snapshot.paramMap
      .get('contract')
      .replace('%2F', '/');

    const sub = this.storeProject.projects().subscribe((res) => {
      this.isLoading = res.loading;
      if (res && res.projects) {
        this.projectCollection = res.projects.filter((el) => {
          return el.operationNumber === id && el.contract === contract;
        });
        if (this.projectCollection && this.projectCollection.length > 0) {
          this.store.dispatch(
            selectedProjectActions.setSelectedProjectSuccess({
              SelectedProject: this.projectCollection[0],
            })
          );
          this.storeActivitiesSelectedProject.dispatch(
            activitiesSelectedProjectActions.setActivitiesSelectedProjectBucketId(
              {
                ActivitiesSelectedProjectBucketId:
                  this.projectCollection[0].projectBucketId,
              }
            )
          );
        }
      }
    });

    this.subscriptionList.add(sub);
  }

  getCurrentUser(): void {
    this.subscriptionList.add(
      this.workflowStoreService.getCurrentUser().subscribe((user) => {
        this.currentUser = user.contact;
      })
    );
  }

  public getCurrentLang(): void {
    this.subscriptionList.add(
      this.storePreferences.select('preferences').subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      })
    );
  }

  getWorkflowActions(): void {
    this.subscriptionList.add(
      this.workflowStoreService.getEnums().subscribe((enums) => {
        this.actionList = [...enums.onlineDisburmentWorkflowSteps];
      })
    );
  }

  getWorkflow(): void {
    this.isLoading = true;
    this.subscriptionList.add(
      this.workflowStoreService.getWorkflow().subscribe((data) => {
        this.workflowConfiguration = [...data.workflowSteps];
        this.institutionList = [...data.workflowInstitutions];
        this.isLoading = data.workflowStepsLoading;
        this.disableButtons =
          !!data.workflowStepsError || this.workflowConfiguration.length === 0;

        this.usersInstitutionUpdated = data.usersInstitutionUpdated;
        this.usersRolUpdated = data.usersRolUpdated;
        if (this.usersRolUpdated.length > 0) {
          this.usersRolUpdatedErrorMsg = this.translate.instant(
            'WORKFLOWCONFIGURATION.TABLE.USER_UPDATED',
            {
              users: this.usersRolUpdated,
            }
          );
        }
        if (this.usersInstitutionUpdated.length > 0) {
          this.usersInstitutionUpdatedErrorMsg = this.translate.instant(
            'WORKFLOWCONFIGURATION.TABLE.INSTITUTION_UPDATED',
            {
              users: this.usersInstitutionUpdated,
            }
          );
        }

        if (
          data.workflowInstitutionsLoaded &&
          data.workflowSteps.length === 0
        ) {
          this.onCreateWorkflow();
        }
      })
    );
  }

  setWorkflowStore(): void {
    this.subscriptionList.add(
      this.projectStoreService.selectedProject().subscribe((data) => {
        if (data.selectedProject) {
          this.projectBucketId = data.selectedProject.projectBucketId;
          this.executorAcronym = data.selectedProject.executorAcronym;
          this.workflowStoreService.setStoreWorkflow(this.projectBucketId);
        }
      })
    );
  }

  setWorkflowInstitutionStore(): void {
    this.subscriptionList.add(
      this.projectStoreService.selectedProject().subscribe((data) => {
        if (data.selectedProject) {
          this.workflowStoreService.setStoreWorkflowInstitution(
            data.selectedProject.projectBucketId
          );
        }
      })
    );
  }

  getUserData(): void {
    const sub = this.workflowStoreService.getCurrentUser().subscribe((user) => {
      let assignedUser: AssignedUser = {};

      assignedUser.email = user.contact.email;
      assignedUser.fullName = user.contact.family_name;
      assignedUser.roleIdCode = null;
      assignedUser.userName = user.contact.email;

      this.contact = assignedUser;
    });

    this.subscriptionList.add(sub);
  }

  onSelectInstitution(institutionCode: string): void {
    this.isUsersLoading = true;
    if (institutionCode.includes('/')) {
      institutionCode = this.handlingSlash(institutionCode);
    }
    this.subscriptionList.add(
      this.workflowODService
        .getWorkflowAssignedUsers(this.projectBucketId, institutionCode)
        .subscribe(
          (resp) => (this.assignedUsers = [...resp.users]),
          () => this.showErrorToast('TRANSACTION.LOAD_INFO_ERROR')
        )
        .add(() => (this.isUsersLoading = false))
    );
  }
 
  handlingSlash(institutionCode: string): string {
    return institutionCode.replace(/\//g, '|');
  }

  onSaveData(data: WorkflowStep[]): void {
    const newWorkflow: WorkflowConfig = {
      workFlowConfig: [...data],
    };
    this.isLoading = true;
    this.form?.markAsPristine();
    this.subscriptionList.add(
      this.workflowODService
        .updateWorkflow(
          this.projectBucketId,
          newWorkflow,
          this.selectedLanguage
        )
        .subscribe(
          () => {
            this.showSuccessToast();
            this.workflowConfiguration = newWorkflow.workFlowConfig;
            this.workflowStoreService.setStoreWorkflow(this.projectBucketId);
            this.isLoading = false;
            this.workflowODService.resetConfiguration();
          },
          () => {
            this.showErrorToast(
              'TRANSACTION.WORKFLOWCONFIGURATION.UPDATE.ERROR'
            );
            this.isLoading = false;
          }
        )
    );
  }

  showSuccessToast(): void {
    const successMessage = this.translate.instant(
      'TRANSACTION.WORKFLOWCONFIGURATION.UPDATE.SUCCESS'
    );
    this.notificationGlobalService.showSuccess(successMessage);
  }

  showErrorToast(literal: string): void {
    const message = this.translate.instant(literal);
    this.notificationGlobalService.showError(message);
  }

  onCreateWorkflow(): void {
    this.subscriptionList.add(
      this.workflowODService
        .createWorkflow(this.projectBucketId, this.executorAcronym)
        .subscribe(
          (res) => {
            this.workflowConfiguration = res.workFlowConfig;
            this.disableButtons = this.workflowConfiguration.length === 0;
          },
          () => {
            this.showErrorToast('TRANSACTION.WORKFLOWCONFIGURATION.GET.ERROR');
            this.disableButtons = true;
          }
        )
    );
  }

  visibilityServices(): void {
    this.visibilitySvc.setVisiblityProjectHeader(true);
    this.visibilitySvc.breadcrumbService.set(
      '@workflow',
      'BREADCRUMB.WORKFLOW'
    );
  }

  formValueChanges(form: UntypedFormGroup): void {
    this.form = form;
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }
}
