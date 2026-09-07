import { Component, Input, OnInit } from '@angular/core';
import { DisbursementHeader } from '../../models';
import { PermissionEnum } from '@core/enums';
import { FiTransactionsApiService } from '@fiduciary-interface/app/features/transactions/services';
import { HttpResponse } from '@angular/common/http';
import { FileSaverService } from 'ngx-filesaver';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fi-disbursement-header',
  templateUrl: './disbursement-header.component.html',
  styleUrls: [],
})
export class DisbursementHeaderComponent implements OnInit {
  constructor(
    private transactionSvc: FiTransactionsApiService,
    readonly fileSaverService: FileSaverService,
    private readonly translate: TranslateService
  ) {}

  @Input() header: DisbursementHeader;
  @Input() downloadReportPermission: PermissionEnum[] = [
    PermissionEnum.SPECIAL,
  ];
  @Input() projectBucketId: string;
  downloadingReport = false;
  ngOnInit(): void {}

  downloadReport(): void {
    const documentName = this.translate.instant(
      'DISBURSEMENT.REPORT_SUMMARY_NAME'
    );
    this.downloadingReport = true;
    this.transactionSvc.getDisbursementReport(this.projectBucketId).subscribe({
      next: (data: HttpResponse<ArrayBuffer>) => {
        this.fileSaverService.save(
          new Blob([new Uint8Array(data.body).buffer], {
            type: data.headers.get('Content-Type'),
          }),
          `${documentName}`
        );
      },
      complete: () => {
        this.downloadingReport = false;
      },
    });
  }
}
