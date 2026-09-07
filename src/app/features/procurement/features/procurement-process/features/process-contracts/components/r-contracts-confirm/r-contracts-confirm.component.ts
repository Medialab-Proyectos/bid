import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';

import {
  ContractResponse,
  SourceDetail,
  SourceItem,
} from '../../rebrand-form/models';
import {
  Enumerator,
  ExchangeRateResponse,
  ParticipantAwardedV2,
  Project,
  ProjectTask,
} from '@core/models';
import {
  catchError,
  filter,
  map,
  Observable,
  Subject,
  take,
  takeUntil,
  tap,
  forkJoin,
  of,
  finalize,
} from 'rxjs';
import {
  BiddingContractApiService,
  ExchangeRateApiService,
} from '@core/services/apis';
import { MatDialog } from '@angular/material/dialog';
import { ContractDialogComponent } from '../contract-dialog/contract-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import {
  FileService,
  NotificationGlobalService,
} from '../../../../../../../../shared';
import { RContractsBidderComponent } from '../r-contracts-bidder/r-contracts-bidder.component';
import { BidderDetailDialog } from '../r-contracts-detail-bidder/r-contracts-detail-bidder.component';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import { FileSaverService } from 'ngx-filesaver';
import { NotificationsService } from '../../../../../../../../shared/services/notifications.service';
import { ProjectStoreService } from '@core/services/store-services';
import { PermissionEnum, WorkflowIdEntityType } from '@core/enums';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PermissionService } from '@core/services/app/permission/permission.service';

export interface CurrencyGroup {
  currency: string;
  items: SourceItem[];
  totalComponent: number;
  totalIdb: number;
  totalLc: number;
  totalCf: number;
  totalUsdEquivalent: number;
}

@Component({
  selector: 'fi-r-contracts-confirm',
  templateUrl: './r-contracts-confirm.component.html',
  styleUrls: ['./r-contracts-confirm.component.scss'],
})
export class RContractsConfirmComponent implements OnInit {
  @Input() biddingContractConflictResolutionMethods: Enumerator[] = [];
  @Input() biddingContractBonusPaymentFrequency: Enumerator[];
  @Input() biddingContractLiquidatedDamageTypes: Enumerator[];
  @Input() biddingContractSecurityTypes: Enumerator[];
  @Input() biddingContractTypes: Enumerator[] = [];
  @Input() biddingContractBonusTypes: Enumerator[];
  @Input() contractData: ContractResponse;
  @Input() participants: ParticipantAwardedV2[];
  @Input() allProjectTasks$: Observable<ProjectTask[]>;
  @Input() biddingContractDocumentGroupCodes: Enumerator[];
  @Input() set constDistributionData(val: {
    structure: SourceItem[];
    products: Map<string, ProjectTask[]>;
  }) {
    if (val) {
      this.processData(val.structure, val.products);
    }
  }
  @Output() editContract: EventEmitter<number> = new EventEmitter<number>();

