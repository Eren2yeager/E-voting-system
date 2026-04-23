import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/Separator";
import {
  LogOut,
  Vote,
  ShieldCheck,
  User,
  Key,
  Fingerprint,
  Database,
  Lock,
  ArrowRight,
  UserCircle2,
} from "lucide-react";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/models/User";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";

export default async function VoterDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  await dbConnect();
  const user = await UserModel.findById(session.user.id)
    .select("hasVoted imageUrl")
    .lean() as
    | { hasVoted?: boolean; imageUrl?: string }
    | null;
  const role = session.user.role;
  if (role === "admin") {
    redirect("/admin");
  }

  const hasVoted = !!user?.hasVoted;
  const displayName = session.user.name ?? "Voter";
  const profileImageUrl = user?.imageUrl ?? session.user.image ?? "";

  return (
    <div className="flex min-h-dvh flex-col overflow-y-hidden bg-transparent">
      <header className="border-b border-border/80 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block text-sm sm:text-base">SecureVote</span>
              <span className="block text-[10px] sm:text-xs font-normal text-muted-foreground -mt-0.5">
                Voter hub
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
     
            <Button variant="outline"  className="hidden sm:inline-flex P-3" asChild>
              <Link href="/profile" className="gap-1.5">
                <UserCircle2 className="h-3.5 w-3.5" />
                Profile
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" asChild>
              <Link href="/profile" aria-label="Profile">
                <UserCircle2 className="h-4 w-4" />
              </Link>
            </Button>
            <div className="shrink-0">
              <ThemeToggle />
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <section
          className={cn(
            "rounded-2xl border border-primary/20 p-6 sm:p-8",
            "bg-gradient-to-br from-primary/8 via-primary/3 to-background",
            "shadow-sm"
          )}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-widest">
                Active election
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                Cast your choice once — it stays private
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                This app uses Next.js, MongoDB, and RSA–OAEP-encrypted ballot blobs. Your login never travels with
                the vote record, so the tally stays anonymous.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <div className="hidden sm:block">
                <UserAvatar name={displayName} imageUrl={profileImageUrl} size={48} className="ring-2 ring-primary/20" />
              </div>
              {hasVoted ? (
                <Badge className="h-8 px-3 text-sm bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  Ballot submitted
                </Badge>
              ) : (
                <Badge variant="outline" className="h-8 px-3 text-sm border-amber-500/50 text-amber-800 dark:text-amber-300">
                  Ready to vote
                </Badge>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <Card
            className={cn(
              "lg:col-span-3 overflow-hidden border-2",
              hasVoted ? "border-emerald-500/25" : "border-primary/25"
            )}
          >
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Vote className="h-5 w-5 text-primary" />
                Your ballot
              </CardTitle>
              <CardDescription>
                {hasVoted
                  ? "You have already used your one vote. The database records only an anonymous encrypted value."
                  : "Select one candidate. After you confirm, you cannot vote again on this account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl p-4",
                  hasVoted ? "bg-emerald-500/5" : "bg-primary/5"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                      hasVoted ? "bg-emerald-500/15" : "bg-primary/10"
                    )}
                  >
                    {hasVoted ? (
                      <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Vote className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {hasVoted ? "Vote locked in" : "Voting is open"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasVoted
                        ? "No personal receipt is stored — that protects anonymity."
                        : "Review candidates, then confirm once. RSA encrypts the choice before it is stored."}
                    </p>
                  </div>
                </div>
                {hasVoted ? (
                  <Button variant="secondary" asChild>
                    <Link href="/profile">View profile & password</Link>
                  </Button>
                ) : (
                  <Button className="w-full sm:w-auto gap-2" asChild>
                    <Link href="/vote">
                      Go to ballot
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <UserAvatar name={displayName} imageUrl={profileImageUrl} size={40} className="ring-1 ring-border" />
                  <div className="min-w-0">
                    <p className="text-muted-foreground">Signed in as</p>
                    <p className="font-mono font-medium break-all">{session.user.name}</p>
                  </div>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">Change your password anytime under Profile — username stays the same.</p>
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link href="/profile">Open profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Built into this app
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex gap-3 rounded-xl border bg-card/50 p-4">
              <Key className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">RSA–OAEP ballots</p>
                <p className="text-sm text-muted-foreground">
                  The candidate id is wrapped with a public key in the server before storage; tally uses the private
                  key (admin only).
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-card/50 p-4">
              <Fingerprint className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No identity in the vote table</p>
                <p className="text-sm text-muted-foreground">
                  A separate flag on your user record prevents double-voting, without keeping your pick next to
                  your name.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-card/50 p-4">
              <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">MongoDB + NextAuth</p>
                <p className="text-sm text-muted-foreground">
                  Session-based access for the ballot; credentials never leave the browser in plain text to other
                  voters.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border bg-card/50 p-4">
              <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Admin-only registration</p>
                <p className="text-sm text-muted-foreground">
                  New voter accounts are created by an administrator, not a public self-signup page.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            SecureVote · 2026 DPDS project
          </span>
          <span>MongoDB · Next.js · NextAuth · RSA</span>
        </div>
      </footer>
    </div>
  );
}
