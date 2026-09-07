export interface UserToken {
  exp?: number;
  nbf?: number;
  ver?: string;
  iss?: string;
  sub?: string;
  aud?: string;
  acr?: string;
  nonce?: string;
  iat?: number;
  auth_time?: number;
  name?: string;
  given_name?: string;
  family_name?: string;
  userCategory?: string;
  idbUserType?: string;
  organization?: string;
  group?: string;
  idbApps?: string;
  email?: string;
  country?: string;
  unique_name?: string;
  tid?: string;
  sapUserId?: string;
  preferredLanguage?: string;
}
