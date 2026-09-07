import { Injectable } from '@angular/core';
import {
  AppStateWithHeaderProject,
  AppStateWithProjects,
  AppStateWithProjectsCountries,
  AppStateWithSelectedProject,
  AppStateWithSidebar,
  AppStateWithUsrPreferences,
  HeaderProjectState,
  ProjectCountriesState,
  ProjectState,
  SelectedProjectState,
  SidebarState,
  UsrPreferencesState,
} from '@core/store';
import { Store } from '@ngrx/store';
import { Observable, of, switchMap } from 'rxjs';
import * as projectsCountriesActions from '@core/store/projectsCountries/actions/projectsCountries.actions';
import { ProjectsApiService } from '@core/services/apis';

@Injectable({
  providedIn: 'root',
})
export class ProjectStoreService {
  constructor(
    private readonly storeSelectedProject: Store<AppStateWithSelectedProject>,
    private readonly storeSidebar: Store<AppStateWithSidebar>,
    private readonly storeHeaderProject: Store<AppStateWithHeaderProject>,
    private readonly storeProject: Store<AppStateWithProjects>,
    private readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly projectsCountriesStore: Store<AppStateWithProjectsCountries>,
    readonly projectsSvc: ProjectsApiService
  ) {}

  public projects(): Observable<ProjectState> {
    return this.storeProject.select('projects');
  }

  public selectedProject(): Observable<SelectedProjectState> {
    return this.storeSelectedProject.select('selectedProject');
  }

  public sidebar(): Observable<SidebarState> {
    return this.storeSidebar.select('sidebar');
  }

  public headerProject(): Observable<HeaderProjectState> {
    return this.storeHeaderProject.select('headerProject');
  }

  public languageSelected(): Observable<UsrPreferencesState> {
    return this.storePreferences.select('preferences');
  }

  getOrLoadProjectsCountries(): Observable<ProjectCountriesState> {
    return this.storePreferences.select('projectsCountries').pipe(
      switchMap((state) => {
        if (!state.countries && !state.loading && !state.loaded) {
          this.getProjectsCountries();
        }
        return of(state);
      })
    );
  }

  getProjectsCountries(): void {
    this.projectsCountriesStore.dispatch(
      projectsCountriesActions.getProjectsCountries()
    );
  }
}
