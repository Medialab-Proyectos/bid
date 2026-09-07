import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'fi-status-label',
  templateUrl: './status-label.component.html',
  providers: [TranslatePipe],
})
export class StatusLabelComponent {
  @Input() cssClass: string;
  @Input() text: string;
}
