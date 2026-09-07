import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TransactionDetailComponent } from './transaction-detail.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { transactionDetailForm } from '../../components/transaction-detail/transaction-detail.form';
import { FiInputNumeric } from '@fiduciary-interface/app/shared/components/input-numeric/components/input-numeric/input-numeric.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { NotificationService } from '@progress/kendo-angular-notification';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AvailableNumbers } from '../../models';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { MaskingStatusPipe } from '../../pipes/masking-status.pipe';

const availableNumbers: AvailableNumbers = {
  requestNumber: 1,
  partNumber: 1,
  currentRequestPartNumbers: {
    1: [1],
    2: [1, 2, 3],
  },
};

async function setup() {
  const { fixture } = await render(TransactionDetailComponent, {
    componentProperties: {
      detailForm: transactionDetailForm(),
      availableNumbers,
    },
    declarations: [FiInputNumeric, MaskingStatusPipe],
    imports: [
      MsalTestModule,
      HttpClientTestingModule,
      RouterTestingModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      provideMockStore({}),
      provideWindowSizeMock({ mobileView: false }),
      NotificationService,
    ],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('TransactionDetailComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('exportToPdf', () => {
    it('should export to pdf', async () => {
      const { component } = await setup();

      const response: HttpResponse<ArrayBuffer> = {
        body: new ArrayBuffer(1),
        clone: jest.fn(),
        headers: new HttpHeaders(),
        ok: true,
        status: 200,
        statusText: 'OK',
        type: HttpEventType.Response,
        url: '',
      };
      const spy = jest
        .spyOn(component.transactionsFormService, 'exportToPdf')
        .mockReturnValue(of(response));
      component.exportToPdf();

      expect(spy).toHaveBeenCalled();
    });

    it('should call error toast on error response', async () => {
      const { component } = await setup();
      jest
        .spyOn(component.transactionsFormService, 'exportToPdf')
        .mockReturnValue(throwError('error'));

      const spy = jest.spyOn(
        component.transactionsFormService,
        'showErrorToast'
      );
      component.exportToPdf();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('addRequestNumber', () => {
    it('should add request number', async () => {
      const { component } = await setup();
      component.addRequestNumber();
      expect(component.detailForm.value.requestNumber).toBe(2);
    });
    it('should set currentAvailableNumbers.requestNumber the selectedCurrentAvailableNumbers.requestNumber ', async () => {
      const { component } = await setup();
      component.currentAvailableNumbers.requestNumber = null;

      component.addRequestNumber();
      expect(component.currentAvailableNumbers.requestNumber).toBe(1);
    });
  });

  describe('subRequestNumber', () => {
    it('should sub request number', async () => {
      const { component } = await setup();

      component.subRequestNumber();
      expect(component.detailForm.value.requestNumber).toBe(0);
    });
    it('should set currentAvailableNumbers.requestNumber the selectedCurrentAvailableNumbers.requestNumber ', async () => {
      const { component } = await setup();
      component.currentAvailableNumbers.requestNumber = null;
      component.subRequestNumber();
      expect(component.currentAvailableNumbers.requestNumber).toBe(1);
    });
  });

  describe('typedRequestNumber', () => {
    it('should set currentAvailableNumbers.requestNumber with the value of the event', async () => {
      const { component } = await setup();
      component.typedRequestNumber(7);
      expect(component.currentAvailableNumbers.requestNumber).toBe(7);
    });
  });

  describe('addPartNumber', () => {
    it('should add part number', async () => {
      const { component } = await setup();
      component.addPartNumber();
      expect(component.detailForm.value.partNumber).toBe(2);
    });
    it('should set currentAvailableNumbers.partNumber the selectedCurrentAvailableNumbers.partNumber ', async () => {
      const { component } = await setup();
      component.currentAvailableNumbers.partNumber = null;

      component.addPartNumber();
      expect(component.currentAvailableNumbers.partNumber).toBe(1);
    });
  });

  describe('subPartNumber', () => {
    it('should sub part number', async () => {
      const { component } = await setup();

      component.subPartNumber();
      expect(component.detailForm.value.partNumber).toBe(0);
    });
    it('should set currentAvailableNumbers.partNumber the selectedCurrentAvailableNumbers.partNumber ', async () => {
      const { component } = await setup();
      component.currentAvailableNumbers.partNumber = null;
      component.subPartNumber();
      expect(component.currentAvailableNumbers.partNumber).toBe(1);
    });
  });

  describe('typedPartNumber', () => {
    it('should set currentAvailableNumbers.partNumber with the value of the event', async () => {
      const { component } = await setup();
      component.typedPartNumber(7);
      expect(component.currentAvailableNumbers.partNumber).toBe(7);
    });
  });
});
