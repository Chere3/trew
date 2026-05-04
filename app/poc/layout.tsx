import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autorouter PoC",
  description: "Proof of concept: model manager with intelligent autorouter",
};

export default function PocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
