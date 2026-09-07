import { Component, OnInit, OnDestroy } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { NotificationsEmailService } from '../../service/notificationsEmail.service';
import {
  NotificationEmail,
  NotificationEmailResponse,
  NotificationsRequest,
} from '../../models/notificationsEmail.model';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import {
  DataStateChangeEvent,
  GridDataResult,
} from '@progress/kendo-angular-grid';
import {
  GroupDescriptor,
  SortDescriptor,
  State,
  process,
} from '@progress/kendo-data-query';
import { DomSanitizer } from '@angular/platform-browser';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { Subscription } from 'rxjs';

enum notificationsKeysENum {
  AllAddresses = 'NOTIFICATIONS.ALL_ADDRESSES',
  Subject = 'NOTIFICATIONS.SUBJECT',
  SendDate = 'NOTIFICATIONS.SEND_DATE',
}
@Component({
  selector: 'fi-notifications',
  templateUrl: './notificationsEmail.component.html',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  constructor(
    readonly notificationServiceEmail: NotificationsEmailService,
    readonly notificationGlobalService: NotificationGlobalService,
    readonly translateSvc: TranslateService,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    private readonly ifdatePipe: IFDatePipe
  ) {}
  protected subscription: Subscription = new Subscription();
  notificationsEmail: NotificationEmail[] = [];
  isLoginNotificationEmail = true;
  searching: boolean;
  searchDate: Date = null;
  pageSize = 10;
  skip = 0;
  gridView: GridDataResult;
  totalResults: number;
  notificationsRequestBody: NotificationsRequest = {
    filterDate: null,
    filterText: null,
    page: 1,
    size: this.pageSize,
  };
  public sort: SortDescriptor[] = [];
  public group: GroupDescriptor[] = [];
  loadingData: boolean;
  public state: State = {
    skip: 0,
    take: this.pageSize,
    group: [],
  };

  subjectTranslate: string;
  allAddressTranslate: string;
  notificationsSendDateTranslate: string;
  language: string;
  public gridData: any = process(this.notificationsEmail, this.state);

  ngOnInit(): void {
    this.getNotificationsEmail();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  generate(id: string): void {
    const element = document.getElementById('outputDocument');
    const notification = this.notificationsEmail.find((x) => x.id === id);

    if (this.translateSvc.getLangs().includes(this.language)) {
      this.generateNotification(notification, element);
    } else {
      this.subscription.add(
        this.translateSvc
          .getTranslation(notification.language.toLocaleLowerCase())
          .subscribe(() => {
            this.language = notification.language;

            let translations =
              this.translateSvc.store.translations[this.language.toLowerCase()];

            this.subjectTranslate = this.getTranslation(
              translations,
              notificationsKeysENum.Subject
            );
            this.allAddressTranslate = this.getTranslation(
              translations,
              notificationsKeysENum.AllAddresses
            );
            this.notificationsSendDateTranslate = this.getTranslation(
              translations,
              notificationsKeysENum.SendDate
            );

            this.generateNotification(notification, element);
          })
      );
    }
  }
  generateNotification(
    notification: NotificationEmail,
    element: HTMLElement
  ): void {
    if (notification) {
      document.getElementById('lblSubject').innerHTML =
        notification.subjectDecode;
      document.getElementById('lblToEmail').innerHTML =
        notification.formattedEmails;
      document.getElementById('lblDate').innerHTML = this.datePipe.transform(
        notification.createDate,
        'dd-MM-yyyy HH:mm:ss'
      );

      let elementToConvert = document.getElementById('output');
      elementToConvert.innerHTML = this.decodeHtml(notification.bodyDecode);
      elementToConvert.classList.add('detail-template');
    }
    const inputDateString = notification.createDate;
    const formattedDate = this.datePipe.transform(
      inputDateString,
      'dd-MM-yyyy HH:mm'
    );
    const options = {
      margin: 10,
      filename: notification.source + ' ' + formattedDate + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf()
      .from(element || document.getElementById('outputDocument'))
      .set(options)
      .save();
  }

  getNotificationsEmail(state?: DataStateChangeEvent): void {
    this.loadingData = true;
    this.notificationServiceEmail
      .getNotifications(this.notificationsRequestBody)
      .subscribe(
        (x: NotificationEmailResponse) => {
          this.notificationsEmail = x.notifications;
          this.notificationsEmail.forEach((notification) => {
            const allAddresses = [
              ...new Set([
                ...notification.toAddresses,
                ...notification.ccAddresses,
                ...notification.bccAddresses,
              ]),
            ];
            notification.formattedEmails = allAddresses.join('; ');
            notification.subjectDecode = this.decodeSuject(
              notification.subjectDecode
            );
            notification.bodyDecode = this.decodeHtml(notification.bodyDecode);

            const padding = 20 + Math.trunc(allAddresses.length / 4) * 15;
            notification.paddingBottom = padding;
            const newDate = new Date(notification.createDate);

            newDate.setHours(0, 0, 0, 0);
            notification.formattedCreatedDate =
              this.ifdatePipe.transform(newDate);
          });
          this.totalResults = x.totalResult;
          this.groupAndSort(state);
        },
        (_) => {
          const msg = this.translateSvc.instant('NOTIFICATIONS.ERROR');
          this.notificationGlobalService.showError(msg, 'right', 'top', 5000);
          this.isLoginNotificationEmail = false;
        }
      );
  }

  onSearch(event: string): void {
    this.skip = 0;
    this.state = {
      skip: 0,
      take: this.pageSize,
      group: [],
    };
    this.notificationsRequestBody.page = 1;
    if (event.trim() === '') {
      this.notificationsRequestBody.filterText = null;
    } else {
      this.notificationsRequestBody.filterText = event.trim();
    }

    this.getNotificationsEmail();
  }

  onChangeDate(event: Date): void {
    this.skip = 0;
    this.state = {
      skip: 0,
      take: this.pageSize,
      group: [],
    };
    if (event === null) {
      this.searchDate = null;
    } else {
      this.searchDate = event;
    }
    this.notificationsRequestBody.page = 1;
    this.notificationsRequestBody.filterDate = this.searchDate;

    this.getNotificationsEmail();
  }

  public dataStateChange(state?: DataStateChangeEvent): void {
    if (state.skip === this.skip) {
      this.groupAndSort(state);
    } else {
      this.skip = state.skip;
      this.notificationsRequestBody.page = state.skip / state.take + 1;
      this.getNotificationsEmail(state);
    }
  }

  groupAndSort(state?: DataStateChangeEvent): void {
    if (!state) {
      this.gridView = {
        data: this.notificationsEmail,
        total: this.totalResults,
      };
    } else {
      state.skip = 0;
      this.state = state;

      this.gridData = process(this.notificationsEmail, this.state);

      this.gridView = { data: this.gridData.data, total: this.totalResults };
    }

    this.loadingData = false;

    this.isLoginNotificationEmail = false;
  }

  decodeHtml(html: string): string {
    const newHtml = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const cadenaDecodificada = this.sanitizer.bypassSecurityTrustHtml(newHtml);
    return cadenaDecodificada['changingThisBreaksApplicationSecurity'];
  }

  decodeSuject(subject: string): string {
    const textoReemplazado = subject.replace(
      /&#(\d+);/g,
      function (_match, code) {
        return String.fromCharCode(code);
      }
    );
    return textoReemplazado;
  }

  getTranslation(translations: any, type: notificationsKeysENum): string {
    return translations[type].concat(':');
  }
}
