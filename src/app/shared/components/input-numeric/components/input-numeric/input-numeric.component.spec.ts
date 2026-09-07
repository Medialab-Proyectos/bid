import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { render } from '@testing-library/angular';
import { FiInputNumeric } from './input-numeric.component';

async function setup() {
  const { fixture } = await render(FiInputNumeric, {
    declarations: [FiInputNumeric],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('FiInputNumeric', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('addNumber', () => {
    it('should emit add event', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component.add, 'emit');

      component.addNumber();
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('subNumber', () => {
    it('should emit sub event', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component.sub, 'emit');

      component.subNumber();
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('onChangeNumber', () => {
    it('should emit typed event', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component.typed, 'emit');

      component.onChangeNumber(1);
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('writeValue', () => {
    it('should set currentValue', async () => {
      const { component } = await setup();
      component.writeValue(10);
      expect(component.currentValue).toBe(10);
    });
  });
  describe('registerOnChange', () => {
    it('should set onChange', async () => {
      const { component } = await setup();
      const fn = () => {};

      component.registerOnChange(fn);
      expect(component.onChange).toEqual(fn);
    });
  });
  describe('registerOnTouched', () => {
    it('should set onTouch', async () => {
      const { component } = await setup();
      const fn = () => {};

      component.registerOnTouched(fn);
      expect(component.onTouch).toEqual(fn);
    });
  });
  describe('setDisabledState', () => {
    it('should set disabled', async () => {
      const { component } = await setup();
      const syp = jest.spyOn(component, 'setDisabledState');
      component.setDisabledState();
      expect(syp).toHaveBeenCalled();
    });
  });
});
