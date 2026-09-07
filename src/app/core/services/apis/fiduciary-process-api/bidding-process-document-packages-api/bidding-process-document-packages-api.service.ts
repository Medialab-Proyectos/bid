import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DocumentDomain } from '@core/enums';
import {
  BiddingProcessDocumentGroup,
  ActionType,
  ErrorResponse,
  GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse,
  GetFiduciaryProcessDocumentsIdResponse,
  GetProcessDocumentPackageByProcurementIdResponse,
  PackagesAwardeds,
  SubmitPackageStatusResponse,
  UploadBiddingProcessPackageDocuments,
  UploadFiduciaryProcessDocuments,
} from '@core/models';
import { REQUEST_IS_ENCODED } from '@core/utils/httpContexts';
import { environment } from '@fiduciary-interface/environments/environment';
import { FileInfo } from '@progress/kendo-angular-upload';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BiddingProcessDocumentPackagesApiService {
  private readonly endpoint = environment.hostApi.fiduciaryProcessApi.endpoint;
  private readonly basePathDocuments = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/biddingProcessPackageDocuments`;
  private readonly basePathDocumentPackage = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/biddingProcessDocumentPackages`;

  constructor(private readonly http: HttpClient) {}

  getBiddingProcessDocumentPackages(
    biddingProcessProcurementProcessId: string,
    isOptional: boolean
  ): Observable<
    GetProcessDocumentPackageByProcurementIdResponse | ErrorResponse
  > {
    const url = `${this.endpoint}/api/v3/procurement-processes/${biddingProcessProcurementProcessId}/document-packages?isOptional=${isOptional}`;
    return this.http.get<GetProcessDocumentPackageByProcurementIdResponse>(url);
  }

  getBiddingProcessDocumentGroups(
    biddingProcessDocumentPackageId: string
  ): Observable<
    GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse | ErrorResponse
  > {
    const endpointUrl = `${this.endpoint}/api/v3/procurement-processes/document-packages`;
    const url = `${endpointUrl}/${biddingProcessDocumentPackageId}/document-groups`;
    return this.http.get<GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse>(
      url
    );
  }

  editBiddingProcessDocumentGroups(
    biddingProcessDocumentPackageId: string,
    documentGroup: BiddingProcessDocumentGroup
  ): Observable<
    GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse | ErrorResponse
  > {
    const endpointUrl = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/biddingProcessDocumentPackages`;
    const url = `${endpointUrl}/${biddingProcessDocumentPackageId}/biddingProcessDocumentGroups`;
    return this.http.put<GetBiddingProcessDocumentGroupsByDocumentPackageIdResponse>(
      url,
      documentGroup
    );
  }

  /**
   * Domain = 2 fiduciaryProcessDocuments
   * Domain = 4 generalProcurementsDocuments
   * Domain = 5 transactionDocuments
   * @param parentId Parent id
   * @returns
   */
  getFiduciaryProcessDocuments(
    parentId: string,
    domain: number
  ): Observable<GetFiduciaryProcessDocumentsIdResponse | ErrorResponse> {
    const url = `${this.endpoint}/api/v3/documents?domain=${domain}&parentId=${parentId}`;
    return this.http.get<GetFiduciaryProcessDocumentsIdResponse>(url);
  }

  deleteBiddingProcessPackageDocument(
    biddingProcessPackageDocumentId: string,
    biddingProcessDocumentPackageId: string
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.basePathDocuments}/${biddingProcessPackageDocumentId}?biddingProcessDocumentPackageId=${biddingProcessDocumentPackageId}`;
    return this.http.delete<unknown>(url);
  }

  deletePackageDocuments(
    procurementProcessId: string,
    documentId: string
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.endpoint}/api/v2/procurement-process/${procurementProcessId}/documents/${documentId}`;
    return this.http.delete<unknown>(url);
  }

  deleteFiduciaryProcessDocument(
    documentId: string,
    domain: number
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.endpoint}/api/fiduciaryProcessDocuments/${documentId}?domain=${domain}`;
    return this.http.delete<unknown>(url);
  }

  updateResultAndAwardeds(
    documentGroupId: string,
    documentGroupResultId: number,
    awardedIdList: string[]
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.basePathDocumentPackage}/documentGroup/${documentGroupId}/result`;
    return this.http.put<unknown>(url, {
      documentGroupResultId,
      awardedIdList,
    });
  }

  getPackagesAwardeds(documentGroupId: string) {
    const url = `${this.basePathDocumentPackage}/documentGroup/${documentGroupId}/awardeds`;
    return this.http.get<PackagesAwardeds>(url);
  }

  editBiddingProcessPackageDocument(
    biddingProcessPackageDocumentId: string,
    procurementProcessId: string,
    biddingProcessDocumentGroupId: UploadFiduciaryProcessDocuments,
    description = ''
  ): Observable<string | ErrorResponse> {
    const url = `${this.endpoint}/api/v2/procurement-process/${procurementProcessId}/document-packages/${biddingProcessPackageDocumentId}`;
    return this.http.put<string>(
      url,
      { ...biddingProcessDocumentGroupId, description },
      {
        responseType: 'text' as 'json',
      }
    );
  }

  /**
   * Domain = 2 fiduciaryProcessDocuments
   * Domain = 4 generalProcurementsDocuments
   * @param biddingProcessDocumentGroupId Parent id
   * @param file
   * @returns
   */
  uploadBiddingProcessPackageDocument(
    biddingProcessDocumentGroupId: string,
    domain: number,
    file: FileInfo,
    lang: string,
    description = ''
  ): Observable<UploadBiddingProcessPackageDocuments | ErrorResponse> {
    const formData = new FormData();

    const p = this.toBlob(file.rawFile);

    return from(p).pipe(
      mergeMap((blobb) => {
        formData.append(
          'biddingProcessDocumentGroupId',
          biddingProcessDocumentGroupId
        );
        formData.append('file', blobb, file.name);
        formData.append('description', description);

        const url = `${this.endpoint}/api/fiduciaryProcessDocuments?parentId=${biddingProcessDocumentGroupId}&domain=${domain}&Lang=${lang}`;
        return this.http.post<UploadBiddingProcessPackageDocuments>(
          url,
          formData,
          { context: new HttpContext().set(REQUEST_IS_ENCODED, false) }
        );
      })
    );
  }

  uploadDocumentsTransactions(
    biddingProcessDocumentGroupId: string,
    file: FileInfo,
    projectBucketId: string
  ) {
    const formData = new FormData();
    const p = this.toBlob(file.rawFile);
    return from(p).pipe(
      mergeMap((blobb) => {
        formData.append('documentGroupId', biddingProcessDocumentGroupId);
        formData.append('file', blobb, file.name);
        formData.append('description', '');
        formData.append('projectBucketId', projectBucketId);
        formData.append('type', '5');

        const url = `${this.endpoint}/api/v2/transactions/documents`;

        return this.http.post<UploadBiddingProcessPackageDocuments>(
          url,
          formData,
          { context: new HttpContext().set(REQUEST_IS_ENCODED, false) }
        );
      })
    );
  }

  uploadDocumentsContracts(
    biddingContractId: string,
    biddingProcessDocumentGroupId: string,
    file: FileInfo,
    domain: DocumentDomain,
    description: string = ''
  ): Observable<UploadBiddingProcessPackageDocuments | ErrorResponse> {
    const formData = new FormData();
    const p = this.toBlob(file.rawFile);
    return from(p).pipe(
      mergeMap((blobb) => {
        formData.append('documentGroupId', biddingProcessDocumentGroupId);
        formData.append('file', blobb, file.name);
        formData.append('description', description);
        formData.append('type', domain.toString());

        const url = `${this.endpoint}/api/v2/bidding-contracts/${biddingContractId}/documents`;

        return this.http.post<UploadBiddingProcessPackageDocuments>(
          url,
          formData,
          { context: new HttpContext().set(REQUEST_IS_ENCODED, false) }
        );
      })
    );
  }

  uploadDocumentsV3(
    biddingContractId: string,
    biddingProcessDocumentGroupId: string,
    file: FileInfo,
    domain: DocumentDomain,
    description: string = ''
  ): Observable<UploadBiddingProcessPackageDocuments | ErrorResponse> {
    const formData = new FormData();
    const p = this.toBlob(file.rawFile);
    return from(p).pipe(
      mergeMap((blobb) => {
        formData.append('documentGroupId', biddingProcessDocumentGroupId);
        formData.append('file', blobb, file.name);
        formData.append('description', description);
        formData.append('documentType', domain.toString());

        const url = `${this.endpoint}/api/v3/bidding-contracts/${biddingContractId}/documents`;

        return this.http.post<UploadBiddingProcessPackageDocuments>(
          url,
          formData,
          { context: new HttpContext().set(REQUEST_IS_ENCODED, false) }
        );
      })
    );
  }

  editDocumentsContracts(
    biddingContractId: string,
    biddingProcessDocumentGroupId: string,
    documentId: string,
    description: string = ''
  ): Observable<UploadBiddingProcessPackageDocuments | ErrorResponse> {
    const body = {
      documentGroupId: biddingProcessDocumentGroupId,
      description,
    };
    const url = `${this.endpoint}/api/v2/bidding-contracts/${biddingContractId}/documents/${documentId}`;
    return this.http.put<UploadBiddingProcessPackageDocuments>(url, body);
  }

  editDocumentsContractsV3(
    biddingContractId: string,
    documentGroupId: string,
    documentId: string,
    description: string = ''
  ): Observable<UploadBiddingProcessPackageDocuments | ErrorResponse> {
    const body = {
      documentGroupId,
      description,
    };
    const url = `${this.endpoint}/api/v3/bidding-contracts/${biddingContractId}/documents/${documentId}`;
    return this.http.put<UploadBiddingProcessPackageDocuments>(url, body);
  }

  uploadDocumentsPackages(
    procurementProcessId: string,
    biddingProcessDocumentGroupId: string,
    file: FileInfo,
    description = ''
  ): Observable<UploadBiddingProcessPackageDocuments | ErrorResponse> {
    const formData = new FormData();
    const p = this.toBlob(file.rawFile);
    return from(p).pipe(
      mergeMap((blobb) => {
        formData.append('documentGroupId', biddingProcessDocumentGroupId);
        formData.append('file', blobb, file.name);
        formData.append('description', description);
        formData.append('type', '2');

        const url = `${this.endpoint}/api/v2/procurement-process/${procurementProcessId}/documents`;
        return this.http.post<UploadBiddingProcessPackageDocuments>(
          url,
          formData,
          { context: new HttpContext().set(REQUEST_IS_ENCODED, false) }
        );
      })
    );
  }

  toBlob(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(
          new Blob([new Uint8Array(event.target.result as ArrayBuffer)], {
            type: file.type,
          })
        );
      };
      reader.readAsArrayBuffer(file);
    });
  }

  submitPackageForDisclosure(
    biddingProcessDocumentPackageId: string
  ): Observable<SubmitPackageStatusResponse | ErrorResponse> {
    const url = `${this.basePathDocumentPackage}/${biddingProcessDocumentPackageId}/submitPackage/disclosure`;
    return this.http.put<SubmitPackageStatusResponse>(url, null);
  }

  submitOptionalPackage(
    biddingProcessDocumentPackageId: string
  ): Observable<SubmitPackageStatusResponse | ErrorResponse> {
    const url = `${this.basePathDocumentPackage}/${biddingProcessDocumentPackageId}/submitOptionalPackage`;
    return this.http.put<any>(url, null);
  }

  completePackage(
    biddingProcessDocumentPackageId: string,
    optional: boolean,
    type: ActionType = 0
  ): Observable<SubmitPackageStatusResponse | ErrorResponse> {
    const url = `${this.endpoint}/api/v2/document-packages/${biddingProcessDocumentPackageId}/complete`;
    return this.http.put<SubmitPackageStatusResponse>(url, {
      type,
      optional,
    });
  }

  submitPackageForNonObjection(
    biddingProcessDocumentPackageId: string,
    type: ActionType
  ): Observable<SubmitPackageStatusResponse | ErrorResponse> {
    const url = `${this.basePathDocumentPackage}/${biddingProcessDocumentPackageId}/submitPackage/nonObjection?type=${type}`;
    return this.http.put<SubmitPackageStatusResponse>(url, null);
  }

  updateStatus(
    biddingProcessDocumentPackageId: string,
    status: number
  ): Observable<any | ErrorResponse> {
    const url = `${this.basePathDocumentPackage}/${biddingProcessDocumentPackageId}/status`;
    return this.http.put<any>(url, status);
  }

  completion(
    biddingProcessDocumentPackageId: string
  ): Observable<any | ErrorResponse> {
    const url = `${this.basePathDocumentPackage}/${biddingProcessDocumentPackageId}/completion`;
    return this.http.put<any>(url, null);
  }

  /**
   *
   * @param actualDate Actual date
   * @param biddingProcessDocumentPackageId Bidding process documentPackageId
   * @returns Date
   */
  updateDocumentPackageActualDate(
    actualDate: Date,
    biddingProcessDocumentPackageId: string,
    lang: string
  ): Observable<Date | ErrorResponse> {
    const url = `${this.basePathDocumentPackage}/${biddingProcessDocumentPackageId}/actualDate?lang=${lang}`;
    return this.http.put<SubmitPackageStatusResponse>(url, actualDate);
  }

  uploadAfterCompletionDocumentPackage(
    biddingProcessDocumentPackageId: string
  ): Observable<any | ErrorResponse> {
    const url = `${this.endpoint}/api/v2/document-packages/${biddingProcessDocumentPackageId}/confirm-additional-information`;
    return this.http.put<SubmitPackageStatusResponse>(url, {});
  }
}
