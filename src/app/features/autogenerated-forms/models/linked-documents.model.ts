import { FormArray, FormControl } from "@angular/forms"

export type LinkedDocumentsFormModel = {
    linkedDocuments: FormArray<FormControl<string>>
}
