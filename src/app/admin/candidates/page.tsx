import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/Badge";
import { CandidatesAdminClient } from "@/components/CandidatesAdminClient";
import { getAdminCandidateRows } from "@/lib/candidatesList";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { UserAvatar } from "@/components/UserAvatar";

export default async function AdminCandidatesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await dbConnect();
  const me = (await User.findById(session.user.id)
    .select("username imageUrl")
    .lean()) as { username?: string; imageUrl?: string } | null;
  const navName = me?.username ?? session.user.name ?? "Admin";
  const navImageUrl = me?.imageUrl ?? session.user.image ?? "";

  const initialCandidates = await getAdminCandidateRows();

  return (
    <div className="flex min-h-dvh flex-col overflow-y-hidden bg-transparent">
      <nav className="border-b glass sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to admin
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-border/60">
              <UserAvatar name={navName} imageUrl={navImageUrl} size={36} className="ring-1 ring-border shrink-0" />
              <span className="text-sm text-muted-foreground max-w-[100px] truncate" title={navName}>
                {navName}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Candidates</h1>
            <p className="text-muted-foreground text-sm">
              Add, edit, or remove options on the ballot. Voters only see this list when signed in.
            </p>
          </div>
        </div>

        <CandidatesAdminClient initialCandidates={initialCandidates} />
      </main>
    </div>
  );
}
