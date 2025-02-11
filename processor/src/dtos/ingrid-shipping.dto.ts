import { Static, Type } from '@sinclair/typebox';

export const InitSessionResponseSchema = Type.Union([
  Type.Object({
    html: Type.String(),
    success: Type.Boolean(),
    ingridSessionId: Type.String(),
  }),
  Type.Object({ success: Type.Boolean(), message: Type.String() }),
]);

export type InitSessionResponseSchemaDTO = Static<typeof InitSessionResponseSchema>;
