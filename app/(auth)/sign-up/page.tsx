import { headers } from "next/headers";
import SignUpForm from "@/app/(auth)/sign-up/_components/SignUpForm";
import { DynamicHole } from "@/components/DynamicHole";

// A separate function so the nonce read sits inside DynamicHole's boundary
// below, as cacheComponents requires — SignUpForm itself is a Client
// Component and can't call headers() directly.
async function SignUpFormWithNonce() {
  const nonce = (await headers()).get("x-nonce");
  return <SignUpForm nonce={nonce} />;
}

export default function SignUpPage() {
  return (
    <DynamicHole>
      <SignUpFormWithNonce />
    </DynamicHole>
  );
}
