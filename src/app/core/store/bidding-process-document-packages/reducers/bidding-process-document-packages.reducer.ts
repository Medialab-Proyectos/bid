import {
  BiddingProcessDocumentGroupsResults,
  DocumentPackageStatusEnum,
  DocumentPackagesStatus,
} from '@core/enums';
import {
  BiddingProcessDocumentGroup,
  BiddingProcessDocumentPackage,
  Enumerator,
  FiduciaryProcessDocument,
  ParticipantAwarded,
  ParticipantPackages,
  UploadFiduciaryProcessDocuments,
} from '@core/models';
import { AppState } from '@core/store/store.reducers';
import { createReducer, on } from '@ngrx/store';
import * as actions from '../actions/bidding-process-document-packages.actions';
import { DocumentGroupCode } from '@fiduciary-interface/app/shared/components/documents/enums';

export interface BiddingProcessDocumentPackagesState {
  biddingProcessDocumentPackagesByProcess: {
    [processId: string]: {
      biddingProcessDocumentPackages: BiddingProcessDocumentPackage[];
      lastBidValidityExtensionDate: Date;
      loaded: boolean;
      loading: boolean;
      error: unknown;
    };
  };
}

export interface AppStateWithBiddingProcessDocumentPackages extends AppState {
  biddingProcessDocumentPackages: BiddingProcessDocumentPackagesState;
}

export const documentsInitialState: BiddingProcessDocumentPackagesState = {
  biddingProcessDocumentPackagesByProcess: {},
};

