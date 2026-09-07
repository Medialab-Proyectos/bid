import { ProjectsEffects } from './projects/effects/projects.effects';
import { BiddingProcessDocumentPackagesEffects } from './bidding-process-document-packages/effects/bidding-process-document-packages.effects';
import { ContactEffect } from './contact/effects/contact.effects';

import { SidebarEffects } from './config/sidebar/effects/sidebar.effects';
import { EnumEffects } from './enums/effects/enums.effects';
import { ProcurementContractsEffects } from './procurement-contracts/effects/procurement-contracts.effects';
import { ParticipantsEffects } from './participants/effects/participants.effects';
import { CurrenciesEffects } from './currencies/effects/currencies.effects';
import { ProjectsBalancesEffects } from '../../features/transactions/store/project-balances/effects/project-Balances.effects';

import { BiddingProcessPlanEffects } from './bidding-process-plan/effects/bidding-process-plan.effects';
import { GeneralProcurementDocumentsEffects } from './general-procurement-documents/effects/general-procurement-documents.effect';
import { WorkflowEffects } from '@fiduciary-interface/app/features/workflow/store/workflow/effects/workflow.effects';
import { PreferencesEffects } from '@core/store/preferences/effects/preferences.effects';
import { WorkflowDocumentsEffects } from '@core/store/workflow-documents/effects/workflow-documents.effects';
import { RolesEffects } from './roles/effects/roles.effects';
import { ProjectsCountriesEffects } from './projectsCountries/effects/projectsCountries.effects';
import { EnumMasterDataEffects } from './enumsMasterData/effects/enumMasterData.effects';

export * from './store.reducers';
export * from './projects/reducers/projects.reducer';
export * from './bidding-process-document-packages/reducers/bidding-process-document-packages.reducer';
export * from './contact/reducers/contact.reducer';
export * from './permissions/reducers/permissions.reducers';
export * from './currencies/reducers/currencies.reducer';
export * from './bidding-process-plan/reducers/bidding-process-plan.reducers';
export * from './config/sidebar/reducers/sidebar.reducer';
export * from './enums/reducers/enums.reducer';
export * from './selectedProject/reducers/selectedProject.reducer';
export * from './procurement-contracts/reducers/procurement-contracts.reducers';
export * from './participants/reducers/participants.reducers';
export * from './visibility-header-project/reducer/header-project.reducer';
export * from './visibility-header-process/reducer/header-process.reducer';
export * from '../../features/transactions/store/project-balances/reducers/project-Balances.reducers';
export * from './currencies/actions/currencies.actions';
export * from './general-procurement-documents/reducers/general-procurement-documents.reducer';
export * from './preferences/reducers/preferences.reducer';
export * from '../../features/workflow/store/workflow/reducers/workflow.reducers';
export * from './activitiesSelectedProject/reducers/activitiesSelectedProject.reducer';
export * from './workflow-documents/reducer/workflow-documents.reducer';
export * from './roles/reducers/roles.reducer';
export * from './projectsCountries/reducers/projectsCountries.reducer';
export * from './enumsMasterData/reducers/enumsMasterData.reducers';

export const EffectsCollection: any[] = [
  ProjectsEffects,
  BiddingProcessDocumentPackagesEffects,
  ContactEffect,
  ProjectsEffects,
  BiddingProcessPlanEffects,
  SidebarEffects,
  EnumEffects,
  ProcurementContractsEffects,
  ParticipantsEffects,
  ProjectsBalancesEffects,
  GeneralProcurementDocumentsEffects,
  CurrenciesEffects,
  WorkflowEffects,
  PreferencesEffects,
  WorkflowDocumentsEffects,
  RolesEffects,
  ProjectsCountriesEffects,
  EnumMasterDataEffects,
];
