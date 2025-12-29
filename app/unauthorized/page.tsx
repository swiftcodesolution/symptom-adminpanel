// app/unauthorized/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import { signOut } from "firebase/auth";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You don&apos;t have permission to access this page.
        </p>
      </div>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
