import { AccordionPanelComponent } from './accordion-panel.component';
import { render, screen, fireEvent } from '@testing-library/angular';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  template: `
    <fi-accordion-panel [open]="open" [collapsible]="collapsible">
      <ng-container number>1</ng-container>
      <ng-container title>Section title</ng-container>
      <ng-container body> collapsible body </ng-container>
    </fi-accordion-panel>
  `,
})
class TestComponent {
  open = true;
  collapsible = true;
}

describe('AccordionPanelComponent', () => {
  async function setup({ open = false, collapsible = true } = {}) {
    await render(TestComponent, {
      componentProperties: {
        open: open,
        collapsible: collapsible,
      },
      declarations: [AccordionPanelComponent],
      imports: [CommonModule],
    });
  }

  function toggleCollapse() {
    fireEvent.click(screen.getByRole('button', { hidden: true }));
  }

  describe('when panel is open', () => {
    it('should close at click button', async () => {
      await setup({ open: true, collapsible: true });

      toggleCollapse();
      const body = screen.queryByRole('panel-body', { hidden: false });

      expect(body).not.toBeTruthy();
    });
  });

  describe('when panel is closed', () => {
    it('should open at click button', async () => {
      await setup({ open: false, collapsible: true });

      toggleCollapse();

      const body = screen.queryByRole('panel-body', { hidden: false });

      expect(body).toBeTruthy();
    });
  });

  it('should no show expand/collapse button', async () => {
    await setup({ open: false, collapsible: false });

    const button = screen.queryByRole('button');

    expect(button).not.toBeTruthy();
  });

  it('should show number', async () => {
    await setup();

    const number = screen.getByText('1');

    expect(number).toBeTruthy();
  });

  it('should show title', async () => {
    await setup();

    const title = screen.getByText(/section title/i);

    expect(title).toBeTruthy();
  });
});
