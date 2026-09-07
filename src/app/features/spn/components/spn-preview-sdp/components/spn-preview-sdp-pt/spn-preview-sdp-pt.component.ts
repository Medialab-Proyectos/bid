import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpnPreviewSdpBaseComponent } from '../spn-preview-sdp-base/spn-preview-sdp-base.component';

@Component({
  selector: 'fi-spn-preview-sdp-pt',
  templateUrl: './spn-preview-sdp-pt.component.html',
  styleUrls: ['./spn-preview-sdp-pt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpnPreviewSdpPtComponent extends SpnPreviewSdpBaseComponent {}
