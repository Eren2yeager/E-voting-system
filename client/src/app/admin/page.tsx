import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  ListChecks,
  LogOut,
  Settings,
  ShieldCheck,
  UserPlus,
  UserCircle2,
  Users,
  Vote,
} from "lucide-react";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { UserAvatar } from "@/components/UserAvatar";

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== "admin") {
    redirect("/dashboard");
  }

  await dbConnect();
  const me = (await User.findById(session.user.id)
    .select("username imageUrl")
    .lean()) as { username?: string; imageUrl?: string } | null;
  const navName = me?.username ?? session.user.name ?? "Admin";
  const navImageUrl = me?.imageUrl ?? session.user.image ?? "";

  const totalUsers = await User.countDocuments();
  const totalAdmins = await User.countDocuments({ role: "admin" });
  const totalVoters = await User.countDocuments({ role: "voter" });
  const totalVoted = await User.countDocuments({ hasVoted: true });
  const pendingVoters = Math.max(totalVoters - totalVoted, 0);
  const turnout = totalVoters > 0 ? ((totalVoted / totalVoters) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex min-h-dvh flex-col overflow-y-hidden bg-transparent">
      <nav className="border-b glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-1 border-r border-border/60 mr-0.5">
              <UserAvatar name={navName} imageUrl={navImageUrl} size={36} className="ring-1 ring-border" />
              <span className="text-sm text-muted-foreground max-w-[100px] truncate" title={navName}>
                {navName}
              </span>
            </div>
            <Badge variant="outline" className="p-3">Administrator</Badge>
            <Button variant="outline" className="hidden sm:inline-flex p-3" asChild>
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
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Election Administration Center</h1>
          <p className="text-muted-foreground mt-1">
            Centralized control for user onboarding, turnout monitoring, and secure tally oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Users size={14} />
                Total Registered Users
              </CardDescription>
              <CardTitle className="text-3xl">{totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Includes admins and voters.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Vote size={14} />
                Registered Voters
              </CardDescription>
              <CardTitle className="text-3xl">{totalVoters}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Eligible accounts with voter role.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <ShieldCheck size={14} />
                Ballots Cast
              </CardDescription>
              <CardTitle className="text-3xl">{totalVoted}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{turnout}% turnout across registered voters.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Clock3 size={14} />
                Pending Votes
              </CardDescription>
              <CardTitle className="text-3xl">{pendingVoters}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Registered voters who have not voted yet.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Administrative Actions
              </CardTitle>
              <CardDescription>Manage operations from one place.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/register">
                <Button className="w-full h-12 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Register new user
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-12 gap-2">
                  <Users className="h-4 w-4" />
                  View all users
                </Button>
              </Link>
              <Link href="/admin/results">
                <Button variant="secondary" className="w-full h-12 gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Election results
                </Button>
              </Link>
              <Link href="/admin/candidates">
                <Button variant="secondary" className="w-full h-12 gap-2">
                  <ListChecks className="h-4 w-4" />
                  Manage candidates
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Overview</CardTitle>
              <CardDescription>Current account distribution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Administrators</span>
                <Badge variant="outline">{totalAdmins}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Voters</span>
                <Badge variant="outline">{totalVoters}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm">Participation</span>
                <Badge variant="outline">{turnout}%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">System Integrity</CardTitle>
              <CardDescription>Operational health of the election platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Authentication</span>
                <Badge className="bg-green-500/20 text-green-600 border-none">Secure</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Ballot Encryption</span>
                <Badge className="bg-green-500/20 text-green-600 border-none">RSA-OAEP</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Double-vote Protection</span>
                <Badge className="bg-green-500/20 text-green-600 border-none">Enforced</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Admin-only Registration</span>
                <Badge className="bg-green-500/20 text-green-600 border-none">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Admin Checklist</CardTitle>
              <CardDescription>Recommended runbook for each election session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Verify voter onboarding list.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Monitor turnout and pending voters.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Review admin analytics before closing election.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Export and archive audit artifacts.
              </div>
            </CardContent>
          </Card>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="ghost" className="gap-2">
            <LogOut size={16} />
            Sign out
          </Button>
        </form>
      </main>
    </div>
  );
}
