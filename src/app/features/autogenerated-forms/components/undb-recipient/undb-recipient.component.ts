import {
  Component,
  forwardRef,
  inject,
  OnDestroy,
  Input,
  AfterViewInit,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  RecipientFormData,
  RecipientFormModel,
} from '../../models/recipient-form.model';
import { Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'fi-undb-recipient',
  templateUrl: './undb-recipient.component.html',
  styleUrls: ['./undb-recipient.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UndbRecipientComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => UndbRecipientComponent),
      multi: true,
    },
  ],
})
export class UndbRecipientComponent
  implements ControlValueAccessor, OnDestroy, AfterViewInit
{
  private fb = inject(NonNullableFormBuilder);

  private _isSubmitted: boolean = false;

  @Input() set isSubmitted(submitted: boolean) {
    this._isSubmitted = submitted;
    if (submitted) {
      this.recipientFormGroup.markAllAsTouched();
    }
  }

  @Input()
  set executorAgency(value: string) {
    if (value)
      this.recipientFormGroup.controls.executingAgency.patchValue(value);
  }

  get isSubmitted(): boolean {
    return this._isSubmitted;
  }

  recipientFormGroup: FormGroup<RecipientFormModel>;

  destroyed$ = new Subject<void>();

  constructor() {
    this.recipientFormGroup = this.fb.group<RecipientFormModel>({
      address: this.fb.control<string>('', [Validators.required]),
      executingAgency: this.fb.control<string>('', [Validators.required]),
      responsible: this.fb.control<string>('', [Validators.required]),
      phone: this.fb.control<string>(''),
      email: this.fb.control<string>('', [Validators.required]),
      website: this.fb.control<string>(''),
    });
  }

  ngAfterViewInit(): void {
    this.recipientFormGroup.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        tap((value: RecipientFormData) => this.onChange(value))
      )
      .subscribe();
  }

  private onChange: (value: RecipientFormData) => void;
  private onTouched: () => void;

  writeValue(obj: RecipientFormData): void {
    if (obj !== null) {
      this.recipientFormGroup.patchValue(obj);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled
      ? this.recipientFormGroup.disable()
      : this.recipientFormGroup.enable();
  }

  onBlur() {
    this.recipientFormGroup.markAsTouched();
    this.onTouched();
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.recipientFormGroup.invalid ? { recipientInvalid: true } : null;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
