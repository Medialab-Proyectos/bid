import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@fiduciary-interface/environments/environment';
import { FileSaverService } from 'ngx-filesaver';
@Injectable({
  providedIn: 'root',
})
export class EzShareService {
  constructor(
    readonly http: HttpClient,
    readonly fileSaverService: FileSaverService
  ) {}
  public downloadFile(opnumber: string, filename: string) {
    return this.http
      .get(`${environment.hostApi.fiduciaryProcessApi.endpoint}/api/ezshare/${opnumber}`)
      .subscribe((res: any) => {
        this.fileSaverService.save(
          new Blob([new Uint8Array(res.data).buffer]),
          filename
        );
      });
  }
}
