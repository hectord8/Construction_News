"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contactMessages,
  newsletterSubscribers,
} from "@/lib/db/schema";

export type FormResult = {
  ok: boolean;
  message: string;
};

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().max(254),
  subject: z.string().max(200).optional().default(""),
  body: z.string().min(10).max(4000),
});

export async function submitContact(formData: FormData): Promise<FormResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Please check your details and try again." };
  }

  const { name, email, subject, body } = parsed.data;
  await db.insert(contactMessages).values({ name, email, subject, body });

  return { ok: true, message: "Thanks — your message has been sent." };
}

const newsletterSchema = z.object({
  email: z.email().max(254),
});

export async function subscribeNewsletter(
  formData: FormData,
): Promise<FormResult> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.email, email),
  });

  if (existing) {
    if (existing.status === "unsubscribed") {
      // Don't automatically re-subscribe - require explicit action
      return {
        ok: false,
        message:
          "This email was previously unsubscribed. Please contact us to re-subscribe.",
      };
    }
    return { ok: true, message: "You're already on the list — welcome back!" };
  }

  await db.insert(newsletterSubscribers).values({
    email,
    token: randomUUID(),
  });

  return { ok: true, message: "Subscribed! Watch your inbox for the digest." };
}
