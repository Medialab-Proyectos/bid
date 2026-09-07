import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import {
  NotificationEmailResponse,
  NotificationsRequest,
} from '../models/notificationsEmail.model';
import { ErrorResponse } from '@core/models';
@Injectable({
  providedIn: 'root',
})
export class NotificationsEmailService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/`;
  constructor(private readonly httpClient: HttpClient) {}
  getNotifications(
    notificationsRequestBody: NotificationsRequest
  ): Observable<NotificationEmailResponse | ErrorResponse> {
    const url = `${this.basePath}notification/decode/user`;
    return this.httpClient.post<NotificationEmailResponse>(
      url,
      notificationsRequestBody
    );
  }
}
