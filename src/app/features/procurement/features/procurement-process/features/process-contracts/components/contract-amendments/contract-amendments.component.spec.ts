import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ContractAmendmentsComponent } from './contract-amendments.component';
import { RouterTestingModule } from '@angular/router/testing';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';

async function setup() {
  const { fixture } = await render(ContractAmendmentsComponent, {
    declarations: [ContractAmendmentsComponent],
    imports: [
      PipeModule,
      RouterTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [IFDatePipe, DatePipe, provideMockStore({})],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ContractAmendmentsComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('viewAmendment', () => {
    it('should navigate to view amendment', async () => {
      const { component } = await setup();
      const mockEvent = {
        preventDefault: () => {},
      };

      const navigateSpy = jest.spyOn(component.router, 'navigate');
      component.viewAmendment(mockEvent, 'amendmentId');

      expect(navigateSpy).toHaveBeenCalled();
    });
  });

  describe('editAmendment', () => {
    it('should navigate to edit amendment', async () => {
      const { component } = await setup();
      const mockEvent = {
        preventDefault: () => {},
      };

      const navigateSpy = jest.spyOn(component.router, 'navigate');
      component.editAmendment(mockEvent, 'amendmentId');

      expect(navigateSpy).toHaveBeenCalled();
    });
  });
});
