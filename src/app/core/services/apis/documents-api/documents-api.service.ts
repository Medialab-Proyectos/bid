import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BiddingProcessDocumentPackagesOLDApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;
  private readonly constNoIniciado = 'No Iniciado';
  private readonly constNames = [
    'Final Version of Bidding Documents (RFP / RFB)',
    'Specific Procurement Notice',
  ];
  private readonly documents = [
    {
      id: '1',
      packageName: 'Publication of SPN',
      actualDate: new Date(),
      currentFiles: 1,
      maximumFiles: 2,
      state: 'Completado',
      commentsCount: 3,
      enable: true,
      documents: [
        {
          id: '1',
          name: '',
          required: true,
          state: 'Archivo subido',
          uploaded: false,
        },
        {
          id: '2',
          name: this.constNames[1],
          required: false,
          state: 'Archivo subido',
          uploaded: false,
        },
      ],
      files: [
        {
          id: '1',
          name: 'BID 2020 Revisado.docx',
          types: [...this.constNames],
          ezShareId: 'EZShare 0189399382',
        },
        {
          id: '2',
          name: 'BID 2020 Revisado v2.docx',
          types: [...this.constNames],
          ezShareId: 'EZShare 0189399382',
        },
      ],
    },
    {
      id: '2',
      packageName: 'BID Opening Record',
      actualDate: null,
      currentFiles: 0,
      maximumFiles: 2,
      state: this.constNoIniciado,
      commentsCount: 0,
      enable: true,
      files: [],
    },
    {
      id: '3',
      packageName: 'Evaluation Report',
      actualDate: new Date(),
      currentFiles: 0,
      maximumFiles: 2,
      state: this.constNoIniciado,
      commentsCount: 1,
      enable: false,
      files: [],
    },
    {
      id: '4',
      packageName: 'BID Opening Record',
      actualDate: new Date(),
      currentFiles: 0,
      maximumFiles: 2,
      state: this.constNoIniciado,
      commentsCount: 2,
      enable: false,
      files: [],
    },
  ];

  //TODO cambiar peticiones a url del contrato
  constructor(private readonly httpClient: HttpClient) {}

  getDocumentsByProyect(): Observable<unknown[]> {
    return of([...this.documents]);
  }

  getDocumentById(id: string) {
    return this.httpClient.get<unknown[]>(
      `${this.basePath}/api/documents/${id}`
    );
  }

  getDocumentSasToken(id: string): Observable<unknown> {
    return this.httpClient.get<unknown[]>(
      `${this.basePath}/api/documents/${id}/generate-token`
    );
  }

  uploadDocumentSasToken(): Observable<unknown> {
    return this.httpClient.get<unknown[]>(
      `${this.basePath}/api/documents/generate-upload-token`
    );
  }

  uploadToBlobStorage(data: unknown): Observable<unknown> {
    return this.httpClient.post<unknown>(
      `${this.basePath}/api/documents/upload-blobstorage`,
      data
    );
  }

  requestUploadToEasyShare(data: unknown): Observable<unknown> {
    return this.httpClient.post<unknown>(
      `${this.basePath}/api/documents/upload-easyshare`,
      data
    );
  }

  deleteDocument(): Observable<unknown> {
    return of(true);
  }

  uploadDocumentFlow(): Observable<unknown> {
    return this.uploadDocumentSasToken().pipe(
      catchError(() => throwError('sas error')),
      concatMap((value) =>
        this.uploadToBlobStorage(value).pipe(
          catchError(() => throwError('blob error'))
        )
      ),
      concatMap((value) =>
        this.requestUploadToEasyShare(value).pipe(
          catchError(() => throwError('easyshare error'))
        )
      )
    );
  }

  downloadDocumentById(id: string) {
    return this.getDocumentSasToken(id).pipe(
      catchError(() => throwError('sas error')),
      concatMap(() =>
        this.getDocumentById(id).pipe(
          catchError(() => throwError('download error'))
        )
      )
    );
  }
}
