import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'; //ActivatedRoute,

import { filter, startWith } from 'rxjs/operators';

@Component({
  selector: 'fi-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent {
  public options = [
    {
      name: 'SHARED.HEADERS.BURGER_MENU.DASHBOARD',
      routeTo: '/dashboard',
      dropdown: false,
    },
    {
      name: 'SHARED.HEADERS.BURGER_MENU.ACTIVITIES',
      routeTo: '/activities',
      dropdown: false,
    },
    {
      name: 'SHARED.HEADERS.BURGER_MENU.PROJECTS',
      routeTo: '/project',
      dropdown: false,
    },
    {
      name: 'Forms',
      routeTo: '/forms',
      dropdown: false,
    },
    {
      name: 'SHARED.HEADERS.BURGER_MENU.NOTIFICATIONS',
      routeTo: '/notification',
      dropdown: false,
    },
  ];
  public mobileView = false;

  screenHeight: number;
  screenWidth: number;

  constructor(
    public activatedroute: ActivatedRoute,
    private readonly router: Router
  ) {
    this.getScreenSize();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(this.router)
      )
      .subscribe((event: NavigationEnd) => {
        const routeURL = event.url;
        const match = routeURL.match(/(forms\/)((\w*)(-)?\w*)*(\/create)/i);
        if (match !== null) {
          const FortmTitlte = match[0]?.split('/')[1].toUpperCase();
          this.options[3].name = 'SHARED.HEADERS.BURGER_MENU.' + FortmTitlte;
        } else {
          this.options[3].name = 'Forms';
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    if (this.screenWidth < 830) {
      this.mobileView = true;
    } else {
      this.mobileView = false;
    }
  }
}
