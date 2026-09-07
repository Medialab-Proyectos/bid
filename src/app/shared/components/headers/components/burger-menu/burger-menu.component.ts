import {
  Component,
  OnChanges,
  Input,
  SimpleChanges,
  ViewChild,
  EventEmitter,
  Output,
} from '@angular/core';
import { DrawerMenuItem, User } from '@core/models';
import { DrawerComponent, DrawerMode } from '@progress/kendo-angular-layout';

@Component({
  selector: 'fi-burger-menu',
  templateUrl: './burger-menu.component.html',
  styleUrls: ['./burger-menu.component.scss'],
})
export class BurgerMenuComponent implements OnChanges {
  @Input() toggle: boolean;
  @Input() userInfo: User;

  @Output() pathEmitter: EventEmitter<DrawerMenuItem> =
    new EventEmitter<DrawerMenuItem>();

  @ViewChild('drawer') drawer: DrawerComponent;
  public expandMode: DrawerMode = 'overlay';
  public items: Array<DrawerMenuItem> = [
    { separator: true },
    { text: 'SHARED.HEADERS.BURGER_MENU.DASHBOARD', path: '/dashboard' },
    { text: 'SHARED.HEADERS.BURGER_MENU.ACTIVITIES', path: '/activities' },
    { text: 'SHARED.HEADERS.BURGER_MENU.PROJECTS' },
    { separator: true },
  ];

  ngOnChanges(_changes: SimpleChanges): void {
    if (_changes?.toggle?.previousValue !== undefined) {
      this.drawer.toggle();
    }
  }

  selectedMenuItem(item: DrawerMenuItem): void {
    this.pathEmitter.emit(item);
  }
}
