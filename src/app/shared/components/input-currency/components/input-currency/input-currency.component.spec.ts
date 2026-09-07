import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { inputCurrency } from './input-currency-form.form';
import { FiInputCurrencyComponent } from './input-currency.component';

async function setup() {
  const { fixture } = await render(FiInputCurrencyComponent, {
    componentProperties: {
      form: inputCurrency(),
      numberOfDecimals: 2,
      isAmountRequired: true,
    },
    declarations: [FiInputCurrencyComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('FiInputCurrencyComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('setFormat', () => {
    it('should set format n2', async () => {
      const { component } = await setup();
      component.setFormat(2);
      expect(component.format).toBe('n2');
    });
    it('should set format n3', async () => {
      const { component } = await setup();
      component.setFormat(0);
      expect(component.format).toBe('n0');
    });
  });

  describe('writeValue value', () => {
    it('should set form value', async () => {
      const { component } = await setup();
      const value = {
        amount: 10,
        currency: {
          currency: 'EUR',
        },
      };
      component.writeValue(value);
      expect(component.form.get('amount').value).toBe(10);
      expect(component.form.get('currency').value).toBe('EUR');
    });
  });
  describe('registerOnChange', () => {
    it('should set onChange', async () => {
      const { component } = await setup();
      const fn = () => {};
      component.registerOnChange(fn);
      expect(component.onChange).toBe(fn);
    });
  });
  describe('registerOnTouched', () => {
    it('should set onTouched', async () => {
      const { component } = await setup();
      const fn = () => {};
      component.registerOnTouched(fn);
      expect(component.onTouch).toBe(fn);
    });
  });
  describe('setDisabledState', () => {
    it('should set disabled', async () => {
      const { component } = await setup();
      component.setDisabledState(true);
      expect(component.isDisabled).toBe(true);
    });
  });
});
