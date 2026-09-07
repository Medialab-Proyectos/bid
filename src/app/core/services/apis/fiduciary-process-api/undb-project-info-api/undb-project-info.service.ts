import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UndbProjectComplementaryInfo } from '@core/models/responses/undb-project-info-response.model';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UndbProjectInfoService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;
  private http = inject(HttpClient)

  constructor() { }

  /**
   * The info fetched on this method is complementary to the project info used on undb replacement forms
   */
  getProjectInfo(projectBucketId: string): Observable<UndbProjectComplementaryInfo> {
    const url = `${this.basePath}/api/v2/procurement-notices/general-information/${projectBucketId}`
    return this.http.get<UndbProjectComplementaryInfo>(url)
  }

}
