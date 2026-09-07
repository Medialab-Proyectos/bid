import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BiddingProcessPlanService } from '@core/services/apis';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import {
  DirectivesModule,
  KendoModule,
  LoaderModule,
  NotificationModule,
} from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CreateProcurementProcessComponent } from './create-procurement-process.component';

describe('CreateProcurementProcessComponent', () => {
  async function setup() {
    const { fixture } = await render(CreateProcurementProcessComponent, {
      imports: [
        LayoutModule,
        DirectivesModule,
        MsalTestModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
        RouterTestingModule,
        KendoModule,
        NotificationModule,
        LoaderModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({}),
        provideWindowSizeMock(),
        NotificationService,
      ],
      declarations: [CreateProcurementProcessComponent],
    });
    const component = fixture.debugElement.componentInstance;
    const biddingProcessPlanSvc = TestBed.inject(BiddingProcessPlanService);
    return { fixture, component, biddingProcessPlanSvc };
  }

  describe('On destroy behaivour', () => {
    it('should create', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    });
  });
});
