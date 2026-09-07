import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CurrencyEnum } from '@core/models';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { createUIKITForm } from './ui-kit-form.form';

@Component({
  selector: 'fi-ui-kit',
  templateUrl: './ui-kit.component.html',
  styleUrls: ['./ui-kit.component.scss'],
})
export class UiKitComponent implements OnInit, AfterViewInit {
  constructor() {}

  public form = createUIKITForm();
  public listItems: Array<{ text: string; value: number }> = [
    { text: 'Small', value: 1 },
    { text: 'Medium', value: 2 },
    { text: 'Large', value: 3 },
  ];

  selectedValue;

  public listItems2: Array<string> = [
    'X-Small',
    'Small',
    'Medium',
    'Large',
    'X-Large',
    '2X-Large',
  ];

  ngOnInit() {
    this.form.get('radioRequiredCheckedError').markAllAsTouched();
  }

  ngAfterViewInit() {
    this.tooltipDir.show(this.btnTooltip.nativeElement);
  }

  public currencies: CurrencyEnum[] = [
    {
      currency: 'USD',
      id: '1',
      numberOfDecimals: 2,
      exchangeRate: 3.4,
    },
    {
      currency: 'PEN',
      id: '2',
      numberOfDecimals: 3,
    },
  ];

  @ViewChild(TooltipDirective)
  public tooltipDir: TooltipDirective;
  @ViewChild('btnTooltip') btnTooltip: ElementRef;
}