const _biddingProcessDocumentPackageReducer = createReducer(
  documentsInitialState,
  on(actions.getDocumentPackages, (state, { processId }) => {
    return {
      ...state,
      biddingProcessDocumentPackagesByProcess: {
        ...state.biddingProcessDocumentPackagesByProcess,
        [processId]: {
          ...state.biddingProcessDocumentPackagesByProcess[processId],
          biddingProcessDocumentPackages: [] as BiddingProcessDocumentPackage[],
          error: null,
          loading: true,
          loaded: false,
        },
      },
    };
  }),
  on(
    actions.getDocumentPackagesSuccess,
    (
      state,
      {
        processId,
        biddingProcessDocumentPackages,
        lastBidValidityExtensionDate,
      }
    ) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages: biddingProcessDocumentPackages.map(
              (e) => ({
                ...e,
                biddingProcessDocumentGroups:
                  [] as BiddingProcessDocumentGroup[],
                groupsState: { loading: false },
                documentsState: { loading: false },
                actualDateState: { loading: false },
              })
            ),
            lastBidValidityExtensionDate: lastBidValidityExtensionDate,
            loading: false,
            loaded: true,
          },
        },
      };
    }
  ),
  on(
    actions.getDocumentGroupsSuccess,
    (
      state,
      {
        processId,
        biddingProcessDocumentPackageId,
        biddingProcessDocumentGroups,
      }
    ) => {
      const uploadedDocAfterCompletionExist = biddingProcessDocumentGroups.some(
        (group) =>
          group.fiduciaryProcessDocuments?.filter(
            (document) =>
              document.status === DocumentPackageStatusEnum.UPLOADED &&
              document.groupCode === DocumentGroupCode.OTHER_AFTER_COMPLETION
          ).length > 0
      );
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages:
              state.biddingProcessDocumentPackagesByProcess[
                processId
              ].biddingProcessDocumentPackages.map((documentPackage) => {
                if (documentPackage.id !== biddingProcessDocumentPackageId) {
                  return documentPackage;
                }

                const newDocumentPackage = { ...documentPackage };
                newDocumentPackage.biddingProcessDocumentGroups =
                  biddingProcessDocumentGroups.map((group) => {
                    return { ...group, documentsState: { loading: false } };
                  });

                newDocumentPackage.groupsState = {
                  ...newDocumentPackage.groupsState,
                  loading: false,
                };
                const packageStatus =
                  newDocumentPackage.status ===
                    DocumentPackagesStatus.COMPLETE ||
                  newDocumentPackage.status ===
                    DocumentPackagesStatus.COMPLETE_AMENDMENT;
                return {
                  ...newDocumentPackage,
                  uploadedDocAfterCompletionExist:
                    packageStatus && uploadedDocAfterCompletionExist,
                };
              }),
          },
        },
      };
    }
  ),
  on(
    actions.restoreDescriptiongDoc,
    (state, { relationalId, packageId, groupId, procurementProcessId }) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[procurementProcessId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [procurementProcessId]: {
            ...state.biddingProcessDocumentPackagesByProcess[
              procurementProcessId
            ],
            biddingProcessDocumentPackages: restoreDescription(
              biddingProcessDocumentPackages,
              packageId,
              groupId,
              relationalId
            ),
          },
        },
      };
    }
  ),
  on(
    actions.updateDescriptiongDocSuccess,
    (
      state,
      { relationalId, packageId, groupId, description, procurementProcessId }
    ) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[procurementProcessId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [procurementProcessId]: {
            ...state.biddingProcessDocumentPackagesByProcess[
              procurementProcessId
            ],
            biddingProcessDocumentPackages: confirmUpdateDescription(
              biddingProcessDocumentPackages,
              packageId,
              groupId,
              relationalId,
              description
            ),
          },
        },
      };
    }
  ),
  on(
    actions.addDescriptionExistingDoc,
    (
      state,
      { procurementProcessId, packageId, groupCode, docId, newDescription }
    ) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[procurementProcessId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [procurementProcessId]: {
            ...state.biddingProcessDocumentPackagesByProcess[
              procurementProcessId
            ],
            biddingProcessDocumentPackages: updateDescription(
              biddingProcessDocumentPackages,
              packageId,
              groupCode,
              docId,
              newDescription
            ),
          },
        },
      };
    }
  ),
  on(
    actions.getFiduciaryProcessDocumentsSuccess,
    (
      state,
      { biddingProcessDocumentGroupId, fiduciaryProcessDocuments, processId }
    ) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[processId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages: updateDocsByGroup(
              biddingProcessDocumentPackages,
              biddingProcessDocumentGroupId,
              fiduciaryProcessDocuments
            ),
          },
        },
      };
    }
  ),
  on(
    actions.addFiduciaryProcessDocumentsSuccess,
    (
      state,
      {
        biddingProcessDocumentPackageId,
        fiduciaryProcessDocuments,
        groupId,
        processId,
      }
    ) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[processId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            loaded: true,
            loading: false,
            biddingProcessDocumentPackages: biddingProcessDocumentPackages.map(
              (documentPackage) => {
                if (documentPackage.id !== biddingProcessDocumentPackageId) {
                  return documentPackage;
                }

                const newDocumentPackage = {
                  ...documentPackage,
                };

                const documentsGroup = [
                  ...documentPackage.biddingProcessDocumentGroups,
                ];

                if (groupId === null) {
                  if (newDocumentPackage.documentsToUpload !== undefined) {
                    newDocumentPackage.documentsToUpload = [
                      ...newDocumentPackage.documentsToUpload,
                      ...fiduciaryProcessDocuments,
                    ];
                  } else {
                    newDocumentPackage.documentsToUpload = [
                      ...fiduciaryProcessDocuments,
                    ];
                  }
                } else {
                  const listDocumentsGroup = [];
                  for (const group of documentsGroup) {
                    if (group.documentGroupCode === groupId) {
                      newDocumentPackage.totalUploadedDocuments += 1;
                      const listDocuments = [
                        ...group.fiduciaryProcessDocuments,
                        ...fiduciaryProcessDocuments,
                      ];

                      listDocumentsGroup.push({
                        ...group,
                        fiduciaryProcessDocuments: listDocuments,
                      });
                    } else {
                      listDocumentsGroup.push({
                        ...group,
                      });
                    }
                  }
                  newDocumentPackage.biddingProcessDocumentGroups =
                    listDocumentsGroup;
                }

                return newDocumentPackage;
              }
            ),
          },
        },
      };
    }
  ),
  on(
    actions.removeFiduciaryProcessDocumentsSuccess,
    (
      state,
      {
        biddingProcessDocumentPackageId,
        fiduciaryProcessDocument,
        uploadFile,
        processId,
      }
    ) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[processId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            loaded: true,
            loading: false,
            biddingProcessDocumentPackages: biddingProcessDocumentPackages.map(
              (documentPackage) => {
                if (documentPackage.id !== biddingProcessDocumentPackageId) {
                  return documentPackage;
                }

                const newDocumentPackage = {
                  ...documentPackage,
                };

                let newDocumentsGroup = [
                  ...documentPackage.biddingProcessDocumentGroups,
                ];

                if (uploadFile) {
                  const newListDocumentsToUpload =
                    newDocumentPackage.documentsToUpload.filter(
                      (document) =>
                        document.file !== fiduciaryProcessDocument.file
                    );

                  newDocumentPackage.documentsToUpload =
                    newListDocumentsToUpload;
                } else {
                  const listDocumentsGroup = [];
                  if (newDocumentsGroup.length > 0) {
                    for (let group of newDocumentsGroup) {
                      group = resetResult(group, fiduciaryProcessDocument);
                      const listDocuments =
                        group.fiduciaryProcessDocuments.filter(
                          (document) =>
                            document.id !== fiduciaryProcessDocument.id
                        );
                      listDocumentsGroup.push({
                        ...group,
                        fiduciaryProcessDocuments: listDocuments,
                      });
                    }
                    newDocumentsGroup = listDocumentsGroup;
                  }
                  newDocumentPackage.biddingProcessDocumentGroups =
                    newDocumentsGroup;
                  newDocumentPackage.totalUploadedDocuments =
                    newDocumentPackage.totalUploadedDocuments - 1;
                }

                return newDocumentPackage;
              }
            ),
          },
        },
      };
    }
  ),

  on(
    actions.updateDocOptionsResult,
    (
      state,
      {
        packageCode,
        groupCode,
        documentId,
        processId,
        results,
        awardedOptions,
        selectedAwardeds,
      }
    ) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[processId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            loaded: true,
            loading: false,
            biddingProcessDocumentPackages: getDocDestructured(
              biddingProcessDocumentPackages,
              packageCode,
              groupCode,
              documentId,
              results,
              awardedOptions,
              selectedAwardeds
            ),
          },
        },
      };
    }
  ),
  on(
    actions.addDescriptionNotUploadDoc,
    (
      state,
      { processId, biddingProcessDocumentPackageId, fiduciaryProcessDocument }
    ) => {
      const docsToUpload = state.biddingProcessDocumentPackagesByProcess[
        processId
      ].biddingProcessDocumentPackages.find(
        (p) => p.id === biddingProcessDocumentPackageId
      ).documentsToUpload;
      const newDocsArray = docsToUpload.map((d) => {
        if (d.name === fiduciaryProcessDocument.name) {
          return { ...d, description: fiduciaryProcessDocument.description };
        } else {
          return d;
        }
      });
      const actualPackages = state.biddingProcessDocumentPackagesByProcess[
        processId
      ].biddingProcessDocumentPackages.map((p) => {
        if (p.id === biddingProcessDocumentPackageId) {
          return { ...p, documentsToUpload: newDocsArray };
        } else {
          return p;
        }
      });
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            loaded: true,
            loading: false,
            biddingProcessDocumentPackages: actualPackages,
          },
        },
      };
    }
  ),
  on(
    actions.setAwardeds,
    (state, { processId, packageId, groupId, documentId, awardeds }) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[processId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            loaded: true,
            loading: false,
            biddingProcessDocumentPackages: updatedAwardeds(
              biddingProcessDocumentPackages,
              packageId,
              groupId,
              documentId,
              awardeds
            ),
          },
        },
      };
    }
  ),

  on(
    actions.getParticipantsAndActualParticipantsSucces,
    (
      state,
      {
        processId,
        packageId,
        groupId,
        documentId,
        participantsOptions,
        awardeds,
      }
    ) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[processId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            loaded: true,
            loading: false,
            biddingProcessDocumentPackages:
              updateParticipantsOptionsAndAwardeds(
                biddingProcessDocumentPackages,
                packageId,
                groupId,
                documentId,
                participantsOptions,
                awardeds
              ),
          },
        },
      };
    }
  ),
  on(
    actions.changePackageStatus,
    actions.changeResultConfig,
    (state, { processId, packageId }) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages:
              state.biddingProcessDocumentPackagesByProcess[
                processId
              ].biddingProcessDocumentPackages.map((documentPackage) => {
                const newDocumentPackage = { ...documentPackage };
                if (documentPackage.id === packageId) {
                  newDocumentPackage.documentsState = {
                    loading: true,
                  };
                }
                return newDocumentPackage;
              }),
          },
        },
      };
    }
  ),
  on(
    actions.changePackageStatusError,
    actions.changeResultConfigError,
    (state, { processId, packageId }) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages:
              state.biddingProcessDocumentPackagesByProcess[
                processId
              ].biddingProcessDocumentPackages.map((documentPackage) => {
                const newDocumentPackage = { ...documentPackage };
                if (documentPackage.id === packageId) {
                  newDocumentPackage.documentsState = {
                    loading: false,
                  };
                }
                return newDocumentPackage;
              }),
          },
        },
      };
    }
  ),

  on(
    actions.changeResultConfigSuccess,
    (state, { processId, packageId, groupId, fileId, result }) => {
      const biddingProcessDocumentPackages =
        state.biddingProcessDocumentPackagesByProcess[processId]
          .biddingProcessDocumentPackages;
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            loaded: true,
            loading: false,
            biddingProcessDocumentPackages: updateResultConfig(
              biddingProcessDocumentPackages,
              packageId,
              groupId,
              fileId,
              result
            ),
          },
        },
      };
    }
  ),

  on(
    actions.changePackageStatusSuccess,
    (state, { processId, packageId, status }) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages:
              state.biddingProcessDocumentPackagesByProcess[
                processId
              ].biddingProcessDocumentPackages.map((documentPackage) => {
                const newDocumentPackage = { ...documentPackage };
                if (documentPackage.id === packageId) {
                  newDocumentPackage.documentsState = {
                    loading: false,
                  };
                  newDocumentPackage.status = status;
                }
                return newDocumentPackage;
              }),
          },
        },
      };
    }
  ),

  on(
    actions.changePackageActualDate,
    (state, { processId, packageId, actualDate }) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages:
              state.biddingProcessDocumentPackagesByProcess[
                processId
              ].biddingProcessDocumentPackages.map((documentPackage) => {
                let newDocumentPackage: BiddingProcessDocumentPackage;
                if (documentPackage.id === packageId) {
                  newDocumentPackage = {
                    ...documentPackage,
                    actualDateState: {
                      loading: true,
                    },
                    actualDate,
                  };
                } else {
                  newDocumentPackage = {
                    ...documentPackage,
                    actualDateState: {
                      loading: false,
                    },
                  };
                }

                return newDocumentPackage;
              }),
          },
        },
      };
    }
  ),

  on(
    actions.changePackageActualDateSuccess,
    (state, { processId, packageId, actualDate }) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages:
              state.biddingProcessDocumentPackagesByProcess[
                processId
              ].biddingProcessDocumentPackages.map((documentPackage) => {
                let newDocumentPackage: BiddingProcessDocumentPackage;
                if (documentPackage.id === packageId) {
                  newDocumentPackage = {
                    ...documentPackage,
                    actualDateState: {
                      loading: false,
                    },
                    actualDate,
                  };
                } else {
                  newDocumentPackage = {
                    ...documentPackage,
                    actualDateState: {
                      loading: false,
                    },
                  };
                }
                return newDocumentPackage;
              }),
          },
        },
      };
    }
  ),

  on(
    actions.changePackageActualDateError,
    (state, { processId, prevDate, packageId }) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages:
              state.biddingProcessDocumentPackagesByProcess[
                processId
              ].biddingProcessDocumentPackages.map((documentPackage) => {
                let newDocumentPackage: BiddingProcessDocumentPackage;
                if (documentPackage.id === packageId) {
                  newDocumentPackage = {
                    ...documentPackage,
                    actualDateState: {
                      loading: false,
                    },
                  };
                  newDocumentPackage.actualDate = prevDate;
                } else {
                  newDocumentPackage = {
                    ...documentPackage,
                    actualDateState: {
                      loading: false,
                    },
                  };
                }
                return newDocumentPackage;
              }),
          },
        },
      };
    }
  ),
  on(actions.deletePackage, (state, { processId }) => {
    return {
      ...state,
      biddingProcessDocumentPackagesByProcess: {
        ...state.biddingProcessDocumentPackagesByProcess,
        [processId]: {
          ...state.biddingProcessDocumentPackagesByProcess[processId],
          loading: true,
          loaded: false,
        },
      },
    };
  }),

  on(
    actions.deletePackageSuccess,
    (state, { processId, biddingProcessDocumentPackageId }) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages: deletePackage(
              state.biddingProcessDocumentPackagesByProcess[processId]
                .biddingProcessDocumentPackages,
              biddingProcessDocumentPackageId
            ),
            loading: false,
            loaded: true,
          },
        },
      };
    }
  ),
  on(actions.deletePackageError, (state, { processId }) => {
    return {
      ...state,
      biddingProcessDocumentPackagesByProcess: {
        ...state.biddingProcessDocumentPackagesByProcess,
        [processId]: {
          ...state.biddingProcessDocumentPackagesByProcess[processId],
          loading: false,
          loaded: true,
        },
      },
    };
  }),

  on(actions.updateBidValidityExtensionDate, (state, { processId }) => {
    return {
      ...state,
      biddingProcessDocumentPackagesByProcess: {
        ...state.biddingProcessDocumentPackagesByProcess,
        [processId]: {
          ...state.biddingProcessDocumentPackagesByProcess[processId],
          loading: true,
          loaded: false,
        },
      },
    };
  }),

  on(
    actions.updateBidValidityExtensionDateSuccess,
    (
      state,
      { processId, biddingProcessDocumentPackageId, bidValidityExtensionDate }
    ) => {
      return {
        ...state,
        biddingProcessDocumentPackagesByProcess: {
          ...state.biddingProcessDocumentPackagesByProcess,
          [processId]: {
            ...state.biddingProcessDocumentPackagesByProcess[processId],
            biddingProcessDocumentPackages: updateBidValidityExtensionDate(
              state.biddingProcessDocumentPackagesByProcess[processId]
                .biddingProcessDocumentPackages,
              biddingProcessDocumentPackageId,
              bidValidityExtensionDate
            ),
            loading: false,
            loaded: true,
          },
        },
      };
    }
  ),
  on(actions.updateBidValidityExtensionDateError, (state, { processId }) => {
    return {
      ...state,
      biddingProcessDocumentPackagesByProcess: {
        ...state.biddingProcessDocumentPackagesByProcess,
        [processId]: {
          ...state.biddingProcessDocumentPackagesByProcess[processId],
          loading: false,
          loaded: true,
        },
      },
    };
  }),
  on(actions.setLoadingPackage, (state, { processId, packageId, loading }) => {
    return {
      ...state,
      biddingProcessDocumentPackagesByProcess: {
        ...state.biddingProcessDocumentPackagesByProcess,
        [processId]: {
          ...state.biddingProcessDocumentPackagesByProcess[processId],
          biddingProcessDocumentPackages:
            state.biddingProcessDocumentPackagesByProcess[
              processId
            ].biddingProcessDocumentPackages.map((documentPackage) => {
              let newDocumentPackage: BiddingProcessDocumentPackage;
              if (documentPackage.id === packageId) {
                newDocumentPackage = {
                  ...documentPackage,
                  groupsState: {
                    loading,
                  },
                };
              } else {
                newDocumentPackage = {
                  ...documentPackage,
                };
              }
              return newDocumentPackage;
            }),
        },
      },
    };
  })
);

