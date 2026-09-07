import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { debounceTime, filter as rxFilter } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { WindowSizeService, NavigationService } from '@core/services/view';
import { ProjectStoreService } from '@core/services/store-services';
import {
  PanelBarItemModel,
  PanelBarSelectEvent,
} from '@progress/kendo-angular-layout';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';

@Component({
  selector: 'fi-project-sidebar',
  templateUrl: './project-sidebar.component.html',
  styleUrls: ['./project-sidebar.component.scss'],
})
export class ProjectSidebarComponent implements OnInit, OnDestroy {
  constructor(
    readonly navigationSvc: NavigationService,
    readonly route: ActivatedRoute,
    readonly router: Router,
    readonly windowSvc: WindowSizeService,
    readonly projectStoreSvc: ProjectStoreService,
    private readonly pipe: TranslatePipe,
    private readonly translateService: TranslateService
  ) {
    this.initMobileConditionals();
  }

  public subscriptionCollection: Subscription[] = [];
  public mobileView = false;
  public parameterRouter: string;
  public filterControl = new UntypedFormControl(null);
  public data: any;
  public items: PanelBarItemModel[];
  public module: string[] = [];
  public expandedKeys: string[] = [];
  public selectedKeys: string[] = [];
  private categories: any[] = null;
  public filteredData: MenuItem[] = null;
  categorySelected: unknown = null;
  readonly subscriptions: Subscription[] = [];
  public projectId: string;
  public contract: string;

  @Output() selectionChange = new EventEmitter<any>();

  initMobileConditionals() {
    this.subscriptionCollection.push(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('code');
    this.contract = this.route.snapshot.paramMap.get('contract');

    this.parameterRouter = this.router.url;

    if (this.route.children.length > 0 && this.mobileView) {
      this.projectId = this.route.children[0].snapshot.paramMap.get('code');
      this.contract = this.route.children[0].snapshot.paramMap.get('contract');
    }
    const subscription = this.filterControl.valueChanges
      .pipe(debounceTime(200))
      .subscribe((filter) => {
        this.handleFilter(filter);
      });
    this.subscriptions.push(subscription);
    this.subscriptions.push(
      this.translateService.onLangChange.subscribe(() => {
        this.mapDataSideBar();
      })
    );
    // `parameterRouter` was only ever set once, above, from the URL the
    // sidebar happened to first mount on -- correct for a page reload, but a
    // button elsewhere in the app that navigates without one (an SPA route
    // change) left the highlighted menu item wherever it was, not wherever
    // the app actually landed.
    this.subscriptions.push(
      this.router.events
        .pipe(rxFilter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          this.parameterRouter = this.router.url;
          this.menuOptionCheck();
          this.mapDataSideBar();
        })
    );
    this.getData();
  }

