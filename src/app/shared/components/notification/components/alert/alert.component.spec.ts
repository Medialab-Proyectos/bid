import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';

import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  async function setup() {
    const { fixture } = await render(AlertComponent, {
      declarations: [AlertComponent],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    });

    const component = fixture.componentInstance;
    return { component, fixture };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('hide', () => {
    it('should set open false', async () => {
      const { component } = await setup();

      component.open = true;
      component.hide();
      expect(component.open).toBeFalsy();
    });
    it('should emit openChange', async () => {
      const { component } = await setup();

      const spy = jest.spyOn(component.openChange, 'emit');

      component.open = true;
      component.hide();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setAlertClass', () => {
    describe('when type is warning', () => {
      it('should set classAlert', async () => {
        const { component } = await setup();

        component.setAlertClass('warning');
        expect(component.classAlert).toEqual('c-alert--warning');
      });
      it('should set iconClass', async () => {
        const { component } = await setup();

        component.setAlertClass('warning');
        expect(component.iconClass).toEqual(
          'fas fa-exclamation-triangle c-alert--warning__icon '
        );
      });
    });
    describe('when type is error', () => {
      it('should set classAlert', async () => {
        const { component } = await setup();

        component.setAlertClass('error');
        expect(component.classAlert).toEqual('c-alert--error');
      });
      it('should set iconClass', async () => {
        const { component } = await setup();

        component.setAlertClass('error');
        expect(component.iconClass).toEqual('fas fa-ban');
      });
    });

    describe('when type is success', () => {
      it('should set classAlert', async () => {
        const { component } = await setup();

        component.setAlertClass('success');
        expect(component.classAlert).toEqual('c-alert--success');
      });
      it('should set iconClass', async () => {
        const { component } = await setup();

        component.setAlertClass('success');
        expect(component.iconClass).toEqual('fas fa-check-circle');
      });
    });

    describe('when type is info', () => {
      it('should set classAlert', async () => {
        const { component } = await setup();

        component.setAlertClass('info');
        expect(component.classAlert).toEqual('c-alert--info');
      });
      it('should set iconClass', async () => {
        const { component } = await setup();

        component.setAlertClass('info');
        expect(component.iconClass).toEqual('fas fa-info-circle');
      });
    });
  });
});
