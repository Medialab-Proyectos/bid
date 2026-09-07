import { Component, Input, ViewChild } from '@angular/core';
import { User } from '@core/models';
import { DrawerComponent } from '@progress/kendo-angular-layout';

@Component({
  selector: 'fi-user-side-menu',
  templateUrl: './user-side-menu.component.html',
})
export class UserSideMenuComponent {
  @Input() userInfo: User;
  @ViewChild('drawer') drawer: DrawerComponent;
  public expandedLanguage = false;

  state = false;

  public toggle() {
    this.drawer.toggle();
  }
  public toggleLanguage(): void {
    this.expandedLanguage = !this.expandedLanguage;
  }
}
