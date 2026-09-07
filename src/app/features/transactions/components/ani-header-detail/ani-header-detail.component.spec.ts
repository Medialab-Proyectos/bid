import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TransactionsStatus } from '../../enums';
import { AniHeaderDetail } from '../../models';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AniHeaderDetailComponent } from './ani-header-detail.component';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const aniHeaderDetail: AniHeaderDetail = {
  requestAntDetails: {
    partNumber: 0,
    requestNumber: 6,
    transactionNumber: '2022089623',
    numberDaysFinancialPlanning: 180,
    financialPlanningPeriodDeadLine: new Date(),
    statusId: TransactionsStatus.EDRAFT,
    authorizeDate: new Date(),
    receivedDate: new Date(),
    status: 'Completed',
  },
  requestAntAmounts: {
    approvedCurrency: 'USD',
    requestedCurrency: 'USD',
    requiredAmount: 15_193_126,
    equivalentApprovedCurrency: 15_193_126,
    realValueDate: new Date(),
    projectedAvailableBalance: 1_000_000_000,
  },
  documents: [
    {
      createdDate: '2022-03-22T16:13:52.049Z',
      createdUser: 'User',
      documentGroup: 1,
      documentName: 'Doc name',
      documentNumber: '1',
      transactionType: 'ANT',
      originalTransactionId: 123,
    },
  ],
};

async function setup() {
  const { fixture } = await render(AniHeaderDetailComponent, {
    componentProperties: {
      aniHeaderDetail,
    },
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      PipeModule,
      MsalTestModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [provideMockStore({}), DatePipe],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('AniHeaderDetailComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
