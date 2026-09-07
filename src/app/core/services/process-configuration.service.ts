import { Injectable } from '@angular/core';
import {
  ErrorResponse,
  GetSettingsResponse,
  KeyValue,
  KeyValueInput,
} from '@core/models';
import { Threshold } from '@core/models/components/process-contract';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import { SettingActionType, SettingType } from '@core/enums';
import { map } from 'rxjs/operators';
import { SHOULD_CACHE_REQUEST } from '@core/utils/httpContexts';

@Injectable({
  providedIn: 'root',
})
export class ProcessConfiguration {
  private readonly baseUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  constructor(private readonly http: HttpClient) {}

  public settings(
    attributes?: KeyValueInput[],
    settingActionType?: SettingActionType,
    settingType?: SettingType,
    isNumericValues = false
  ): Observable<GetSettingsResponse | ErrorResponse> {
    let params = new HttpParams();

    if (attributes !== undefined) {
      for (let index = 0; index < attributes.length; index++) {
        if (attributes[index]) {
          params = params.set(
            `attributes[${index}].key`,
            attributes[index].key
          );
          params = params.set(
            `attributes[${index}].value`,
            attributes[index].value.toString()
          );
        }
      }
    }

    if (settingActionType !== undefined) {
      params = params.set('settingActionType', settingActionType.toString());
    }

    if (settingType !== undefined) {
      params = params.set('settingType', settingType.toString());
    }

    if (isNumericValues !== false) {
      params = params.set('isNumericValues', isNumericValues.toString());
    }

    let url = `${this.baseUrl}/api/v2/settings`;
    if (params.keys().length > 0) {
      url = `${url}?${params.toString()}`;
    }

    return this.http.get<GetSettingsResponse>(url, {
      context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
    });
  }

  thresholdSettings(
    attributes?: KeyValue[] | KeyValueInput[],
    isNumericValues = false
  ) {
    return this.settings(
      attributes,
      SettingActionType.Extend,
      SettingType.Threshold,
      isNumericValues
    ).pipe(
      map((data: GetSettingsResponse) => {
        const settings = data.settings;
        let threshold: Threshold = null;

        if (settings.length > 0 && settings[0].values) {
          threshold = this.parseThresholds(settings[0].values);
        }

        return threshold;
      })
    );
  }

  parseThresholds(thresholdString: string): Threshold {
    const formatedString = thresholdString.replace(/\\"/g, '"');
    return JSON.parse(formatedString);
  }
}
