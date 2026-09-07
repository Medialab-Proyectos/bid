export interface PermissionRequest {
  contractNumber: string;
  operationNumber: string;
  roles: RoleRequest[];
}

export interface RoleRequest {
  roleIdCode?: string;
  roleType?: string;
  roleName?: string;
}
