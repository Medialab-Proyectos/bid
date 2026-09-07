import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EoiPostRequestModel } from '@fiduciary-interface/app/features/eoi/forms/eoi.forms';
import { map, mergeMap, Observable, of } from 'rxjs';
import { environment } from '@fiduciary-interface/environments/environment';
import { GetEoiResponse } from '@fiduciary-interface/app/features/eoi/models/eoi.model';
import { BiddingProcessDocumentPackagesApiService } from '../bidding-process-document-packages-api/bidding-process-document-packages-api.service';
import {
  GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse,
  GetFiduciaryProcessDocumentsIdResponse,
} from '@core/models';
import { GroupCodeEnum } from '@core/enums/groupCode.enum';
import { DocumentDomain } from '@core/enums';

@Injectable({
  providedIn: 'root',
})
export class EoiApiService {
  private http = inject(HttpClient);
  private packageSvc = inject(BiddingProcessDocumentPackagesApiService);

  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly baseUrl = `${this.config.endpoint}/api/v2/procurement-notices/eoi`;

  constructor() {}

  registerEoi(body: EoiPostRequestModel): Observable<string> {
    return this.http.post<string>(this.baseUrl, body);
  }

  getEoiById(eoiId: string): Observable<GetEoiResponse> {
    return this.http.get<GetEoiResponse>(`${this.baseUrl}/${eoiId}`);
  }

  updateEoi(body: EoiPostRequestModel, eoiId: string) {
    return this.http.put<GetEoiResponse>(`${this.baseUrl}/${eoiId}`, body);
  }

  hasEzShare(packageId: string) {
    return this.packageSvc.getBiddingProcessDocumentGroups(packageId).pipe(
      mergeMap(
        (
          response: GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse
        ) => {
          const groups = response.biddingProcessDocumentGroups.find((group) =>
            [GroupCodeEnum.EOI, GroupCodeEnum.SPN].includes(
              group.documentGroupCode
            )
          );

          if (groups) {
            return this.packageSvc
              .getFiduciaryProcessDocuments(
                groups.id,
                DocumentDomain.BIDDINGPROCESSDOCUMENTGROUP
              )
              .pipe(
                map((data: GetFiduciaryProcessDocumentsIdResponse) => {
                  return {
                    hasEzShare:
                      data.fiduciaryProcessDocuments[0]?.ezshareNumber !== null,
                    docId: data.fiduciaryProcessDocuments[0]?.id,
                  };
                })
              );
          } else {
            return of({
              hasEzShare: false,
              docId: null,
            });
          }
        }
      )
    );
  }
}
