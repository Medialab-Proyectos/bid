import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  combineLatest,
  fromEvent,
} from 'rxjs';
import {
  ContractOperation,
  CountryEffectResponse,
  OperationPreference,
  PreferencesModel,
  Project,
} from '@core/models';
import {
  AppStateWithSelectedProject,
  AppStateWithActivitiesSelectedProject,
  ProjectState,
  AppState,
} from '@core/store';
import { Store, select } from '@ngrx/store';
import { CardBuilder } from '@core/builders/card.builder';
import { Card } from '../components/project-card/model/card.model';
import { Router } from '@angular/router';
import { WindowSizeService } from '@core/services/view';
import {
  BiddingProcessPlanStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import * as activitiesSelectedProjectActions from '@core/store/activitiesSelectedProject/actions/activitiesSelectedProject.actions';
import { PreferencesstoreService } from '@core/services/store-services/preferences/preferencesstore.service';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  take,
  tap,
} from 'rxjs/operators';
import * as projectActions from '@core/store/projects/actions/projects.actions';
import { ProjectsApiService } from '@core/services/apis';
import { FilterComponent } from '@fiduciary-interface/app/shared/components/filter/components/filter/filter.component';
import { EMPTY_GUID } from '../../projects/projects.env';

interface Item {
  text: string;
  value: boolean;
}

