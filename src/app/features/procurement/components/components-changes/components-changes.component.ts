import { Component, Input } from '@angular/core';
import { ComponentsChanges, OutputsChanges } from '../../models';

@Component({
  selector: 'fi-components-changes',
  templateUrl: './components-changes.component.html',
})
export class ComponentsChangesComponent {
  @Input() set changesComponents(value: ComponentsChanges) {
    this.previousComponentName = value?.previousValues.componentName;
    this.previousComponentsData = value?.previousValues.outputs;

    this.newComponentName = value?.newValues.componentName;
    this.newComponentsData = value?.newValues.outputs;
  }

  previousComponentName: string;
  previousComponentsData: OutputsChanges[];
  newComponentName: string;
  newComponentsData: OutputsChanges[];

  constructor() {}
}
