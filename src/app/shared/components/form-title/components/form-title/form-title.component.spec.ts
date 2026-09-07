import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormTitleComponent } from './form-title.component';
import { render, screen } from '@testing-library/angular';

async function setup() {
  const { fixture } = await render(FormTitleComponent, {
    declarations: [],
    imports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [],
  });
  const component = fixture.debugElement.componentInstance;
  return { fixture, component };
}

describe('FormTitleComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  it('should render the title correctly', async () => {
    const { fixture, component } = await setup();
    component.title = 'Test title';
    fixture.detectChanges();
    expect(screen.getByText(/title/i)).toBeInTheDocument();
  });
});
