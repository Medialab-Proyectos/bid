import {
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Host,
  SkipSelf,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
  Validators,
  NgControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-time-picker',
  templateUrl: './time-picker.component.html',
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
  ],
})
export class TimePickerComponent
  implements ControlValueAccessor, Validator, OnDestroy, OnInit
{
  @Input() label: string = 'Hora (formato 24h)';

  timeControl = new FormControl('', [
    Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ]);

  disabled = false;
  isRequired = false;
  private subscription?: Subscription;

  // Callbacks para ControlValueAccessor
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Optional() @Host() @SkipSelf() private ngControl: NgControl) {}

  ngOnInit(): void {
    this.detectRequiredState();
    this.updateValidators();

    // Configurar la suscripción DESPUÉS de que el componente esté inicializado
    this.subscription = this.timeControl.valueChanges.subscribe((value) => {
      // Solo emitir cambios si tenemos una función onChange válida
      if (this.onChange) {
        this.onChange(value || '');
      }
    });
  }

  /**
   * Detecta si el control está marcado como required en el formulario padre
   */
  detectRequiredState(): void {
    if (this.ngControl && this.ngControl.control) {
      const parentValidators = this.ngControl.control.validator;
      if (parentValidators) {
        const validationErrors = parentValidators({} as AbstractControl);
        this.isRequired =
          validationErrors && validationErrors['required'] !== undefined;
      }
    }
  }

  updateValidators(): void {
    const validators = [Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)];

    if (this.isRequired) {
      validators.push(Validators.required);
    }

    this.timeControl.setValidators(validators);
    this.timeControl.updateValueAndValidity({ emitEvent: false });
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones untuk prevenir memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Implementación de ControlValueAccessor
  writeValue(value: string): void {
    // Actualiza el control cuando el formulario padre establece un valor
    if (this.timeControl) {
      this.timeControl.setValue(value || '', { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    // Verificar que el control existe antes de manipularlo
    if (this.timeControl) {
      if (isDisabled) {
        this.timeControl.disable({ emitEvent: false });
      } else {
        this.timeControl.enable({ emitEvent: false });
      }
    }
  }

  // Implementación de Validator
  validate(control: AbstractControl): ValidationErrors | null {
    // Si no tenemos timeControl todavía, retornar null
    if (!this.timeControl) {
      return null;
    }

    // Si el control padre tiene validador required, propagar ese estado
    if (control.validator) {
      const validationErrors = control.validator({} as AbstractControl);
      if (validationErrors && validationErrors['required'] !== undefined) {
        this.isRequired = true;
        this.updateValidators();
      }
    }

    if (this.isRequired && !this.timeControl.value) {
      return { required: true };
    }

    if (this.timeControl.errors && this.timeControl.errors['pattern']) {
      return { pattern: true };
    }

    return null;
  }

  // Para uso directo del componente si es necesario
  get value(): string {
    return this.timeControl?.value || '';
  }

  set value(value: string) {
    if (this.timeControl) {
      this.timeControl.setValue(value);
      if (this.onChange) {
        this.onChange(value);
      }
      this.onTouched();
    }
  }
}
