export type CommercetoolsToken = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
};

export interface AuthorizationService {
  getAccessToken(): Promise<CommercetoolsToken>;
}
