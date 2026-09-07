import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { ProcurementProcessDataComponent } from './procurement-process-data.component';
import { ProcurementProcess } from '../../procurement-process.form';
import { UntypedFormControl } from '@angular/forms';

describe('ProcurementProcessDataComponent', () => {
  async function setup() {
    const { fixture } = await render(ProcurementProcessDataComponent, {
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      declarations: [ProcurementProcessDataComponent],
    });
    const component = fixture.debugElement.componentInstance;

    return { fixture, component };
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('warningMessage', () => {
    it('should set visibleWarningMessage to true', async () => {
      const { component } = await setup();
      const warningMsg = 'warning';
      component.warningMessage = warningMsg;
      expect(component.visibleWarningMessage).toBe(true);
    });
    it('should set visibleWarningMessage NOT to true', async () => {
      const { component } = await setup();
      const warningMsg = null;
      component.warningMessage = warningMsg;
      expect(component.visibleWarningMessage).not.toBe(true);
    });
  });

  it('should return form control category ', async () => {
    const { component } = await setup();
    const form = ProcurementProcess();
    component.processForm = form;
    const result = component.categoryControl;
    const expectedResult = form.get('category') as UntypedFormControl;

    expect(result).toEqual(expectedResult);
  });
  it('should return form control justification ', async () => {
    const { component } = await setup();
    const form = ProcurementProcess();
    component.processForm = form;
    const result = component.justificationControl;
    const expectedResult = form.get('justification') as UntypedFormControl;

    expect(result).toEqual(expectedResult);
  });
  it('should emit on valueCahnge', async () => {
    const { component } = await setup();

    const emitSpy = jest.spyOn(component.changeDropdown, 'emit');
    const event: any = {};
    const dropdownValue: any = 1;
    component.valueChange(event, dropdownValue);

    expect(emitSpy).toHaveBeenCalledWith({ event, dropdownValue });
  });
});
