import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpnPreviewSdpBaseComponent } from '../spn-preview-sdp-base/spn-preview-sdp-base.component';

@Component({
  selector: 'fi-spn-preview-sdp-fr',
  templateUrl: './spn-preview-sdp-fr.component.html',
  styleUrls: ['./spn-preview-sdp-fr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpnPreviewSdpFrComponent extends SpnPreviewSdpBaseComponent {}
