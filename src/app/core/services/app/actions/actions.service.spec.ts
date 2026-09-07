import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PermissionActions } from '@core/enums';
import { provideMockStore } from '@ngrx/store/testing';

import { ActionsService } from './actions.service';

describe('ActionsService', () => {
  let service: ActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})],
    });
    service = TestBed.inject(ActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be handle permissions', () => {
    const permissions = [PermissionActions.VIEW_DISBURSEMENT_ACTION];
    const spy = jest.spyOn(service, 'currentUserExistsInWorkflow');
    service.handleTransactionStatus(permissions);
    expect(spy).toHaveBeenCalled();
  });

  it('should be return if current user exists in workflow', () => {
    service.currentUserExistsInWorkflow().subscribe((res) => {
      expect(res).toEqual(true);
    });
  });

  it('should be return view permission', () => {
    const permissions = [PermissionActions.VIEW_DISBURSEMENT_ACTION];
    let hasPermission = service.hasViewPermission(permissions);

    expect(hasPermission).toBe(true);
  });

  it('should be return create transaction', () => {
    const permissions = [PermissionActions.IS_CREATE];
    let hasPermission = service.isCreateTransaction(permissions);

    expect(hasPermission).toBe(true);
  });

  it('should be return edit transaction', () => {
    const permissions = [PermissionActions.IS_EDIT];
    let hasPermission = service.isEditTransaction(permissions);

    expect(hasPermission).toBe(true);
  });

  it('should be return transaction', () => {
    const permissions = [PermissionActions.TRANSACTION_ACTION];
    let hasPermission = service.hasTransactionPermission(permissions);

    expect(hasPermission).toBe(true);
  });

  it('should be return can edit transaction', () => {
    const permissions = [PermissionActions.CAN_EDIT];
    let hasPermission = service.hasCanEditTransaction(permissions);

    expect(hasPermission).toBe(true);
  });

  it('should be return can not edit transaction', () => {
    const permissions = [PermissionActions.CAN_NOT_EDIT];
    let hasPermission = service.hasCanNotEditTransaction(permissions);

    expect(hasPermission).toBe(true);
  });

  it('should be return workflow', () => {
    const permissions = [PermissionActions.WORKFLOW_PERMISSION];
    let hasPermission = service.hasWorkflowPermission(permissions);

    expect(hasPermission).toBe(true);
  });
});
