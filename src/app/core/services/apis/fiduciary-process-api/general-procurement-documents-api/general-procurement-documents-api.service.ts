import { forkJoin, Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ErrorResponse,
  FiduciaryProcessDocumentGroup,
  GeneralProcurementDocumentResponse,
  GroupsResponse,
  UploadBiddingProcessPackageDocuments,
  DiscloseDocument,
} from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { FileInfo } from '@progress/kendo-angular-upload';
import { BiddingProcessDocumentPackagesApiService } from '../bidding-process-document-packages-api/bidding-process-document-packages-api.service';
import { catchError, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GeneralProcurementDocumentsApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly docSvc: BiddingProcessDocumentPackagesApiService
  ) {}

  /**
   * Domain = 2 fiduciaryProcessDocuments
   * Domain = 4 generalProcurementsDocuments
   * Domain = 5 transactionDocuments
   * @param projectBucketId Parent id
   * @returns
   */
  getGeneralProcurementDocuments(
    projectBucketId: string,
    domain: number
  ): Observable<GeneralProcurementDocumentResponse | ErrorResponse> {
    const url = `${this.basePath}/api/v3/documents?domain=${domain}&parentId=${projectBucketId}`;
    return this.httpClient.get<GeneralProcurementDocumentResponse>(url);
  }

  setGeneralProcurementDocument(
    biddingProcessDocumentGroupId: string,
    domain: number,
    file: FileInfo,
    lang: string
  ): Observable<UploadBiddingProcessPackageDocuments | ErrorResponse> {
    return this.docSvc.uploadBiddingProcessPackageDocument(
      biddingProcessDocumentGroupId,
      domain,
      file,
      lang
    );
  }

  deleteGeneralProcurementDocument(
    documentId: string,
    domain: number
  ): Observable<GeneralProcurementDocumentResponse | ErrorResponse> {
    const url = `${this.basePath}/api/fiduciaryProcessDocuments/${documentId}?domain=${domain}`;
    return this.httpClient.delete<unknown>(url);
  }

  deleteContractDocument(biddingContractId: string, documentId: string) {
    const url = `${this.basePath}/api/v2/bidding-contracts/${biddingContractId}/documents/${documentId}`;
    return this.httpClient.delete<unknown>(url);
  }

  deleteContractDocumentV3(biddingContractId: string, documentId: string) {
    const url = `${this.basePath}/api/v3/bidding-contracts/${biddingContractId}/documents/${documentId}`;
    return this.httpClient.delete<unknown>(url);
  }

  submitForDisclosure(
    documentId: string,
    parentId: string,
    domain: number
  ): Observable<GeneralProcurementDocumentResponse | ErrorResponse> {
    const params = new HttpParams();
    params.append('domain', domain.toString());
    params.append('parentId', parentId);
    const url = `${this.basePath}/api/fiduciaryProcessDocuments/${documentId}?domain=${domain}&parentId=${parentId}`;
    return this.httpClient.put<GeneralProcurementDocumentResponse>(url, '', {
      params,
    });
  }

  sendToEditDocument(
    documentId: string,
    parentId: string,
    domain: number
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/api/fiduciaryProcessDocuments/${documentId}?domain=${domain}&parentId=${parentId}`;
    return this.httpClient.put<string>(url, '', {
      responseType: 'text' as any,
    });
  }

  changeGroupOfDocument(
    documentId: string,
    parentId: string,
    domain: number
  ): Observable<string | ErrorResponse> {
    return this.sendToEditDocument(documentId, parentId, domain);
  }

  getGroups(
    domain: number,
    parentId: string
  ): Observable<FiduciaryProcessDocumentGroup[]> {
    const url = `${this.basePath}/api/groups?domain=${domain}&parentId=${parentId}`;

    return this.httpClient.get<GroupsResponse>(url).pipe(
      mergeMap((response: GroupsResponse) => {
        const groups = response.groups.map((group) => ({
          groupCode: group.code,
          id: group.id,
          isMandatory: group.mandatory,
          fiduciaryProcessDocuments: [],
        }));

        if (groups.length === 0) {
          return of(groups);
        }

        const requests = groups.map((group) =>
          this.getGeneralProcurementDocuments(group.id, domain).pipe(
            catchError(() => of({ fiduciaryProcessDocuments: [] })),
            map((response: GeneralProcurementDocumentResponse) => ({
              ...group,
              fiduciaryProcessDocuments: response.fiduciaryProcessDocuments.map(
                (doc) => ({
                  ...doc,
                  groupCode: group.groupCode,
                })
              ),
            }))
          )
        );

        return forkJoin(requests);
      })
    );
  }

  sendDisclosure(
    documentId: string,
    discloseDocument: DiscloseDocument
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/api/fiduciaryProcessDocuments/${documentId}/disclose`;
    return this.httpClient.post<string>(url, discloseDocument);
  }
}
