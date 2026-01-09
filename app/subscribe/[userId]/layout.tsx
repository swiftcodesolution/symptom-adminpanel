// app/subscribe/[userId]/layout.tsx
import { Toaster } from "@/components/ui/sonner";

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
}
