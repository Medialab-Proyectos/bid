import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ModalService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { Subscription, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DialogResponse, ModalOptions } from '@core/models';
import { UBOBiddersResponse } from '@core/models/responses/ubo-response.model';
import { FormGroup } from '@angular/forms';
import { EmailRequest, UBOBiddersRequest } from '@core/models/ubo.model';
import { UboApiService } from '@core/services/apis/fiduciary-process-api/ubo-api/ubo-api.service';
import { UboService } from '../../services/ubo.service';
import { UBOForm } from '@core/models/ubo.model';
import { ProjectStoreService } from '@core/services/store-services';
import { LanguagesCode } from '@core/enums';

@Component({
  selector: 'fi-ubo',
  templateUrl: './ubo.component.html',
  styleUrls: [],
})
export class UBOComponent implements OnInit, OnDestroy {
  @Input() disableBtn: boolean = false;
  @Input() packageId: string;
  @Input() processId: string;
  bidders: UBOBiddersResponse = null;
  readonly suscriptions: Subscription = new Subscription();
  loading = false;
  loadingEmailModal = false;
  selectedLang: string = LanguagesCode.ENGLISH;
  projectExecutor: string;
  constructor(
    readonly fiModalSvc: ModalService,
    readonly uboApiService: UboApiService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly translate: TranslateService,
    readonly uboService: UboService,
    readonly projectStoreSvc: ProjectStoreService
  ) {}
  ngOnInit(): void {
    this.suscriptions.add(
      this.projectStoreSvc.languageSelected().subscribe((data) => {
        this.selectedLang = data.preferences?.preferredLanguage
          ? data.preferences.preferredLanguage
          : LanguagesCode.ENGLISH;
      })
    );
    this.suscriptions.add(
      this.projectStoreSvc.selectedProject().subscribe((data) => {
        this.projectExecutor = data?.selectedProject?.executor;
      })
    );
  }

  openUBOModal(): void {
    if (this.disableBtn || this.loading) {
      return;
    }
    this.loading = true;
    const sub = this.uboApiService
      .getUBOBidders(this.processId)
      .pipe(
        switchMap((bidders: UBOBiddersResponse) => {
          this.bidders = bidders;
          const mappedBidders = {
            bidders: bidders.bidders.filter((b) => {
              return b.propertyEffectiveDocument === null;
            }),
          };
          return this.fiModalSvc.openDialogUBO(
            'UBO.MODAL.TITTLE',
            [
              { text: 'UBO.MODAL.BTN_CANCEL' },
              {
                text: 'UBO.MODAL.BTN_CONFIRM',
                cssClass: 'k-primary k-align-text submit-button-modal',
              },
            ],
            mappedBidders
          );
        })
      )
      .subscribe({
        next: (modalData: DialogResponse) => {
          if (modalData.result === ModalOptions.ACCEPT) {
            this.sendBiddersEmails(modalData?.content);
          } else {
            this.loading = false;
          }
        },
        error: () => {
          this.loading = false;
        },
      });
    this.suscriptions.add(sub);
  }

  openDialogUBOCheckEmailStatus(): void {
    if (this.loadingEmailModal) {
      return;
    }
    this.loadingEmailModal = true;
    const sub = this.uboApiService
      .getUBOBidders(this.processId)
      .pipe(
        switchMap((bidders: UBOBiddersResponse) => {
          return this.fiModalSvc.openDialogUBOCheckEmailStatus(
            'UBO.MODAL.EMAIL_STATUS.TITTLE',
            [],
            bidders,
            this.selectedLang
          );
        })
      )
      .subscribe({
        next: () => {
          this.loadingEmailModal = false;
        },
        error: () => {
          this.loadingEmailModal = false;
        },
      });
    this.suscriptions.add(sub);
  }

  showErrorToast(message: string): void {
    this.notificationGlobalSvc.showError(
      this.translate.instant(message),
      'right',
      'top',
      7000
    );
  }

  showSuccessToast(message: string): void {
    this.notificationGlobalSvc.showSuccess(
      this.translate.instant(message),
      'right',
      'top',
      7000
    );
  }

  sendBiddersEmails(UBOForm: FormGroup<UBOForm>): void {
    this.loading = true;
    const UBOBiddersrequest: UBOBiddersRequest = {
      executor: this.projectExecutor,
      bidders: [],
    };
    UBOForm.controls.bidders.controls.forEach((d) => {
      const emails: EmailRequest[] = [];
      d.value.emails.forEach((e) => {
        emails.push({ emailAddress: e.email, fullName: e.fullName });
      });
      if (emails.length > 0) {
        const bidderRequest = this.uboService.createBidderForRequest(
          emails,
          d.value.bidderId,
          d.value.name,
          this.bidders.bidders
        );

        UBOBiddersrequest.bidders.push(bidderRequest);
      }
    });

    this.suscriptions.add(
      this.uboApiService
        .postUBOEmails(this.packageId, UBOBiddersrequest)
        .subscribe({
          next: () => {
            this.loading = false;
            this.showSuccessToast('UBO.SUCCESS_TOAST');
          },
          error: () => {
            this.loading = false;
            this.showErrorToast('UBO.ERROR_TOAST');
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.suscriptions.unsubscribe();
  }
}
