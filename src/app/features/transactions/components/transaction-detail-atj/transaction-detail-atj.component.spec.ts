import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FiInputNumeric } from '@fiduciary-interface/app/shared/components/input-numeric/components/input-numeric/input-numeric.component';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { TransactionDetailAtjComponent } from './transaction-detail-atj.component';
import { transactionDetailAtjForm } from './transaction-detail-atj.form';
import { NotificationService } from '@progress/kendo-angular-notification';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
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
  const { fixture } = await render(TransactionDetailAtjComponent, {
    componentProperties: {
      detailForm: transactionDetailAtjForm(),
      availableNumbers,
      currentANTrequestNumber: 1,
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

describe('TransactionDetailAtjComponent', () => {
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

  describe('addRequestNumberANT', () => {
    it('should add request number', async () => {
      const { component } = await setup();
      component.requestNumberANT = 2;
      component.currentANTrequestNumber = null;
      component.addRequestNumberANT();
      expect(component.requestNumberAdvanceOfFunds.value).toBe(2);
    });
    it('should set currentAvailableNumbers.requestNumber the requestNumberANT', async () => {
      const { component, fixture } = await setup();

      component.currentANTrequestNumber = null;

      component.addRequestNumberANT();
      fixture.detectChanges();
      expect(component.currentANTrequestNumber).toEqual(
        component.requestNumberANT
      );
    });
  });

  describe('subRequestNumberANT', () => {
    it('should sub request number', async () => {
      const { component } = await setup();
      component.currentANTrequestNumber = 2;
      component.subRequestNumberANT();
      expect(component.requestNumberAdvanceOfFunds.value).toBe(1);
    });
    it('should set currentAvailableNumbers.requestNumber the requestNumberANT', async () => {
      const { component, fixture } = await setup();

      component.currentANTrequestNumber = null;

      component.subRequestNumberANT();
      fixture.detectChanges();
      expect(component.currentANTrequestNumber).toEqual(
        component.requestNumberANT
      );
    });
  });
  describe('requestNumberAdvanceOfFunds', () => {
    it('should set currentANTrequestNumber to the value of the event', async () => {
      const { component } = await setup();
      component.typedRequestNumberANT(55);
      expect(component.currentANTrequestNumber).toEqual(55);
    });
  });
  describe('addPartNumberANT', () => {
    it('should add part number', async () => {
      const { component } = await setup();
      component.currentANTpartNumber = null;
      component.addPartNumberANT();
      expect(component.partNumberAdvanceOfFunds.value).toBe(1);
    });
    it('should set currentAvailableNumbers.partNumber the currentAvailableNumbers.partNumber', async () => {
      const { component, fixture } = await setup();

      component.currentANTpartNumber = null;

      component.addPartNumberANT();
      fixture.detectChanges();
      expect(component.currentANTpartNumber).toEqual(
        component.currentAvailableNumbers.partNumber
      );
    });
  });
  describe('subPartNumberANT', () => {
    it('should sub part number', async () => {
      const { component } = await setup();
      component.currentANTpartNumber = 2;
      component.subPartNumberANT();
      expect(component.partNumberAdvanceOfFunds.value).toBe(1);
    });
    it('should set currentAvailableNumbers.partNumber the currentAvailableNumbers.partNumber', async () => {
      const { component, fixture } = await setup();

      component.currentANTpartNumber = null;

      component.subPartNumberANT();
      fixture.detectChanges();
      expect(component.currentANTpartNumber).toEqual(
        component.currentAvailableNumbers.partNumber
      );
    });
  });
  describe('typedPartNumberANT', () => {
    it('should set currentANTpartNumber to the value of the event', async () => {
      const { component } = await setup();
      component.typedPartNumberANT(55);
      expect(component.currentANTpartNumber).toEqual(55);
    });
  });
  describe('addRequestNumberANJ', () => {
    it('should add request number', async () => {
      const { component } = await setup();
      component.currentANJrequestNumber = null;
      component.addRequestNumberANJ();
      expect(component.requestNumberJustification.value).toBe(1);
    });
    it('should set currentAvailableNumbers.requestNumber the requestNumberANJ', async () => {
      const { component, fixture } = await setup();

      component.currentANJrequestNumber = null;

      component.addRequestNumberANJ();
      fixture.detectChanges();
      expect(component.currentANJrequestNumber).toEqual(
        component.currentANJrequestNumber
      );
    });
  });
  describe('subRequestNumberANJ', () => {
    it('should sub request number', async () => {
      const { component } = await setup();
      component.currentANJrequestNumber = 2;
      component.subRequestNumberANJ();
      expect(component.requestNumberJustification.value).toBe(1);
    });
    it('should set currentAvailableNumbers.requestNumber the requestNumberANJ', async () => {
      const { component, fixture } = await setup();

      component.currentANJrequestNumber = null;

      component.subRequestNumberANJ();
      fixture.detectChanges();
      expect(component.currentANJrequestNumber).toEqual(
        component.currentANJrequestNumber
      );
    });
  });
  describe('typedRequestNumberANJ', () => {
    it('should set currentANJrequestNumber to the value of the event', async () => {
      const { component } = await setup();
      component.typedRequestNumberANJ(55);
      expect(component.currentANJrequestNumber).toEqual(55);
    });
  });
  describe('addPartNumberANJ', () => {
    it('should add part number', async () => {
      const { component } = await setup();
      component.currentANJpartNumber = null;
      component.addPartNumberANJ();
      expect(component.partNumberJustification.value).toBe(1);
    });
    it('should set currentAvailableNumbers.partNumber the currentAvailableNumbers.partNumber', async () => {
      const { component, fixture } = await setup();

      component.currentANJpartNumber = null;

      component.addPartNumberANJ();
      fixture.detectChanges();
      expect(component.currentANJpartNumber).toEqual(
        component.currentAvailableNumbers.partNumber
      );
    });
  });
  describe('subPartNumberANJ', () => {
    it('should sub part number', async () => {
      const { component } = await setup();
      component.currentANJpartNumber = 2;
      component.subPartNumberANJ();
      expect(component.partNumberJustification.value).toBe(1);
    });
    it('should set currentAvailableNumbers.partNumber the currentAvailableNumbers.partNumber', async () => {
      const { component, fixture } = await setup();

      component.currentANJpartNumber = null;

      component.subPartNumberANJ();
      fixture.detectChanges();
      expect(component.currentANJpartNumber).toEqual(
        component.currentAvailableNumbers.partNumber
      );
    });
  });
  describe('typedPartNumberANJ', () => {
    it('should set currentANJpartNumber to the value of the event', async () => {
      const { component } = await setup();
      component.typedPartNumberANJ(55);
      expect(component.currentANJpartNumber).toEqual(55);
    });
  });
});
