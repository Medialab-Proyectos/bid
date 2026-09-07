import { provideMockStore } from '@ngrx/store/testing';
import { ProjectSidebarComponent } from './project-sidebar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LabelModule } from '@progress/kendo-angular-label';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { render } from '@testing-library/angular';
import { sidebarInitialState } from '@core/store';
import { Component } from '@angular/core';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProjectSidebarComponent', () => {
  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should select correct menu option when is parent node', async () => {
    const { component, router } = await setup();

    const mockUrlTree = router.parseUrl('/project/CO-L1229/transactions');

    (router as any).currentUrlTree = mockUrlTree;
    component.ngOnInit();

    expect(component.selectedKeys).toEqual(['5']);
    expect(component.expandedKeys).toEqual(['4']);
  });

  it('should select correct menu option when is child node gpn', async () => {
    const { component, router } = await setup();

    const mockUrlTree = router.parseUrl('/project/CO-L1229/gpn');

    (router as any).currentUrlTree = mockUrlTree;
    component.ngOnInit();

    expect(component.selectedKeys).toEqual(['0_0']);
    expect(component.expandedKeys).toEqual(['0']);
  });

  it('should select correct menu option when is child node procurement', async () => {
    const { component, router } = await setup();

    const mockUrlTree = router.parseUrl('/project/CO-L1229/procurement');

    (router as any).currentUrlTree = mockUrlTree;
    component.ngOnInit();

    expect(component.selectedKeys).toEqual(['0_1']);
    expect(component.expandedKeys).toEqual(['0']);
  });
});

const sidebarState = { ...sidebarInitialState };
sidebarState.sidebar = [
  {
    index: '1',
    icon: 'fas fa-list-alt',
    text: 'Adquisiciones',
    routeTo: '',
    selected: false,
    separator: false,
    items: [
      {
        index: '1.1',
        text: 'Aviso General de Adquisiciones',
        icon: '',
        routeTo: 'project/:code/gpn',
        selected: false,
        separator: false,
        isChild: true,
      },
      {
        index: '1.2',
        text: 'Gestión de Adquisiciones',
        icon: '',
        routeTo: '/project/:code/procurement',
        selected: false,
        separator: false,
        isChild: true,
      },
    ],
  },
  {
    index: '5',
    icon: 'fal fa-file-invoice-dollar',
    text: 'Registro de pagos',
    routeTo: '/project/:code/payment-records',
    selected: false,
    separator: false,
  },
  {
    index: '6',
    icon: 'fas fa-sack-dollar',
    text: 'Transacciones Bancarias',
    routeTo: '/project/:code/transactions',
    selected: false,
    separator: false,
  },
  {
    index: '7',
    icon: 'fas fa-file-chart-line',
    text: 'Progeso Financiero',
    routeTo: '/project/:code/financial-progress',
    selected: false,
    separator: false,
  },
  {
    index: '8',
    icon: 'fas fa-chart-line',
    text: 'Plan Financiero',
    routeTo: '/project/:code/financial-plan',
    selected: false,
    separator: false,
  },
  {
    index: '9',
    icon: 'fas fa-question-circle',
    text: 'Preguntas Frecuentes',
    routeTo: '/project/:code/faq',
    selected: false,
    separator: false,
  },
  {
    index: '10',
    icon: 'fas fa-network-wired',
    text: 'Usuarios & Workflow',
    routeTo: '/project/:code/usr-workflow',
    selected: false,
    separator: false,
  },
];

const initialState = {
  sidebar: sidebarState,
};

async function setup() {
  const { fixture } = await render(ProjectSidebarComponent, {
    imports: [
      DirectivesModule,
      HttpClientTestingModule,
      RouterTestingModule.withRoutes([
        {
          path: 'project/CO-L1229/transactions',
          component: TestComponent,
        },
        {
          path: 'project/CO-L1229/gpn',
          component: TestComponent,
        },
        {
          path: 'project/CO-L1229/procurement',
          component: TestComponent,
        },
      ]),
      LabelModule,
      TreeViewModule,
      InputsModule,
      NoopAnimationsModule,
      FormsModule,
      ReactiveFormsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    declarations: [ProjectSidebarComponent, TestComponent],
    providers: [
      TranslatePipe,
      provideMockStore({ initialState }),
      { provide: 'windowObject', useValue: window },
    ],
  });

  const component = fixture.componentInstance;
  const router = component.router;
  return {
    component,
    router,
  };
}

@Component({
  template: '',
})
class TestComponent {}
