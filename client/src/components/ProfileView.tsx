"use client";

import Link from "next/link";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ProfileImageForm } from "@/components/ProfileImageForm";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, Shield, Vote, ArrowLeft, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme-toggle";

export type ProfileViewProps = {
  username: string;
  imageUrl: string;
  role: "admin" | "voter";
  hasVoted: boolean;
  createdAt: string;
};

export function ProfileView({ username, imageUrl, role, hasVoted, createdAt }: ProfileViewProps) {
  const isAdmin = role === "admin";
  const homeHref = isAdmin ? "/admin" : "/dashboard";

  return (
    <div className="flex min-h-dvh flex-col overflow-y-hidden bg-transparent">
      <header className="border-b glass sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href={homeHref}>
              <ArrowLeft className="h-4 w-4" />
              {isAdmin ? "Admin home" : "Dashboard"}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <UserAvatar name={username} imageUrl={imageUrl} size={32} className="ring-1 ring-border" />
              <span className="font-medium text-foreground max-w-[120px] truncate">{username}</span>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Admin" : "Voter"}
              </Badge>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile & security</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin
              ? "Account details are read-only except your password. Use the admin home for user and candidate management."
              : "Your voting record is not shown here. You can only update your account password in this app."}
          </p>
        </div>

        <Card className="border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </CardTitle>
            <CardDescription>Fields that identify your session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3 pb-2 border-b border-border/50">
              <UserAvatar name={username} imageUrl={imageUrl} size={64} className="ring-2 ring-primary/20" />
              <div>
                <p className="text-xs text-muted-foreground">Preview</p>
                <p className="text-sm">Shown on your dashboard and here when a URL is set</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-border/50">
              <span className="text-muted-foreground">Username</span>
              <span className="font-mono font-medium">{username}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-border/50">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="outline" className="w-fit">
                {isAdmin ? "Administrator" : "Voter"}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-border/50">
              <span className="text-muted-foreground">Member since</span>
              <span>{createdAt}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2">
              <span className="text-muted-foreground">Ballot status</span>
              {isAdmin ? (
                <span className="text-muted-foreground text-right max-w-xs">
                  Admins are not part of the voter tally. Voter accounts can cast one secret ballot.
                </span>
              ) : hasVoted ? (
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                  <Vote className="h-4 w-4" />
                  You have already voted
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-medium">
                  Not yet cast — you can open the ballot from the dashboard
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              How this app uses your data
            </CardTitle>
            <CardDescription>Aligned with SecureVote: MongoDB, NextAuth, and RSA-encrypted ballots</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Login is checked against your account only; the vote record in the database has no user id attached.</p>
            <p>• Ballots are encrypted with RSA-OAEP before storage; only the server tally step decrypts to count them.</p>
            {!isAdmin && (
              <p>• We never store a receipt that links you to your pick — that is by design for anonymity.</p>
            )}
            {isAdmin && (
              <p>
                • As admin, you run registration and public candidates; for operations use{" "}
                <Link href="/admin" className="text-primary underline">
                  the admin home
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <ProfileImageForm key={imageUrl} initialImageUrl={imageUrl} />

        <ChangePasswordForm />

        {isAdmin ? (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Back to admin
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to voter dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/vote">Open ballot</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
