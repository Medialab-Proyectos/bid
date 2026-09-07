import { createAction, props } from '@ngrx/store';
import { MenuItem } from '@core/models';

export const getSidebar = createAction('[SideBar Component] get Sidebar');

export const getSidebarSucces = createAction(
  '[SideBar Component] get Sidebar success',
  props<{ sidebar: MenuItem[] }>()
);
export const getSidebarError = createAction(
  '[SideBar Component] get Sidebar Error',
  props<{ payload: unknown }>()
);