function updateBidValidityExtensionDate(
  packages: BiddingProcessDocumentPackage[],
  biddingProcessDocumentPackageId: string,
  bidValidityExtensionDate: Date
): BiddingProcessDocumentPackage[] {
  const packagesClone = JSON.parse(JSON.stringify(packages));
  const package1 = packagesClone.find(
    (p) => p.id === biddingProcessDocumentPackageId
  );
  package1.bidValidityExtensionDate = bidValidityExtensionDate;
  return packagesClone;
}

function deletePackage(
  packages: BiddingProcessDocumentPackage[],
  biddingProcessDocumentPackageId: string
): BiddingProcessDocumentPackage[] {
  return packages.filter(
    (objeto) => objeto.id !== biddingProcessDocumentPackageId
  );
}

function updateDescription(
  packages: BiddingProcessDocumentPackage[],
  packageId: string,
  biddingProcessDocumentGroupCode: number,
  docId: string,
  newDescription: string
): BiddingProcessDocumentPackage[] {
  return packages.map((p) => {
    if (p.id === packageId) {
      return {
        ...p,
        biddingProcessDocumentGroups: p.biddingProcessDocumentGroups.map(
          (group) => {
            if (group.documentGroupCode === biddingProcessDocumentGroupCode) {
              return {
                ...group,
                fiduciaryProcessDocuments: group.fiduciaryProcessDocuments.map(
                  (d) => {
                    if (d.id === docId) {
                      return { ...d, newDescription: newDescription };
                    } else {
                      return { ...d };
                    }
                  }
                ),
              };
            } else {
              return { ...group };
            }
          }
        ),
      };
    } else {
      return { ...p };
    }
  });
}

