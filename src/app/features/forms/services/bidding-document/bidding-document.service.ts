import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DocumentDomain } from '@core/enums';
import {
  ErrorResponse,
  GeneralProcurementDocumentResponse,
} from '@core/models';
import {
  PreviewBiddingDocumentRequest,
  StoreBiddingDocumentRequest,
  UpdateBiddingDocumentRequest,
} from '@fiduciary-interface/app/features/forms/models/request/bidding-document-request.model';
import { environment } from '@fiduciary-interface/environments/environment';
import { FileSaverService } from 'ngx-filesaver';
import { Observable } from 'rxjs';
import { OpeningDate } from '../../models/openingDate.model';
import { REQUEST_IS_ENCODED } from '@core/utils/httpContexts';

@Injectable({
  providedIn: 'root',
})
export class BiddingDocumentService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/`;
  public htmlPreview;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly fileSaverService: FileSaverService
  ) {}

  generateDocumentFile(
    biddingDocument: StoreBiddingDocumentRequest
  ): Observable<any> {
    const formData = new FormData();
    formData.append(
      'biddingDocument',
      btoa(unescape(encodeURIComponent(JSON.stringify(biddingDocument))))
    );
    const url = `${this.basePath}biddingDocuments/generate`;
    return this.httpClient.post(url, formData, {
      observe: 'response' as 'response',
      responseType: 'arraybuffer',
      context: new HttpContext().set(REQUEST_IS_ENCODED, false),
    });
  }

  updateDocument(
    documentId: string,
    updateBiddingDocumentRequest: UpdateBiddingDocumentRequest
  ): Observable<any> {
    const formData = new FormData();
    formData.append(
      'jsonFormModel',
      btoa(
        unescape(
          encodeURIComponent(JSON.stringify(updateBiddingDocumentRequest))
        )
      )
    );
    const url = `${this.basePath}biddingDocuments/update/${documentId}/forms`;
    return this.httpClient.put(url, formData, {
      observe: 'response' as 'response',
      responseType: 'arraybuffer',
    });
  }

  downloadDocument(
    fiduciaryProcessDocumentId: string,
    language: string
  ): Observable<any> {
    const url = `${this.basePath}biddingDocuments/${fiduciaryProcessDocumentId}/downloadDocument?language=${language}`;
    return this.httpClient.get(url, {
      observe: 'response' as 'response',
      responseType: 'arraybuffer',
    });
  }

  deleteGeneralProcurementDocument(
    documentId: string,
    domain: number
  ): Observable<GeneralProcurementDocumentResponse | ErrorResponse> {
    const url = `${this.basePath}fiduciaryProcessDocuments/${documentId}?domain=${domain}`;
    return this.httpClient.delete<unknown>(url);
  }

  success(response: any, filename: string, fileType: string): void {
    this.fileSaverService.save(
      new Blob([new Uint8Array(response.body).buffer], {
        type: `application/${fileType}`,
      }),
      filename
    );
  }

  sendDocuments(
    biddingProcessDocumentGroupId: string,
    domain: DocumentDomain,
    biddingDocumentId: string,
    document: any,
    filename: string
  ): Observable<unknown> {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([new Uint8Array(document).buffer], {
        type: `application/pdf`,
      }),
      filename
    );
    return this.httpClient.post(
      `${this.basePath}fiduciaryProcessDocuments?parentId=${biddingProcessDocumentGroupId}&domain=${domain}&biddingDocumentId=${biddingDocumentId}`,
      formData
    );
  }

  getOpenDate(
    biddingDocumentId: string
  ): Observable<OpeningDate | ErrorResponse> {
    const url = `${this.basePath}biddingDocuments/documentOpeningDate/${biddingDocumentId}`;
    return this.httpClient.get<OpeningDate>(url);
  }

  updateOpenDate(
    biddingDocumentId: string,
    actualDate: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}biddingDocuments/${biddingDocumentId}/openingDate`;
    return this.httpClient.put<string>(url, actualDate);
  }

  getPreviewHtml(
    biddingDocument: PreviewBiddingDocumentRequest
  ): Observable<unknown> {
    const formData = new FormData();
    formData.append(
      'biddingDocument',
      btoa(unescape(encodeURIComponent(JSON.stringify(biddingDocument))))
    );
    return this.httpClient.post(
      `${this.basePath}biddingDocuments/previews`,
      formData,
      {
        responseType: 'text',
        context: new HttpContext().set(REQUEST_IS_ENCODED, false),
      }
    );
  }

  updateStatusDocument(document: any): Observable<unknown> {
    return this.httpClient.post<any>(
      `${this.basePath}fiduciaryProcessDocuments/UpdateStatusDocuments`,
      document
    );
  }

  updateBlobDocument(
    domain: number,
    document: any,
    filename: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([new Uint8Array(document.body).buffer], {
        type: `application/pdf`,
      }),
      filename
    );
    const url = `${this.basePath}fiduciaryProcessDocuments/updateBlobDocument?domain=${domain}`;
    return this.httpClient.put(url, formData, {
      context: new HttpContext().set(REQUEST_IS_ENCODED, false),
    });
  }

  verifyDocumentExistence(filename: string): Observable<any> {
    const url = `${this.basePath}fiduciaryProcessDocuments/existDocumentInBlob?fileName=${filename}`;
    return this.httpClient.get(url);
  }

  updateDocumentReturnedWithComments(
    fiduciaryProcessDocumentId: string,
    document: any,
    filename: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([new Uint8Array(document.body).buffer], {
        type: `application/pdf`,
      }),
      filename
    );
    const url = `${this.basePath}fiduciaryProcessDocuments/updateDocument?fiduciaryProcessDocumentId=${fiduciaryProcessDocumentId}`;
    return this.httpClient.put(url, formData, {
      context: new HttpContext().set(REQUEST_IS_ENCODED, false),
    });
  }

  sendToPublication(biddingDocumentsId): Observable<any> {
    const url = `${this.basePath}biddingDocuments/${biddingDocumentsId}/sendToPublication`;
    return this.httpClient.put(url, '');
  }
}