@Component({
  selector: 'fi-webapp-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('searchInputField')
  searchInputField?: FilterComponent;

  scrollPosition = 0;
  projectCollection: Project[] = [];
  finishedProjectCollection: Project[] = [];
  subscriptionCollection: Subscription[] = [];
  public optionsToFilter: Array<Item> = [
    {
      text: 'DASHBOARD.PREFERENCES_DROPDOWN.ALL',
      value: true,
    },
    {
      text: 'DASHBOARD.PREFERENCES_DROPDOWN.FAVORITES',
      value: false,
    },
  ];
  preferedLang: string;
  allProjects = true;
  highlightValue = null;
  filterResults = 0;
  filteredProjectCollection: Project[] = [];
  filteredProjectFavoriteCollection: Project[] = [];
  allProjectsCollection: Project[] = [];
  allProjectsCollectionCopy: Project[] = [];
  filteredFinishedProjectCollection: BehaviorSubject<Project[]> =
    new BehaviorSubject<Project[]>([]);
  preferences: PreferencesModel;
  selectedValue = this.optionsToFilter[1];
  isLoadingData: boolean = false;

  reduxProjectsObs: Observable<ProjectState>;
  dropdownSelectionfavoriteObs: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(this.selectedValue.value);
  filterSearchObs: BehaviorSubject<string> = new BehaviorSubject<string>('');
  counter = 0;
  searchString = '';
  filterString = '';

  show = 5;
  public mobileView = false;
  isLoading = true;

  public optionsToSearch: Array<Item> = [
    {
      text: 'DASHBOARD.SEARCH_DROPDOWN.OPERATION',
      value: false,
    },
    {
      text: 'DASHBOARD.SEARCH_DROPDOWN.PROJECT',
      value: true,
    },
  ];
  selectedSearchValue = this.optionsToSearch[1];
  public countryOptions: Array<CountryEffectResponse>;

  selectedCountry: CountryEffectResponse;
  allCountryOptions: CountryEffectResponse = {
    countryCode: null,
    total: null,
    name: 'ALL.COUNTRIES.OPTION',
    isoCountryCode: null,
  };
  lastFilterCursor: string;
  hasMoreFilterData: boolean;
  loadingFilterData: boolean;
  constructor(
    readonly storeProject: ProjectStoreService,
    readonly windowSvc: WindowSizeService,
    readonly router: Router,
    readonly storeSelectedProject: Store<AppStateWithSelectedProject>,
    readonly biddingProcessPlanStoreService: BiddingProcessPlanStoreService,
    readonly storeActivitiesSelectedProject: Store<AppStateWithActivitiesSelectedProject>,
    private readonly storePreferences: PreferencesstoreService,
    readonly store: Store<AppState>,
    private zone: NgZone,
    private projectApiSvc: ProjectsApiService
  ) {
    this.getProjects();
  }

  lastCursor: string;
  isFetchingData = new BehaviorSubject(false);
  isFullScrolled = new BehaviorSubject(false);
  totalPages: number;
  actualPage: number;
  initMobileConditionals(): void {
    const sub = this.windowSvc.windowSizeChanged.subscribe((data) => {
      this.mobileView = data.mobileView;
    });
    this.subscriptionCollection.push(sub);
  }

  ngOnInit(): void {
    this.getProjectsCountries();
    this.subToProjectState();
    this.initMobileConditionals();
    this.storeActivitiesSelectedProject.dispatch(
      activitiesSelectedProjectActions.unSetActivitiesSelectedProjectBucketId()
    );
    this.biddingProcessPlanStoreService.resetBiddingProcessPlan();
    this.subscriptionCollection.push(
      this.storePreferences.selectPreferences().subscribe((data) => {
        this.preferences = data.preferences;
      })
    );
    this.subscriptionCollection.push(
      fromEvent(window, 'scroll')
        .pipe(
          map(() => window.scrollY),
          filter(() => {
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPosition = window.innerHeight + window.scrollY;
            return documentHeight - scrollPosition < 20;
          }),
          debounceTime(200),
          distinctUntilChanged(),
          filter((data) => {
            let aux =
              document.documentElement.scrollHeight - window.innerHeight;
            return Math.round(data) >= aux;
          }),
          map(() => true)
        )
        .subscribe((data) => {
          this.scrollPosition = window.scrollY;
          if (this.selectedValue.value && this.searchString === '') {
            this.isFullScrolled.next(data);
          }
        })
    );
    this.subscriptionCollection.push(
      combineLatest([this.isFullScrolled, this.isFetchingData])
        .pipe(distinctUntilChanged())
        .subscribe((data) => {
          if (data[0] === true && this.isLoadingData === false) {
            if (this.selectedCountry.countryCode) {
              if (this.hasMoreFilterData && !this.loadingFilterData) {
                this.getNewProjects().subscribe((data) => {
                  if (!!this.selectedCountry.countryCode) {
                    this.processDataWithFilters(this.searchString, data);
                  }
                });
              }
            } else {
              this.loadProjectsOnScroll();
            }
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptionCollection.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  getProjectsCountries(): void {
    const sub = this.storeProject
      .getOrLoadProjectsCountries()
      .pipe(filter((data) => !!data.countries && data.loaded))
      .subscribe((data) => {
        this.countryOptions = [this.allCountryOptions, ...data.countries];
        this.selectedCountry = this.countryOptions[0];
      });
    this.subscriptionCollection.push(sub);
  }
  public valueChange(value: any): void {
    this.filterString = '';
    this.selectedCountry = this.countryOptions[0];
    this.searchString = '';
    this.highlightValue = '';
    if (value.value && this.filteredProjectCollection.length === 0) {
      this.store.dispatch(
        projectActions.getNewProjects({ initialData: false })
      );
    }
    if (value.value) {
      this.restoreOriginalProjects();
    } else {
      this.getReduxProjects('favouriteProjects').subscribe((data) => {
        this.filteredProjectFavoriteCollection = data;
      });
    }
  }

  getReduxProjects(
    property: 'favouriteProjects' | 'projects'
  ): Observable<Project[]> {
    return this.store.pipe(
      select('projects'),
      map((data) => data[property]),
      take(1)
    );
  }

  restoreOriginalProjects(): void {
    this.allProjectsCollection = structuredClone(
      this.allProjectsCollectionCopy
    );
  }

  public valueSearchChange(): void {
    if (this.searchInputField) {
      this.searchInputField.clearValue();
    }
  }

  selectedCard(project: any): void {
    this.router.navigate([
      '/project',
      project.operation,
      project.contract.replace('/', '%2F'),
      'procurement',
    ]);
  }

  filterfavorites(array: Project[], event: boolean): Project[] {
    if (event) {
      return array;
    } else {
      return array.filter((project: Project) => project.favorite);
    }
  }

  filterSearch(array: Project[], event: string) {
    const lowerCase = event.toLocaleLowerCase();
    return array.filter(
      (project: Project) =>
        project.name.toLowerCase().includes(lowerCase) ||
        project.operationNumber.toLowerCase().includes(lowerCase) ||
        project.contract.toString().toLowerCase().includes(lowerCase) ||
        project.approvedAmount.toString().includes(lowerCase) ||
        project.executor.toLowerCase().includes(lowerCase) ||
        project.operationNumber.toLowerCase().includes(lowerCase)
    );
  }
  changeCountry(): void {
    this.getNewProjects().subscribe((data) => {
      this.lastFilterCursor = EMPTY_GUID;
      this.hasMoreFilterData = false;
      if (!!this.selectedCountry.countryCode || !this.selectedValue.value) {
        this.processDataWithFilters(this.searchString, data);
      } else {
        this.processData('', data);
      }
    });
  }

  filterValue(event: string): void {
    if (this.selectedValue.value) {
      this.getReduxProjects('projects').subscribe((data) => {
        this.searchString = event;
        this.highlightValue = event;
        this.processData(event, data);
      });
    } else {
      this.getReduxProjects('favouriteProjects').subscribe((data) => {
        const searchByInput = this.selectedSearchValue.value
          ? 'operationNumber'
          : 'contract';
        this.filteredProjectFavoriteCollection = data.filter((p) =>
          p[searchByInput]
            ?.toLocaleLowerCase()
            .includes(event.toLocaleLowerCase())
        );
        this.highlightValue = event;
      });
    }
  }

  processDataWithFilters(event: string, actualProjects: Project[]): void {
    this.isLoading = true;
    this.loadingFilterData = true;
    if (!this.selectedValue.value) {
      this.getReduxProjects('favouriteProjects').subscribe((data) => {
        this.filteredProjectFavoriteCollection = data.filter((p) =>
          p.contract.includes(event) && this.selectedCountry?.countryCode
            ? p.countryCode === this.selectedCountry?.countryCode
            : true
        );
      });
      this.isLoading = false;
      this.loadingFilterData = false;
    } else {
      const reqApi = this.selectedSearchValue.value
        ? this.projectApiSvc.getSpecificOperation(
            event,
            this.selectedCountry.countryCode,
            this.lastFilterCursor
          )
        : this.projectApiSvc.getSpecificProject(
            event,
            10,
            this.selectedCountry.countryCode,
            this.lastFilterCursor
          );

      this.subscriptionCollection.push(
        reqApi.subscribe({
          next: (data) => {
            this.lastFilterCursor = data.cursor;
            let findData = data.data.map((p) =>
              this.mapContractOperationToProject(p)
            );

            const allProjects = this.deleteDuplicate([
              ...actualProjects,
              ...findData,
            ]);

            this.store.dispatch(
              projectActions.setProjectsOnSearch({ projects: allProjects })
            );
            if (data.cursor === EMPTY_GUID) {
              this.hasMoreFilterData = false;
            } else {
              this.hasMoreFilterData = true;
            }

            const idsInSecondArray = new Set(
              this.allProjectsCollection.map((item) => item.id)
            );

            data.data.forEach((item) => {
              if (!idsInSecondArray.has(item.id)) {
                this.allProjectsCollection.push(
                  this.mapContractOperationToProject(item)
                );
              }
            });

            this.allProjectsCollection = this.allProjectsCollection.filter(
              (data) => {
                const searchByInput = this.selectedSearchValue.value
                  ? data.operationNumber
                  : data.contract;

                return (
                  searchByInput
                    .toLocaleLowerCase()
                    .includes(event.toLocaleLowerCase()) &&
                  data.countryCode === this.selectedCountry.countryCode
                );
              }
            );

            this.filterResults = this.allProjectsCollection.length;
            this.isLoading = false;
            this.loadingFilterData = false;
          },
          error: () => {
            this.allProjectsCollection = [];
            this.filterResults = this.allProjectsCollection.length;
            this.isLoading = false;
            this.loadingFilterData = false;
          },
        })
      );
    }
  }

  processData(event: string, actualProjects: Project[]): void {
    if (event !== '') {
      this.isLoading = true;

      const reqApi = this.selectedSearchValue.value
        ? this.projectApiSvc.getSpecificOperation(
            event,
            this.selectedCountry.countryCode
          )
        : this.projectApiSvc.getSpecificProject(
            event,
            10,
            this.selectedCountry.countryCode
          );

      this.subscriptionCollection.push(
        reqApi.subscribe({
          next: (data) => {
            let findData = data.data.map((p) =>
              this.mapContractOperationToProject(p)
            );

            const allProjects = this.deleteDuplicate([
              ...actualProjects,
              ...findData,
            ]);

            this.store.dispatch(
              projectActions.setProjectsOnSearch({ projects: allProjects })
            );

            const idsInSecondArray = new Set(
              this.allProjectsCollection.map((item) => item.id)
            );

            data.data.forEach((item) => {
              if (!idsInSecondArray.has(item.id)) {
                this.allProjectsCollection.push(
                  this.mapContractOperationToProject(item)
                );
              }
            });

            this.allProjectsCollection = this.allProjectsCollection.filter(
              (data) =>
                (this.selectedSearchValue.value
                  ? data.operationNumber
                  : data.contract
                )
                  .toLocaleLowerCase()
                  .includes(event.toLocaleLowerCase())
            );

            this.filterResults = this.allProjectsCollection.length;
            this.isLoading = false;
          },
          error: () => {
            this.allProjectsCollection = [];
            this.filterResults = this.allProjectsCollection.length;
            this.isLoading = false;
          },
        })
      );
    } else {
      this.restoreOriginalProjects();
    }
  }

  deleteDuplicate(arr: Project[]): Project[] {
    const uniqueProjectsMap = new Map<string, Project>();
    for (const project of arr) {
      if (!uniqueProjectsMap.has(project.projectBucketId)) {
        uniqueProjectsMap.set(project.projectBucketId, project);
      }
    }
    return Array.from(uniqueProjectsMap.values());
  }

  mapContractOperationToProject(data: ContractOperation): Project {
    return {
      approvedAmount: data.originalApprovedAmount,
      contract: data.operation,
      countryCode: data.countryCode,
      currentApprovedAmount: data.currentApprovedAmount,
      executor: data.executor,
      executorAcronym: data.executorAcronym,
      favorite: false,
      id: data.id,
      name: data.projectName[this.preferedLang],
      nameEn: data.projectName.en,
      nameEs: data.projectName.es,
      nameFr: data.projectName.fr,
      namePt: data.projectName.pt,
      operationNumber: data.project,
      projectBucketId: data.id,
      projectName: data.projectName,
    };
  }

  cardComponentBuilder(project: Project, highlight: string): Card {
    const cardBuilder = new CardBuilder();
    return cardBuilder
      .withProjectCollection(project)
      .withHighlight(highlight)
      .build();
  }

  loadProjectsOnScroll(): void {
    if (this.actualPage < this.totalPages) {
      this.store.dispatch(
        projectActions.loadMoreProjects({ lastCursor: this.lastCursor })
      );
    }
  }

  subToProjectState(): void {
    this.subscriptionCollection.push(
      this.store
        .pipe(select('projects'))
        .pipe(map((data) => data.isFetchingData))
        .subscribe((data) => {
          this.isLoadingData = data;

          if (this.isLoadingData) {
            this.isFullScrolled.next(false);
          } else {
            this.zone.runOutsideAngular(() => {
              requestAnimationFrame(() => {
                window.scrollTo(0, this.scrollPosition);
              });
            });
          }
        })
    );

    const obsProjects = this.store
      .pipe(select('projects'))
      .pipe(filter((data) => !data.fetchInitialData && !data.isFetchingData));
    const obsPreferences = this.store.select('preferences').pipe(
      tap((data) => (this.preferedLang = data.preferences.preferredLanguage)),
      map((data) => data.preferences.projects)
    );

    this.subscriptionCollection.push(
      combineLatest([obsProjects, obsPreferences]).subscribe((data) => {
        this.isFetchingData.next(data[0].fetchInitialData);
        this.isLoading = data[0].fetchInitialData;
        this.totalPages = data[0].totalPages;
        this.actualPage = data[0].actualPage;
        this.lastCursor = data[0].lastCursor;
        this.selectedValue = data[0].hasFavourites
          ? this.optionsToFilter[1]
          : this.optionsToFilter[0];
        this.filteredProjectCollection = [...data[0].newProjects];
        this.filteredProjectFavoriteCollection = [...data[0].favouriteProjects];

        // Crear un diccionario a partir de arreglo1 usando projectBucketId como clave
        const dict = {};
        this.filteredProjectCollection.forEach((item) => {
          dict[item.projectBucketId] = { ...item };
        });

        // Actualizar el diccionario con los elementos de arreglo2, manteniendo la propiedad favorite
        this.filteredProjectFavoriteCollection.forEach((item) => {
          if (dict[item.projectBucketId]) {
            dict[item.projectBucketId].favorite = item.favorite;
          } else {
            dict[item.projectBucketId] = { ...item };
          }
        });

        // Convertir el diccionario de vuelta a un arreglo
        const combinedArray = Object.values(dict) as Project[];

        this.allProjectsCollection = this.addFavoriteProp(
          combinedArray,
          data[1]
        ).sort((a, b) => Number(b.favorite) - Number(a.favorite));
        this.allProjectsCollectionCopy = structuredClone(
          this.allProjectsCollection
        );

        const uniqueContracts = new Set();
        const uniqueData = this.allProjectsCollection.filter((item) => {
          const isDuplicate = uniqueContracts.has(item.contract);
          uniqueContracts.add(item.contract);
          return !isDuplicate;
        });
        this.allProjectsCollection = uniqueData;
        this.allProjectsCollectionCopy = structuredClone(
          this.allProjectsCollection
        );
      })
    );
  }

  addFavoriteProp(
    projects: Project[],
    favoriteProjects: OperationPreference[]
  ): Project[] {
    let newProjects = projects.map((p) => {
      if (
        favoriteProjects.filter((fp) => fp.contractNumber === p.contract)
          .length > 0
      ) {
        return { ...p, favorite: true };
      } else {
        return { ...p };
      }
    });
    return newProjects;
  }

  getProjects(): void {
    this.subscriptionCollection.push(
      this.store
        .select('projects')
        .pipe(map((data) => data.lastCursor))
        .pipe(filter((data) => data === ''))
        .pipe(take(1))
        .subscribe(() => {
          this.store.dispatch(
            projectActions.getNewProjects({ initialData: true })
          );
        })
    );
  }

  mapFavoritesProjects(
    favoriteProject: OperationPreference[],
    preferedLang: string
  ): Project[] {
    return favoriteProject.map((data) => {
      return {
        approvedAmount: data.totalApprovedAmount,
        contract: data.contractNumber,
        countryCode: '',
        currentApprovedAmount: 2,
        executor: '',
        executorAcronym: '',
        favorite: true,
        id: data.projectBucket,
        name: data.projectName[preferedLang],
        nameEn: data.projectName.en,
        nameEs: data.projectName.es,
        nameFr: data.projectName.fr,
        namePt: data.projectName.pt,
        operationNumber: data.operationNumber,
        projectBucketId: data.projectBucket,
        projectName: {
          en: data.projectName.en,
          es: data.projectName.es,
          fr: data.projectName.fr,
          pt: data.projectName.pt,
        },
      };
    });
  }

  getNewProjects(): Observable<Project[]> {
    return this.store.pipe(
      select('projects'),
      map((data) => data.newProjects),
      take(1)
    );
  }
}
