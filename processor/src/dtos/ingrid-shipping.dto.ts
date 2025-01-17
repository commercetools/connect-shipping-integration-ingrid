import { Static, Type } from '@sinclair/typebox';

export const InitSessionRequestSchema = Type.Object({
  sessionId: Type.String(),
});

export const InitSessionResponseSchema = Type.Object({
  result: Type.String(),
});

export type InitSessionRequestSchemaDTO = Static<typeof InitSessionRequestSchema>;
export type InitSessionResponseSchemaDTO = Static<typeof InitSessionResponseSchema>;
