import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { environment } from '@fiduciary-interface/environments/environment';
import {
  ProjectTaskResponse,
  ErrorResponse,
  Operations,
  PreferencesModel,
  OperationPreference,
} from '@core/models';
import { Observable, filter, map, of, switchMap, take } from 'rxjs';
import {
  ContractOperation,
  CountriesResponse,
  Project,
} from '@core/models/project.model';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import {
  EMPTY_GUID,
  REGISTER_PER_PAGES,
} from '@fiduciary-interface/app/features/projects/projects.env';
import { SHOULD_CACHE_REQUEST } from '@core/utils/httpContexts';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private readonly baseUrl = environment.hostApi.fiduciaryProcessApi.endpoint;
  EMPTY_GUID = EMPTY_GUID;
  REGISTER_PER_PAGES = REGISTER_PER_PAGES;

  constructor(
    readonly http: HttpClient,
    private readonly store: Store<AppState>
  ) {}

  getProjectsByContactId(
    cursor: string,
    pageSize: number,
    operation?: string
  ): Observable<Operations> {
    const url = `${this.baseUrl}/api/v2/project-buckets`;
    let params = new HttpParams()
      .set('cursor', cursor)
      .set('pageSize', pageSize.toString());
    if (operation) {
      params = params.set('operation', operation);
    }
    return this.http.get<Operations>(url, { params });
  }

  getProjectsV2(cursor: string, pageSize: number): Observable<Operations> {
    const url = `${this.baseUrl}/api/v2/project-buckets`;
    let params = new HttpParams()
      .set('cursor', cursor)
      .set('pageSize', pageSize.toString());

    return this.http.get<Operations>(url, { params });
  }

  private mapFavoritesProjects(
    favoriteProject: OperationPreference[],
    preferedLang: string
  ): Project[] {
    return favoriteProject.map((data) => {
      return {
        approvedAmount: data.totalApprovedAmount,
        contract: data.contractNumber,
        countryCode: data?.countryCode,
        currentApprovedAmount: data.totalApprovedAmount,
        executor: data.institutionName,
        executorAcronym: '',
        favorite: true,
        id: data.projectBucketId,
        name: data.projectName[preferedLang],
        nameEn: data.projectName.en,
        nameEs: data.projectName.es,
        nameFr: data.projectName.fr,
        namePt: data.projectName.pt,
        operationNumber: data.operationNumber,
        projectBucketId: data.projectBucketId,
        projectName: {
          en: data.projectName.en,
          es: data.projectName.es,
          fr: data.projectName.fr,
          pt: data.projectName.pt,
        },
      };
    });
  }

  mapData(data: ContractOperation[]): Project[] {
    let aux = data;
    return aux.map((d) => {
      return {
        name: d.projectName.en,
        projectName: {
          en: d.projectName.en,
          es: d.projectName.es,
          pt: d.projectName.pt,
          fr: d.projectName.fr,
        },
        nameEn: d.projectName.en,
        nameEs: d.projectName.es,
        nameFr: d.projectName.fr,
        namePt: d.projectName.pt,
        operationNumber: d.project,
        executor: d.executor,
        executorAcronym: d.executorAcronym,
        contract: d.operation,
        approvedAmount: d.originalApprovedAmount,
        countryCode: d.countryCode,
        projectBucketId: d.id,
        id: d.id,
        currentApprovedAmount: d.currentApprovedAmount,
        favorite: false,
      };
    });
  }

  getProjects(newParam = true) {
    return this.store
      .select('preferences')
      .pipe(
        filter((data) => data.loaded),
        map((data) => data.preferences),
        take(1)
      )
      .pipe(
        switchMap((data: PreferencesModel) => {
          if (data.projects.length > 0 && newParam) {
            const favoriteProjects = this.mapFavoritesProjects(
              data.projects,
              data.preferredLanguage
            );
            return of({
              favorites: true,
              projects: favoriteProjects,
              lastCursor: '',
              totalPages: -1,
            });
          } else {
            return this.getProjectsV2(
              this.EMPTY_GUID,
              this.REGISTER_PER_PAGES
            ).pipe(
              map((projectsData) => ({
                favorites: false,
                projects: this.mapData(projectsData.data),
                lastCursor: projectsData.cursor,
                totalPages: Math.ceil(
                  projectsData.total / this.REGISTER_PER_PAGES
                ),
              }))
            );
          }
        })
      );
  }

  getProjectTasks(
    projectBucketId: string,
    type: number = null
  ): Observable<ProjectTaskResponse | ErrorResponse> {
    let url = `${this.baseUrl}/api/projectBuckets/${projectBucketId}/projectTasks`;

    if (type) {
      url = `${url}?type=${type}`;
    }

    return this.http.get<ProjectTaskResponse>(url, {
      context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
    });
  }

  getProjectTasksChilds(
    projectTaskId: string
  ): Observable<ProjectTaskResponse | ErrorResponse> {
    return this.http.get<ProjectTaskResponse>(
      `${this.baseUrl}/api/projectTasks/${projectTaskId}/projectTaskChilds`,
      {
        context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
      }
    );
  }

  getSpecificProject(
    operation: string,
    pageSize = 1,
    countryCode?: string,
    filterCursor?: string
  ): Observable<Operations> {
    const url = `${this.baseUrl}/api/v2/project-buckets`;
    const cursor = filterCursor ? filterCursor : this.EMPTY_GUID;
    let params = new HttpParams()
      .set('cursor', cursor)
      .set('pageSize', pageSize.toString())
      .set('operation', operation);

    if (!!countryCode) {
      params = params.set('countryCode', countryCode);
    }

    return this.http.get<Operations>(url, { params });
  }

  getSpecificOperation(
    operation: string,
    countryCode?: string,
    filterCursor?: string
  ): Observable<Operations> {
    const url = `${this.baseUrl}/api/v2/project-buckets`;
    const cursor = filterCursor ? filterCursor : this.EMPTY_GUID;
    const defaultPage = 10;
    let params = new HttpParams()
      .set('cursor', cursor)
      .set('pageSize', defaultPage)
      .set('projectNumber', operation);

    if (!!countryCode) {
      params = params.set('countryCode', countryCode);
    }

    return this.http.get<Operations>(url, { params });
  }

  getProjectsCountries(): Observable<CountriesResponse> {
    const url = `${this.baseUrl}/api/v2/project-buckets/countries`;

    return this.http.get<CountriesResponse>(url).pipe(take(1));
  }
}
