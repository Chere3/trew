import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { ChatInterface } from "@/app/(dashboard)/chat/ChatInterface";

export const metadata: Metadata = {
  title: "Chat - Trew",
  description: "Chat with AI models",
};

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/register");
  }

  return <ChatInterface />;
}