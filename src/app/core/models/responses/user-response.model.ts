export interface RoleResponse {
  roles: RoleResponseBody[];
  paging: UserPaging;
}

export interface RoleResponseBody {
  roleIdCode: string;
  roleName: string;
  roleType: string;
}

export interface PermissionResponse {
  permissions: PermissionResponseBody[];
  paging: UserPaging;
}

export interface PermissionResponseBody {
  roleType: string;
  roleIdCode: string;
  roleName: string;
  operationNumber: string;
  operationType: string;
  contractNumber: string;
  permissions: UserPermission[];
}

export interface UserPermission {
  permissionCode: string;
  permission: string;
  permissionDescription: string;
}

export interface UserPaging {
  totalRecords: number;
  next: string;
  preview: string;
  last: string;
  first: string;
}
