import { FormType } from '@core/utils';
import {
  BonusModel,
  Contract,
  ContractAditionalInfoModel,
  ContractBonusResponse,
  ContractComponent,
  ContractCostDitribution,
  ContractDamagesResponse,
  ContractExecutionPlace,
  ContractGeneralInfoResponse,
  ContractGuaranteeResponse,
  ContractLocationResponse,
  ContractLotResponse,
  ContractLotsModel,
  ContractParticipants,
  ContractPaymentScheduleResponse,
  ContractProduct,
  ContractsFeesModel,
  ContractsGeneralInfoModel,
  DamagesModel,
  ExecutionLocation,
  Fee,
  GuaranteeModel,
  Lots,
} from './models';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Currency, ProjectTask } from '@core/models';

export const PERCENTAGE_DAMAGES_MINIMUM = 0.01;
export const PERCENTAGE_DAMAGES_MAXIMUM = 1;
export const MAXIMUM_PERCENTAGE_DAMAGES_MINIMUM = 0.01;
export const MAXIMUM_PERCENTAGE_DAMAGES_MAXIMUM = 10;

export const PERCENTAGE_BONUS_MINIMUM = 0.01;
export const PERCENTAGE_BONUS_MAXIMUM = 1;
export const MAXIMUM_PERCENTAGE_BONUS_MINIMUM = 0.01;
export const MAXIMUM_PERCENTAGE_BONUS_MAXIMUM = 10;

export const EXECUTION_PLACE_ADRRESS_MAX_LENGTH = 300;
export const EXECUTION_PLACE_LOCALITY_MAX_LENGTH = 300;
export const EXECUTION_PLACE_POSTAL_CODE_MAX_LENGTH = 50;

export const GENERAL_INFORMATION_NAME_MAX_LENGHT = 200;
export const GENERAL_INFORMATION_OBJECTIVE = 500;
export const GENERAL_INFORMATION_INTERNAL_NUMBER = 100;
export const GENERAL_INFORMATION_APPLICABLE_LAW = 500;
export const GENERAL_INFORMATION_JUSTIFICATION_MAX_LENGTH = 300;
export const GENERAL_INFORMATION_CONFLICT_JUSTIFICATION_MAX_LENGT = 200;

const MIN_NUMBER = 0;

export function createExecutionPlaceForm(): FormType<ContractExecutionPlace> {
  return new FormGroup({
    locations: new FormArray([createLocationForm()]),
  });
}

export function createLocationForm(
  location?: ContractLocationResponse
): FormType<ExecutionLocation> {
  return new FormGroup({
    address: new FormControl<string>(location?.address ?? '', [
      Validators.required,
      Validators.maxLength(EXECUTION_PLACE_ADRRESS_MAX_LENGTH),
    ]),
    country: new FormControl<string>(location?.countryCode ?? '', [
      Validators.required,
    ]),
    zipCode: new FormControl<string>(location?.postalCode ?? '', [
      Validators.maxLength(EXECUTION_PLACE_POSTAL_CODE_MAX_LENGTH),
    ]),
    id: new FormControl<string>(''),
    locality: new FormControl<string>(location?.locality ?? null, [
      Validators.maxLength(EXECUTION_PLACE_LOCALITY_MAX_LENGTH),
    ]),
  });
}

export function defaultCurrency(): FormType<ContractCostDitribution> {
  return new FormGroup({
    currencies: new FormArray([
      new FormGroup({
        currency: new FormControl<string>(null, [Validators.required]),
        componentsArray: new FormArray(
          [
            new FormGroup({
              component: new FormControl<string>(null, [Validators.required]),
              products: new FormArray(
                [ContractProductForm()],
                [minLengthArray(1)]
              ),
              totalAmountBid: new FormControl<number>(null),
              totalCounterpartAmount: new FormControl<number>(0),
              totalCofinaningAmount: new FormControl<number>(0),
              totalAmount: new FormControl<number>(0),
              totalEquivalentAmount: new FormControl<number>(0),
            }),
          ],
          [minLengthArray()]
        ),
        equivalentUsd: new FormControl<number>(0),
        numberOfDecimal: new FormControl<number>(0),
        totalAmountBid: new FormControl<number>(0),
        totalCounterpartAmount: new FormControl<number>(0),
        totalCofinaningAmount: new FormControl<number>(0),
        totalAmount: new FormControl<number>(0),
        totalEquivalentAmount: new FormControl<number>(0),
        equivalentUsdApproval: new FormControl<number>(0),
      }),
    ]),
  });
}

