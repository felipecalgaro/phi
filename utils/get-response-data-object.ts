import z from "zod";

export type ResponseDataObject<T = unknown> =
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error: string;
    };

export function getResponseDataSchema<T>(schema: T) {
  return z
    .object({
      success: z.literal(false),
      error: z.string(),
    })
    .or(
      z.object({
        success: z.literal(true),
        data: schema,
      }),
    );
}
