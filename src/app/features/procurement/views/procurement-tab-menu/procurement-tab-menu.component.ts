import { Component, OnInit } from '@angular/core';
import { PermissionEnum } from '@core/enums';

@Component({
  selector: 'fi-procurement-tab-menu',
  templateUrl: './procurement-tab-menu.component.html',
})
export class ProcurementTabMenuComponent implements OnInit {
  public goToTopButtonPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  public navLinks = [
    {
      label: 'PROCUREMENT.PROCUREMENT_PLAN',
      link: './',
      index: 0,
      status: 'active',
      matchFullpath: {
        exact: true,
      },
    },
    {
      label: 'PROCUREMENT.APPROVED_PLANS',
      link: './approved-plans',
      index: 1,
      status: 'active',
      matchFullpath: {
        exact: true,
      },
    },
    {
      label: 'PROCUREMENT.COMMENTS_BY_PLAN.TITLE',
      link: './comments',
      index: 2,
      status: 'active',
      matchFullpath: {
        exact: false,
      },
    },
    {
      label: 'PROCUREMENT_MENU.PROCUREMENT_MONITORING_TAB',
      link: './monitoring',
      index: 3,
      status: 'active',
      matchFullpath: {
        exact: false,
      },
    },
  ];
  constructor() {}

  ngOnInit(): void {}
}
