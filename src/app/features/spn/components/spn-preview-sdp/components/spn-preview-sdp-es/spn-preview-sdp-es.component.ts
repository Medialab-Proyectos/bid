import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SpnPreviewSdpBaseComponent } from '../spn-preview-sdp-base/spn-preview-sdp-base.component';

@Component({
  selector: 'fi-spn-preview-sdp-es',
  templateUrl: './spn-preview-sdp-es.component.html',
  styleUrls: ['./spn-preview-sdp-es.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpnPreviewSdpEsComponent extends SpnPreviewSdpBaseComponent {}
