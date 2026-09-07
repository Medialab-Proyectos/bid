import { Component } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ModeEnum, PermissionEnum } from '@core/enums';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';
import { Observable } from 'rxjs';
import { createContractsForm } from '../../components/contracts-form/contracts-form.form';

@Component({
  selector: 'fi-contract-create-form',
  templateUrl: 'create-contract.component.html',
})
export class CreateContractComponent {
  form: UntypedFormGroup = createContractsForm();
  formErrorCollection: FormErrorTranslateKey[] = [];
  mode = ModeEnum.CREATE;
  public errorListTitle = 'CONTRACT.VALIDATION_ERRORS_TITLE';
  stateSubmit = 'create';

  contractAddPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  constructor(
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard
  ) {}

  updateErrorList(event) {
    this.formErrorCollection = event;
    if (this.formErrorCollection.length > 0) {
      document.getElementById('top').scrollIntoView();
    }
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }
}