//TODO type
export function createCurrencyForm(data?: any): FormGroup {
  return new FormGroup({
    currency: new FormControl<string>(data?.currency ?? null, [
      Validators.required,
    ]),
    componentsArray: new FormArray<any>([], [minLengthArray()]),
    equivalentUsd: new FormControl<number>(data?.equivalentUsd ?? 0),
    numberOfDecimal: new FormControl<number>(data?.numberOfDecimal ?? 0),
    totalAmount: new FormControl<number>(data?.totalAmount ?? 0),
    totalAmountBid: new FormControl<number>(data?.totalAmountBid ?? 0),
    totalCofinaningAmount: new FormControl<number>(
      data?.totalCofinaningAmount ?? 0
    ),
    totalCounterpartAmount: new FormControl<number>(
      data?.totalCounterpartAmount ?? 0
    ),
    totalEquivalentAmount: new FormControl<number>(
      data?.totalEquivalentAmount ?? 0
    ),
    equivalentUsdApproval: new FormControl<number>(0),
  });
}

export function paymentForm(): FormType<ContractPaymentScheduleResponse> {
  return new FormGroup({
    paymentNumber: new FormControl<number>(0, [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    estimatedDate: new FormControl<string>('', [Validators.required]),
    componentId: new FormControl<string>('', [Validators.required]),
    productId: new FormControl<string>('', [Validators.required]),
    paymentRequestTypeId: new FormControl<number>(null, [Validators.required]),
    currency: new FormControl<string>('', [Validators.required]),
    idbAmount: new FormControl<number>(0, [Validators.required]),
    lcAmount: new FormControl<number>(0, [Validators.required]),
    cfAmount: new FormControl<number>(0, [Validators.required]),
    paymentAmount: new FormControl<number>(0, [Validators.required]),
  });
}

export function ProjectTaskForm(): FormType<ProjectTask> {
  return new FormGroup({
    id: new FormControl<string>(''),
    name: new FormControl<string>(''),
    type: new FormControl<number>(0),
    executionWbs: new FormControl<string>(''),
    estimatedStartDate: new FormControl<string>(''),
    estimatedEndDate: new FormControl<string>(''),
    actualStartDate: new FormControl<string>(''),
    actualEndDate: new FormControl<string>(''),
    bidEstimatedAmount: new FormControl<number>(0),
    localCounterpartAmount: new FormControl<number>(0),
    coFinancingAmount: new FormControl<number>(0),
    totalEstimatedAmount: new FormControl<number>(0),
    bidActualCost: new FormControl<number>(0),
    localCounterpartActualCost: new FormControl<number>(0),
    coFinancingActualCost: new FormControl<number>(0),
    totalActualAmount: new FormControl<number>(0),
    currency: new FormControl<string>(''),
    status: new FormControl<number>(0),
  });
}

//TODO type
export function ContractProductForm(data?: any): FormType<ContractProduct> {
  return new FormGroup(
    {
      output: new FormControl<string>(data?.output ?? null, [
        Validators.required,
      ]),
      bidAmount: new FormControl<number>(data?.bidAmount ?? 0, [
        Validators.required,
      ]),
      localCounterPartAmount: new FormControl<number>(
        data?.localCounterPartAmount ?? 0,
        [Validators.required]
      ),
      cofinancingAmount: new FormControl<number>(data?.cofinancingAmount ?? 0, [
        Validators.required,
      ]),
      totalAmount: new FormControl<number>(data?.totalAmount ?? null),
      totalEquivalent: new FormControl<number>(data?.totalEquivalent ?? null),
    },
    productAmountValidator()
  );
}

export function CurrencyForm(): FormType<Currency> {
  const form = new FormGroup({
    currency: new FormControl<string>(''),
    isBorrowing: new FormControl<boolean>(false),
    isHard: new FormControl<boolean>(false),
    numberOfDecimals: new FormControl<number>(0),
  });
  return form as FormType<Currency>;
}

//TODO type
export function ComponentForm(data?: any): FormType<ContractComponent> {
  return new FormGroup({
    component: new FormControl<string>(data?.component ?? '', [
      Validators.required,
    ]),
    totalAmount: new FormControl<number>(data?.totalAmount ?? 0),
    totalAmountBid: new FormControl<number>(data?.totalAmountBid ?? 0),
    totalCofinaningAmount: new FormControl<number>(
      data?.totalCofinaningAmount ?? 0
    ),
    totalEquivalentAmount: new FormControl<number>(
      data?.totalEquivalentAmount ?? 0
    ),
    totalCounterpartAmount: new FormControl<number>(
      data?.totalCounterpartAmount ?? 0
    ),
    products: new FormArray([], [minLengthArray(1)]),
  });
}

export function minLengthArray(minLength: number = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const array = control as FormArray;

    if (array.length < minLength) {
      return {
        minLengthArray: 'error',
      };
    }

    return null;
  };
}

export function defaultParticipants(): FormType<ContractParticipants> {
  return new FormGroup({
    selectedParticipantId: new FormControl<string>('', Validators.required),
  });
}

export function defaultContractGeneralInfo(
  isGoods: boolean,
  isOther: boolean,
  generalInfo?: ContractGeneralInfoResponse
): FormType<ContractsGeneralInfoModel> {
  const baseControls = {
    contractName: new FormControl(generalInfo?.name ?? null, [
      Validators.required,
      Validators.maxLength(GENERAL_INFORMATION_NAME_MAX_LENGHT),
    ]),
    contractObjective: new FormControl(generalInfo?.objective ?? '', [
      Validators.required,
      Validators.maxLength(GENERAL_INFORMATION_OBJECTIVE),
    ]),
    signatureDate: new FormControl(generalInfo?.signatureDate ?? null, [
      Validators.required,
      maxDate(new Date()),
    ]),
    startDate: new FormControl(generalInfo?.startDate ?? null, [
      Validators.required,
      dateGreaterEqualThan<ContractsGeneralInfoModel>(
        'signatureDate',
        'mustBeAfterSignature'
      ),
    ]),
    endDate: new FormControl(generalInfo?.endDate ?? null, [
      Validators.required,
      dateGreaterEqualThan<ContractsGeneralInfoModel>(
        'startDate',
        'mustBeAfterStart'
      ),
    ]),
    internalControlNumber: new FormControl(
      generalInfo?.internalControlNumber ?? null,
      [Validators.maxLength(GENERAL_INFORMATION_INTERNAL_NUMBER)]
    ),
    contractType: new FormControl(generalInfo?.contractType ?? null, [
      Validators.required,
    ]),
    hasAdvancePayment: new FormControl(
      generalInfo?.hasAdvancedPayment ?? false,
      [Validators.required]
    ),
    conflictResolutionMethod: new FormControl<number>(
      generalInfo?.conflictResolutionMethod ?? null,
      [Validators.required]
    ),
    applicableLaw: new FormControl(generalInfo?.applicableLaw ?? null, [
      Validators.required,
      Validators.maxLength(GENERAL_INFORMATION_APPLICABLE_LAW),
    ]),
    justification: new FormControl(
      generalInfo?.justification ?? null,
      isOther
        ? [
            Validators.required,
            Validators.maxLength(GENERAL_INFORMATION_JUSTIFICATION_MAX_LENGTH),
          ]
        : []
    ),
    conflictResolutionJustification: new FormControl(
      generalInfo?.conflictResolutionJustification ?? null,
      [
        Validators.maxLength(
          GENERAL_INFORMATION_CONFLICT_JUSTIFICATION_MAX_LENGT
        ),
      ] // validadores dinámicos, se manejan en el componente
    ),
  };

  const controls = isGoods
    ? {
        ...baseControls,
        goodsSource: new FormControl(
          generalInfo?.goodsOrigin ?? [],
          arrayLength(1, 3)
        ),
      }
    : baseControls;

  return new FormGroup(controls) as FormType<ContractsGeneralInfoModel>;
}

export function createGuaranteeForm(
  guarantee?: ContractGuaranteeResponse
): FormType<GuaranteeModel> {
  return new FormGroup({
    guaranteeType: new FormControl<number>(
      guarantee?.guaranteeTypeId ?? null,
      Validators.required
    ),
    currency: new FormControl<string>(
      guarantee?.currency ?? null,
      Validators.required
    ),
    amount: new FormControl<number>(
      guarantee?.amount ?? null,
      Validators.required
    ),
    usdEquivalentAmount: new FormControl<number>(
      guarantee?.usdEquivalentAmount ?? null,
      Validators.required
    ),
    startDate: new FormControl<string>(
      guarantee?.issueDate ?? null,
      Validators.required
    ),
    endDate: new FormControl<string>(guarantee?.endDate ?? null, [
      Validators.required,
      dateGreaterThan<GuaranteeModel>('startDate', 'endDateMustBeGreater'),
    ]),
  });
}

export function createBonusForm(
  bonus?: ContractBonusResponse
): FormType<BonusModel> {
  return new FormGroup({
    liquidatedDamageType: new FormControl<number>(
      bonus?.bonusTypeId ?? null,
      Validators.required
    ),
    paymentFrequencyType: new FormControl<number>(
      bonus?.paymentFrequencyTypeId ?? null,
      Validators.required
    ),
    percentage: new FormControl<number>(bonus?.percentage ?? null, [
      Validators.min(PERCENTAGE_BONUS_MINIMUM),
      Validators.max(PERCENTAGE_BONUS_MAXIMUM),
      Validators.required,
    ]),
    maximumPercentage: new FormControl<number>(
      bonus?.maximumPercentage ?? null,
      [
        Validators.min(MAXIMUM_PERCENTAGE_BONUS_MINIMUM),
        Validators.max(MAXIMUM_PERCENTAGE_BONUS_MAXIMUM),
        Validators.required,
      ]
    ),
  });
}

export function createDamagesForm(
  damage?: ContractDamagesResponse
): FormType<DamagesModel> {
  return new FormGroup({
    liquidatedDamageType: new FormControl<number>(
      damage?.paymentFrequencyTypeId ?? null,
      Validators.required
    ),
    paymentFrequencyType: new FormControl<number>(
      damage?.paymentFrequencyTypeId ?? null,
      Validators.required
    ),
    percentage: new FormControl<number>(damage?.percentage ?? null, [
      Validators.min(PERCENTAGE_DAMAGES_MINIMUM),
      Validators.max(PERCENTAGE_DAMAGES_MAXIMUM),
      Validators.required,
    ]),
    maximumPercentage: new FormControl<number>(
      damage?.maximumPercentage ?? null,
      [
        Validators.min(MAXIMUM_PERCENTAGE_DAMAGES_MINIMUM),
        Validators.max(MAXIMUM_PERCENTAGE_DAMAGES_MAXIMUM),
        Validators.required,
      ]
    ),
  });
}

export function createLotForm(
  allowedCurrencies: string[],
  lot?: ContractLotResponse
): FormType<Lots> {
  return new FormGroup({
    name: new FormControl(lot?.lotNumber ?? null, [Validators.required]),
    amount: new FormControl(lot?.amount ?? null, [
      Validators.required,
      Validators.min(MIN_NUMBER),
    ]),
    currency: new FormControl<string>(lot?.currency ?? null, [
      Validators.required,
      currencyValidator(allowedCurrencies),
    ]),
    unit: new FormControl<number>(lot?.unit ?? null, [Validators.required]),
  });
}

export function createFeeForm(fee?: Fee): FormType<Fee> {
  return new FormGroup({
    concept: new FormControl<string>(fee?.concept ?? '', [Validators.required]),
    hours: new FormControl<number>(fee?.hours ?? null, [
      Validators.required,
      Validators.min(0),
    ]),
    currency: new FormControl<string>(fee?.currency ?? '', [
      Validators.required,
    ]),
    usdEquivalent: new FormControl<number>(fee?.usdEquivalent ?? null, [
      Validators.required,
      Validators.min(0),
    ]),
    subtotal: new FormControl<number>(fee?.subtotal ?? 0, [
      Validators.required,
    ]),
  });
}

export function defaultContractLots(): FormType<ContractLotsModel> {
  return new FormGroup({
    lots: new FormArray([]),
  });
}

export function defaultContractsFees(): FormType<ContractsFeesModel> {
  return new FormGroup({
    fees: new FormArray([]),
  });
}

export function defaultContractAdditionalInfo(): FormType<ContractAditionalInfoModel> {
  return new FormGroup({
    guarantees: new FormArray([]),
    bonus: new FormArray([]),
    damages: new FormArray([]),
  });
}

export function firstContractStep(
  isGoods: boolean,
  isOther: boolean
): FormType<Contract> {
  return new FormGroup({
    participants: defaultParticipants(),
    generalInfo: defaultContractGeneralInfo(isGoods, isOther),
    lots: defaultContractLots(),
    fees: defaultContractsFees(),
    costDistribution: defaultCurrency(),
    executionPlace: createExecutionPlaceForm(),
    additionalInformation: defaultContractAdditionalInfo(),
  });
}

export function maxDate(maxDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const controlDate = new Date(control.value);
    return controlDate <= maxDate
      ? null
      : { maxDate: { max: maxDate, actual: controlDate } };
  };
}