function updateDocsByGroup(
  packages: BiddingProcessDocumentPackage[],
  biddingProcessDocumentGroupId: string,
  fiduciaryProcessDocuments: FiduciaryProcessDocument[]
): BiddingProcessDocumentPackage[] {
  return packages.map((packageDocs) => {
    const hasLoadingDocuments = packageDocs.biddingProcessDocumentGroups.filter(
      (group) => group.documentsState?.loading
    );
    return {
      ...packageDocs,
      biddingProcessDocumentGroups:
        packageDocs.biddingProcessDocumentGroups.map((groupDocs) => {
          if (groupDocs.id === biddingProcessDocumentGroupId) {
            return {
              ...groupDocs,
              fiduciaryProcessDocuments: fiduciaryProcessDocuments.map(
                (doc) => {
                  return { ...doc, groupCode: groupDocs.documentGroupCode };
                }
              ),
              documentsState: {
                loading: false,
              },
            };
          } else {
            return { ...groupDocs };
          }
        }),
      documentsState: {
        loading: hasLoadingDocuments.length > 0,
      },
    };
  });
}

function getDocDestructured(
  biddingProcessDocumentPackages: BiddingProcessDocumentPackage[],
  packageCode: number,
  groupCode: number,
  docId: string,
  options: Enumerator[],
  awardedOptions: ParticipantAwarded[],
  selectedAwardeds: string[]
): BiddingProcessDocumentPackage[] {
  let _packages = [...biddingProcessDocumentPackages];
  _packages = _packages.map((p) => {
    const newPackage = { ...p };
    const filteredGroup = newPackage.biddingProcessDocumentGroups.find(
      (g) => g.documentGroupCode === groupCode
    );
    if (p.code === packageCode) {
      newPackage.biddingProcessDocumentGroups = [
        ...newPackage.biddingProcessDocumentGroups,
      ].map((g) => {
        const newGroup = { ...g };
        if (g.documentGroupCode === groupCode) {
          newGroup.fiduciaryProcessDocuments = [
            ...newGroup.fiduciaryProcessDocuments,
          ].map((d) => {
            let newDoc = { ...d };
            if (d.id === docId) {
              newDoc = {
                ...newDoc,
                groupCode,
                actualResults: options,
                showHeaderResult: true,
                result: filteredGroup.documentGroupConfiguration.result,
                participantsOptions: awardedOptions,
                awardeds: selectedAwardeds,
              };
            }
            return newDoc;
          });
        }
        return newGroup;
      });
    }
    return newPackage;
  });
  return _packages;
}

