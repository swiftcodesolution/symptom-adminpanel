import { CompanyAuthProvider } from "@/lib/CompanyAuthContext";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompanyAuthProvider>{children}</CompanyAuthProvider>;
}
