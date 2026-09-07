import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';

import { DocumentsPermissions, FiduciaryProcessDocument } from '@core/models';
import { FiduciaryProcessDocumentsStatuses, PermissionEnum } from '@core/enums';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { WindowSizeService } from '@core/services/view';
import { ModalService } from '@fiduciary-interface/app/shared/services/modal.service';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store';

@Component({
  selector: 'fi-document-item',
  templateUrl: './document-item.component.html',
  styleUrls: ['./document-item.component.scss'],
})
export class DocumentItemComponent implements OnChanges, OnDestroy {
  constructor(
    readonly pipe: TranslatePipe,
    readonly fiModalSvc: ModalService,
    readonly windowSvc: WindowSizeService,
    private readonly store: Store<AppState>
  ) {
    this.initMobileConditionals();
  }

  @Input() documentListPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() data: FiduciaryProcessDocument;
  @Input() permissions: DocumentsPermissions;
  @Input() isGPN = false;
  @Output() downloadDocEmitter: EventEmitter<FiduciaryProcessDocument> =
    new EventEmitter<FiduciaryProcessDocument>();
  @Output() deleteDocEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() previewDocEmitter: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  subscriptionCollection: Subscription[] = [];
  public mobileView = false;
  screenHeight: number;
  screenWidth: number;
  isInternalUser = false;

  public itemMenu = [];

  initMobileConditionals(): void {
    this.subscriptionCollection.push(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  ngOnChanges(): void {
    this.subscriptionCollection.push(
      this.store.select('contact').subscribe((res) => {
        if (res.contact !== null) {
          this.isInternalUser = res.contact.is_internal;
        }
      })
    );

    this.initPermissions();
  }

  ngOnDestroy(): void {
    this.subscriptionCollection.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  public downloadAction(): void {
    this.downloadDocEmitter.emit(this.data);
  }

  public previewAction(): void {
    this.previewDocEmitter.emit(true);
  }

  public deleteAction(): void {
    this.deleteDocEmitter.emit(this.data.id);
  }

  public initPermissions(): void {
    this.itemMenu = [];
    if (this.permissions) {
      if (this.data.biddingDocumentId !== '') {
        this.itemMenu.push({
          actionName: 'SHARED.DOCUMENT.PREVIEW',
          click: () => this.previewAction(),
        });
      }
      if (this.permissions.download) {
        this.itemMenu.push({
          actionName: 'SHARED.DOCUMENT.DOWNLOAD',
          click: () => this.downloadAction(),
        });
      }
      if (this.permissions.delete && this.isInternalUser === false) {
        switch (this.data.status) {
          case FiduciaryProcessDocumentsStatuses.errorEzshareUpload:
          case FiduciaryProcessDocumentsStatuses.draftUploadedBlobStorage:
          case FiduciaryProcessDocumentsStatuses.rejected:
          case FiduciaryProcessDocumentsStatuses.undisclosed:
            this.itemMenu.push({
              actionName: 'SHARED.DOCUMENT.DELETE',
              click: () => this.deleteAction(),
            });
            break;
          case FiduciaryProcessDocumentsStatuses.ReturnWithComment:
            if (this.data.biddingDocumentId === '') {
              this.itemMenu.push({
                actionName: 'SHARED.DOCUMENT.DELETE',
                click: () => this.deleteAction(),
              });
            }
            break;
        }
      }
    }
  }
}
