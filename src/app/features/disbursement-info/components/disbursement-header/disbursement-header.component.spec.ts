import { DisbursementHeaderComponent } from './disbursement-header.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { DisbursementHeader } from '../../models';
import { render } from '@testing-library/angular';

describe('DisbursementHeaderComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    component.header = headerMock;
    expect(component).toBeTruthy();
  });
});

async function setup() {
  const { fixture } = await render(DisbursementHeaderComponent, {
    componentProperties: { header: headerMock },
    declarations: [DisbursementHeaderComponent],
    imports: [
      PipeModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [IFDatePipe, DatePipe, provideMockStore({})],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}
const headerMock: DisbursementHeader = {
  currentDisbInformation: '2021-12-10T09:41:11.027Z',
  cumulativeExtension: 1,
  totalAmountPendingJustification: 1,
  minimumAmountPendingJustification: 1,
  advanceJustificationPercentage: 1,
  financialPeriodDeadline: '2021-12-10T09:41:11.027Z',
  lastRequestNumber: 1,
  lastAdvanceFoundsAmount: 1,
  lastAdvanceFoundDate: '2021-12-10T09:41:11.027Z',
};
