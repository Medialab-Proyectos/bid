import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorResponse, PreferencesModel } from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;
  private DEFAULT_LANGUAGE = 'en';

  constructor(readonly http: HttpClient) {}

  public updatePreferences(
    newPreferences: PreferencesModel
  ): Observable<PreferencesModel | ErrorResponse> {
    const url = `${this.apiUrl}/api/v2/settings/users`;
    return this.http.post<PreferencesModel>(url, newPreferences);
  }

  public getPreferences(): Observable<PreferencesModel | ErrorResponse> {
    const url = `${this.apiUrl}/api/v2/settings/users`;
    return this.http.get<PreferencesModel>(url).pipe(
      map((data) => ({
        ...data,
        projects: data.projects ?? [],
        procurementPreferences: data.procurementPreferences ?? [],
        preferredLanguage: data.preferredLanguage ?? this.DEFAULT_LANGUAGE,
      }))
    );
  }
}
