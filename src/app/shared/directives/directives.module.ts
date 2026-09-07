import { NgModule } from '@angular/core';

import { DefaultDropdownValueDirective } from './default-dropdown-value.directive';
import { DisableControlDirective } from './disable-control.directive';
import { DisplayByPermissionsDirective } from './display-by-permissions/display-by-permissions.directive';
import { DisabledByActionsDirective } from './disabled-by-actions.directive';
import { DirectiveDropdownFormControl } from './dropdownFormControl.directive';
import { DirectiveDropdownModelControl } from './dropdownModelControl.directive';
import { MultiselectformcontrolDirective } from './multiselectFormControl.directive';

@NgModule({
  declarations: [
    DefaultDropdownValueDirective,
    DisableControlDirective,
    DisplayByPermissionsDirective,
    DisabledByActionsDirective,
    DirectiveDropdownFormControl,
    DirectiveDropdownModelControl,
    MultiselectformcontrolDirective,
  ],
  exports: [
    DefaultDropdownValueDirective,
    DisableControlDirective,
    DisplayByPermissionsDirective,
    DisabledByActionsDirective,
    DirectiveDropdownFormControl,
    DirectiveDropdownModelControl,
    MultiselectformcontrolDirective,
  ],
})
export class DirectivesModule {}
