import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { PermissionActions } from '@core/enums';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { DisabledByActionsDirective } from './disabled-by-actions.directive';

describe('DisabledByActionsDirective', () => {
  it('should create an instance', () => {
    expect(setup).toBeTruthy();
  });
});

async function setup(permissions: PermissionActions[]) {
  await render(TestComponent, {
    componentProperties: {
      permissions,
    },
    providers: [provideMockStore({})],
    declarations: [DisabledByActionsDirective],
    imports: [HttpClientTestingModule],
  });
}
@Component({
  template: `
    <button [fiDisableByPermissions]="permissions">
      Only can enable this with permissions
    </button>
  `,
})
class TestComponent {
  permissions = [];
}