  ngOnDestroy() {
    this.subscriptionCollection.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  public hasChildren = (item: any) => item.items && item.items.length > 0;
  public fetchChildren = (item: any) => of(item.items);
  public isExpanded = () => true;

  public getData() {
    this.projectStoreSvc.sidebar().subscribe((data) => {
      this.data = data.sidebar;
      this.categories = this.data;
      this.filteredData = this.categories;
      const filter = this.filterControl.value;
      // `mapDataSideBar` reads `selectedKeys`/`expandedKeys` to mark the
      // active item, so it has to run after they are computed, not before.
      this.menuOptionCheck();
      this.mapDataSideBar();
      this.handleFilter(filter);
    });
  }

  /** Same index-key `menuOptionCheck` derives from a menu entry's own
   *  `index` field ("5" -> "4", "5.2" -> "4_1"), so a built item can be
   *  matched back against `selectedKeys`/`expandedKeys` regardless of search
   *  filtering having changed its position in `filteredData`. */
  private keyFor(index: string): string {
    if (index.includes('.')) {
      const [main, sub] = index.split('.');
      return `${parseInt(main, 10) - 1}_${parseInt(sub, 10) - 1}`;
    }
    return (parseInt(index, 10) - 1).toString();
  }

  mapDataSideBar() {
    const newItems: PanelBarItemModel[] = [];
    this.filteredData.forEach((i) => {
      if (i.items === undefined) {
        newItems.push(<PanelBarItemModel>{
          title: this.pipe.transform(i.text),
          children: [],
          iconClass: i.icon,
          id: i.routeTo,
          selected: this.selectedKeys.includes(this.keyFor(i.index)),
        });
      } else {
        const childs: PanelBarItemModel[] = [];
        let anyChildSelected = false;
        i.items.forEach((child) => {
          const childSelected = this.selectedKeys.includes(
            this.keyFor(child.index)
          );
          anyChildSelected = anyChildSelected || childSelected;
          childs.push(<PanelBarItemModel>{
            title: this.pipe.transform(child.text),
            id: child.routeTo,
            selected: childSelected,
          });
        });
        newItems.push(<PanelBarItemModel>{
          title: this.pipe.transform(i.text),
          children: childs,
          iconClass: i.icon,
          id: 'null',
          // Belt and suspenders: whatever `expandedKeys` came up with, a
          // group whose own child is the active route has to be open for
          // that child to even be visible.
          expanded:
            this.expandedKeys.includes(this.keyFor(i.index)) ||
            anyChildSelected,
        });
      }
    });
    this.items = newItems;
  }

  public onPanelSelect(event: PanelBarSelectEvent): void {

    if (event.item.id === "helpSupportUrl") {
      event.preventDefault();
      window.open( environment.helpSupportUrl, '_blank');
      return;
    }

    if (event.item.id !== 'null') {
      const param = { code: this.projectId, contract: this.contract };
      this.navigationSvc.navigateTo(event.item.id, param);
    }
  }

  private handleFilter(filter: string): void {
    this.filteredData = this.filter(this.categories, filter);
  }

  private filter(categories: any[], filter: string): any[] {
    return categories.reduce((accumulator, item) => {
      if (this.contains(item.text, filter)) {
        accumulator.push(item);
      } else if (item.items && item.items.length > 0) {
        const newItems = this.filter(item.items, filter);
        if (newItems.length > 0) {
          accumulator.push({ text: item.text, items: newItems });
        }
      }
      return accumulator;
    }, []);
  }

  public contains(text: string, term: string): boolean {
    text = text || '';
    term = term || '';
    const word = text.trim().toLowerCase().replace(/\s+/g, '');
    const word2 = term.trim().toLowerCase().replace(/\s+/g, '');
    return word.indexOf(word2) >= 0;
  }

  public menuOptionCheck(): void {
    // Reset before recomputing -- called again on every navigation now, not
    // just once at mount, so a route with no matching entry has to leave the
    // menu with nothing selected rather than whatever the previous route left.
    this.module = [];
    this.selectedKeys = [];

    if (this.filteredData.length === 0) {
      return;
    }

    const arrayRoute = this.createArrayRoute(this.filteredData);
    const urlSegments = this.formatArray(this.parameterRouter);
    const currentPage = urlSegments[urlSegments.length - 1];

    arrayRoute.forEach((item) => {
      const itemRouteAsArray = item[1].split('/');
      if (itemRouteAsArray[itemRouteAsArray.length - 1] === currentPage) {
        this.selectedKeys = [item[0]];
      }
    });

    if (this.parameterRouter !== '/') {
      for (const item of arrayRoute) {
        const menuRouteSegments = this.formatArray(item[1]);

        this.searchModule(menuRouteSegments, urlSegments, item);
      }
    }
    let expandedkey = '';

    if (this.module.length > 0) {
      const selectedKey = this.module[0];
      if (selectedKey.length > 2) {
        expandedkey = this.module[0].slice(0, -2);
      } else {
        expandedkey = (parseInt(this.module[0]) - 1).toString();
      }
    }
    this.expandedKeys = [expandedkey];
  }

  createArrayRoute(items, array: any[][] = []) {
    if (items === undefined) {
      return array;
    }

    let index = '';

    items.forEach((item) => {
      if (!item.routeTo) {
        this.createArrayRoute(item.items, array);
      } else {
        if (item.index.includes('.')) {
          const indexSplited = item.index.split('.');
          const mainIndex = (parseInt(indexSplited[0]) - 1).toString();
          const subIndex = (parseInt(indexSplited[1]) - 1).toString();
          index = `${mainIndex}_${subIndex}`;
        } else {
          index = (parseInt(item.index) - 1).toString();
        }
        array.push([index, item.routeTo]);
      }
    });

    return array;
  }

  formatArray(url: string) {
    return url.split('/').filter((route) => route !== '');
  }

  searchModule(menuRouteSegments, urlSegments, item): void {
    for (
      let routeSegmentIndex = 0;
      routeSegmentIndex < menuRouteSegments.length;
      routeSegmentIndex++
    ) {
      const menuRoute = menuRouteSegments[routeSegmentIndex];
      const urlRoute = urlSegments[routeSegmentIndex];
      if (!urlRoute) {
        break;
      }
      if (menuRoute.includes(':')) {
        continue;
      }
      if (menuRoute !== urlRoute) {
        break;
      }
      const currentLength = routeSegmentIndex + 1;
      if (
        currentLength === menuRouteSegments.length &&
        currentLength === urlSegments.length
      ) {
        this.module[0] = item[0];
      }
    }
  }
}
