import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Create account - Trew",
  description: "Create a new Trew account to access all AI models in one place.",
};

export default async function RegisterPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/chat");
  }

 
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started with Trew today"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
