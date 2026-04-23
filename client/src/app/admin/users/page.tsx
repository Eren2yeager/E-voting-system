import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserCheck, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import dbConnect from "@/lib/mongodb";
import type { Types } from "mongoose";
import User from "@/models/User";
import { UserAvatar } from "@/components/UserAvatar";

type UserRow = {
  id: string;
  username: string;
  imageUrl: string;
  role: string;
  hasVoted: boolean;
  createdAt: string;
};

type LeanUser = {
  _id: Types.ObjectId;
  username: string;
  imageUrl?: string;
  role: string;
  hasVoted: boolean;
  createdAt?: Date;
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await dbConnect();
  const raw = (await User.find({})
    .select("username imageUrl role hasVoted createdAt")
    .sort({ createdAt: -1 })
    .lean()) as unknown as LeanUser[];
  const rows: UserRow[] = raw.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    imageUrl: u.imageUrl ?? "",
    role: u.role,
    hasVoted: u.hasVoted,
    createdAt: u.createdAt ? u.createdAt.toLocaleString() : "—",
  }));

  const me = (await User.findById(session.user.id)
    .select("username imageUrl")
    .lean()) as { username?: string; imageUrl?: string } | null;
  const navName = me?.username ?? session.user.name ?? "Admin";
  const navImageUrl = me?.imageUrl ?? session.user.image ?? "";

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
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground text-sm">
              Read-only directory of accounts. Passwords are never shown.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registered accounts</CardTitle>
            <CardDescription>
              <span className="inline-flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                {rows.length} total
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet. Use Register user on the admin home.</p>
            ) : (
              <ul className="space-y-0">
                {rows.map((u, i) => (
                  <li key={u.id}>
                    {i > 0 ? <Separator className="my-2" /> : null}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={u.username} imageUrl={u.imageUrl} size={40} className="ring-1 ring-border" />
                        <div className="min-w-0">
                          <p className="font-medium">{u.username}</p>
                          <p className="text-xs text-muted-foreground">Joined {u.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                        {u.hasVoted ? (
                          <Badge variant="outline" className="text-green-600 border-green-500/30">
                            Voted
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not voted</Badge>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-md border p-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            To add voters, go to <Link href="/admin/register" className="text-primary underline">Register new user</Link>.
            Admins are not required to cast a vote.
          </p>
        </div>
      </main>
    </div>
  );
}
