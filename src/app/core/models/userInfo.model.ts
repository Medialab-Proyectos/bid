import { RoleObj } from '.';

export interface UserInfo {
  institution: string;
  user: User;
}

export interface User {
  initials?: string;
  name: string;
  roles: RoleObj[];
  email: string;
}
