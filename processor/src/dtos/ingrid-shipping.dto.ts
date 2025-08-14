import { type Static, Type } from '@sinclair/typebox';

/* Session Request Schemas */
export const InitSessionRequestSchema = Type.Union([
  Type.Object({
    voucherCode: Type.Optional(Type.Array(Type.String())),
  }),
  Type.Null(),
]);

/* Init Session Schemas */
const InitSessionSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  cartVersion: Type.Number(),
  ingridHtml: Type.String(),
  ingridSessionId: Type.String(),
});

export const InitSessionResponseSchema = Type.Union([InitSessionSuccessResponseSchema]);

/* Update Session Schemas */
const UpdateSessionSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  cartVersion: Type.Number(),
  ingridSessionId: Type.String(),
});

export const UpdateSessionResponseSchema = Type.Union([UpdateSessionSuccessResponseSchema]);

/* Init Session Request DTOs */
export type InitSessionRequestSchemaDTO = Static<typeof InitSessionRequestSchema>;

/* Init Session DTOs */
export type InitSessionSuccessResponseSchemaDTO = Static<typeof InitSessionSuccessResponseSchema>;
export type InitSessionResponseSchemaDTO = Static<typeof InitSessionResponseSchema>;

/* Update Session DTOs */
export type UpdateSessionSuccessResponseSchemaDTO = Static<typeof UpdateSessionSuccessResponseSchema>;
export type UpdateSessionResponseSchemaDTO = Static<typeof UpdateSessionResponseSchema>;
