import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@fiduciary-interface/environments/environment';
import { map, Observable, shareReplay } from 'rxjs';
import { SpnService } from '../bussiness/spn.service';
import { NoticeTypeEnum } from '@core/enums/documentPackageCode.enum';

@Injectable({
  providedIn: 'root',
})
export class ProcurementNoticesService {
  constructor(private http: HttpClient, private spnSvc: SpnService) {}

  api = environment.hostApi.fiduciaryProcessApi.endpoint;
  getAgaInfo(projectBucketId): Observable<any> {
    return this.http.get(
      `${this.api}/api/v2/procurement-notices/general-information/${projectBucketId}`
    );
  }

  unitsOfTime(): Observable<any> {
    return this.http
      .get(`${this.api}/api/v2/procurement-notices/spn/units-of-time`)
      .pipe(shareReplay(1));
  }

  createSpn(value): Observable<any> {
    return this.http.post(`${this.api}/api/v2/procurement-notices/spn`, value);
  }

  updateSpn(value, noticeId): Observable<any> {
    return this.http.put(
      `${this.api}/api/v2/procurement-notices/spn/${noticeId}`,
      value
    );
  }

  getSpn(noticeId: string): Observable<any> {
    return this.http
      .get<any>(`${this.api}/api/v2/procurement-notices/spn/${noticeId}`)
      .pipe(
        map((data) => {
          return {
            ...data,
            bidOpeningDate: this.spnSvc.convertUtcToLocalDate(
              data.bidOpeningDate
            ),
            dateOfSubmissionOfBids: this.spnSvc.convertUtcToLocalDate(
              data.dateOfSubmissionOfBids
            ),
          };
        })
      );
  }

  confirmNotice(
    noticeId: string,
    noticeType: NoticeTypeEnum
  ): Observable<void> {
    return this.http.put<void>(
      `${this.api}/api/v2/procurement-notices/confirm`,
      {
        noticeId,
        noticeType,
      }
    );
  }
}
