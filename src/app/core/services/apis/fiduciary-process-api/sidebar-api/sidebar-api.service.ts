import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MenuItem } from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarApiService {
  constructor(readonly http: HttpClient) {}

  public getSidebar(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(
      `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/configurations/sidebar`
    );
  }
}
