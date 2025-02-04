import { Static, Type } from '@sinclair/typebox';

export const InitSessionRequestSchema = Type.Union([
  Type.Object({
    sessionId: Type.Optional(Type.String()),
  }),
  Type.Null(),
]);

const InitSessionSuccessResponseSchema = Type.Object({
  html: Type.String(),
  success: Type.Boolean(),
  ingridSessionId: Type.String(),
});

export const InitSessionResponseSchema = Type.Union([
  InitSessionSuccessResponseSchema,
  Type.Object({ success: Type.Boolean(), message: Type.String() }),
]);

export type InitSessionSuccessResponseSchemaDTO = Static<typeof InitSessionSuccessResponseSchema>;
export type InitSessionRequestSchemaDTO = Static<typeof InitSessionRequestSchema>;
export type InitSessionResponseSchemaDTO = Static<typeof InitSessionResponseSchema>;
