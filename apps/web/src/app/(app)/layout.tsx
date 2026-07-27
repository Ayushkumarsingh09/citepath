import { redirect } from "next/navigation";
import { getSessionUser, getActiveMembership } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const jar = await cookies();
  const workspaceId = jar.get("citepath_workspace")?.value;
  const membership = await getActiveMembership(user.id, workspaceId);
  if (!membership) redirect("/onboarding");

  return <AppShell workspaceName={membership.workspace.name}>{children}</AppShell>;
}
