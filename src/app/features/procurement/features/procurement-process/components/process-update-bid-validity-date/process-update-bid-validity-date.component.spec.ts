import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProcessUpdateBidValidityDateComponent } from './process-update-bid-validity-date.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationModule } from '@fiduciary-interface/app/shared';
import { NotificationService } from '@progress/kendo-angular-notification';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

describe('ProcessUpdateBidValidityDateComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  it('should call the showSuccess method on success', async () => {
    const { component } = await setup();
    component.minDate = null;
    const spy = jest.spyOn(component.notificationGlobalSvc, 'showSuccess');
    jest
      .spyOn(component.biddingProcessPlanService, 'updateBidValidityDate')
      .mockReturnValue(of(''));
    component.onValueChange('2023-07-03');
    expect(spy).toHaveBeenCalled();
  });
  it('should call the showError method on error', async () => {
    const { component } = await setup();
    component.minDate = null;
    component.notificationText.errorMessage = 'error';
    const spy = jest.spyOn(component.notificationGlobalSvc, 'showError');
    jest
      .spyOn(component.biddingProcessPlanService, 'updateBidValidityDate')
      .mockReturnValue(throwError(''));
    jest
      .spyOn(component.biddingStoreSvc, 'getBiddingProcessByIdAction')
      .mockReturnValue();

    component.onValueChange('2023-07-03');
    expect(spy).toHaveBeenCalled();
  });
});

async function setup() {
  const { fixture } = await render(ProcessUpdateBidValidityDateComponent, {
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      NotificationModule,
    ],
    declarations: [ProcessUpdateBidValidityDateComponent],
    providers: [NotificationService, DatePipe, provideMockStore({})],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}
