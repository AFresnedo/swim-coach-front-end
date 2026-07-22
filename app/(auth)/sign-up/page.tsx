import { headers } from "next/headers";
import SignUpForm from "@/app/(auth)/sign-up/_components/SignUpForm";

// A nonce-based CSP requires reading the request header here, in a Server
// Component — Turnstile's <Script> tag needs it, but SignUpForm itself is a
// Client Component and headers() isn't available there.
export default async function SignUpPage() {
  const nonce = (await headers()).get("x-nonce");
  return <SignUpForm nonce={nonce} />;
}
