import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-info-process-title',
  templateUrl: './info-process-title.component.html',
})
export class InfoProcessTitleComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() icon: string;
}
