import { Static, Type } from '@sinclair/typebox';
import { Parse } from '@sinclair/typebox/syntax';
import { IngridCreateSessionResponse } from '../clients/ingrid/types/ingrid.client.type';

export const InitSessionRequestSchema = Type.Union([
  Type.Object({
    sessionId: Type.Optional(Type.String()),
  }),
  Type.Null(),
]);

export const InitSessionResponseSchema = Type.Union([
  Type.Object({
    html: Type.String(),
    success: Type.Boolean(),
    ingridSessionId: Type.String(),
  }),
  Type.Object({ success: Type.Boolean(), message: Type.String() }),
]);

export type InitSessionRequestSchemaDTO = Static<typeof InitSessionRequestSchema>;
export type InitSessionResponseSchemaDTO = Static<typeof InitSessionResponseSchema>;
