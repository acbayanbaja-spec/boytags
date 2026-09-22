import { z } from "zod";

const email = z.string().email("Enter a valid email address.");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Please enter your name.").max(80),
    email,
    phone: z.string().min(7, "Enter a valid contact number.").max(20).optional(),
    password,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, "Password is required."),
    rememberMe: z.boolean().optional(),
  }),
});

export const forgotSchema = z.object({
  body: z.object({ email }),
});

export const resetSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password,
  }),
});

export const profileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().min(7).max(20).optional().nullable(),
  }),
});
