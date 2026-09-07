import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PermissionEnum } from '@core/enums/permission.enum';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { provideMockStore } from '@ngrx/store/testing';
import { mockPermissionService } from '../../../../test/test-helpers';
import { DisplayByPermissionsDirective } from './display-by-permissions.directive';

@Component({
  template: `
    <button *fiDisplayByPermissions="permissions">
      Only can view this with permissions
    </button>
  `,
})
class TestComponentDirective {
  permissions: PermissionEnum[] = [];
}

describe('DisplayByPermissionsDirective', () => {
  let fixture: ComponentFixture<TestComponentDirective>;
  let component: TestComponentDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayByPermissionsDirective, TestComponentDirective],
      providers: [
        provideMockStore({}),
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponentDirective);
    component = fixture.componentInstance;
  });

  it('should show element when has permissions', () => {
    component.permissions = [
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    ];
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button).not.toBeNull();
  });
});
