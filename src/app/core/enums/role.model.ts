export interface Role {
  roleIdCode: string;
  roleName: string;
  roleType: string;
  roleTypeOrigin: string;
}

export interface RolesResponse {
  roles: Role[];
}
