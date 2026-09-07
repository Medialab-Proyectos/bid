import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-loader',
  templateUrl: './loader.component.html',
})
export class LoaderComponent {
  /**
   * type: pulsing (default), infinite-spinner, converging-spinner
   */
  @Input() type = 'converging-spinner';

  /**
   * themeColor: primary (default), secondary, tertiary, info, success,
   * warning, error, dark, light, inverse
   */
  @Input() themeColor = 'info';

  /**
   * size: small, medium (default) , large
   */
  @Input() size = 'medium';

  @Input() id?: number;
}
