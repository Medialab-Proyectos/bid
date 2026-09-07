import {
  Component,
  inject,
  OnInit,
  computed,
  Signal,
  OnDestroy,
  Input,
  signal,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  map,
  Observable,
  of,
  Subject,
  tap,
  startWith,
  distinctUntilChanged,
  takeUntil,
  filter,
  forkJoin,
  catchError,
} from 'rxjs';
import {
  Currency,
  ExchangeRateResponse,
  ProjectTask,
  ProjectTaskResponse,
} from '@core/models';
import {
  ExchangeRateApiService,
  ProjectsApiService,
} from '@core/services/apis';
import { FormType } from '@core/utils';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import {
  ContractComponent,
  ContractCostDitribution,
  ContractCurrency,
  ContractProduct,
  SourceItem,
} from '../../rebrand-form/models';
import {
  ComponentForm,
  ContractProductForm,
  createCurrencyForm,
} from '../../rebrand-form/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ContractDialogComponent } from '../contract-dialog/contract-dialog.component';
import { NotificationGlobalService } from '../../../../../../../../shared';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import { TranslateService } from '@ngx-translate/core';

// ============================================
// Tipo utilitario para hacer tipos parciales recursivamente
// ============================================

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

// ============================================
// Aliases de tipos usando los modelos existentes
// ============================================

type ContractProductValue = DeepPartial<ContractProduct>;
type ContractComponentValue = DeepPartial<ContractComponent>;
type ContractCurrencyValue = DeepPartial<ContractCurrency>;
type ContractCostDistributionValue = DeepPartial<ContractCostDitribution>;

// ============================================
// Interfaces para cálculos (estas son específicas del componente)
// ============================================

interface CurrencyCalculation {
  totalAmountBid: number;
  totalAmountCounterPart: number;
  totalAmountCofinancing: number;
  totalAmountEquivalent: number;
  currencyEquivalent: number;
  components: ComponentCalculation[];
}

interface ComponentCalculation {
  bidComponentTotalAmount: number;
  localCounterpartComponentAmount: number;
  cofinancingComponentAmount: number;
  totalComponentAmount: number;
  componentEquivalentCurrency: number;
  products: ProductCalculation[];
}

interface ProductCalculation {
  bidAmount: number;
  localCounterPartAmount: number;
  cofinancingAmount: number;
  totalAmount: number;
  productEquivalent: number;
}

interface CurrencyState {
  components$: Observable<ProjectTask[]>[];
  isExpanded: boolean;
  isLoading: boolean;
  previousCurrency: string | null;
  previousComponents: (string | null)[];
  previousProducts: Map<number, (string | null)[]>;
}

@Component({
  selector: 'fi-r-contracts-cost-distribution',
  templateUrl: './r-contracts-cost-distribution.component.html',
  styleUrls: ['./r-contracts-cost-distribution.component.scss'],
})
export class RContractsCostDistributionComponent implements OnInit, OnDestroy {
  private readonly notificationSvc = inject(NotificationGlobalService);
  private readonly exchangeRateSvc = inject(ExchangeRateApiService);
  private readonly contractsSvc = inject(ContractRebrandService);
  private readonly projectSvc = inject(ProjectsApiService);
  private readonly translate = inject(TranslateService);
  private readonly injector = inject(Injector);
  private readonly dialog = inject(MatDialog);

  // Inputs usando decorators tradicionales
  @Input() allCurrencies$!: Observable<Currency[]>;
  @Input() allProjectTasks$!: Observable<ProjectTask[]>;
  @Input() currenciesMap: any[] = [];
  @Input() currencyApprovalCode;
  @Input() form!: FormType<ContractCostDitribution>;
  @Input()
  set preloadedData(
    data: {
      structure: SourceItem[];
      products: Map<string, ProjectTask[]>;
    } | null
  ) {
    if (data) {
      this.loadPreloadedComponentsData(data.structure, data.products);
    }
  }

  // Constantes
  readonly MAXIMUM_CURRENCIES = 4;
  readonly mode: ProgressSpinnerMode = 'indeterminate';
  readonly color: ThemePalette = 'primary';

  // Estado reactivo
  private readonly currencyStates = signal<Map<number, CurrencyState>>(
    new Map()
  );
  private readonly destroy$ = new Subject<void>();
  readonly currencyCodeExchangeRate = signal<ExchangeRateResponse | null>(null);

  // Signals con tipos específicos
  formValue!: Signal<ContractCostDistributionValue>;
  formErrorNonZeroRows;
  currencyCalculations!: Signal<CurrencyCalculation[]>;
  totalEquivalent!: Signal<number>;
  contractSignDate!: Signal<string | null>;

