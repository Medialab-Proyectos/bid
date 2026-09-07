import { Injectable } from '@angular/core';
import {
  BiddingProcessPlanStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { BiddingProcessDocumentPackagesApiService } from '@core/services/apis';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { filter, map, mergeMap, switchMap, take } from 'rxjs/operators';
import {
  BiddingProcessDocumentPackage,
  EvaluationParticipantsResponse,
  GetParticipantsResponse,
  GetProcessDocumentPackageByProcurementIdResponse,
  KeyValueInput,
  ParticipantResponse,
  SettingsParticipants,
} from '@core/models';
import { DocumentPackagesStatus } from '@core/enums';
import { BidderApiService, ParticipantsApiService } from '@core/services/apis/';
import {
  AppState,
  BiddingProcessPlanState,
  SelectedProjectState,
} from '@core/store';
import { Store } from '@ngrx/store';

interface PackagesAndParticipantsConfig {
  participants: ParticipantResponse[];
  configValues: EvaluationParticipantsResponse;
  packages: BiddingProcessDocumentPackage[];
  code: number;
  selectedProject: SelectedProjectState;
  selectedPlan: BiddingProcessPlanState;
  disabledBtn: boolean;
  lastBidValidityExtensionDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PackageAndParticipantsService {
  constructor(
    private readonly projectSvc: ProjectStoreService,
    private readonly biddingProcessPlanStore: BiddingProcessPlanStoreService,
    private readonly documentsApi: BiddingProcessDocumentPackagesApiService,
    readonly configSvc: ProcessConfiguration,
    private readonly participantsApi: ParticipantsApiService,
    private readonly bidderApi: BidderApiService,
    readonly store: Store<AppState>
  ) {}

  dictionary = {
    awardedAmount: 'amount',
    financialScore: 'weighedFinancialScore',
    overallScore: 'totalScore',
    technicalScore: 'weighedTechScore',
  };

  mapParticipantSettingsToMasterData(
    countryCode: string,
    categoryId: number,
    procurementMethodId: number,
    packageCodeId: number
  ): Observable<SettingsParticipants> {
    return this.getSelectedLang().pipe(
      switchMap((lang) =>
        this.participantsApi
          .getParticipantsSettings(
            countryCode,
            categoryId,
            procurementMethodId,
            packageCodeId
          )
          .pipe(
            map((data) => {
              return {
                text: data.text,
                availableResults: data.availableResults.map((r) => {
                  return { id: r.id, name: r.name[lang], code: r.code };
                }),
                awardedAmount: data.awardedAmount,
                financialScore: data.financialScore,
                overallScore: data.overallScore,
                technicalScore: data.technicalScore,
              };
            })
          )
      )
    );
  }

  getSelectedLang(): Observable<string> {
    return this.store.select('preferences').pipe(
      filter((data) => data.preferences !== null),
      map((data) => data.preferences.preferredLanguage),
      take(1)
    );
  }

  checkData(): Observable<PackagesAndParticipantsConfig> {
    return combineLatest([
      this.projectSvc.selectedProject(),
      this.biddingProcessPlanStore.biddingProcessPlan(),
    ])
      .pipe(
        filter(
          ([selectedProjectObs, selectedPlanObs]) =>
            selectedProjectObs.selectedProject !== undefined &&
            selectedProjectObs.loaded &&
            selectedPlanObs.selectedBiddingProcessProcurementProcess !==
              undefined &&
            selectedPlanObs.isSelectedProcessLoaded
        ),
        switchMap(([selectedProject, selectedPlan]) =>
          this.documentsApi
            .getBiddingProcessDocumentPackages(
              selectedPlan.selectedBiddingProcessProcurementProcess.id,
              false
            )
            .pipe(
              map((data: GetProcessDocumentPackageByProcurementIdResponse) => {
                const mandatoryOrderedPackages =
                  data.biddingProcessDocumentPackage
                    .filter((p) => !p.isOptional)
                    .sort((a, b) => a.order - b.order);
                const packagesWithConditions = mandatoryOrderedPackages.filter(
                  (p) =>
                    p.status === DocumentPackagesStatus.NOT_STARTED ||
                    p.status === DocumentPackagesStatus.RETURNED
                );

                const packageForParticipantResult = this.packageForParticipants(
                  packagesWithConditions,
                  mandatoryOrderedPackages
                );

                return {
                  packages: mandatoryOrderedPackages,
                  code:
                    packagesWithConditions.length > 0
                      ? packagesWithConditions[0].code
                      : mandatoryOrderedPackages[
                          mandatoryOrderedPackages.length - 1
                        ].code,
                  packageCodeForParticiapntResult:
                    packageForParticipantResult.code,
                  selectedProject: selectedProject,
                  selectedPlan: selectedPlan,
                  lastBidValidityExtensionDate:
                    data.lastBidValidityExtensionDate,
                };
              })
            )
        ),
        switchMap((projectPlanAndPackages) => {
          return forkJoin([
            this.mapParticipantSettingsToMasterData(
              projectPlanAndPackages.selectedProject.selectedProject
                .countryCode,
              projectPlanAndPackages.selectedPlan
                .selectedBiddingProcessProcurementProcess.category.id,
              projectPlanAndPackages.selectedPlan
                .selectedBiddingProcessProcurementProcess.procurementMethod.id,
              projectPlanAndPackages.code
            ),
            this.mapParticipantSettingsToMasterData(
              projectPlanAndPackages.selectedProject.selectedProject
                .countryCode,
              projectPlanAndPackages.selectedPlan
                .selectedBiddingProcessProcurementProcess.category.id,
              projectPlanAndPackages.selectedPlan
                .selectedBiddingProcessProcurementProcess.procurementMethod.id,
              projectPlanAndPackages.packageCodeForParticiapntResult
            ),
          ]).pipe(
            map(([data, dataForParticpantResult]) => {
              if (data) {
                const configValues = {
                  awardedAmount: data.awardedAmount,
                  financialScore: data.financialScore,
                  overallScore: data.overallScore,
                  technicalScore: data.technicalScore,
                  texto: data.text,
                  availableResults: data.availableResults,
                } as EvaluationParticipantsResponse;

                return {
                  ...projectPlanAndPackages,
                  configValues: {
                    ...configValues,
                    availableResults: dataForParticpantResult.availableResults,
                  },
                };
              } else {
                return {
                  ...projectPlanAndPackages,
                  configValues: null,
                };
              }
            })
          );
        }),
        switchMap((projectPlanPackagesAndConfig) => {
          return this.participantsApi
            .getParticipants(
              projectPlanPackagesAndConfig.selectedPlan
                .selectedBiddingProcessProcurementProcess.id
            )
            .pipe(
              map((response: GetParticipantsResponse) => {
                const participants = this.addDisabledProperty(
                  response.participantsDetail as ParticipantResponse[]
                );
                return participants;
              })
            )
            .pipe(
              switchMap((participantsArray: ParticipantResponse[]) => {
                if (participantsArray.length === 0) {
                  return of({
                    ...projectPlanPackagesAndConfig,
                    participants: [],
                  });
                }
                const participantsDetailObs = participantsArray.map(
                  (participant) => {
                    return this.bidderApi
                      .searchBidderById(participant.biddingProcessBidderId)
                      .pipe(
                        switchMap((participantDetail) => {
                          return this.bidderApi
                            .searchBidderLocationsById(
                              participant.biddingProcessBidderId
                            )
                            .pipe(
                              mergeMap((additionalData) => {
                                return of({
                                  ...participantDetail,
                                  additionalData: additionalData,
                                });
                              })
                            );
                        })
                      );
                  }
                );
                return forkJoin(participantsDetailObs).pipe(
                  mergeMap((details) => {
                    return of(
                      participantsArray.map((participant, index) => ({
                        ...participant,
                        bidder: {
                          ...details[index].biddingProcessBidder,
                          address:
                            details[index].additionalData.locations.length > 0
                              ? details[index].additionalData.locations[0]
                                  .address
                              : '',
                          zipCode:
                            details[index].additionalData.locations.length > 0
                              ? details[index].additionalData.locations[0]
                                  .zipCode
                              : '',
                          country:
                            details[index].additionalData.locations.length > 0
                              ? details[index].additionalData.locations[0]
                                  .country
                              : null,
                        },
                      }))
                    );
                  }),
                  mergeMap((participants) => {
                    return of({
                      ...projectPlanPackagesAndConfig,
                      participants: participants,
                    });
                  })
                );
              })
            );
        })
      )
      .pipe(
        map((data) => {
          const { availableResults, ...dataWithOutResults } = data.configValues;
          const indexes = Object.values(dataWithOutResults).reduce(
            (acumulator, value, index) => {
              if (value === 'R') {
                acumulator.push(index);
              }
              return acumulator;
            },
            []
          );
          const keys = indexes.map(
            (index) => Object.keys(dataWithOutResults)[index]
          );
          const keyDictionary = keys.map((key) => this.dictionary[key]);

          let disabledBtn = false;

          data.participants.forEach((p) => {
            keyDictionary.forEach((k) => {
              if (p[k] === null) {
                disabledBtn = true;
              }
            });
          });

          return { ...data, disabledBtn };
        })
      )
      .pipe(
        map((data) => {
          const unOrderParticipants = data.participants;
          const orderedParticipants = unOrderParticipants.sort(
            (a, b) =>
              new Date(a.created).getTime() - new Date(b.created).getTime()
          );
          return { ...data, participants: orderedParticipants };
        })
      );
  }

  /**
   * Returns an array of participants with the new property (allowToEdit) that will define if the user is allow to edit this participant
   * @param {ParticipantResponse} participants - a array of participants
   */
  addDisabledProperty(
    participants: ParticipantResponse[]
  ): ParticipantResponse[] {
    return participants.map((p: ParticipantResponse) => {
      p.allowToEdit = !(
        p.biddingContractAwarded || p.biddingProcessDocumentAwarded
      );
      return p;
    });
  }

  packageForParticipants(
    packagesWithConditions: BiddingProcessDocumentPackage[],
    mandatoryOrderedPackages: BiddingProcessDocumentPackage[]
  ): BiddingProcessDocumentPackage {
    let packageForParticipantResult: BiddingProcessDocumentPackage;
    if (packagesWithConditions.length > 0) {
      if (
        packagesWithConditions[0].code === mandatoryOrderedPackages[0].code &&
        packagesWithConditions[0].order === mandatoryOrderedPackages[0].order
      ) {
        packageForParticipantResult = packagesWithConditions[0];
      } else {
        const previousPackage = mandatoryOrderedPackages.find(
          (p) => p.order === packagesWithConditions[0].order - 1
        );
        if (
          previousPackage.status === DocumentPackagesStatus.COMPLETE ||
          previousPackage.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
        ) {
          packageForParticipantResult = packagesWithConditions[0];
        } else {
          packageForParticipantResult = previousPackage;
        }
      }
    } else {
      packageForParticipantResult =
        mandatoryOrderedPackages[mandatoryOrderedPackages.length - 1];
    }
    return packageForParticipantResult;
  }

  buildAttributesQuery(
    countryCode: string,
    categoryId: number,
    procurementMethodId: number,
    packageCode: number
  ): KeyValueInput[] {
    return [
      {
        key: 'countryCode',
        value: countryCode,
      },
      {
        key: 'category',
        value: categoryId,
      },
      {
        key: 'procurementMethod',
        value: procurementMethodId,
      },
      {
        key: 'packageCode',
        value: packageCode,
      },
    ];
  }
}
