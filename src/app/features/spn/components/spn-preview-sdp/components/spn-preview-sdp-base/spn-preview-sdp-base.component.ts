import { Component, inject, Input } from '@angular/core';
import { SpnType } from '@fiduciary-interface/app/features/spn/enums/spnNoticeType.enum';
import { SpnService } from '@fiduciary-interface/app/features/spn/services/bussiness/spn.service';

@Component({
  selector: 'fi-spn-preview-sdp-base',
  templateUrl: './spn-preview-sdp-base.component.html',
  styleUrls: ['./spn-preview-sdp-base.component.scss'],
})
export class SpnPreviewSdpBaseComponent {
  private spnService = inject(SpnService);

  spnType = SpnType;

  @Input()
  data: any;

  @Input()
  isSDOGoods: boolean;

  @Input()
  isSDONCSVC;

  lotsTableColumns = ['lotNumber', 'name', 'expectedTime', 'specifications'];

  getKeyByValue(value: string) {
    return this.spnService.getKeyByValue(value);
  }

  getValueOptions(options: any, id: string) {
    return this.spnService.getValueOptions(options, id);
  }

  getUnitOfTimeName(unitsOfTime: any, unitOfTimeId: string) {
    return this.spnService.getUnitOfTimeName(unitsOfTime, unitOfTimeId);
  }
}
