import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

export const optionalHttpUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Must be an HTTP or HTTPS URL");

export const regionSchema = z
  .string()
  .trim()
  .max(100)
  .regex(/^[\p{L}\p{N} &,'()./-]*$/u, "Invalid region");

export function parseDateParam(value: string | undefined): Date | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

export function nextDateParam(value: string): Date | null {
  const date = parseDateParam(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}
