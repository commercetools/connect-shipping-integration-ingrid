export interface Authentication<Principal = unknown, Credentials = unknown> {
  hasPrincipal(): boolean;
  getAuthorities(): string[];
  hasCredentials(): boolean;
  getPrincipal(): Principal;
  getCredentials(): Credentials;
  isAuthenticated(): boolean;
}

export interface AuthenticationManager {
  authenticate(authentication: Authentication): Promise<Authentication> | Authentication;
}
