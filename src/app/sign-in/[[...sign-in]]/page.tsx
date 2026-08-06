import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignIn />
    </div>
  );
}
