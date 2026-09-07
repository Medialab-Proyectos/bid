import { PermissionEnum } from '@core/enums';

export interface Permission extends RoleObj {
  contractNumber: string;
  permissions: PermissionEnum[];
}

export interface RoleObj {
  roleType: string;
  roleIdCode: string;
  roleName?: string;
}
