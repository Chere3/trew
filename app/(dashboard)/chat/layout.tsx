import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { ChatInterface } from "@/app/(dashboard)/chat/ChatInterface";

export const metadata: Metadata = {
  title: "Chat - Trew",
  description: "Chat with AI models",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
};

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/register");
  }

  return (
    <>
      <ChatInterface />
      <div className="hidden">{children}</div>
    </>
  );
}