export function dateGreaterThan<T = any>(
  compareControlName: keyof T,
  errorName: string = 'dateGreaterThan'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !control.parent) return null;

    const compareControl = control.parent.get(compareControlName as string);
    if (!compareControl || !compareControl.value) return null;

    const currentDate = new Date(control.value);
    const compareDate = new Date(compareControl.value);

    return currentDate > compareDate ? null : { [errorName]: true };
  };
}

export function dateGreaterEqualThan<T = any>(
  compareControlName: keyof T,
  errorName: string = 'dateGreaterEqualThan'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !control.parent) return null;

    const compareControl = control.parent.get(compareControlName as string);
    if (!compareControl || !compareControl.value) return null;

    const currentDate = new Date(control.value);
    const compareDate = new Date(compareControl.value);

    return currentDate >= compareDate ? null : { [errorName]: true };
  };
}

export function arrayLength(
  min?: number,
  max?: number,
  errorName: string = 'arrayLength'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    if (!Array.isArray(control.value)) {
      return { [errorName]: { message: 'Value must be an array' } };
    }
    const length = control.value.length;
    if (min !== undefined && length < min) {
      return {
        [errorName]: {
          min,
          actual: length,
          message: `Array must have at least ${min} element(s)`,
        },
      };
    }
    if (max !== undefined && length > max) {
      return {
        [errorName]: {
          max,
          actual: length,
          message: `Array must have at most ${max} element(s)`,
        },
      };
    }
    return null;
  };
}

