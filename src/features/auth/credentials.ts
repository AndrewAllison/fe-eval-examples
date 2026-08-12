import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));
const password = z
  .string()
  .min(12, "Password must contain at least 12 characters.")
  .max(128, "Password cannot exceed 128 characters.");

export const signInSchema = z.object({ email, password });

export const signUpSchema = signInSchema.extend({
  name: z.string().trim().min(2, "Name must contain at least 2 characters."),
});
