import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';

import { Subscription } from 'rxjs';
import { DrawerMenuItem, User } from '@core/models';
import { WindowSizeService } from '@core/services/view';

@Component({
  selector: 'fi-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  private readonly subscriptionCollection: Subscription[] = [];

  @Input() userInfo: User;
  @Output() pathEmitter: EventEmitter<DrawerMenuItem> =
    new EventEmitter<DrawerMenuItem>();

  public mobileView = false;
  public toggle = false;

  constructor(readonly windowSvc: WindowSizeService) {
    this.initMobileConditionals();
  }

  ngOnDestroy(): void {
    this.subscriptionCollection.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  initMobileConditionals(): void {
    this.subscriptionCollection.push(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  drawer(): void {
    this.toggle = !this.toggle;
  }

  navigateTo(item: DrawerMenuItem): void {
    this.pathEmitter.emit(item);
  }
}
