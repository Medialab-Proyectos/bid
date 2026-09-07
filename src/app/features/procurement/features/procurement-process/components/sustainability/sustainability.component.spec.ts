import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Enumerator } from '@core/models';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { SustainabilityComponent } from './sustainability.component';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const biddingProcessProcurementProcessSustainabilities: Enumerator[] = [
  {
    id: 0,
    name: 'ENUM.PROCESS.SUSTAINABILITY.ECONOMIC_CONSIDERATIONS',
  },
  {
    id: 1,
    name: 'ENUM.PROCESS.SUSTAINABILITY.ENVIROMENTAL_CONSIDERATIONS',
  },
  {
    id: 2,
    name: 'ENUM.PROCESS.SUSTAINABILITY.SOCIAL_CONSIDERATIONS',
  },
];
const initialState = {
  biddingProcessProcurementProcessSustainabilities: {
    ...biddingProcessProcurementProcessSustainabilities,
  },
};

describe('SustainabilityComponent', () => {
  async function setup() {
    const { fixture } = await render(SustainabilityComponent, {
      imports: [
        MsalTestModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      declarations: [SustainabilityComponent],
      providers: [provideMockStore({ initialState })],
    });
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('getSustainabilityEnum', () => {
    it('should fill the observable with the values of the enum', async () => {
      const { component } = await setup();

      component
        .getSustainabilityEnum()
        .subscribe((data) =>
          expect(data).toEqual(biddingProcessProcurementProcessSustainabilities)
        );
    });
  });
});
