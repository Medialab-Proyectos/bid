import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { BidderParentComponent } from '../bidder-parent/bidder-parent.component';

async function setup() {
  const { fixture } = await render(BidderParentComponent, {
    declarations: [],
    imports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [],
  });
  const component = fixture.debugElement.componentInstance;
  return { fixture, component };
}

describe('NewBidderComponent', () => {
  it('should build the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
