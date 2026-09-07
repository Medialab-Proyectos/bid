import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  UBOBidderResponse,
  UBOBiddersResponse,
} from '@core/models/responses/ubo-response.model';
import {
  Email,
  EmailRequest,
  UBOBidder,
  UBOData,
  UBOForm,
  UboInfo,
} from '@core/models/ubo.model';
import { UboApiService } from '@core/services/apis/fiduciary-process-api/ubo-api/ubo-api.service';
import {
  BiddingProcessPlanStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UboService {
  constructor(
    private readonly uboApiService: UboApiService,
    private readonly biddingStoreSvc: BiddingProcessPlanStoreService,
    private readonly storeProject: ProjectStoreService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly translate: TranslateService
  ) {}

  UBORules: UBOData;

  getProcurementProcessData(procurementProcessId: string): Observable<UboInfo> {
    return this.uboApiService.getUBO().pipe(
      switchMap((uboInfo) =>
        this.biddingStoreSvc
          .getOrLoadSelectedBiddingProcessById(procurementProcessId)
          .pipe(
            map((data) => {
              const procurementProcess =
                data.selectedBiddingProcessProcurementProcess;
              return {
                category: procurementProcess.category.name,
                procurementMethod: procurementProcess.procurementMethod.name,
                supervisionMethod: procurementProcess.supervisionMethod.name,
                uboInfo,
              };
            })
          )
      ),
      switchMap((uboAndProcess) =>
        this.storeProject.selectedProject().pipe(
          map((projectData) => ({
            ...uboAndProcess,
            countryCode: projectData.selectedProject.countryCode,
          }))
        )
      )
    );
  }

  createBidderForRequest(
    emails: EmailRequest[],
    bidderId: string,
    name: string,
    bidders: UBOBidderResponse[]
  ): UBOBidder {
    const bidderData = bidders.find((b) => {
      return b.bidderId === bidderId;
    });
    const emailsRequest: Email[] = [];
    emails.forEach((e) => {
      emailsRequest.push({
        recipientId: null,
        emailAddress: e.emailAddress,
        recipientStatus: null,
        fullName: e.fullName,
      });
    });

    return {
      participantId: bidderData.participantId,
      bidderId,
      name,
      emails: emailsRequest,
      envelopeId: bidderData.envelopeId,
      envelopeStatusId: bidderData.envelopeStatus?.id ?? null,
    };
  }

  checkUboRules(
    UBORules: UBOData,
    countryCode: string,
    category: string,
    procurementMethod: string,
    supervisionMethod: string,
    prop: 'value' | 'mandatory'
  ): boolean {
    return !!(
      UBORules[countryCode]?.[category]?.[procurementMethod]?.[
        supervisionMethod
      ]?.[prop] ||
      UBORules['ALL']?.[category]?.[procurementMethod]?.[supervisionMethod]?.[
        prop
      ]
    );
  }

  checkBiddersSignaturesPackage(
    biddingProcessProcurementProcessId: string,
    hasUboDocumentGroup: boolean
  ): Observable<string[]> {
    return this.getProcurementProcessData(
      biddingProcessProcurementProcessId
    ).pipe(
      switchMap((data) => {
        const applyUBORules =
          this.checkUboRules(
            data.uboInfo,
            data.countryCode,
            data.category,
            data.procurementMethod,
            data.supervisionMethod,
            'value'
          ) && hasUboDocumentGroup;
        const missingSignatures: string[] = [];
        if (!applyUBORules) {
          return of(missingSignatures);
        } else {
          if (
            this.checkUboRules(
              data.uboInfo,
              data.countryCode,
              data.category,
              data.procurementMethod,
              data.supervisionMethod,
              'mandatory'
            )
          ) {
            return this.uboApiService
              .getUBOBidders(biddingProcessProcurementProcessId)
              .pipe(
                map((data: UBOBiddersResponse) => {
                  data.bidders.forEach((b) => {
                    if (!b.propertyEffectiveDocument?.ezshareNumber) {
                      missingSignatures.push(b.name);
                    }
                  });
                  return missingSignatures;
                })
              );
          } else {
            return of(missingSignatures);
          }
        }
      })
    );
  }

  checkBiddersSignaturesContract(
    biddingProcessProcurementProcessId: string,
    participantsIds: string[]
  ): Observable<string[]> {
    return this.getProcurementProcessData(
      biddingProcessProcurementProcessId
    ).pipe(
      switchMap((data) => {
        const applyUBORules = this.checkUboRules(
          data.uboInfo,
          data.countryCode,
          data.category,
          data.procurementMethod,
          data.supervisionMethod,
          'value'
        );
        const missingSignatures: string[] = [];
        if (!applyUBORules) {
          return of(missingSignatures);
        } else {
          if (
            this.checkUboRules(
              data.uboInfo,
              data.countryCode,
              data.category,
              data.procurementMethod,
              data.supervisionMethod,
              'mandatory'
            )
          ) {
            return this.uboApiService
              .getUBOBidders(biddingProcessProcurementProcessId)
              .pipe(
                map((data: UBOBiddersResponse) => {
                  data.bidders.forEach((b) => {
                    if (!b.propertyEffectiveDocument?.ezshareNumber) {
                      if (participantsIds.includes(b.participantId)) {
                        missingSignatures.push(b.name);
                      }
                    }
                  });
                  return missingSignatures;
                })
              );
          } else {
            return of(missingSignatures);
          }
        }
      })
    );
  }

  hasEmailsToSent(form: FormGroup<UBOForm>, primaryBtn: boolean): boolean {
    let hasEmails = false;
    hasEmails = form.controls.bidders.controls.some(
      (b) => b.value.emails.length > 0
    );
    if (!hasEmails && primaryBtn) {
      const errormsg = this.translate.instant(
        'UBO.MODAL.EMAILS_VALIDATON.ERROR'
      );
      this.notificationGlobalSvc.showError(errormsg);
    }

    return hasEmails;
  }
}
