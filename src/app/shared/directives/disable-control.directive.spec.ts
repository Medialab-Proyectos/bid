import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { DisableControlDirective } from './disable-control.directive';

@Component({
  template: `
    <input
      type="text"
      data-testid="input"
      [formControl]="control"
      [fiDisableControl]="disabled"
    />
    <button (click)="disable()">disable</button>
    <button (click)="enable()">enable</button>
  `,
})
class TestComponent {
  disabled = false;
  control = new FormControl();

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }
}

describe('DisableControlDirective', () => {
  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      getPropertyValue: () => {
        return '';
      },
    }),
  });
  async function setup() {
    const { fixture } = await render(TestComponent, {
      declarations: [DisableControlDirective],
      imports: [CommonModule, FormsModule, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    const component = fixture.componentInstance;
    return {
      component,
      fixture,
    };
  }

  it('should disable control', async () => {
    const { component, fixture } = await setup();
    screen.getByRole('button', { name: /disable/i, hidden: true }).click();
    fixture.detectChanges();
    expect(component.control.enabled).toBe(false);
  });

  it('should enable control', async () => {
    const { component, fixture } = await setup();
    screen.getByRole('button', { name: /enable/i, hidden: true }).click();
    fixture.detectChanges();
    expect(component.control.enabled).toBe(true);
  });
});
