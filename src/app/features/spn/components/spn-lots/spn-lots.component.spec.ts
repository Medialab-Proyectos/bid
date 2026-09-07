import { SpnLotsComponent } from './spn-lots.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { render } from '@testing-library/angular';
import { FormArray } from '@angular/forms';

describe('SpnLotsComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});

async function setup() {
  const { fixture } = await render(SpnLotsComponent, {
    imports: [TranslateTestingModule],
    declarations: [SpnLotsComponent],
    providers: [...commonTestProviders],
    componentProperties: {
      lots: new FormArray([]),
    },
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}
