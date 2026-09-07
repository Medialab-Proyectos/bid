import { sidebarReducer, SidebarState } from './sidebar.reducer';
import * as actions from '../actions/sidebar.actions';
import { MenuItem } from '@core/models';

describe('sidebarReducer', () => {
  it('should update the state when getSidebar action is dispatched', () => {
    const action = actions.getSidebar();

    const result = sidebarReducer(sidebarStateMock, action);
    const resultExpected = JSON.parse(JSON.stringify(sidebarStateMock));

    expect(result).toEqual({ ...resultExpected, loading: true });
  });
  it('should update the state when getSidebarSucces action is dispatched', () => {
    const sidebarData: MenuItem[] = [{ text: 'Item 1' }, { text: 'Item 2' }];
    const action = actions.getSidebarSucces({ sidebar: sidebarData });

    const result = sidebarReducer(sidebarStateMock, action);
    const resultExpected = JSON.parse(JSON.stringify(sidebarStateMock));
    resultExpected.loading = false;
    resultExpected.loaded = true;
    resultExpected.sidebar = [...sidebarData];

    expect(result).toEqual(resultExpected);
  });

  it('should update the state when getSidebarError action is dispatched', () => {
    const error = 'Error message';
    const action = actions.getSidebarError({ payload: error });

    const result = sidebarReducer(sidebarStateMock, action);
    const resultExpected = JSON.parse(JSON.stringify(sidebarStateMock));
    resultExpected.loading = false;
    resultExpected.loaded = true;
    resultExpected.error = error;

    expect(result).toEqual(resultExpected);
  });
});

const sidebarStateMock: SidebarState = {
  sidebar: [],
  loaded: true,
  loading: false,
  error: null,
};
