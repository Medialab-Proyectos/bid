import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpnPreviewSdpBaseComponent } from '../spn-preview-sdp-base/spn-preview-sdp-base.component';

@Component({
  selector: 'fi-spn-preview-sdp-en',
  templateUrl: './spn-preview-sdp-en.component.html',
  styleUrls: ['./spn-preview-sdp-en.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpnPreviewSdpEnComponent extends SpnPreviewSdpBaseComponent {}