function updateParticipantsOptionsAndAwardeds(
  biddingProcessDocumentPackages: BiddingProcessDocumentPackage[],
  packageId: string,
  groupId: string,
  documentId: string,
  participantsOptions: ParticipantAwarded[],
  awardeds: ParticipantPackages[]
): BiddingProcessDocumentPackage[] {
  const awardedsResults = mapAwardeds(awardeds);
  let _packages = [...biddingProcessDocumentPackages];
  _packages = _packages.map((p) => {
    const newPackage = { ...p };
    if (p.id === packageId) {
      newPackage.biddingProcessDocumentGroups = [
        ...newPackage.biddingProcessDocumentGroups,
      ].map((g) => {
        const newGroup = { ...g };
        if (g.id === groupId) {
          newGroup.fiduciaryProcessDocuments = [
            ...newGroup.fiduciaryProcessDocuments,
          ].map((d) => {
            let newDoc = { ...d };
            if (d.id === documentId) {
              newDoc = {
                ...newDoc,
                participantsOptions,
                awardeds: awardedsResults,
                result: 0,
              };
            }
            return newDoc;
          });
        }
        return newGroup;
      });
    }
    newPackage.documentsState = {
      loading: false,
    };
    return newPackage;
  });
  return _packages;
}

function resetResult(
  group: BiddingProcessDocumentGroup,
  fiduciaryProcessDocument: FiduciaryProcessDocument
): BiddingProcessDocumentGroup {
  const hasDocs = group.fiduciaryProcessDocuments.some(
    (d) => d.id === fiduciaryProcessDocument.id
  );
  if (hasDocs) {
    let newConfig = {
      ...group.documentGroupConfiguration,
      result: BiddingProcessDocumentGroupsResults.NORESULT,
    };
    return {
      ...group,
      documentGroupConfiguration: newConfig,
    };
  } else {
    return group;
  }
}

