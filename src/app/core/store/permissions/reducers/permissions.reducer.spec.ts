import {
  permissionReducer,
  PermissionState,
  permissionInitialState,
} from './permissions.reducers';
import * as actions from '../actions/permissions.actions';
import { Permission } from '@core/models';
import { PermissionEnum } from '@core/enums';

const initialState: PermissionState = {
  permissions: [],
  loaded: false,
  loading: false,
  error: null,
};

describe('authenticate reducer', () => {
  it('should store permission in state', () => {
    expect(
      permissionReducer(initialState, { type: '[Permissions] Get Permissions' })
    ).toEqual({
      ...initialState,
      loading: false,
    });
  });
  it('should update the state when getUserPermissionsSuccess action is dispatched', () => {
    const initialState = permissionInitialState;

    const action = actions.getUserPermissionsSuccess({
      permissions: permissionsMock,
    });

    const result = permissionReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
    expect(result.permissions).toEqual(permissionsMock);
  });

  it('should update the state when getUserPermissionsError action is dispatched', () => {
    const initialState = permissionInitialState;
    const error = 'Error message';
    const action = actions.getUserPermissionsError({ payload: error });

    const result = permissionReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.loaded).toBe(true);
    expect(result.error).toBe(error);
  });
});

const permissionsMock: Permission[] = [
  {
    contractNumber: 'contractNumber 1',
    permissions: [PermissionEnum.ADD_DELETE_BANK_RESPONSE_DOCUMENT],
    roleType: 'roleType1',
    roleIdCode: 'roleIdCode1',
    roleName: 'roleName1',
  },
];