  ngOnInit(): void {
    // Inicializar signals dentro del injection context
    runInInjectionContext(this.injector, () => {
      // Signal para la fecha de firma del contrato
      this.contractSignDate = toSignal(
        this.contractsSvc.contractSignDate$.pipe(
          filter((data) => data !== null),
          distinctUntilChanged()
        ),
        { initialValue: null }
      );

      // Signal del form value
      this.formValue = toSignal(
        this.form.valueChanges.pipe(
          startWith(this.form.value),
          distinctUntilChanged()
        ),
        { initialValue: this.form.value }
      );

      this.formErrorNonZeroRows = toSignal(
        this.form.statusChanges.pipe(
          startWith(this.form.status),
          map(() =>
            this.form.controls.currencies.controls.map((c) => {
              const hasError = c.controls.componentsArray.controls.some((co) =>
                co.controls.products.controls.some(
                  (p) => p.errors?.['totalAmountZero']
                )
              );

              return hasError ? { totalAmountZero: true } : null;
            })
          ),
          distinctUntilChanged(
            (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
          )
        ),
        { initialValue: [] }
      );

      // Computed signal para cálculos
      this.currencyCalculations = computed(() => {
        const formVal = this.formValue();
        if (!formVal?.currencies) return [];

        return formVal.currencies.map((currency) =>
          this.calculateCurrency(currency)
        );
      });

      // Computed signal para total
      this.totalEquivalent = computed(() => {
        const calculations = this.currencyCalculations();
        const total = calculations.reduce(
          (sum, calc) => sum + (calc?.currencyEquivalent ?? 0),
          0
        );
        return this.roundToDecimals(total, 2);
      });
    });
    const currentDate = this.contractSignDate();
    if (currentDate && this.currencyApprovalCode) {
      this.loadInitialApprovalExchangeRate(currentDate);
    }

    // Suscripción para recalcular tasas de cambio cuando cambia la fecha
    this.contractsSvc.contractSignDate$
      .pipe(
        filter((data) => data !== null && data !== ''),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((date) => {
        this.recalculateAllExchangeRates(date);
      });

    // Inicializar estados para las monedas existentes
    const currenciesLength = this.form.controls.currencies.length;
    for (let i = 0; i < currenciesLength; i++) {
      this.initializeCurrencyState(i);
    }
  }

  private loadInitialApprovalExchangeRate(date: string): void {
    this.exchangeRateSvc
      .convertV2(date, this.currencyApprovalCode)
      .pipe(
        catchError((error) => {
          console.error('Error loading initial approval exchange rate:', error);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((data: ExchangeRateResponse) => {
        this.currencyCodeExchangeRate.set(data);
        if (data?.exchangeRate != null) {
          this.currenciesList.controls.forEach((currencyGroup) => {
            currencyGroup.controls.equivalentUsdApproval.setValue(
              data.exchangeRate
            );
          });
        }
      });
  }

  private loadPreloadedComponentsData(
    source: SourceItem[],
    productsMap: Map<string, ProjectTask[]>
  ): void {
    const currencyGroups = this.groupByCurrency(source);

    currencyGroups.forEach(({ currency, items }, currencyIndex) => {
      const state = this.getCurrencyState(currencyIndex);

      if (state.components$.length > 0) {
        return;
      }

      state.previousCurrency = currency;
      state.previousComponents = [];
      state.previousProducts = new Map();

      items.forEach((item, componentIndex) => {
        const products = productsMap.get(item.componentId) || [];
        const products$ = of(products).pipe(takeUntil(this.destroy$));

        state.components$.push(products$);
        state.previousComponents.push(item.componentId);

        const previousProducts = item.detail.map((d) => d.productId);
        state.previousProducts.set(componentIndex, previousProducts);
      });

      this.updateCurrencyState(currencyIndex, state);
    });
  }

  private groupByCurrency(
    source: SourceItem[]
  ): Array<{ currency: string; items: SourceItem[] }> {
    const map = new Map<string, SourceItem[]>();
    source.forEach((item) => {
      if (!item.currency) return;

      if (!map.has(item.currency)) {
        map.set(item.currency, []);
      }
      map.get(item.currency)!.push(item);
    });
    return Array.from(map.entries()).map(([currency, items]) => ({
      currency,
      items,
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // Recálculo de tasas de cambio
  // ============================================

  private recalculateAllExchangeRates(date: string): void {
    const currenciesArray = this.currenciesList.controls;
    const exchangeRateRequests: Observable<{
      index: number;
      data: ExchangeRateResponse;
    }>[] = [];

    if (this.currencyApprovalCode) {
      this.loadInitialApprovalExchangeRate(date);
    }

    // Crear requests para todas las monedas que tienen un valor seleccionado
    currenciesArray.forEach((currencyGroup, index) => {
      const currencyValue = currencyGroup.controls.currency.value;
      if (currencyValue && currencyValue !== '') {
        const request$ = this.exchangeRateSvc
          .convertV2(date, currencyValue)
          .pipe(
            map((data) => ({ index, data: data as ExchangeRateResponse })),
            catchError((error) => {
              console.error(
                `Error recalculating exchange rate for currency ${currencyValue}:`,
                error
              );
              return of({ index, data: null as any });
            })
          );
        exchangeRateRequests.push(request$);
      }
    });

    // Si no hay requests, salir
    if (exchangeRateRequests.length === 0) {
      return;
    }

    // Mostrar loading en todas las monedas que se van a actualizar
    currenciesArray.forEach((currencyGroup, index) => {
      const currencyValue = currencyGroup.controls.currency.value;
      if (currencyValue && currencyValue !== '') {
        this.updateCurrencyState(index, { isLoading: true });
      }
    });

    // Ejecutar todas las peticiones en paralelo
    forkJoin(exchangeRateRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          results.forEach(({ index, data }) => {
            if (data && data.exchangeRate) {
              // Solo actualizar la tasa de cambio, NO limpiar montos
              this.updateCurrencyData(data, index);
            }
            this.updateCurrencyState(index, { isLoading: false });
          });

          /* this.notificationSvc.showSuccess(
            'Tasas de cambio actualizadas correctamente'
          ); */
        },
        error: (error) => {
          console.error('Error recalculating exchange rates:', error);
          this.notificationSvc.showError(
            'Error al actualizar las tasas de cambio'
          );

          // Remover loading de todas las monedas
          currenciesArray.forEach((currencyGroup, index) => {
            const currencyValue = currencyGroup.controls.currency.value;
            if (currencyValue && currencyValue !== '') {
              this.updateCurrencyState(index, { isLoading: false });
            }
          });
        },
      });
  }

  // ============================================
  // Gestión de Estado
  // ============================================

  private initializeCurrencyState(index: number): void {
    const currencyControl = this.currenciesList.at(index).controls.currency;
    const componentsArray = this.getComponentsArray(index);

    // Obtener valores previos de todos los componentes
    const previousComponents = componentsArray.controls.map(
      (c) => c.controls.component.value
    );

    const previousProductsMap = new Map<number, (string | null)[]>();
    componentsArray.controls.forEach((componentGroup, componentIndex) => {
      const productsArray = componentGroup.controls.products;
      const previousProducts = productsArray.controls.map(
        (p) => p.controls.output.value
      );
      previousProductsMap.set(componentIndex, previousProducts);
    });

    this.getCurrencyState(index);

    // Guardar el valor inicial de la moneda, componentes y productos
    this.updateCurrencyState(index, {
      previousCurrency: currencyControl.value,
      previousComponents: previousComponents,
      previousProducts: previousProductsMap,
    });
  }

  getCurrencyState(index: number): CurrencyState {
    const states = this.currencyStates();
    if (!states.has(index)) {
      states.set(index, {
        components$: [],
        isExpanded: true,
        isLoading: false,
        previousCurrency: null,
        previousComponents: [],
        previousProducts: new Map(),
      });
      this.currencyStates.set(new Map(states));
    }
    return states.get(index)!;
  }

  private updateCurrencyState(
    index: number,
    updates: Partial<CurrencyState>
  ): void {
    const states = this.currencyStates();
    const currentState = this.getCurrencyState(index);
    states.set(index, { ...currentState, ...updates });
    this.currencyStates.set(new Map(states));
  }

  // ============================================
  // Getters para acceso al FormArray
  // ============================================

  get currenciesList(): FormType<ContractCurrency[]> {
    return this.form.controls.currencies;
  }

  getComponentsArray(currencyIndex: number): FormType<ContractComponent[]> {
    return this.currenciesList.at(currencyIndex).controls.componentsArray;
  }

  getProductsArray(
    currencyIndex: number,
    componentIndex: number
  ): FormType<ContractProduct[]> {
    return this.getComponentsArray(currencyIndex).at(componentIndex).controls
      .products;
  }

  getCurrencyName(currencyIndex: number): string {
    return this.currenciesList
      .at(currencyIndex)
      ?.controls?.currency.getRawValue();
  }

  getCurrencyDecimal(currencyIndex: number): number {
    return this.currenciesList
      .at(currencyIndex)
      .controls.numberOfDecimal.getRawValue();
  }

  // ============================================
  // Métodos de Cálculo (puros)
  // ============================================

  private calculateCurrency(
    currency: ContractCurrencyValue
  ): CurrencyCalculation {
    if (!currency) {
      return this.emptyCalculation();
    }

    const equivalentUsd = currency.equivalentUsd ?? 0;
    const numberOfDecimal = currency.numberOfDecimal ?? 2;
    const componentsArray = currency.componentsArray ?? [];

    const components = componentsArray.map((comp) =>
      this.calculateComponent(comp, equivalentUsd, numberOfDecimal)
    );

    const totalAmountBid = this.roundToDecimals(
      components.reduce((sum, c) => sum + (c.bidComponentTotalAmount ?? 0), 0),
      numberOfDecimal
    );

    const totalAmountCounterPart = this.roundToDecimals(
      components.reduce(
        (sum, c) => sum + (c.localCounterpartComponentAmount ?? 0),
        0
      ),
      numberOfDecimal
    );

    const totalAmountCofinancing = this.roundToDecimals(
      components.reduce(
        (sum, c) => sum + (c.cofinancingComponentAmount ?? 0),
        0
      ),
      numberOfDecimal
    );

    const totalAmountEquivalent = this.roundToDecimals(
      totalAmountBid + totalAmountCounterPart + totalAmountCofinancing,
      numberOfDecimal
    );

    const currencyEquivalent = this.roundToDecimals(
      totalAmountEquivalent / (equivalentUsd || 1),
      numberOfDecimal
    );

    return {
      totalAmountBid,
      totalAmountCounterPart,
      totalAmountCofinancing,
      totalAmountEquivalent,
      currencyEquivalent,
      components,
    };
  }

  private calculateComponent(
    component: ContractComponentValue,
    currencyEquivalent: number,
    numberOfDecimal: number
  ): ComponentCalculation {
    if (!component?.products) {
      return this.emptyComponentCalculation();
    }

    const products = component.products.map((prod) =>
      this.calculateProduct(prod, currencyEquivalent, numberOfDecimal)
    );

    const bidComponentTotalAmount = this.roundToDecimals(
      products.reduce((sum, p) => sum + (p.bidAmount ?? 0), 0),
      numberOfDecimal
    );

    const localCounterpartComponentAmount = this.roundToDecimals(
      products.reduce((sum, p) => sum + (p.localCounterPartAmount ?? 0), 0),
      numberOfDecimal
    );

    const cofinancingComponentAmount = this.roundToDecimals(
      products.reduce((sum, p) => sum + (p.cofinancingAmount ?? 0), 0),
      numberOfDecimal
    );

    const totalComponentAmount = this.roundToDecimals(
      bidComponentTotalAmount +
        localCounterpartComponentAmount +
        cofinancingComponentAmount,
      numberOfDecimal
    );

    const componentEquivalentCurrency = this.roundToDecimals(
      totalComponentAmount / (currencyEquivalent || 1),
      numberOfDecimal
    );

    return {
      bidComponentTotalAmount,
      localCounterpartComponentAmount,
      cofinancingComponentAmount,
      totalComponentAmount,
      componentEquivalentCurrency,
      products,
    };
  }

  private calculateProduct(
    product: ContractProductValue,
    currencyEquivalent: number,
    numberOfDecimal: number
  ): ProductCalculation {
    const bidAmount = product?.bidAmount ?? 0;
    const localCounterPartAmount = product?.localCounterPartAmount ?? 0;
    const cofinancingAmount = product?.cofinancingAmount ?? 0;

    const totalAmount = this.roundToDecimals(
      bidAmount + localCounterPartAmount + cofinancingAmount,
      numberOfDecimal
    );

    const productEquivalent = this.roundToDecimals(
      totalAmount / (currencyEquivalent || 1),
      numberOfDecimal
    );

    return {
      bidAmount,
      localCounterPartAmount,
      cofinancingAmount,
      totalAmount,
      productEquivalent,
    };
  }

  private emptyCalculation(): CurrencyCalculation {
    return {
      totalAmountBid: 0,
      totalAmountCounterPart: 0,
      totalAmountCofinancing: 0,
      totalAmountEquivalent: 0,
      currencyEquivalent: 0,
      components: [],
    };
  }

  private emptyComponentCalculation(): ComponentCalculation {
    return {
      bidComponentTotalAmount: 0,
      localCounterpartComponentAmount: 0,
      cofinancingComponentAmount: 0,
      totalComponentAmount: 0,
      componentEquivalentCurrency: 0,
      products: [],
    };
  }

  private roundToDecimals(value: number, decimals: number): number {
    if (isNaN(value) || isNaN(decimals)) {
      return 0;
    }
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  // ============================================
  // CRUD Operations para Monedas
  // ============================================

  addCurrencies(): void {
    if (this.currenciesList.length >= this.MAXIMUM_CURRENCIES) {
      return;
    }

    const newCurrencyForm = createCurrencyForm();
    this.currenciesList.push(newCurrencyForm);

    const newIndex = this.currenciesList.length - 1;
    this.initializeCurrencyState(newIndex);

    if (newIndex > 0) {
      this.addComponent(newIndex);
    }
  }

  deleteCurrency(currencyIndex: number): void {
    if (
      currencyIndex < 0 ||
      currencyIndex >= this.currenciesList.length ||
      this.currenciesList.length <= 1
    ) {
      return;
    }

    const dialogRef = this.dialog.open(ContractDialogComponent, {
      data: {
        title: this.translate.instant(
          'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_DELETE_CURRENCY_TITLE'
        ),
        message: this.translate.instant(
          'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_DELETE_CURRENCY_MESSAGE'
        ),
        confirmText: this.translate.instant(
          'R.CONTRACT.COST_DISTRIBUTION.DELETE'
        ),
        cancelText: this.translate.instant(
          'R.CONTRACT.COST_DISTRIBUTION.CANCEL'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => result === true),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.performDeleteCurrency(currencyIndex);
      });
  }

  private performDeleteCurrency(currencyIndex: number): void {
    this.currenciesList.removeAt(currencyIndex);

    // Limpiar el estado
    const states = this.currencyStates();
    states.delete(currencyIndex);

    // Re-indexar estados
    const newStates = new Map<number, CurrencyState>();
    states.forEach((state, index) => {
      if (index > currencyIndex) {
        newStates.set(index - 1, state);
      } else if (index < currencyIndex) {
        newStates.set(index, state);
      }
    });

    this.currencyStates.set(newStates);
  }

  // ============================================
  // CRUD Operations para Componentes
  // ============================================

  addComponent(currencyIndex: number): void {
    const componentsArray = this.getComponentsArray(currencyIndex);
    componentsArray.push(ComponentForm());

    const state = this.getCurrencyState(currencyIndex);
    state.components$.push(of([]));

    // Actualizar el array de componentes previos
    const newComponentIndex = componentsArray.length - 1;
    state.previousComponents.push(null);

    state.previousProducts.set(newComponentIndex, []);

    this.updateCurrencyState(currencyIndex, state);

    this.addProduct(currencyIndex, newComponentIndex);
  }

  deleteComponent(currencyIndex: number, componentIndex: number): void {
    const dialogRef = this.dialog.open(ContractDialogComponent, {
      data: {
        title: this.translate.instant(
          'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_DELETE_COMPONENT_TITLE'
        ),
        message: this.translate.instant(
          'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_DELETE_COMPONENT_MESSAGE'
        ),
        confirmText: this.translate.instant(
          'R.CONTRACT.COST_DISTRIBUTION.DELETE'
        ),
        cancelText: this.translate.instant(
          'R.CONTRACT.COST_DISTRIBUTION.CANCEL'
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => result === true),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.performDeleteComponent(currencyIndex, componentIndex);
      });
  }

  private performDeleteComponent(
    currencyIndex: number,
    componentIndex: number
  ): void {
    const componentsArray = this.getComponentsArray(currencyIndex);
    componentsArray.removeAt(componentIndex);

    const state = this.getCurrencyState(currencyIndex);
    state.components$.splice(componentIndex, 1);
    state.previousComponents.splice(componentIndex, 1);

    state.previousProducts.delete(componentIndex);

    const newProductsMap = new Map<number, (string | null)[]>();
    state.previousProducts.forEach((products, index) => {
      if (index > componentIndex) {
        newProductsMap.set(index - 1, products);
      } else if (index < componentIndex) {
        newProductsMap.set(index, products);
      }
    });
    state.previousProducts = newProductsMap;

    this.updateCurrencyState(currencyIndex, state);
  }

  // ============================================
  // CRUD Operations para Productos
  // ============================================

  addProduct(currencyIndex: number, componentIndex: number): void {
    const productsArray = this.getProductsArray(currencyIndex, componentIndex);
    productsArray.push(ContractProductForm());

    const state = this.getCurrencyState(currencyIndex);
    if (!state.previousProducts.has(componentIndex)) {
      state.previousProducts.set(componentIndex, []);
    }
    state.previousProducts.get(componentIndex)!.push(null);
    this.updateCurrencyState(currencyIndex, state);
  }

  deleteProduct(
    currencyIndex: number,
    componentIndex: number,
    productIndex: number
  ): void {
    const productsArray = this.getProductsArray(currencyIndex, componentIndex);
    productsArray.removeAt(productIndex);

    const state = this.getCurrencyState(currencyIndex);
    const previousProducts = state.previousProducts.get(componentIndex);
    if (previousProducts) {
      previousProducts.splice(productIndex, 1);
      this.updateCurrencyState(currencyIndex, state);
    }
  }

  // ============================================
  // Handlers de Selección
  // ============================================

  selectCurrency(event: MatSelectChange, currencyIndex: number): void {
    const selectedCurrency = event.value;
    const currencyControl =
      this.currenciesList.at(currencyIndex).controls.currency;
    const state = this.getCurrencyState(currencyIndex);
    const previousCurrency = state.previousCurrency;

    // Validar duplicados con el nuevo valor
    const currencies = this.currenciesList.controls.map((c, idx) =>
      idx === currencyIndex
        ? selectedCurrency
        : c.controls.currency.getRawValue()
    );

    const duplicateIndex = this.findFirstDuplicateIndex(currencies, -1);
    if (duplicateIndex !== -1 && duplicateIndex === currencyIndex) {
      // Revertir al valor anterior
      currencyControl.setValue(previousCurrency, { emitEvent: false });
      this.resetCurrency(currencyIndex);
      return;
    }

    // Verificar si hay componentes y si el valor previo NO es null/undefined/''
    const componentsArray = this.getComponentsArray(currencyIndex);
    const hasPreviousValue =
      previousCurrency != null && previousCurrency !== '';

    if (componentsArray.length > 0 && hasPreviousValue) {
      // Mostrar modal de confirmación
      const dialogRef = this.dialog.open(ContractDialogComponent, {
        data: {
          title: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_CHANGE_CURRENCY_TITLE'
          ),
          message: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_CHANGE_CURRENCY_MESSAGE'
          ),
          confirmText: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONTINUE'
          ),
          cancelText: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CANCEL'
          ),
        },
      });

      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result === true) {
            const contractDate = this.contractSignDate();
            if (contractDate) {
              this.loadExchangeRate(
                selectedCurrency,
                currencyIndex,
                previousCurrency,
                contractDate
              );
            } else {
              this.notificationSvc.showError(
                this.translate.instant(
                  'R.CONTRACT.COST_DISTRIBUTION.ERROR_NO_SIGN_DATE'
                )
              );
              currencyControl.setValue(previousCurrency, {
                emitEvent: false,
              });
            }
          } else {
            currencyControl.setValue(previousCurrency, {
              emitEvent: false,
            });
          }
        });
    } else {
      const contractDate = this.contractSignDate();
      if (contractDate) {
        this.loadExchangeRate(
          selectedCurrency,
          currencyIndex,
          previousCurrency,
          contractDate
        );
      } else {
        this.notificationSvc.showError(
          this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.ERROR_NO_SIGN_DATE'
          )
        );
        currencyControl.setValue(previousCurrency, {
          emitEvent: false,
        });
      }
    }
  }

  private resetCurrency(currencyIndex: number): void {
    const currencyGroup = this.currenciesList.at(currencyIndex);
    currencyGroup.controls.currency.setValue(null);
    currencyGroup.controls.equivalentUsd.setValue(0);
    currencyGroup.controls.numberOfDecimal.setValue(0);
    currencyGroup.controls.componentsArray.clear();

    const state = this.getCurrencyState(currencyIndex);
    state.components$ = [];
    this.updateCurrencyState(currencyIndex, {
      components$: [],
      previousCurrency: null,
      previousComponents: [],
    });
  }

  private loadExchangeRate(
    currency: string,
    currencyIndex: number,
    previousCurrency: string | null,
    date: string
  ): void {
    this.updateCurrencyState(currencyIndex, { isLoading: true });

    this.exchangeRateSvc
      .convertV2(date, currency)
      .pipe(
        tap((data: ExchangeRateResponse) => {
          this.updateCurrencyData(data, currencyIndex);
          this.cleanAmounts(currencyIndex);
          this.updateCurrencyState(currencyIndex, {
            previousCurrency: currency,
          });
        }),
        tap(() =>
          this.updateCurrencyState(currencyIndex, { isLoading: false })
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (_) => {
          this.updateCurrencyState(currencyIndex, { isLoading: false });

          this.notificationSvc.showError(
            this.translate.instant(
              'R.CONTRACT.COST_DISTRIBUTION.ERROR_EXCHANGE_RATE'
            )
          );

          const currencyControl =
            this.currenciesList.at(currencyIndex).controls.currency;
          currencyControl.setValue(previousCurrency, { emitEvent: false });
        },
      });
  }

  private updateCurrencyData(
    data: ExchangeRateResponse,
    currencyIndex: number
  ): void {
    const currencyGroup = this.currenciesList.at(currencyIndex);
    currencyGroup.controls.equivalentUsd.setValue(data.exchangeRate);
    currencyGroup.controls.equivalentUsdApproval.setValue(
      this.currencyCodeExchangeRate()?.exchangeRate ?? 0
    );

    const currencyData = this.currenciesMap.find(
      (c) => c.currency === data.fromCurrency
    );
    if (currencyData) {
      currencyGroup.controls.numberOfDecimal.setValue(
        currencyData.numberOfDecimals
      );
    }
  }

  private cleanAmounts(currencyIndex: number): void {
    const componentsArray = this.getComponentsArray(currencyIndex);
    componentsArray.controls.forEach((componentGroup) => {
      const productsArray = componentGroup.controls.products;
      productsArray.controls.forEach((productGroup) => {
        productGroup.controls.bidAmount.setValue(null);
        productGroup.controls.cofinancingAmount.setValue(null);
        productGroup.controls.totalAmount.setValue(null);
        productGroup.controls.localCounterPartAmount.setValue(null);
      });
    });
  }

  selectComponent(
    event: MatSelectChange,
    currencyIndex: number,
    componentIndex: number
  ): void {
    const componentId = event.value;
    const componentsArray = this.getComponentsArray(currencyIndex);
    const componentControl =
      componentsArray.at(componentIndex).controls.component;

    const state = this.getCurrencyState(currencyIndex);
    const previousComponent = state.previousComponents[componentIndex];

    const actualComponents = componentsArray.controls.map(
      (c) => c.controls.component.value
    );
    const duplicatedIndex = this.findFirstDuplicateIndex(
      actualComponents,
      componentIndex
    );

    if (duplicatedIndex !== -1) {
      componentControl.setValue(previousComponent, { emitEvent: false });
      this.resetComponent(currencyIndex, componentIndex);
      return;
    }

    const productsArray = this.getProductsArray(currencyIndex, componentIndex);
    const hasPreviousValue =
      previousComponent != null && previousComponent !== '';

    if (productsArray.length > 0 && hasPreviousValue) {
      const dialogRef = this.dialog.open(ContractDialogComponent, {
        data: {
          title: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_CHANGE_COMPONENT_TITLE'
          ),
          message: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_CHANGE_COMPONENT_MESSAGE'
          ),
          confirmText: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONTINUE'
          ),
          cancelText: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CANCEL'
          ),
        },
      });

      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result === true) {
            state.previousComponents[componentIndex] = componentId;
            this.updateCurrencyState(currencyIndex, state);

            this.loadComponentProducts(
              componentId,
              currencyIndex,
              componentIndex
            );
          } else {
            componentControl.setValue(previousComponent, {
              emitEvent: false,
            });
          }
        });
    } else {
      state.previousComponents[componentIndex] = componentId;
      this.updateCurrencyState(currencyIndex, state);

      this.loadComponentProducts(componentId, currencyIndex, componentIndex);
    }
  }

  private resetComponent(currencyIndex: number, componentIndex: number): void {
    const componentGroup =
      this.getComponentsArray(currencyIndex).at(componentIndex);
    componentGroup.controls.component.setValue('');
    componentGroup.controls.products.clear();

    const state = this.getCurrencyState(currencyIndex);
    state.previousComponents[componentIndex] = null;

    state.previousProducts.set(componentIndex, []);

    this.updateCurrencyState(currencyIndex, state);
  }

  private loadComponentProducts(
    componentId: string,
    currencyIndex: number,
    componentIndex: number
  ): void {
    this.updateCurrencyState(currencyIndex, { isLoading: true });

    const state = this.getCurrencyState(currencyIndex);
    state.components$[componentIndex] = this.projectSvc
      .getProjectTasksChilds(componentId)
      .pipe(
        map((response: ProjectTaskResponse) => response.projectTasks),
        tap(() => {
          this.updateCurrencyState(currencyIndex, { isLoading: false });
          const productsArray = this.getProductsArray(
            currencyIndex,
            componentIndex
          );
          if (productsArray.length === 0) {
            this.addProduct(currencyIndex, componentIndex);
          }
        }),
        takeUntil(this.destroy$)
      );

    this.updateCurrencyState(currencyIndex, state);

    const productsArray = this.getProductsArray(currencyIndex, componentIndex);
    productsArray.clear();

    state.previousProducts.set(componentIndex, []);
    this.updateCurrencyState(currencyIndex, state);
  }

  selectProduct(
    currencyIndex: number,
    componentIndex: number,
    productIndex: number
  ): void {
    const event = arguments[3] as MatSelectChange;
    const selectedProductId = event.value;

    const productsArray = this.getProductsArray(currencyIndex, componentIndex);
    const productControl = productsArray.at(productIndex).controls.output;

    // Obtener el valor previo del estado guardado
    const state = this.getCurrencyState(currencyIndex);
    const previousProducts = state.previousProducts.get(componentIndex) || [];
    const previousProduct = previousProducts[productIndex];

    // Validar duplicados
    const actualProducts = productsArray.controls.map(
      (p) => p.controls.output.value
    );
    const duplicatedIndex = this.findFirstDuplicateIndex(
      actualProducts,
      productIndex
    );

    if (duplicatedIndex !== -1) {
      // Revertir al valor anterior
      productControl.setValue(previousProduct, { emitEvent: false });
      this.resetProduct(currencyIndex, componentIndex, productIndex);
      return;
    }

    // Verificar si hay montos ingresados y si el valor previo NO es null/undefined/''
    const hasPreviousValue = previousProduct != null && previousProduct !== '';
    const hasAmounts = this.productHasAmounts(
      currencyIndex,
      componentIndex,
      productIndex
    );

    // Solo mostrar modal si hay montos Y valor previo válido
    if (hasAmounts && hasPreviousValue) {
      // Mostrar modal de confirmación
      const dialogRef = this.dialog.open(ContractDialogComponent, {
        data: {
          title: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_CHANGE_PRODUCT_TITLE'
          ),
          message: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONFIRM_CHANGE_PRODUCT_MESSAGE'
          ),
          confirmText: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CONTINUE'
          ),
          cancelText: this.translate.instant(
            'R.CONTRACT.COST_DISTRIBUTION.CANCEL'
          ),
        },
      });

      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result === true) {
            // Actualizar el valor previo en el estado
            if (!state.previousProducts.has(componentIndex)) {
              state.previousProducts.set(componentIndex, []);
            }
            const products = state.previousProducts.get(componentIndex)!;
            products[productIndex] = selectedProductId;
            this.updateCurrencyState(currencyIndex, state);

            // Limpiar los montos del producto
            this.cleanProductAmounts(
              currencyIndex,
              componentIndex,
              productIndex
            );
          } else {
            // Revertir el cambio
            productControl.setValue(previousProduct, {
              emitEvent: false,
            });
          }
        });
    } else {
      // No hay montos o no había valor previo, actualizar directamente
      if (!state.previousProducts.has(componentIndex)) {
        state.previousProducts.set(componentIndex, []);
      }
      const products = state.previousProducts.get(componentIndex)!;
      products[productIndex] = selectedProductId;
      this.updateCurrencyState(currencyIndex, state);
    }
  }

  private productHasAmounts(
    currencyIndex: number,
    componentIndex: number,
    productIndex: number
  ): boolean {
    const productGroup = this.getProductsArray(
      currencyIndex,
      componentIndex
    ).at(productIndex);

    const bidAmount = productGroup.controls.bidAmount.value;
    const localAmount = productGroup.controls.localCounterPartAmount.value;
    const cofinancingAmount = productGroup.controls.cofinancingAmount.value;

    // Verificar si algún monto tiene un valor diferente de null/undefined/0
    return (
      (bidAmount != null && bidAmount !== 0) ||
      (localAmount != null && localAmount !== 0) ||
      (cofinancingAmount != null && cofinancingAmount !== 0)
    );
  }

  private cleanProductAmounts(
    currencyIndex: number,
    componentIndex: number,
    productIndex: number
  ): void {
    const productGroup = this.getProductsArray(
      currencyIndex,
      componentIndex
    ).at(productIndex);

    productGroup.controls.bidAmount.setValue(null);
    productGroup.controls.localCounterPartAmount.setValue(null);
    productGroup.controls.cofinancingAmount.setValue(null);
    productGroup.controls.totalAmount.setValue(null);
  }

  private resetProduct(
    currencyIndex: number,
    componentIndex: number,
    productIndex: number
  ): void {
    const productGroup = this.getProductsArray(
      currencyIndex,
      componentIndex
    ).at(productIndex);
    productGroup.controls.output.setValue('');

    // Resetear también el valor previo en el estado
    const state = this.getCurrencyState(currencyIndex);
    const previousProducts = state.previousProducts.get(componentIndex);
    if (previousProducts) {
      previousProducts[productIndex] = null;
      this.updateCurrencyState(currencyIndex, state);
    }
  }

  isComponentSelected(
    componentId: string,
    currencyIndex: number,
    excludeIndex: number
  ): boolean {
    const componentsArray = this.getComponentsArray(currencyIndex);
    return componentsArray.controls.some(
      (control, index) =>
        index !== excludeIndex &&
        control.controls.component.value === componentId
    );
  }

  isCurrencySelected(currency: string, excludeIndex: number): boolean {
    return this.currenciesList.controls.some(
      (control, index) =>
        index !== excludeIndex && control.controls.currency.value === currency
    );
  }

  isProductSelected(
    productId: string,
    currencyIndex: number,
    componentIndex: number,
    excludeIndex: number
  ): boolean {
    const productsArray = this.getProductsArray(currencyIndex, componentIndex);
    return productsArray.controls.some(
      (control, index) =>
        index !== excludeIndex && control.controls.output.value === productId
    );
  }

  // ============================================
  // Utilidades
  // ============================================

  private findFirstDuplicateIndex(
    arr: (string | null)[],
    excludeIndex: number = -1
  ): number {
    const seen = new Set<string>();
    for (const [index, value] of arr.entries()) {
      if (value === '' || value == null || index === excludeIndex) {
        continue;
      }
      if (seen.has(value)) {
        return index;
      }
      seen.add(value);
    }
    return -1;
  }

  collapseCurrency(currencyIndex: number): void {
    const state = this.getCurrencyState(currencyIndex);
    this.updateCurrencyState(currencyIndex, {
      isExpanded: !state.isExpanded,
    });
  }

  isLoading(currencyIndex: number): boolean {
    return this.getCurrencyState(currencyIndex).isLoading;
  }

  isExpanded(currencyIndex: number): boolean {
    return this.getCurrencyState(currencyIndex).isExpanded;
  }

  getComponentProducts(
    currencyIndex: number,
    componentIndex: number
  ): Observable<ProjectTask[]> {
    const state = this.getCurrencyState(currencyIndex);
    return state.components$[componentIndex] || of([]);
  }

  getProductControl(
    currencyIndex: number,
    componentIndex: number,
    productIndex: number
  ) {
    return this.form.controls.currencies.controls[currencyIndex].controls
      .componentsArray.controls[componentIndex].controls.products.controls[
      productIndex
    ].controls.output;
  }

  getCurrenciesTotalEquivalent(): number {
    return this.totalEquivalent();
  }
}
