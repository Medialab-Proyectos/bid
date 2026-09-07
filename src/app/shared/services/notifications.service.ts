import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import { NotificationSendByEntityType } from '@core/models';
import { NotificationGlobalService } from './notification-global.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/`;

  constructor(
    private readonly httpClient: HttpClient,
    readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly translate: TranslateService
  ) {}

  sendNotification(
    notificationBody: NotificationSendByEntityType
  ): Observable<any> {
    return this.httpClient.post(
      `${this.basePath}notification/SendByEntityType`,
      notificationBody
    );
  }

  successMsg(): void {
    const successMessage = this.translate.instant(
      'GLOBAL.SEND_TO_INTERNAL_REVIEW.SUCCESS'
    );
    this.notificationGlobalSvc.showSuccess(successMessage);
  }

  errorMsg(): void {
    const errorMsg = this.translate.instant(
      'GLOBAL.SEND_TO_INTERNAL_REVIEW.ERROR'
    );
    this.notificationGlobalSvc.showError(errorMsg);
  }
}
