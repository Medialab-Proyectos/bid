import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-accordion-panel',
  templateUrl: './accordion-panel.component.html',
})
export class AccordionPanelComponent {
  @Input() open = true;
  @Input() collapsible = true;
  @Input() mode: AccordionMode = 'normal';
  @Input() id: number;
}

type AccordionMode = 'normal' | 'slim';