function updateResultConfig(
  biddingProcessDocumentPackages: BiddingProcessDocumentPackage[],
  packageId: string,
  groupId: string,
  documentId: string,
  result: number
) {
  let _packages = [...biddingProcessDocumentPackages];
  _packages = _packages.map((p) => {
    const newPackage = { ...p };
    if (p.id === packageId) {
      newPackage.biddingProcessDocumentGroups = [
        ...newPackage.biddingProcessDocumentGroups,
      ].map((g) => {
        const newGroup = { ...g };
        if (g.id === groupId) {
          newGroup.fiduciaryProcessDocuments = [
            ...newGroup.fiduciaryProcessDocuments,
          ].map((d) => {
            let newDoc = { ...d };
            if (d.id === documentId) {
              newDoc = {
                ...newDoc,
                result,
              };
            }
            return newDoc;
          });
          let newGroupConfiguration = {
            ...newGroup.documentGroupConfiguration,
          };
          newGroupConfiguration = { ...newGroupConfiguration, result };
          newGroup.documentGroupConfiguration = newGroupConfiguration;
        }
        return newGroup;
      });
      newPackage.documentsState = {
        loading: false,
      };
    }
    return newPackage;
  });
  return _packages;
}

function confirmUpdateDescription(
  biddingProcessDocumentPackages: BiddingProcessDocumentPackage[],
  packageId: string,
  groupId: UploadFiduciaryProcessDocuments,
  relationalId: string,
  description: string
): BiddingProcessDocumentPackage[] {
  let packages = [...biddingProcessDocumentPackages];
  packages = packages.map((p) => {
    const newPackage = { ...p };
    if (p.id === packageId) {
      newPackage.biddingProcessDocumentGroups = [
        ...newPackage.biddingProcessDocumentGroups,
      ].map((g) => {
        const newGroup = { ...g };
        if (g.id === groupId.biddingProcessDocumentGroupId) {
          newGroup.fiduciaryProcessDocuments = [
            ...newGroup.fiduciaryProcessDocuments,
          ].map((d) => {
            let newDoc = { ...d };
            if (d.relationalId === relationalId) {
              newDoc = {
                ...newDoc,
                description,
                newDescription: description,
              };
            }
            return newDoc;
          });
        }
        return newGroup;
      });
    }
    return newPackage;
  });
  return packages;
}

