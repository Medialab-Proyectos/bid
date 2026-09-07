import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { ProcessOutputsComponent } from './process-outputs.component';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { provideMockStore } from '@ngrx/store/testing';
import {
  ProcessOutputs,
  createProcessOutputs,
} from '../../procurement-process.form';
import { UntypedFormArray } from '@angular/forms';

describe('ProcessOutputsComponent', () => {
  async function setup() {
    const { fixture } = await render(ProcessOutputsComponent, {
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [provideMockStore({})],
      declarations: [ProcessOutputsComponent, IfNumberPipe],
    });
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('selectComponent', () => {
    it('should emit the index string event', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.selectedComponent, 'emit');
      component.selectComponent('string');
      fixture.detectChanges();
      expect(component.selectedComponent.emit).toHaveBeenCalled();
    });
  });

  describe('addOutputFormGroup', () => {
    it('should emit the event', async () => {
      const { component, fixture } = await setup();

      jest.spyOn(component.addOutput, 'emit');
      component.addOutputFormGroup();
      fixture.detectChanges();
      expect(component.addOutput.emit).toHaveBeenCalled();
    });
  });

  describe('deleteOutputFormGroup', () => {
    it('should remove at index if outputsAsigned is more than 1', async () => {
      const { component } = await setup();
      const form = ProcessOutputs();
      const newoutput1 = createProcessOutputs();
      newoutput1.controls.id.setValue('your-component-id');
      newoutput1.controls.percentage.setValue([
        { id: 'output1', percentage: 90 },
      ]);

      const newoutput2 = createProcessOutputs();
      newoutput2.controls.id.setValue('your-component-id2');
      newoutput2.controls.percentage.setValue([
        { id: 'output2', percentage: 90 },
      ]);
      (form.get('outputsAsigned') as UntypedFormArray).push(newoutput1);
      (form.get('outputsAsigned') as UntypedFormArray).push(newoutput2);

      component.componentsForm = form;

      component.deleteOutputFormGroup(0);

      (form.get('outputsAsigned') as UntypedFormArray).removeAt(0);

      const result = component.componentsForm.get('outputsAsigned').value;
      const resultExpected =
        component.componentsForm.get('outputsAsigned').value;

      expect(result).toEqual(resultExpected);
    });

    it('should not remove at index if outputsAsigned is 1', async () => {
      const { component } = await setup();
      const form = ProcessOutputs();
      const newoutput1 = createProcessOutputs();
      newoutput1.controls.id.setValue('your-component-id');
      newoutput1.controls.percentage.setValue([
        { id: 'output1', percentage: 90 },
      ]);

      (form.get('outputsAsigned') as UntypedFormArray).push(newoutput1);

      component.componentsForm = form;
      component.deleteOutputFormGroup(0);

      const result = component.componentsForm.get('outputsAsigned').value;
      const resultExpected =
        component.componentsForm.get('outputsAsigned').value;

      expect(result).toEqual(resultExpected);
    });
  });
});
