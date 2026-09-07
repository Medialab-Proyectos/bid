import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';

import { AdditionalPackage } from '@core/models';
import { SettingType } from '@core/enums';
import { AppUtilsService } from '@fiduciary-interface/app/app-utils.service';
import { KeyValueInput } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class AdditionalDocPackagesService {
  private readonly apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  constructor(
    readonly http: HttpClient,
    private readonly utilsSvc: AppUtilsService
  ) {}

  addPackage(
    biddingProcessProcurementProcessId: string,
    optionalPackage: AdditionalPackage
  ): Observable<string> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${biddingProcessProcurementProcessId}/optionalBiddingProcessDocumentPackages`;
    return this.http.post<string>(url, optionalPackage);
  }

  buildAttributesAdditionalPackage(
    procurementCategoryName: string,
    procurementMethodName: string,
    procurementSupervisionMethodName: string
  ): KeyValueInput[] {
    const attributeCategory: KeyValueInput = {
      key: 'category',
      value: procurementCategoryName,
    };
    const attributeProcurementMethod: KeyValueInput = {
      key: 'procurementMethod',
      value: procurementMethodName,
    };
    const attributeSupervisionMethod: KeyValueInput = {
      key: 'supervisionMethod',
      value: procurementSupervisionMethodName,
    };
    return this.utilsSvc.buildAttributesArray(
      SettingType.AdditionalDocumentPackage,
      null,
      attributeCategory,
      attributeProcurementMethod,
      null,
      attributeSupervisionMethod,
      null
    );
  }

  updateBidValidityExtensionDate(
    packageId: string,
    bidValidityExtensionDate: Date
  ): Observable<any> {
    const url = `${this.apiUrl}/api/biddingProcessDocumentPackages/${packageId}/bidValidityDate`;
    return this.http.put<string>(url, bidValidityExtensionDate);
  }
}
