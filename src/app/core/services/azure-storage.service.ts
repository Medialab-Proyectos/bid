import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FileSaverService } from 'ngx-filesaver';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    readonly http: HttpClient,
    readonly fileSaverService: FileSaverService,
    readonly store: Store<AppState>
  ) {}
  public async downloadFile(fileUrl: string, fileName: string) {
    this.http
      .get(
        `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/storage/downloadDocument/${fileUrl}/${fileName}`
      )
      .subscribe((res: any) => {
        this.fileSaverService.save(
          new Blob([new Uint8Array(res.data).buffer]),
          fileName
        );
      });
  }

  public uploadFiles(files: any, metadata: string) {
    const formData = new FormData();
    formData.append(files, metadata);
    return this.http.post(
      `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/storage/upload`,
      formData
    );
  }
}
