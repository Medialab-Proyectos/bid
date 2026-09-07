import { Injectable } from '@angular/core';
import {
  OperationDataPreference,
  PreferencesModel,
  ProcurementPreferences,
} from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  constructor() {}

  updateFavoriteProjecPreferences(
    newOldPreference: OperationDataPreference,
    actualPreferences: PreferencesModel
  ): PreferencesModel {
    const newState = JSON.parse(JSON.stringify(actualPreferences)); // Crear una copia del objeto

    const operationIndex = newState.favoriteOperations?.findIndex(
      (operation) =>
        operation.operationNumber === newOldPreference.operationNumber
    );
    if (operationIndex !== -1) {
      const projectIndex = newState?.favoriteOperations[
        operationIndex
      ]?.favoriteProjects.indexOf(newOldPreference.contract);
      if (projectIndex !== -1) {
        newState.favoriteOperations[operationIndex].favoriteProjects.splice(
          projectIndex,
          1
        );
        if (
          newState.favoriteOperations[operationIndex].favoriteProjects
            .length === 0
        ) {
          newState.favoriteOperations.splice(operationIndex, 1);
        }
      } else {
        newState.favoriteOperations[operationIndex].favoriteProjects.push(
          newOldPreference.contract
        );
      }
    } else {
      newState.favoriteOperations.push({
        operationNumber: newOldPreference.operationNumber,
        favoriteProjects: [newOldPreference.contract],
      });
    }
    return newState; // Devolver un objeto de acción en lugar de la copia modificada
  }

  updatePreferedLanguagePreferences(
    lang: string,
    actualPreferences: PreferencesModel
  ): PreferencesModel {
    const newState: PreferencesModel = JSON.parse(
      JSON.stringify(actualPreferences)
    ); // Crear una copia del objeto

    newState.preferredLanguage = lang;
    return newState; // Devolver un objeto de acción en lugar de la copia modificada
  }

  updateProcurementProcessTablePreferences(
    tablePreferences: ProcurementPreferences,
    actualPreferences: PreferencesModel
  ): PreferencesModel {
    const newState: PreferencesModel = JSON.parse(
      JSON.stringify(actualPreferences)
    );
    const index = newState.procurementPreferences?.findIndex(
      (p) => p.projectBucketId === tablePreferences.projectBucketId
    );
    if (index === -1) {
      newState.procurementPreferences = [
        ...newState.procurementPreferences,
        tablePreferences,
      ];
    } else {
      newState.procurementPreferences[index] = tablePreferences;
    }
    return newState;
  }
}
