import type { Authentication, SessionPrincipal } from '../types';

export class SessionAuthentication implements Authentication<SessionPrincipal, string> {
  private principal: SessionPrincipal;
  private authorities: string[] | undefined;
  private sessionId: string;
  private authenticated: boolean;

  constructor(sessionId: string, principal: SessionPrincipal) {
    this.principal = principal;
    this.sessionId = sessionId;
    this.authenticated = true;
  }

  hasPrincipal(): boolean {
    return !!this.getPrincipal();
  }
  getAuthorities(): string[] {
    return this.authorities || [];
  }
  hasCredentials(): boolean {
    return !!this.getCredentials();
  }
  getPrincipal() {
    return this.principal;
  }
  getCredentials() {
    return this.sessionId;
  }
  isAuthenticated(): boolean {
    return this.authenticated;
  }
}
