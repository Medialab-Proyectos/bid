import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { FormNameEnum } from '../../enums/form-name';

@Component({
  selector: 'fi-forms',
  templateUrl: './forms.component.html',
  styleUrls: [
    './forms.component.scss',
    '../../../../shared/components/headers/components/project-sidebar/project-sidebar.component.scss',
  ],
})
export class FormsComponent implements OnInit {
  constructor(
    public translateService: TranslateService,
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {    
  }

  @ViewChild('drawer') drawer: DrawerComponent;
  public expanded: boolean;
  public mobileView = false;

  public expandedKeys: any[] = ['0'];

  public checkedKeys: any[] = ['0_1'];

  public readonly data: any[] = [
    {
      text: 'Forms',
      items: [
        {
          text: this.translateService.instant('FORMS.FORMS_TABS.GENERATE_GPN'),
          routeTo: `${FormNameEnum.GPN}/create`,
        },
        {
          text: this.translateService.instant(
            'FORMS.FORMS_TABS.GENERATE_SPN_GOODS'
          ),
          routeTo: `${FormNameEnum.SPN_GOODS}/create`,
        },
        {
          text: this.translateService.instant(
            'FORMS.FORMS_TABS.GENERATE_SPN_MINOR_WORKS'
          ),
          routeTo: `${FormNameEnum.SPN_MINOR_WORKS}/create`,
        },
        {
          text: this.translateService.instant('FORMS.FORMS_TABS.GENERATE_NOA'),
          routeTo: `${FormNameEnum.NOA_GOODS}/create`,
        },
        {
          text: this.translateService.instant(
            'FORMS.FORMS_TABS.GENERATE_NOA_FIRMS'
          ),
          routeTo: `${FormNameEnum.NOA_FIRMS}/create`,
        },
        {
          text: this.translateService.instant('FORMS.FORMS_TABS.GENERATE_MI'),
          routeTo: `${FormNameEnum.EOI}/create`,
        },
      ],
    },
  ];

  form: any;

  eventclickNode(event) {
    this.router.navigate([event.item.dataItem.routeTo], {
      relativeTo: this.activatedRoute,
    });
  }

  filterForms(formName: string): any[] {
    return this.data.map((form) => {
      return Object.values(form.items).filter((item: any) => {
        item.routeTo.includes(formName.toString());
      });
    });
  }

  ngOnInit(): void {
    this.expanded = true;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.form) {
        const result = this.filterForms(params.form);
        if (result) {
          this.data.forEach((forms) => {
            forms.items = result[0];
          });
        }
      }
    });
  }
}
