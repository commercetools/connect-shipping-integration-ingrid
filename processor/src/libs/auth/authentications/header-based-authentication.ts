import type { Authentication, HeaderPrincipal } from '../types';

export class HeaderBasedAuthentication implements Authentication<HeaderPrincipal, string> {
  private authHeader: string;

  constructor(authHeader: string) {
    this.authHeader = authHeader;
  }

  hasPrincipal(): boolean {
    return !!this.getPrincipal();
  }

  getAuthorities(): string[] {
    return [];
  }

  hasCredentials(): boolean {
    return !!this.getCredentials();
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
