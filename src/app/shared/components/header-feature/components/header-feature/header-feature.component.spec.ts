import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { mockState } from '@core/store';
import { provideMockStore } from '@ngrx/store/testing';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { render, screen } from '@testing-library/angular';

import { HeaderFeatureComponent } from './header-feature.component';

describe('HeaderFeatureComponent', () => {
  it('should show selected project contract code', async () => {
    await setup();
    expect(screen.getByText(/4902\/OC-CO/i)).toBeInTheDocument();
  });

  it('should show title', async () => {
    await setup();
    expect(screen.getByText(/Proyecto/i)).toBeInTheDocument();
  });

  it('should show subtitle', async () => {
    await setup();
    expect(screen.getByText(/Proceso de adquisición/i)).toBeInTheDocument();
  });

  it('should show feature title', async () => {
    await setup();
    expect(screen.getByText(/Nuevo proceso/i)).toBeInTheDocument();
  });
});

const initialState = { ...mockState };
initialState.selectedProject = {
  error: '',
  loaded: true,
  loading: false,
  selectedProject: {
    contract: '4902/OC-CO',
  },
} as any;

async function setup() {
  await render(HeaderFeatureComponent, {
    componentProperties: {
      feature: 'Nuevo proceso',
      subtitle: 'Proceso de adquisición',
      title: 'Proyecto',
    },
    imports: [LayoutModule, HttpClientTestingModule],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    providers: [provideMockStore({ initialState })],
  });
}