export function currencyValidator(allowedCurrencies: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const isValid = allowedCurrencies.includes(control.value);
    return isValid ? null : { invalidCurrency: { value: control.value } };
  };
}

export function currencyTotalValidator(
  currenciesList: { currency: string; total: number }[]
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormArray)) {
      return null;
    }

    const lotsArray = control as FormArray<FormType<Lots>>;

    // Agrupar amounts por moneda
    const currencyTotals = new Map<string, number>();

    lotsArray.controls.forEach((lotControl) => {
      const currency = lotControl.get('currency')?.value;
      const amount = lotControl.get('amount')?.value;

      if (currency && amount != null) {
        const currentTotal = currencyTotals.get(currency) || 0;
        currencyTotals.set(currency, currentTotal + amount);
      }
    });

    // Validar que ninguna moneda exceda su límite
    const exceededCurrencies: {
      currency: string;
      total: number;
      limit: number;
    }[] = [];

    currencyTotals.forEach((total, currency) => {
      const currencyLimit = currenciesList.find((c) => c.currency === currency);
      if (currencyLimit && total > currencyLimit.total) {
        exceededCurrencies.push({
          currency,
          total,
          limit: currencyLimit.total,
        });
      }
    });

    return exceededCurrencies.length > 0
      ? { currencyTotalExceeded: exceededCurrencies }
      : null;
  };
}

