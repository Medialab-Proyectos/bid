import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TransactionTypeCardComponent } from './transaction-type-card.component';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

async function setup() {
  const { fixture } = await render(TransactionTypeCardComponent, {
    componentProperties: {
      id: 1,
      transactionCard: {
        type: 'ANT',
        description: 'description',
        errorMessage: 'errorMessage',
        icon: 'icon',
        title: 'title',
      },
    },
    declarations: [TransactionTypeCardComponent],
    imports: [
      TooltipModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.debugElement.componentInstance;
  return { fixture, component };
}

describe('NewTransactionAvailabilityComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('initTransaction', () => {
    it('should emit on click button', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component.transactionCardType, 'emit');
      component.initTransaction();
      expect(spy).toHaveBeenCalled();
    });
  });
});
