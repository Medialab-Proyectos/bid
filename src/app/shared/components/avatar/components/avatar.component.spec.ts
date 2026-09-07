import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { AvatarComponent } from './avatar.component';

const initialState = {
  contact: {
    contact: {
      given_name: 'ONLINE',
      famili_name: 'BIDDING',
    },
  },
};

async function setup() {
  const { fixture } = await render(AvatarComponent, {
    componentProperties: {
      userNameInitials: 'Test User',
    },
    declarations: [AvatarComponent],
    imports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [provideMockStore({ initialState })],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('AvatarComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
