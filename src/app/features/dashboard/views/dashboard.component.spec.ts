/* eslint-disable @typescript-eslint/no-var-requires */
import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render /*screen*/ } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TranslatePipe } from '@ngx-translate/core';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { Router } from '@angular/router';
import { ProjectCardComponent } from '@fiduciary-interface/app/features/dashboard/components/project-card/project-card.component';
import { CardModule } from '@progress/kendo-angular-layout';
import { HighlightSearchPipe } from '@fiduciary-interface/app/shared/pipes/highlight-search.pipe';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FilterComponent } from '@fiduciary-interface/app/shared/components/filter/components/filter/filter.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

const projectCollection = [
  {
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed cursus urna, sed faucibus justo. ',
    operationNumber: 'CO-L001',
    approvedAmount: 123456789,
    executor: 'Ministerio de educacion de colombia',
    contract: 1111111,
    status: 'In progress',
  },
  {
    name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed cursus urna, sed faucibus justo. ',
    operationNumber: 'CO-L002',
    approvedAmount: 987654321,
    executor: 'Ministerio de educacion de colombia',
    contract: 20222222,
    status: 'In progress',
  },
  {
    name: 'name 30',
    operationNumber: 'CO-L003',
    approvedAmount: 987654321,
    executor: 'Ministerio de educacion de colombia',
    contract: 3333333,
    status: 'In progress',
  },
  {
    name: 'Contrato 54',
    operationNumber: 'CO-L004',
    approvedAmount: 123456789,
    executor: 'Ministerio de educacion de colombia',
    contract: 44444,
    status: 'Finished',
  },
  {
    name: 'operation 84',
    operationNumber: 'CO-L005',
    approvedAmount: 987654321,
    executor: 'Ministerio de educacion de colombia',
    contract: 5555555,
    status: 'In progress',
  },
  {
    name: 'name 30',
    operationNumber: 'CO-L006',
    approvedAmount: 987654321,
    executor: 'Ministerio de educacion de colombia',
    contract: 66666666,
    status: 'Finished',
  },
];

const initialState = {
  projects: {
    projects: [...projectCollection],
  },
};

describe('Should show a list of projects and could filter them', () => {
  async function setup() {
    const { fixture } = await render(DashboardComponent, {
      declarations: [
        DashboardComponent,
        ProjectCardComponent,
        HighlightSearchPipe,
        FilterComponent,
      ],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
        CardModule,
        InputsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        DropDownsModule,
        FormsModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        TranslatePipe,
        provideMockStore({ initialState }),
        provideWindowSizeMock({ mobileView: false }),
      ],
    });

    const store = TestBed.inject(MockStore);
    const router = TestBed.inject(Router);
    const component = fixture.componentInstance;

    function filterProjects(filterValue: string) {
      component.filterValue(filterValue);
      fixture.detectChanges();
    }

    return { component, fixture, store, filterProjects, router };
  }

  it('Should store get projects', async () => {
    const { store } = await setup();
    store.setState(initialState);
    store.subscribe((res: never) => {
      expect(initialState).toEqual(res);
    });
  });

  /* it('should redirect to project on click card', async () => {
    const { router } = await setup();

    const spy = jest.spyOn(router, 'navigate');

    screen.getByText(/CO-L001/i).click();

    expect(spy).toHaveBeenCalled();
  });*/
});