function restoreDescription(
  biddingProcessDocumentPackages: BiddingProcessDocumentPackage[],
  packageId: string,
  groupId: UploadFiduciaryProcessDocuments,
  relationalId: string
): BiddingProcessDocumentPackage[] {
  let packages = [...biddingProcessDocumentPackages];
  packages = packages.map((p) => {
    const newPackage = { ...p };
    if (p.id === packageId) {
      newPackage.biddingProcessDocumentGroups = [
        ...newPackage.biddingProcessDocumentGroups,
      ].map((g) => {
        const newGroup = { ...g };
        if (g.id === groupId.biddingProcessDocumentGroupId) {
          newGroup.fiduciaryProcessDocuments = [
            ...newGroup.fiduciaryProcessDocuments,
          ].map((d) => {
            let newDoc = { ...d };
            const oldDescription = newDoc.description;
            if (d.relationalId === relationalId) {
              newDoc = {
                ...newDoc,
                description: oldDescription,
                newDescription: oldDescription,
              };
            }
            return newDoc;
          });
        }
        return newGroup;
      });
    }
    return newPackage;
  });
  return packages;
}

function updatedAwardeds(
  biddingProcessDocumentPackages: BiddingProcessDocumentPackage[],
  packageId: string,
  groupId: string,
  documentId: string,
  awardeds: string[]
): BiddingProcessDocumentPackage[] {
  let _packages = [...biddingProcessDocumentPackages];
  _packages = _packages.map((p) => {
    const newPackage = { ...p };
    if (p.id === packageId) {
      newPackage.biddingProcessDocumentGroups = [
        ...newPackage.biddingProcessDocumentGroups,
      ].map((g) => {
        const newGroup = { ...g };
        if (g.id === groupId) {
          newGroup.fiduciaryProcessDocuments = [
            ...newGroup.fiduciaryProcessDocuments,
          ].map((d) => {
            let newDoc = { ...d };
            if (d.id === documentId) {
              newDoc = {
                ...newDoc,
                awardeds,
              };
            }
            return newDoc;
          });
        }
        return newGroup;
      });
    }
    return newPackage;
  });
  return _packages;
}

function mapAwardeds(awardeds: ParticipantPackages[]): string[] {
  const resultsId: string[] = [];
  awardeds.forEach((a) => resultsId.push(a.biddingProcessParticipantId));
  return resultsId;
}

export function biddingProcessDocumentPackageReducer(state, action) {
  return _biddingProcessDocumentPackageReducer(state, action);
}
