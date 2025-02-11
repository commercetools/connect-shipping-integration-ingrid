export type HeaderPrincipal = {
  authHeader: string;
};

export type SessionPrincipal = {
  cartId: string;
  processorUrl: string;
  correlationId?: string;
};
