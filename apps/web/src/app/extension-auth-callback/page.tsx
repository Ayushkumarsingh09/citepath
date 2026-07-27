import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui";

export default async function ExtensionAuthCallbackPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/extension-auth-callback");

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4">
      <div className="surface max-w-lg p-8 text-center">
        <h1 className="font-display text-2xl">Extension connected</h1>
        <p className="mt-3 text-sm text-muted">
          You are signed in as {user.email}. The CitePath extension can now use this browser session to
          read the posting queue. We never ask for your Reddit password.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button href="/dashboard">Back to app</Button>
          <Button href="/settings" variant="secondary">
            View activity
          </Button>
        </div>
      </div>
    </div>
  );
}
