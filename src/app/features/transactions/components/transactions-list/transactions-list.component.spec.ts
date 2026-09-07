import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TransactionsListComponent } from './transactions-list.component';
import { render } from '@testing-library/angular';
import { TransactionActions, Transaction } from '../../models';
import {
  TransactionAction,
  TransactionsStatus,
  TransactionsTypes,
} from '../../enums';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

const transactions: Transaction[] = [
  {
    id: 1,
    transactionNumber: 'string',
    transactionType: 'string',
    requestNumber: 0,
    partNumber: 0,
    currency: 'string',
    amount: 1,
    status: 'string',
    approvalDate: new Date(),
    transactionStatusCode: 'COMPLETED',
    transactionTypeCode: TransactionsTypes.ANJ,
    lastUpdatedBy: 'string',
    lastUpdate: new Date(),
    valueDate: new Date('2021-12-29T03:00:00'),
    transactionActions: [],
    parentId: 1,
    transactionStatusId: TransactionsStatus.COMPLETED,
  },
  {
    id: 2,
    transactionNumber: 'string',
    transactionType: 'string',
    requestNumber: 0,
    partNumber: 0,
    currency: 'string',
    amount: 12,
    status: 'string',
    approvalDate: new Date(),
    transactionStatusCode: 'COMPLETED',
    transactionTypeCode: TransactionsTypes.ANJ,
    lastUpdatedBy: 'string',
    lastUpdate: new Date(),
    valueDate: new Date('2021-12-29T03:00:00'),
    transactionActions: [],
    parentId: null,
    transactionStatusId: TransactionsStatus.COMPLETED,
  },
];

async function setup() {
  const { fixture } = await render(TransactionsListComponent, {
    componentProperties: {
      transactions,
    },
    declarations: [IfNumberPipe],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      RouterTestingModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [DatePipe, provideMockStore({})],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('TransactionsListComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('transactionAction', () => {
    it('should emit transactionAction', async () => {
      const { component } = await setup();
      const event: TransactionActions = {
        text: 'test',
        value: TransactionAction.DELETE,
      };
      const transaction: Transaction = null;
      const output = {
        action: event,
        transaction,
      };
      const spy = jest.spyOn(component.transactionAction, 'emit');
      component.onItemClick(event, transaction);
      expect(spy).toHaveBeenCalledWith(output);
    });
  });

  describe('goToDetails', () => {
    it('should call navigate to ATJ', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component.router, 'navigate');
      component.goToDetails(transactions[0]);
      expect(spy).toHaveBeenCalled();
    });
    it('should call navigate', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component.router, 'navigate');
      component.goToDetails(transactions[1]);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('transactionStyles', () => {
    it('should return the css class c-status-label__blue', async () => {
      const { component } = await setup();
      const result = component.transactionStyles(TransactionsStatus.EDRAFT);
      expect(result).toEqual('c-status-label__blue');
    });
    it('should return the css c-status-label__orange-yellow', async () => {
      const { component } = await setup();
      const result = component.transactionStyles(TransactionsStatus.EPAUT);
      expect(result).toEqual('c-status-label__orange-yellow');
    });
    it('should return the css class c-status-label__grey', async () => {
      const { component } = await setup();
      const result = component.transactionStyles(TransactionsStatus.COMPLETED);
      expect(result).toEqual('c-status-label__grey');
    });
    it('should return the css class c-status-label__green', async () => {
      const { component } = await setup();
      const result = component.transactionStyles(
        TransactionsStatus.RECEIVEBYIDB
      );
      expect(result).toEqual('c-status-label__green');
    });
    it('should return the css default class', async () => {
      const { component } = await setup();
      const result = component.transactionStyles(null);
      expect(result).toEqual('c-status-label__orange-yellow');
    });
  });
});
