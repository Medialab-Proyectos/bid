import { inject, Injectable } from '@angular/core';
import {
  BiddingProcessPlanStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import {
  combineLatest,
  filter,
  map,
  Observable,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs';
import { ProjectInfo, getTranslationMap } from '../models';
import { TranslatePipe } from '@ngx-translate/core';
import { UndbProjectInfoService } from '@core/services/apis/fiduciary-process-api/undb-project-info-api/undb-project-info.service';
import { UndbProjectComplementaryInfo } from '@core/models/responses/undb-project-info-response.model';
import { EoiViewModel } from '../../eoi/models/eoi.model';
import { NoticeType } from '../models/project-info.model';

@Injectable({
  providedIn: 'root',
})
export class LoadProjectDataService {
  private projectStoreService = inject(ProjectStoreService);
  private preferencesStoreService = inject(PreferencesstoreService);
  private procurementProcessStoreSvc = inject(BiddingProcessPlanStoreService);
  private translatePipe = inject(TranslatePipe);
  private undbProjectInfo = inject(UndbProjectInfoService);

  selectedProject$ = this.projectStoreService
    .selectedProject()
    .pipe(map((selectedProject) => selectedProject.selectedProject));

  projectCountry$ = this.projectStoreService.getOrLoadProjectsCountries().pipe(
    filter((countriesState) => countriesState.loaded),
    map((countriesState) => countriesState.countries),
    withLatestFrom(this.selectedProject$),
    filter((d) => Boolean(d[0])),
    map(([countries, selectedProject]) => {
      const countryName = countries?.filter(
        (country) => country.countryCode === selectedProject.countryCode
      )[0]?.name;
      return this.capitalize(this.translatePipe.transform(countryName));
    })
  );

  procurementProcess$ = this.procurementProcessStoreSvc
    .biddingProcessPlan()
    .pipe(
      filter((data) => Boolean(data.selectedBiddingProcessProcurementProcess)),
      map((data) => data.selectedBiddingProcessProcurementProcess),
      take(1)
    );

  selectedLanguage$ = this.preferencesStoreService
    .selectPreferences()
    .pipe(map((preferences) => preferences.preferences.preferredLanguage));

  loadDataProject() {
    return combineLatest([
      this.selectedLanguage$,
      this.selectedProject$,
      this.projectCountry$,
    ]).pipe(
      map(([selectedLanguage, selectedProject, country]) => ({
        selectedLanguage,
        selectedProject,
        country,
      }))
    );
  }

  loadProjectComplementaryData(): Observable<UndbProjectComplementaryInfo> {
    return this.selectedProject$.pipe(
      switchMap((selectedProject) =>
        this.undbProjectInfo.getProjectInfo(selectedProject.projectBucketId)
      )
    );
  }

  loadEoiData(): Observable<EoiViewModel> {
    return combineLatest([
      this.selectedProject$,
      this.selectedLanguage$,
      this.projectCountry$,
      this.procurementProcess$,
      this.loadProjectComplementaryData(),
    ]).pipe(
      map(
        ([
          selectedProject,
          selectedLanguage,
          projectCountry,
          procurementProcess,
          projectComplementaryData,
        ]) => ({
          selectedProject,
          selectedLanguage,
          projectCountry,
          procurementProcess,
          projectComplementaryData,
        })
      )
    );
  }

  loadDatatoSpn() {
    return combineLatest([
      this.loadDataProject(),
      this.procurementProcess$,
    ]).pipe(
      map(([projectData, procurementProcess]) => ({
        ...projectData,
        processName: procurementProcess.name,
        processCode: procurementProcess.code,
        procurementProcess,
      }))
    );
  }

  getKeysFromObj(info: ProjectInfo, noticeType: NoticeType) {
    const translationMap = getTranslationMap(noticeType);
    return Object.keys(info)
      .filter((key) => key in translationMap)
      .map((key) => ({
        key: key as keyof ProjectInfo,
        label: translationMap[key as keyof ProjectInfo],
      }));
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  titleCase(text: string): string {
    return text
      .split(' ')
      .map((word) => this.capitalize(word))
      .join(' ');
  }
}
