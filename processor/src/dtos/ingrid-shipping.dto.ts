import { Static, Type } from '@sinclair/typebox';
import { Parse } from '@sinclair/typebox/syntax';
import { IngridCreateSessionResponse } from '../clients/types/ingrid.client.type';

export const InitSessionRequestSchema = Type.Object({
  sessionId: Type.String(),
});

export const InitSessionResponseSchema = Type.Object({
  html_snippet: Type.String(),
  session: Type.Any(),
  token: Type.String(),
});

export type InitSessionRequestSchemaDTO = Static<typeof InitSessionRequestSchema>;
export type InitSessionResponseSchemaDTO = Static<typeof InitSessionResponseSchema>;