  private readonly permissionService = inject(PermissionService);
  private readonly contractApiSvc = inject(BiddingContractApiService);
  private readonly exchangeRateSvc = inject(ExchangeRateApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();
  private readonly translate = inject(TranslateService);
  private readonly notificationBlobalService = inject(
    NotificationGlobalService
  );
  private readonly contractsSvc = inject(ContractRebrandService);
  private readonly fileSvc = inject(FileService);
  private readonly fileSaverService = inject(FileSaverService);
  projectSelected: Project;
  /** Mapa para almacenar tasas de cambio por moneda */
  private exchangeRates = new Map<string, number>();
  private contractSignDate: string | null = null;

  public documents = computed(() => {
    return this.contractsSvc._documentState().persistedDocs;
  });
  totalEquivalentUsd: number = 0;
  costDistributionComponent: CurrencyGroup[] = [];
  participantsAwarded: ParticipantAwardedV2 | null = null;
  viewPermissions: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  sendOficialCommunicationsPermission: PermissionEnum[] = [
    PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
  ];

  SendInternalNotificationsPermission: PermissionEnum[] = [
    PermissionEnum.SEND_INTERNAL_NOTIFICATIONS,
  ];
  readonly loadDetailScreen = signal<boolean>(
    /\/contracts\/v2\/[0-9a-fA-F-]{36}\/detail$/.test(this.router.url)
  );

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    readonly router: Router,
    readonly notificationService: NotificationsService,
    readonly storeProject: ProjectStoreService
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.loadDetailScreen.set(
          /\/contracts\/v2\/[0-9a-fA-F-]{36}\/detail$/.test(this.router.url)
        );
      });
  }

  ngOnInit(): void {
    this.filterParticipantsAwarded();
    this.loadSelectedProject();
  }

  filterParticipantsAwarded(): void {
    this.participantsAwarded = this.participants?.find(
      (participant) =>
        participant.biddingProcessParticipantId ===
        this.contractData?.participantAwardedId
    );
  }

  CanSendInternalReview(): boolean {
    return (
      this.permissionService.hasSpecialPermission(
        this.sendOficialCommunicationsPermission
      ) &&
      !this.permissionService.hasSpecialPermission(
        this.SendInternalNotificationsPermission
      )
    );
  }

  processData(structure: SourceItem[], products: Map<string, ProjectTask[]>) {
    // Extraer fecha de firma del contrato
    this.contractSignDate =
      this.contractData?.generalInformation?.signatureDate || null;

    this.allProjectTasks$?.pipe(take(1)).subscribe((allTasks) => {
      // Enriquecer datos con nombres de componentes y productos
      const enrichedData = structure.map((item) => {
        const componentTask = allTasks.find((t) => t.id === item.componentId);

        const newItem = {
          ...item,
          componentName: componentTask
            ? componentTask.name
            : 'Componente no encontrado',
          detail: item.detail.map((d) => {
            const tasksForComponent = products.get(item.componentId) || [];
            const productTask = tasksForComponent.find(
              (t) => t.id === d.productId
            );
            return {
              ...d,
              productName: productTask
                ? productTask.name
                : 'Producto no encontrado',
            };
          }),
        };

        return this.calculateProductTotal(newItem);
      });

      // Agrupar por moneda (antes de cargar tasas)
      const groupedResult = this.groupByCurrency(enrichedData);
      this.costDistributionComponent = groupedResult;

      // Cargar tasas de cambio para las monedas encontradas
      const currencies = this.getUniqueCurrencies(enrichedData);
      this.loadExchangeRates(currencies)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Recalcular agrupación con tasas cargadas
            const groupedWithRates = this.groupByCurrency(enrichedData);
            this.costDistributionComponent = groupedWithRates;
            this.sumEquivalentUsd(groupedWithRates);
          },
          error: (error) => {
            console.error('Error cargando tasas de cambio:', error);
            // Mantener datos sin tasas cargadas
          },
        });
    });
  }

  sumEquivalentUsd(groupedWithRates: CurrencyGroup[]) {
    // Calcular total general en USD
    this.totalEquivalentUsd = groupedWithRates.reduce(
      (sum, group) => sum + group.totalUsdEquivalent,
      0
    );
  }

  handleConfirm() {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('R_CONTRACTS_CONFIRM_MODAL_TITLE'),
        message: this.translate.instant(
          'R_CONTRACTS_CONFIRM_MODAL_DESCRIPTION'
        ),
        confirmText: this.translate.instant(
          'R_CONTRACTS_CONFIRM_DIALOG_BTN_CONFIRM'
        ),
        cancelText: this.translate.instant(
          'R_CONTRACTS_CONFIRM_DIALOG_CANCEL_BTN'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => result === true),
        takeUntil(this.destroy$)
      )
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.confirmContract();
        }
      });
  }

  returnToEdit() {
    this.editContract.emit(0);
  }

  public loadSelectedProject(): void {
    this.storeProject
      .selectedProject()
      .pipe(
        take(1),
        filter((state) => !!state.selectedProject),
        tap((state) => {
          this.projectSelected = state.selectedProject;
        })
      )
      .subscribe((_) => {});
  }

  sendNotificationToInternalReview() {
    this.contractsSvc.setLoading(true);
    this.notificationService
      .sendNotification({
        EntityType: WorkflowIdEntityType.BIDDING_CONTRACT,
        Id: this.contractData.id,
        ProjectBucketId: this.projectSelected.projectBucketId,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.contractsSvc.setLoading(false);
        })
      )
      .subscribe({
        next: () => {
          this.notificationBlobalService.showSuccess(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.SUCCESS_MESSAGE')
          );
        },
        error: (error) => {
          console.log(error);
          this.notificationBlobalService.showError(
            this.translate.instant('R.CONTRACT.NOTIFICATIONS.ERROR_MESSAGE')
          );
        },
      });
  }

  confirmContract() {
    this.contractsSvc.setLoading(true);
    this.contractApiSvc
      .putConfirmContractV3(this.contractData.id)
      .pipe(
        take(1),
        finalize(() => {
          this.contractsSvc.setLoading(false);
        })
      )
      .subscribe({
        next: () => {
          this.notificationBlobalService.showSuccess(
            this.translate.instant('R.CONTRACT.CONFIRMATION.SUCCESS_MESSAGE')
          );
          this.router.navigate(['../contracts'], {
            relativeTo: this.activatedRoute.parent,
          });
        },
        error: (error) => {
          console.log(error);

          this.notificationBlobalService.showError(
            this.translate.instant('R.CONTRACT.CONFIRMATION.ERROR_MESSAGE')
          );
        },
      });
  }

  openDetails(): void {
    const dialogData: BidderDetailDialog = {
      headerIcon: 'info',
      headerText: 'Detalle del Adjudicatario',
      bodyText: 'Información detallada del participante',
      bidderInfo: this.participantsAwarded,
      cancelBtnText: 'Cancelar',
      confirmBtnText: 'Aceptar',
    };

    this.dialog.open(RContractsBidderComponent, {
      data: dialogData,
      width: 'auto',
      maxHeight: '65vh',
      maxWidth: '90vw',
    });
  }

  downloadDoc(doc) {
    this.fileSvc.downloadFile(doc.id).subscribe(
      (res: ArrayBuffer) => {
        this.fileSaverService.save(
          new Blob([new Uint8Array(res).buffer]),
          doc.name
        );
      },
      (error) => {
        console.error('error', error);
      }
    );
  }

  /**
   * Establece la fecha de firma del contrato y recalcula tasas de cambio
   * Método para ser llamado desde el componente padre
   * @param date Fecha de firma en formato ISO o string
   */
  setContractSignDate(date: string): void {
    if (this.contractSignDate !== date) {
      this.contractSignDate = date;
      // Limpiar tasas previas
      this.exchangeRates.clear();
      // Recargar tasas con la nueva fecha
      if (this.costDistributionComponent.length > 0) {
        this.recalculateExchangeRates();
      }
    }
  }

  /**
   * Recalcula las tasas de cambio para todas las monedas existentes
   * Usado cuando cambia la fecha de firma del contrato
   */
  private recalculateExchangeRates(): void {
    const currencies = Array.from(
      new Set(this.costDistributionComponent.map((g) => g.currency))
    );

    this.loadExchangeRates(currencies)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Regenerar datos agrupados con nuevas tasas
          if (this.costDistributionComponent.length > 0) {
            // Encontrar los datos originales enriquecidos para reagrupar
            const enrichedItems = this.costDistributionComponent.reduce(
              (acc, g) => acc.concat(g.items),
              []
            );

            const regrouped = this.groupByCurrency(enrichedItems);
            this.costDistributionComponent = regrouped;
          }
        },
        error: (error) => {
          console.error('Error recalculando tasas de cambio:', error);
        },
      });
  }

  /**
   * Agrupa componentes por moneda y calcula totales incluyendo equivalente en USD
   * @param source Array de SourceItem enriquecidos con totales
   * @returns Array de grupos organizados por moneda con totales en original y USD
   */
  private groupByCurrency(source: SourceItem[]): Array<{
    currency: string;
    items: SourceItem[];
    totalComponent: number;
    totalIdb: number;
    totalLc: number;
    totalCf: number;
    totalUsdEquivalent: number;
  }> {
    const map = new Map<
      string,
      {
        items: SourceItem[];
        total: number;
        idb: number;
        lc: number;
        cf: number;
        usdEquivalent: number;
      }
    >();

    source.forEach((item) => {
      if (!item.currency) return;

      const enrichedItem = this.calculateProductTotal(item);

      if (!map.has(item.currency)) {
        map.set(item.currency, {
          items: [],
          total: 0,
          idb: 0,
          lc: 0,
          cf: 0,
          usdEquivalent: 0,
        });
      }

      const group = map.get(item.currency)!;
      group.items.push(enrichedItem);
      group.total += enrichedItem.totalCurrency;

      // Acumular IDB, LC y CF por separado
      enrichedItem.detail.forEach((detail: SourceDetail) => {
        group.idb += detail.idbTotal || 0;
        group.lc += detail.lcTotal || 0;
        group.cf += detail.cfTotal || 0;
      });
    });

    // Calcular equivalentes en USD para cada grupo
    return Array.from(map.entries()).map(([currency, data]) => {
      const usdEquivalent = this.calculateTotalUsdEquivalent(
        data.total,
        currency
      );

      return {
        currency,
        items: data.items,
        totalComponent: data.total,
        totalIdb: data.idb,
        totalLc: data.lc,
        totalCf: data.cf,
        totalUsdEquivalent: usdEquivalent,
      };
    });
  }

  private calculateProductTotal(
    item: SourceItem
  ): SourceItem & { totalCurrency: number } {
    const total = item.detail.reduce((acc: number, d: SourceDetail) => {
      return acc + (d.idbTotal || 0) + (d.lcTotal || 0) + (d.cfTotal || 0);
    }, 0);

    return {
      ...item,
      totalCurrency: total,
    };
  }

  /**
   * Extrae las monedas únicas de los componentes de costo distribuido
   * @param source Array de SourceItem con información de componentes
   * @returns Array de códigos de moneda únicos
   */
  private getUniqueCurrencies(source: SourceItem[]): string[] {
    const currencySet = new Set<string>();
    source.forEach((item) => {
      if (item.currency) {
        currencySet.add(item.currency);
      }
    });
    return Array.from(currencySet);
  }

  /**
   * Carga las tasas de cambio para todas las monedas en paralelo
   * Realiza requests simultáneos a la API de tasas de cambio
   * @param currencies Array de códigos de moneda a cargar
   * @returns Observable que se completa cuando todas las tasas se han cargado
   */
  private loadExchangeRates(currencies: string[]): Observable<void> {
    if (!this.contractSignDate || currencies.length === 0) {
      return of(void 0);
    }

    // Crear array de observables para cada moneda
    const exchangeRateRequests$: Observable<{
      currency: string;
      rate: number;
    }>[] = currencies
      .filter((currency) => currency !== 'USD') // No cargar tasa para USD (1:1)
      .map((currency) =>
        this.exchangeRateSvc.convertV2(this.contractSignDate!, currency).pipe(
          map((response: ExchangeRateResponse) => {
            // Ensure response has exchangeRate property
            const rate =
              response.exchangeRate !== undefined ? response.exchangeRate : 1;
            return {
              currency: currency,
              rate: rate,
            };
          }),
          catchError((error) => {
            console.error(
              `Error cargando tasa de cambio para ${currency}:`,
              error
            );
            this.notificationBlobalService.showError(
              this.translate.instant(
                'R.CONTRACT.COST_DISTRIBUTION.ERROR_EXCHANGE_RATE'
              )
            );
            // Retornar tasa por defecto en caso de error
            return of({ currency, rate: 1 });
          })
        )
      );

    // Si no hay monedas a cargar (o solo USD), completar inmediatamente
    if (exchangeRateRequests$.length === 0) {
      this.exchangeRates.set('USD', 1);
      return of(void 0);
    }

    // Ejecutar todos los requests en paralelo
    return forkJoin(exchangeRateRequests$).pipe(
      tap((results) => {
        // Almacenar las tasas cargadas
        results.forEach(({ currency, rate }) => {
          this.exchangeRates.set(currency, rate);
        });
        // USD siempre tiene tasa 1:1
        this.exchangeRates.set('USD', 1);
      }),
      map(() => void 0) // Convertir a Observable<void>
    );
  }

  /**
   * Calcula el equivalente en USD para un total en otra moneda
   * @param totalInCurrency Total en la moneda original
   * @param currency Código de la moneda
   * @returns Equivalente en USD redondeado a 2 decimales
   */
  private calculateTotalUsdEquivalent(
    totalInCurrency: number,
    currency: string
  ): number {
    const exchangeRate = this.exchangeRates.get(currency) || 1;
    const equivalent = totalInCurrency / exchangeRate;
    return Math.round(equivalent * 100) / 100; // Redondear a 2 decimales
  }
}
