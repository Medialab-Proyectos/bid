import { ActionReducerMap } from '@ngrx/store';
import * as projectReducer from './projects/reducers/projects.reducer';
import * as selectedProjectReducer from './selectedProject/reducers/selectedProject.reducer';
import * as contactReducer from './contact/reducers/contact.reducer';
import * as preferencesReducer from './preferences/reducers/preferences.reducer';
import * as permissionReducer from './permissions/reducers/permissions.reducers';
import * as currenciesReducer from './currencies/reducers/currencies.reducer';
import * as enumReducer from './enums/reducers/enums.reducer';
import * as biddingProcessDocumentPackageReducer from './bidding-process-document-packages/reducers/bidding-process-document-packages.reducer';
import * as biddingProcessPlanReducers from './bidding-process-plan/reducers/bidding-process-plan.reducers';
import * as generalProcurementDocumentsReducers from './general-procurement-documents/reducers/general-procurement-documents.reducer';
import * as userTokenReducer from './user-token/reducers/user-token.reducer';
import * as activitiesSelectedProjectReducer from './activitiesSelectedProject/reducers/activitiesSelectedProject.reducer';
import * as procurementProcessHeaderReducer from './procurement-process-header/reducers/procurementProcessHeader.reducer';
import * as workflowDocumentsReducer from './workflow-documents/reducer/workflow-documents.reducer';
import * as commentsFilterReducer from './commentsFilter/reducer/commentsFilter.reducer';
import * as rolesReducer from './roles/reducers/roles.reducer';
import * as projectsCountriesReduces from './projectsCountries/reducers/projectsCountries.reducer';
import * as enumMasterDataReducer from './enumsMasterData/reducers/enumsMasterData.reducers';

export interface AppState {
  projects?: projectReducer.ProjectState;
  selectedProject?: selectedProjectReducer.SelectedProjectState;
  permissions?: permissionReducer.PermissionState;
  contact?: contactReducer.ContactState;
  preferences?: preferencesReducer.UsrPreferencesState;
  enums?: enumReducer.EnumState;
  documents?: biddingProcessDocumentPackageReducer.BiddingProcessDocumentPackagesState;
  biddingProcessPlan?: biddingProcessPlanReducers.BiddingProcessPlanState;
  generalProcurementDocuments?: generalProcurementDocumentsReducers.GeneralProcurementDocumentsState;
  currencies?: currenciesReducer.CurrencieState;
  userToken?: userTokenReducer.UserTokenState;
  activitiesSelectedProjectBucketId?: activitiesSelectedProjectReducer.ActivitiesSelectedProjectState;
  procurementProcessHeader?: procurementProcessHeaderReducer.ProcurementProcessHeaderState;
  workflowDocuments?: workflowDocumentsReducer.WorkflowDocumentsState;
  commentsFilterForm?: commentsFilterReducer.CommentsFilterState;
  roles?: rolesReducer.RolesState;
  projectsCountries?: projectsCountriesReduces.ProjectCountriesState;
  enumsMasterData?: enumMasterDataReducer.EnumsMasterDataState;
}

export const storeReducer: ActionReducerMap<AppState> = {
  projects: projectReducer.projectReducer,
  selectedProject: selectedProjectReducer.selectedProjectReducer,
  permissions: permissionReducer.permissionReducer,
  contact: contactReducer.contactReducer,
  preferences: preferencesReducer.preferencesReducer,
  enums: enumReducer.enumReducer,
  enumsMasterData: enumMasterDataReducer.masterDataReducer,
  documents:
    biddingProcessDocumentPackageReducer.biddingProcessDocumentPackageReducer,
  biddingProcessPlan: biddingProcessPlanReducers.biddingProcessPlanReducer,
  generalProcurementDocuments:
    generalProcurementDocumentsReducers.generalProcurementDocumentsReducer,
  currencies: currenciesReducer.currenciesReducer,
  userToken: userTokenReducer.userTokenReducer,
  activitiesSelectedProjectBucketId:
    activitiesSelectedProjectReducer.activitiesSelectedProjectReducer,
  procurementProcessHeader:
    procurementProcessHeaderReducer.procurementProcessHeaderReducer,
  workflowDocuments: workflowDocumentsReducer.workflowDocumentsReducer,
  commentsFilterForm: commentsFilterReducer.commentsFilterReducer,
  roles: rolesReducer.roleReducer,
  projectsCountries: projectsCountriesReduces.projectsCountriesReducer,
};

export const mockState: AppState = {
  projects: null,
  permissions: null,
  contact: null,
  preferences: null,
  enums: null,
  documents: null,
  biddingProcessPlan: null,
  generalProcurementDocuments: null,
  selectedProject: null,
  userToken: null,
  activitiesSelectedProjectBucketId: null,
  workflowDocuments: null,
  commentsFilterForm: null,
  roles: null,
  projectsCountries: null,
  enumsMasterData: null,
};
