import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fi-title-description',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './title-description.component.html',
})
export class TitleDescriptionComponent {
  @Input() set title(key: string) {
    this._title = `PROCUREMENT.MILESTONES.${key}`;
  }
  @Input() set description(key: string) {
    this._description = `PROCUREMENT.MILESTONES.DESCRIPTION.${key}`;
  }
  _description: string;
  _title: string;
}
