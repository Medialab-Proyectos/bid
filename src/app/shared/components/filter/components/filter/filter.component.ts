import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  UntypedFormControl,
  UntypedFormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'fi-filter',
  templateUrl: './filter.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterComponent),
      multi: true,
    },
  ],
})
export class FilterComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  @Output() filterValue: EventEmitter<string> = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  @Input() placeholder = '';
  @Input() minLength = 5;

  textbox: any;
  @ViewChild('textBox') set input(_input: ElementRef) {
    this.textbox = _input;
  }

  formFilter = new UntypedFormGroup({
    filter: new UntypedFormControl('', []),
  });

  @Input() loading = null;

  defaultLoading = false;

  onChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  private readonly subscription = new Subscription();

  ngOnInit(): void {
    this.filterControlValueChanges();
  }

  filterControlValueChanges(): void {
    const subscription = this.filterControl.valueChanges
      .pipe(debounceTime(1000))
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.emitFilterValue(value);
      });
    this.subscription.add(subscription);
  }

  emitFilterValue(value: string): void {
    if (!value || value.length < this.minLength) {
      this.onChange('');
      this.filterValue.emit('');
      return;
    }

    this.setSpinner();
    this.onChange(value);
    this.filterValue.emit(value);
  }

  get filterControl(): UntypedFormControl {
    return this.formFilter.get('filter') as UntypedFormControl;
  }

  setSpinner(): void {
    this.defaultLoading = true;
    setTimeout(() => {
      this.defaultLoading = false;
    }, 300);
  }

  writeValue(value: unknown): void {
    this.filterControl.setValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.filterControl.disable();
    } else {
      this.filterControl.enable();
    }
  }

  clearValue(): void {
    this.filterControl.setValue('');
    this.textbox.input.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search.emit(this.filterControl.value);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