export function advancePaymentGuaranteeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null;
    }

    const formGroup = control as FormType<Contract>;

    const hasAdvancePayment =
      formGroup.controls?.generalInfo?.controls?.hasAdvancePayment?.value;
    const guarantees =
      formGroup.controls.additionalInformation.controls.guarantees;

    if (guarantees?.hasError('advancePaymentRequired')) {
      const errors = { ...guarantees.errors };
      delete errors['advancePaymentRequired'];
      guarantees.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }

    if (
      hasAdvancePayment === true &&
      (!guarantees || guarantees.length === 0)
    ) {
      guarantees?.setErrors({
        ...guarantees.errors,
        advancePaymentRequired: true,
      });

      return {
        advancePaymentRequiresGuarantee: true,
      };
    }

    return null;
  };
}

function productAmountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormType<ContractProduct>;
    const amountControls = {
      bid: formGroup.controls.bidAmount,
      local: formGroup.controls.localCounterPartAmount,
      cofinancing: formGroup.controls.cofinancingAmount,
    };

    const total =
      (amountControls.bid?.value ?? 0) +
      (amountControls.local?.value ?? 0) +
      (amountControls.cofinancing?.value ?? 0);

    const shouldValidate =
      !!formGroup.controls.output.value || formGroup.controls.output.dirty;

    if (total <= 0 && shouldValidate) {
      return setAmountErrors(Object.values(amountControls), {
        totalAmountZero: true,
      });
    }

    clearAmountErrors(Object.values(amountControls), 'totalAmountZero');
    return null;
  };
}

function setAmountErrors(
  controls: AbstractControl[],
  error: ValidationErrors
): ValidationErrors {
  controls.forEach((ctrl) => {
    if (ctrl) {
      ctrl.setErrors({ ...ctrl.errors, ...error });
    }
  });
  return error;
}

function clearAmountErrors(
  controls: AbstractControl[],
  errorKey: string
): void {
  controls.forEach((ctrl) => {
    if (ctrl?.hasError(errorKey)) {
      const errors = { ...ctrl.errors };
      delete errors[errorKey];
      ctrl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  });
}
