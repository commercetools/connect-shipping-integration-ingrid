import { Authentication, HeaderPrincipal, SessionPrincipal } from './types/authn.type';

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
    return this.getPrincipal() !== undefined;
  }
  getAuthorities(): string[] {
    return this.authorities || [];
  }
  hasCredentials(): boolean {
    return this.getCredentials() !== undefined;
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

export class HeaderBasedAuthentication implements Authentication<HeaderPrincipal, string> {
  private authHeader: string;

  constructor(authHeader: string) {
    this.authHeader = authHeader;
  }

  hasPrincipal(): boolean {
    return this.getPrincipal() != undefined;
  }

  getAuthorities(): string[] {
    return [];
  }

  hasCredentials(): boolean {
    return this.getCredentials() != undefined;
  }

  getCredentials(): string {
    return this.authHeader;
  }

  getPrincipal(): HeaderPrincipal {
    return {
      authHeader: this.authHeader,
    };
  }

  isAuthenticated(): boolean {
    return false;
  }
}
