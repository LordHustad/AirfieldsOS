export type UserRole =
  | 'AIRFIELD_MANAGER'
  | 'DUTY_CONTROLLER'
  | 'FBO_ADMIN'
  | 'ACCOUNTS_OFFICER';

export interface SaaSUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  airfieldName: string;
  icao: string;
  avatarColor: string;
  title: string;
  createdAt: string;
}

export interface SaaSOrganization {
  id: string;
  name: string;
  icao: string;
  location: string;
  tier: 'STRIP' | 'LICENSED' | 'REGIONAL';
  primaryRadio: string;
  ownerUserId: string;
  createdAt: string;
}

export interface AuthSession {
  user: SaaSUser;
  organization: SaaSOrganization;
  token: string;
  expiresAt: string;
}
