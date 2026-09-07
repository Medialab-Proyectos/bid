import { FormArray, FormControl, FormGroup } from '@angular/forms';

export type FormType<T> = T extends (infer U)[]
  ? U extends string | number | boolean
    ? FormControl<T>
    : FormArray<FormType<U>>
  : T extends Date
  ? FormControl<Date>
  : T extends boolean
  ? FormControl<boolean>
  : T extends object
  ? FormGroup<{ [K in keyof T]: FormType<T[K]> }>
  : FormControl<T>;
