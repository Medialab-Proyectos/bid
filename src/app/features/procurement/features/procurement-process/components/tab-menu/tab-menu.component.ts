import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { WindowSizeService } from '@core/services/view';
import {
  BiddingProcessProcurementProcessStatuses,
  PermissionEnum,
  SettingType,
  SettingActionType,
} from '@core/enums';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import {
  BiddingProcessProcurementProcess,
  GetSettingsResponse,
  GetProcessDocumentPackageByProcurementIdResponse,
} from '@core/models';
import { ActivatedRoute } from '@angular/router';
import { AdditionalDocPackagesService } from '../../features/process-additional-doc-packages/services/additional-doc-packages.service';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import { BiddingProcessDocumentPackagesApiService } from '@core/services/apis';
import { filter, switchMap, take } from 'rxjs/operators';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';

@Component({
  selector: 'fi-tab-menu',
  templateUrl: './tab-menu.component.html',
})
export class TabMenuComponent implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();
  public mobileView = false;
  public showMenuMobile = false;
  public navLinks = [
    {
      label: 'DOCUMENTS_TAB',
      link: './doc-packages',
      index: 0,
      status: 'active',
    },
    {
      label: 'EVALUATION_REPORT_TAB',
      link: './participant',
      index: 1,
      status: 'active',
    },
    {
      label: 'CONTRACTS_TAB',
      link: './contracts',
      index: 2,
      status: 'active',
    },
  ];
  procurementProcess: BiddingProcessProcurementProcess;
  processProcurementProcessId: string;
  loading = true;
  loadingPermissions = true;
  private readonly additionalDocumentsTap = {
    label: 'ADDITIONAL_PACKAGES_TAB',
    link: './additional-doc-packages',
    index: 3,
    status: 'active',
  };
  permissionSeeParticipantContractGuest: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  permissionSeeParticipantContract: PermissionEnum[] = [
    PermissionEnum.DOWNLOAD_PACKAGE_DOCUMENTS,
  ];
  hasPermissionSeeParticipantContract: boolean;

  @ViewChild('anchor') public anchor: ElementRef;
  @ViewChild('popup', { read: ElementRef }) public popup: ElementRef;
  @HostListener('document:click', ['$event'])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.showMenuMobile = false;
    }
  }

  public onToggleMobileMenu(): void {
    this.showMenuMobile = !this.showMenuMobile;
  }

  constructor(
    readonly windowSvc: WindowSizeService,
    private readonly permissionSvc: PermissionService,
    private readonly biddingStoreSvc: BiddingProcessPlanStoreService,
    private readonly activatedRoute: ActivatedRoute,
    readonly additionalDocPackagesService: AdditionalDocPackagesService,
    readonly configSvc: ProcessConfiguration,
    private readonly documentsApi: BiddingProcessDocumentPackagesApiService,
    readonly store: Store<AppState>
  ) {
    this.initMobileConditionals();
  }

  ngOnInit(): void {
    this.checkPermissionForTabs();
    this.processProcurementProcessId =
      this.activatedRoute.snapshot.params.processId;
    this.loadSelectedProcurementProcess();
  }
  loadSelectedProcurementProcess(): void {
    this.subscription.add(
      this.biddingStoreSvc
        .getOrLoadSelectedBiddingProcessById(this.processProcurementProcessId)
        .pipe(
          filter((data) => !!data.selectedBiddingProcessProcurementProcess),
          take(1),
          switchMap((data) => {
            this.procurementProcess =
              data.selectedBiddingProcessProcurementProcess;
            return this.getSettingsAdditionalPackage(
              this.procurementProcess.id
            );
          })
        )
        .subscribe(() => {
          // Aquí puede realizar cualquier acción adicional después de obtener la configuración.
        })
    );
  }

  getSettingsAdditionalPackage(
    procurementProcessId: string
  ): Observable<unknown> {
    const attributes =
      this.additionalDocPackagesService.buildAttributesAdditionalPackage(
        this.procurementProcess.category.name,
        this.procurementProcess.procurementMethod.name,
        this.procurementProcess.supervisionMethod.name
      );
    return this.configSvc
      .settings(
        attributes,
        SettingActionType.Extend,
        SettingType.AdditionalDocumentPackage
      )
      .pipe(
        switchMap((data: GetSettingsResponse) => {
          if (data.settings.length > 0) {
            const formatedString = data.settings[0].values?.replace(
              /\\"/g,
              '"'
            );
            if (formatedString !== '') {
              if (!this.navLinks.includes(this.additionalDocumentsTap)) {
                this.navLinks.splice(1, 0, this.additionalDocumentsTap);
              }
              this.loading = false;
              return of(null); // Emita un valor nulo para finalizar la cadena.
            } else {
              return this.getDocumentsPackages(procurementProcessId);
            }
          } else {
            this.loading = false;
            return of(null);
          }
        })
      );
  }
  getDocumentsPackages(procurementProcessId: string): Observable<void> {
    return this.documentsApi
      .getBiddingProcessDocumentPackages(procurementProcessId, true)
      .pipe(
        switchMap((data: GetProcessDocumentPackageByProcurementIdResponse) => {
          const additionalPackage = data.biddingProcessDocumentPackage.find(
            (p) => p.isOptional === true
          );
          if (additionalPackage !== undefined) {
            if (!this.navLinks.includes(this.additionalDocumentsTap)) {
              this.navLinks.splice(1, 0, this.additionalDocumentsTap);
            }
          }
          this.loading = false;
          return of(null); // Emita un valor nulo para finalizar la cadena.
        })
      );
  }

  getTabs(): void {
    if (!this.hasPermissionSeeParticipantContract) {
      this.navLinks = this.navLinks.filter(
        (tab) => tab.index !== 1 && tab.index !== 2
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private contains(target: any): boolean {
    if (this.mobileView) {
      return (
        this.anchor.nativeElement.contains(target) ||
        (this.popup ? this.popup.nativeElement.contains(target) : false)
      );
    } else {
      return false;
    }
  }

  initMobileConditionals() {
    this.subscription.add(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  checkPermissionForTabs(): void {
    const biddingProcessPlanState$ = this.biddingStoreSvc.biddingProcessPlan();
    const permissionsState$ = this.store.select('permissions');
    const sub = combineLatest([biddingProcessPlanState$, permissionsState$])
      .pipe(
        filter(
          ([biddingProcessPlanState, permissionsState]) =>
            biddingProcessPlanState.selectedBiddingProcessProcurementProcess !==
              null && permissionsState.loaded
        ),
        take(1)
      )
      .subscribe((data) => {
        if (data[0].selectedBiddingProcessProcurementProcess !== null) {
          if (
            BiddingProcessProcurementProcessStatuses.EXPECTED ===
              data[0].selectedBiddingProcessProcurementProcess.status ||
            BiddingProcessProcurementProcessStatuses.MODIFIED ===
              data[0].selectedBiddingProcessProcurementProcess.status ||
            BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING ===
              data[0].selectedBiddingProcessProcurementProcess.status ||
            BiddingProcessProcurementProcessStatuses.TECHNICAL_EVALUATION_OF_BIDS_PROPOSALS ===
              data[0].selectedBiddingProcessProcurementProcess.status ||
            BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL ===
              data[0].selectedBiddingProcessProcurementProcess.status
          ) {
            this.hasPermissionSeeParticipantContract =
              this.permissionSvc.haveSomePermissions(
                this.permissionSeeParticipantContract
              );
            this.getTabs();
            this.loadingPermissions = false;
          } else {
            this.hasPermissionSeeParticipantContract =
              this.permissionSvc.haveSomePermissions(
                this.permissionSeeParticipantContractGuest
              );
            this.getTabs();
            this.loadingPermissions = false;
          }
        }
      });
    this.subscription.add(sub);
  }
}
