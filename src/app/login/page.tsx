import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginClient from "@/components/LoginClient";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "admin" ? "/admin" : "/dashboard");
  }

  return <LoginClient />;
}
