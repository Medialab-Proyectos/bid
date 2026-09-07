import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@fiduciary-interface/environments/environment';
import { ErrorResponse } from '@core/models';
import { NoticeTypeEnum } from '@core/enums/documentPackageCode.enum';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;
  constructor(readonly http: HttpClient) {}

  downloadFile(
    fiduciaryProcessDocumentId: string
  ): Observable<ArrayBuffer | ErrorResponse> {
    return this.http.get(
      `${this.basePath}/api/v2/documents/${fiduciaryProcessDocumentId}`,
      {
        responseType: 'arraybuffer',
      }
    );
  }

  disclose(
    procurementProcessId: string,
    documentId: string,
    noticeType: NoticeTypeEnum
  ) {
    return this.http.post(
      `${this.basePath}/api/v2/procurement-notices/publish`,
      {
        procurementProcessId,
        documentId,
        noticeType,
      }
    );
  }
}
