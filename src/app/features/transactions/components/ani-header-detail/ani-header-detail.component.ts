import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Enums } from '@core/models';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AniHeaderDetail } from '../../models';

@Component({
  selector: 'fi-ani-header-detail',
  templateUrl: './ani-header-detail.component.html',
})
export class AniHeaderDetailComponent implements OnInit {
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;

  enumTransactionStatus = Enums.TransactionStatuses;
  transactionPrefix = 'OD';

  @Input() aniHeaderDetail: AniHeaderDetail;

  constructor() {}

  ngOnInit(): void {}

  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;

    if (element.offsetWidth < element.scrollWidth) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
}
