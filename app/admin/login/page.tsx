import { redirect } from "next/navigation";
import { adminConfigured, isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");
  return (
    <main className="admin-auth">
      <div className="admin-auth-card">
        <p className="eyebrow">Site admin</p>
        <h1>Sign in</h1>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="admin-warn">
            Admin access is not configured on this deployment. Set <code>ADMIN_PASSWORD</code> and{" "}
            <code>ADMIN_SESSION_SECRET</code>, then redeploy.
          </p>
        )}
      </div>
    </main>
  );
}
