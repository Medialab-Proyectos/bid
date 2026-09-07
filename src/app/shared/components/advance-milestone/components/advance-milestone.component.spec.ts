import { AdvanceMilestoneComponent } from './advance-milestone.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';

async function setup() {
  const { fixture } = await render(AdvanceMilestoneComponent, {
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('AdvanceMilestoneComponent', () => {
  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });
});
