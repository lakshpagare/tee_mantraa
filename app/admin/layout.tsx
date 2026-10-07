import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminRole } from "@/lib/constants";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defence in depth: middleware already guards /admin, and every /api/admin route re-checks the role.
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!isAdminRole(session.user.role)) redirect("/?error=unauthorized");
  const settings = await getSettings();
  return <AdminShell user={{ name: session.user.name, email: session.user.email }} brand={settings.brandName}>{children}</AdminShell>;
}
