import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DocsListComponent } from './docs-list.component';
import { TranslatePipe } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import { DocEnum } from '@core/enums';
import { Enums } from '@core/models';
import { RouterTestingModule } from '@angular/router/testing';

describe('DocsListComponent', () => {
  async function setup() {
    const { fixture } = await render(DocsListComponent, {
      declarations: [],
      componentProperties: {},
      imports: [
        RouterTestingModule,
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [TranslatePipe, provideMockStore({})],
    });
    const component = fixture.debugElement.componentInstance;
    return {
      fixture,
      component,
    };
  }
  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('set mode', () => {
    it('should set groupEnum with biddingContractDocumentGroupCodes enums', async () => {
      const { component } = await setup();
      component.mode = DocEnum.CONTRACTS;
      component.ngOnChanges();
      expect(component.groupEnum).toBe(Enums.biddingContractDocumentGroupCodes);
    });
    it('should set groupEnum with biddingContractAmendmentDocumentGroupCodes enums', async () => {
      const { component } = await setup();
      component.mode = DocEnum.AMENDMENTS;
      component.ngOnChanges();
      expect(component.groupEnum).toBe(
        Enums.biddingContractAmendmentDocumentGroupCodes
      );
    });
    it('should set groupEnum with biddingProcessDocumentGroupCodes enums', async () => {
      const { component } = await setup();
      component.mode = DocEnum.PACKAGES;
      component.ngOnChanges();
      expect(component.groupEnum).toBe(Enums.biddingProcessDocumentGroupCodes);
    });
    it('should set groupEnum with transactionDocumentGroupCodes enums', async () => {
      const { component } = await setup();
      component.mode = DocEnum.TRANSACTIONS;
      component.ngOnChanges();
      expect(component.groupEnum).toBe(Enums.transactionDocumentGroupCodes);
    });
  });
});
