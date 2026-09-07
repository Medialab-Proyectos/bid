import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { LinkedDocumentsFormModel } from '../../models/linked-documents.model';

@Component({
  selector: 'fi-undb-linked-documents',
  templateUrl: './undb-linked-documents.component.html',
  styleUrls: ['./undb-linked-documents.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UndbLinkedDocumentsComponent),
    },
  ],
})
export class UndbLinkedDocumentsComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  private fb = inject(NonNullableFormBuilder);

  @Input() title = 'UNDB.LINKED_DOCUMENTS.TITLE';

  @Input() subtitle = 'UNDB.LINKED_DOCUMENTS.SUBTITLE';

  @Input() label = 'UNDB.LINKED_DOCUMENTS.LABEL';

  linkedDocumentsFormGroup: FormGroup<LinkedDocumentsFormModel>;
  destroyed$ = new Subject<void>();

  private onChange: (value: string[]) => void;
  private onTouched: () => void;

  urlRegex = new RegExp(
    '^(https?|ftp):\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$'
  );

  constructor() {
    this.linkedDocumentsFormGroup = this.fb.group<LinkedDocumentsFormModel>({
      linkedDocuments: this.fb.array<FormControl<string>>([
        this.fb.control<string>('', [Validators.pattern(this.urlRegex)]),
      ]),
    });
  }

  ngAfterViewInit(): void {
    this.documentsFormArray.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        tap((value) => {
          // Filter out empty strings since the API will throw validation errors for empty strings
          let filteredValue = value.filter((value) => !!value);
          this.onChange(filteredValue);
        })
      )
      .subscribe();
  }

  get documentsFormArray(): FormArray<FormControl<string>> {
    return this.linkedDocumentsFormGroup.controls.linkedDocuments;
  }

  addDocument() {
    this.documentsFormArray.push(
      new FormControl<string>('', [Validators.pattern(this.urlRegex)])
    );
  }

  deleteDocument(index: number) {
    this.documentsFormArray.removeAt(index);
  }

  writeValue(value: string[]): void {
    if (Array.isArray(value)) {
      this.documentsFormArray.clear();

      value.forEach((val) => {
        this.documentsFormArray.push(
          this.fb.control(val, [Validators.pattern(this.urlRegex)])
        );
      });

      if (value.length === 0) {
        this.documentsFormArray.push(
          this.fb.control('', [Validators.pattern(this.urlRegex)])
        );
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onBlur() {
    this.onTouched();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
