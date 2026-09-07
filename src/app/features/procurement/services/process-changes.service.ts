import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import { ProcurementProcessVersion } from '../models';
@Injectable({
  providedIn: 'root',
})
export class ProcessChangesService {
  constructor(readonly http: HttpClient) {}

  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}`;

  getAllChanges(processId: string): Observable<ProcurementProcessVersion> {
    const url = `${this.basePath}/api/biddingProcessProcurementProcesses/${processId}/versions`;
    return this.http.get<ProcurementProcessVersion>(url);
  }
}
