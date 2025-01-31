import { Static, Type } from '@sinclair/typebox';

export const InitSessionRequestSchema = Type.Union([
  Type.Object({
    sessionId: Type.Optional(Type.String()),
  }),
  Type.Null(),
]);

export const InitSessionResponseSchema = Type.Object({
  html_snippet: Type.String(),
  session: Type.Any(),
  token: Type.Optional(Type.String()),
});

export type InitSessionRequestSchemaDTO = Static<typeof InitSessionRequestSchema>;
export type InitSessionResponseSchemaDTO = Static<typeof InitSessionResponseSchema>;
