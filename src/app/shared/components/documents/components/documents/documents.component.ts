import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, AppStateWithUsrPreferences } from '@core/store';
import { Subscription } from 'rxjs';
import { FileRestrictions, SelectEvent } from '@progress/kendo-angular-upload';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { WindowSizeService } from '@core/services/view';
import { TempDoc } from '@core/store/tempDoc/model/tempDoc.model';
import { GeneralProcurementDocumentsApiService } from '@core/services/apis';

import {
  Contact,
  DocumentsPermissions,
  Enums,
  FiduciaryProcessDocument,
} from '@core/models';
import {
  DocumentDomain,
  FiduciaryProcessDocumentsStatuses,
  PermissionEnum,
} from '@core/enums';
import { EnumsStoreService } from '@core/services/store-services';
import { BtnBusinessRule } from '@core/models/btnBusinessRules';

export interface ErrorMessage {
  type: string;
  title: string;
  subtitle: string;
}
@Component({
  selector: 'fi-documents',
  templateUrl: './documents.component.html',
  providers: [TranslatePipe],
})
export class DocumentsComponent implements OnChanges, OnInit, OnDestroy {
  @Input() documents: FiduciaryProcessDocument[];
  @Input() permissions: DocumentsPermissions;

  @Input() loading: boolean;
  @Input() noObjection = false;
  @Input() projectBucketId: string;
  @Input() allowedExtensions: Array<string> = [
    '.pdf',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.doc',
    '.docx',
    '.msg',
    '.jpg',
    '.png',
    '.jpeg',
  ];
  @Input() maxFileSize = 25e8;
  @Input() validFormats: Array<string> = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'application/vnd.ms-outlook',
  ];
  @Input() multipleDocs = true;
  @Input() btnBusiness: BtnBusinessRule;
  @Input() testGPNTooltip: string;
  @Output() downloadDocEmitter: EventEmitter<FiduciaryProcessDocument> =
    new EventEmitter<FiduciaryProcessDocument>();
  @Output() replaceDocEmitter: EventEmitter<string> =
    new EventEmitter<string>();
  @Output() previewDocEmitter: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() deleteDocEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() requestPublication: EventEmitter<FiduciaryProcessDocument> =
    new EventEmitter<FiduciaryProcessDocument>();
  @Output() requestReplace: EventEmitter<FiduciaryProcessDocument> =
    new EventEmitter<FiduciaryProcessDocument>();
  @Output() refreshDocs: EventEmitter<unknown> = new EventEmitter();
  @Output() routinGpnForm: EventEmitter<unknown> = new EventEmitter();

  public subscriptionCollection: Subscription[] = [];
  public tempDocs: TempDoc[];
  public myFiles: Array<unknown>;
  public docForm: UntypedFormGroup;
  public docs: FiduciaryProcessDocument[] = [];
  public mockDocumentItem: FiduciaryProcessDocument;

  public restrictions: FileRestrictions = {
    allowedExtensions: this.allowedExtensions,
    maxFileSize: null,
    minFileSize: null,
  };

  public userInfo: Contact;
  documentDomain = DocumentDomain;
  public docState: FiduciaryProcessDocumentsStatuses;
  public rejectedState = FiduciaryProcessDocumentsStatuses.rejected;
  public undisclosedState = FiduciaryProcessDocumentsStatuses.undisclosed;
  public errorEzshareUpload =
    FiduciaryProcessDocumentsStatuses.errorEzshareUpload;
  public draftState =
    FiduciaryProcessDocumentsStatuses.draftUploadedBlobStorage;
  public errorMessage: ErrorMessage = null;

  public docExtension: string;
  public labelUploadDoc = '';
  public labelUploadFiles = '';
  public labelGenerateDoc = '';
  public labelUploadFilesTooltip = '';
  public generateSearchText = 'generate';

  public mobileView = false;
  public toggle = false;
  public replacingDoc = false;
  public submitted = false;
  public invalidDocument = false;
  public isEnumLoading: boolean;
  public ReturnWithComment =
    FiduciaryProcessDocumentsStatuses.ReturnWithComment;

  screenHeight: number;
  screenWidth: number;

  enum = Enums;
  selectedLanguage: string;

  public documentListPermission = [PermissionEnum.VIEW_PROCUREMENT_INFORMATION];
  public uploadDocumentPermission = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  public requestPublicationButtonPermission = [
    PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
  ];

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly pipe: TranslatePipe,
    private readonly store: Store<AppState>,
    private readonly windowSvc: WindowSizeService,
    private readonly GPNSvc: GeneralProcurementDocumentsApiService,
    private readonly enumsSvc: EnumsStoreService,
    private readonly translate: TranslateService,
    private readonly notificationSvc: NotificationGlobalService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>
  ) {
    this.docForm = this.fb.group({
      files: [this.myFiles, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getCurrentLang();
    this.initMobileConditionals();
    this.getUserInfo();
    this.loadFileUploadTranslation();
    this.checkEnumsLoaded();
  }

  ngOnChanges(): void {
    if (this.documents && this.documents[0] !== undefined) {
      if (this.documents[0].id === null) {
        this.docs = [];
      } else {
        this.docs = [...this.documents];
      }
    } else {
      if (this.documents) {
        this.docs = [...this.documents];
      } else {
        this.docs = [];
      }
    }
    this.checkDocsLength();
    this.checkDocState();
    this.loadFileUploadTranslation();
  }

  ngOnDestroy(): void {
    this.unsuscribeObservables();
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscriptionCollection.push(sub);
  }

  checkEnumsLoaded(): void {
    this.subscriptionCollection.push(
      this.enumsSvc.selectEnums().subscribe((data) => {
        const statusEnum =
          data.enumsLoading[Enums.fiduciaryProcessDocumentsStatuses];

        this.isEnumLoading = statusEnum;
      })
    );
  }

  initMobileConditionals(): void {
    this.subscriptionCollection.push(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  getUserInfo(): void {
    this.subscriptionCollection.push(
      this.store.select('contact').subscribe((res) => {
        if (res.contact !== null) {
          this.userInfo = res.contact;
        }
      })
    );
  }

  addMessagesError(title: string, subtitle: string): void {
    this.errorMessage = {
      type: 'error',
      title,
      subtitle,
    };
  }

  onValueChange(event: SelectEvent): void {
    const file = event.files[0];
    if (
      this.checkDocumentSize(file.size) &&
      this.checkFormatFile(file.extension)
    ) {
      this.invalidDocument = false;
      this.loading = true;
      this.GPNSvc.setGeneralProcurementDocument(
        this.projectBucketId,
        this.documentDomain.PROJECTBUCKET,
        event.files[0],
        this.selectedLanguage
      )
        .subscribe(
          () => {
            this.refreshDocs.emit('true');
          },
          () => {
            const message = this.translate.instant(
              'SHARED.DOCUMENT.DOCUMENT_FINISHED.UPLOAD_ERROR'
            );
            this.notificationSvc.showError(message, 'right', 'top', 7000);
            this.docForm.reset();
          }
        )
        .add(() => (this.loading = false));
    } else {
      if (!this.checkFormatFile(file.extension)) {
        const title = this.pipe.transform('SHARED.DOCUMENT.FORMAT_ERROR.TITLE');
        const subtitle = this.pipe.transform(
          'SHARED.DOCUMENT.FORMAT_ERROR.SUB_TITLE'
        );
        this.addMessagesError(
          title,
          `${subtitle} ${this.restrictions.allowedExtensions.join()}`
        );
      }
      if (!this.checkDocumentSize(file.size)) {
        const title = this.pipe.transform('SHARED.DOCUMENT.SIZE_ERROR.TITLE');
        const subtitle = this.pipe.transform(
          'SHARED.DOCUMENT.SIZE_ERROR.SUB_TITLE'
        );
        this.addMessagesError(
          title,
          `${subtitle} ${this.bytesToMegabytes(this.maxFileSize)}MB`
        );
      }
      this.loading = true;
      setTimeout(() => {
        this.docForm.controls.files.setValue(null);
        this.loading = false;
      }, 200);
      this.docs = [];
      this.invalidDocument = true;
    }
  }

  /**
   * @description checks if the size of the document is smaller than the maxFileSize
   * @param fileSize number
   */
  checkDocumentSize(fileSize: number): boolean {
    return fileSize < this.maxFileSize;
  }

  /**
   * @description checks the document format
   * @param type string
   */
  checkFormatFile(type: string): boolean {
    return (
      this.allowedExtensions.find(
        (ft) => ft.toUpperCase() === type.toUpperCase()
      ) !== undefined
    );
  }

  /**
   * @description turn the value of bytes in megabytes
   * @param bytes
   */
  bytesToMegabytes(bytes: number): number {
    return bytes * 0.000001;
  }

  loadFileUploadTranslation(): void {
    if (this.mobileView) {
      this.labelUploadDoc = '';
    } else {
      this.labelUploadDoc = this.pipe.transform(
        'SHARED.DOCUMENT.DRAG_DOCUMENT'
      );
    }
    this.labelUploadFilesTooltip = this.pipe.transform(
      'SHARED.DOCUMENT.UPLOAD_FILES_TOOLTIP'
    );
    this.labelUploadFiles = this.pipe.transform('SHARED.DOCUMENT.UPLOAD_FILES');
    this.labelGenerateDoc = this.pipe.transform(
      'SHARED.DOCUMENT.GENERATE_DOCUMENT'
    );
  }

  checkDocState(): void {
    if (this.docs[0]) {
      this.docState = this.docs[0].status;
      this.docForm.controls.files.setValue(this.docs[0]);
    } else {
      this.docState =
        FiduciaryProcessDocumentsStatuses.draftUploadedBlobStorage;
    }
  }

  checkDocsLength(): void {
    if (this.docs.length <= 0) {
      this.docForm.reset();
    }
  }

  previewDoc(event: boolean): void {
    this.previewDocEmitter.emit(event);
  }

  downloadDoc(event: FiduciaryProcessDocument): void {
    this.downloadDocEmitter.emit(event);
  }

  deleteDoc(event: string): void {
    this.deleteDocEmitter.emit(event);
  }

  unsuscribeObservables(): void {
    this.subscriptionCollection.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  publishDoc(): void {
    this.requestPublication.emit(this.mockDocumentItem);
  }

  replaceRejectedDoc(): void {
    this.requestReplace.emit(this.docs[0]);
  }

  routerDocumentGPN(event: any): void {
    this.routinGpnForm.emit(event);
  }
}
