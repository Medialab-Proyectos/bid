import { Component, Input, ViewChild } from '@angular/core';
import { User } from '@core/models';
import { DrawerComponent } from '@progress/kendo-angular-layout';

@Component({
  selector: 'fi-projects-side-menu',
  templateUrl: './projects-side-menu.component.html',
})
export class ProjectsSideMenuComponent {
  @Input() userInfo: User;
  @ViewChild('drawer') drawer: DrawerComponent;

  public toggle() {
    this.drawer.toggle();
  }
}
