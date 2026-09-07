import { UndbDatePickerComponent } from './undb-date-picker.component';
import { MatNativeDateModule } from '@angular/material/core';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { render } from '@testing-library/angular';
import { FormControl, NgControl } from '@angular/forms';

const mockNgControl: Partial<NgControl> = {
  control: new FormControl(),
  valueAccessor: null,
};

describe('UndbDatePickerComponent', () => {
  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });
});

async function setup() {
  const { fixture } = await render(UndbDatePickerComponent, {
    declarations: [UndbDatePickerComponent],
    componentProperties: {
      ngControl: mockNgControl as NgControl,
    },
    imports: [MatNativeDateModule, TranslateTestingModule],
    providers: [provideMockStore(), ...commonTestProviders],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}
