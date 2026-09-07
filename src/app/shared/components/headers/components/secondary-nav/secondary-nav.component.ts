import { Component, Input } from '@angular/core';
import { User } from '@core/models';

@Component({
  selector: 'fi-secondary-nav',
  templateUrl: './secondary-nav.component.html',
})
export class SecondaryNavComponent {
  @Input() userInfo: User;
  @Input() isProjectsRoutes: boolean;
}
