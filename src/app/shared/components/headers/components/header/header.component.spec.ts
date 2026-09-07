import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { DrawerMenuItem } from '@core/models';
import { render } from '@testing-library/angular';
import { HeaderComponent } from './header.component';

async function setup() {
  const { fixture } = await render(HeaderComponent, {
    declarations: [HeaderComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    providers: [{ provide: 'windowObject', useValue: window }],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('HeaderComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('drawer', () => {
    it('should swap toogle value', async () => {
      const { component } = await setup();
      component.toggle = true;

      component.drawer();
      expect(component.toggle).toBe(false);
    });
  });
  describe('navigateTo', () => {
    it('should emit pathEmitter', async () => {
      const { component } = await setup();
      const item: DrawerMenuItem = null;
      const spy = jest.spyOn(component.pathEmitter, 'emit');

      component.navigateTo(item);
      expect(spy).toHaveBeenCalled();
    });
  });
});
