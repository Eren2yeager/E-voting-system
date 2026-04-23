"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SoftAurora from "@/components/ui/SoftAurora";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowRight,
  BarChart3,
  Fingerprint,
  KeyRound,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Sparkles,
  Vote,
} from "lucide-react";
import { cn } from "@/lib/utils";

function dashboardHref(role: string | undefined) {
  return role === "admin" ? "/admin" : "/dashboard";
}

function dashboardLabel(role: string | undefined) {
  return role === "admin" ? "Admin hub" : "Dashboard";
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-xl",
        "transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-md",
        className,
      )}
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function LandingPage() {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated" && !!session?.user;
  const role = session?.user?.role;
  const hubHref = signedIn ? dashboardHref(role) : "/login";
  const hubLabel = signedIn ? dashboardLabel(role) : "Sign in";
  const showSetup = !signedIn || role === "admin";

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0">
        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1}
          color1="#f7f7f7"
          color2="#e100ff"
          noiseFrequency={2.5}
          noiseAmplitude={1}
          bandHeight={0.5}
          bandSpread={1}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={1}
          enableMouseInteraction
          mouseInfluence={0.25}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/75 via-background/55 to-background/92"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)_/_0.12),transparent)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-base sm:text-lg">SecureVote</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {showSetup ? (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                asChild
              >
                <Link href="/admin/register">Setup</Link>
              </Button>
            ) : null}
            {status === "loading" ? (
              <Button size="sm" className="min-w-[7.5rem] shadow-sm" disabled>
                …
              </Button>
            ) : signedIn ? (
              <Button size="sm" className="gap-1.5 shadow-sm" asChild>
                <Link href={hubHref}>
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  {hubLabel}
                </Link>
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5 shadow-sm" asChild>
                <Link href="/login">
                  Sign in
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary"
            >
              <Sparkles className="h-3 w-3" />
              E-voting · privacy first
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.08]">
              Cast once.
              <span className="block bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent dark:from-primary dark:via-violet-400 dark:to-fuchsia-400">
                Count with confidence.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              A modern ballot experience for your course project: anonymous
              tallies, RSA-protected votes, and admin tools that stay out of the
              voter&apos;s way.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              {status === "loading" ? (
                <Button
                  size="lg"
                  className="h-12 rounded-2xl px-8 text-base"
                  disabled
                >
                  Loading…
                </Button>
              ) : signedIn ? (
                <Button
                  size="lg"
                  className="h-12 gap-2 rounded-2xl px-8 text-base shadow-lg shadow-primary/15"
                  asChild
                >
                  <Link href={hubHref}>
                    <LayoutDashboard className="h-4 w-4" />
                    {role === "admin" ? "Open admin hub" : "Open dashboard"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="h-12 gap-2 rounded-2xl px-8 text-base shadow-lg shadow-primary/15"
                  asChild
                >
                  <Link href="/login">
                    Open sign in
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl px-8 text-base backdrop-blur-sm"
                asChild
              >
                <Link href="#features">Explore features</Link>
              </Button>
            </div>
            {signedIn && session?.user?.name ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {session.user.name}
                </span>
              </p>
            ) : null}
            <p className="mt-10 text-xs text-muted-foreground sm:text-sm">
              Stack you can demo:{" "}
              <span className="font-mono text-foreground/80">Next.js</span> ·{" "}
              <span className="font-mono text-foreground/80">MongoDB</span> ·{" "}
              <span className="font-mono text-foreground/80">NextAuth</span> ·{" "}
              <span className="font-mono text-foreground/80">RSA-OAEP</span>
            </p>
          </div>

          <div
            id="features"
            className="mx-auto mt-20 w-full max-w-5xl scroll-mt-24"
          >
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built for trust
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
                Stitch-style clarity: fewer buzzwords, more of what examiners
                and voters actually care about.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              <FeatureCard
                icon={KeyRound}
                title="RSA-encrypted ballots"
                description="Choices leave the browser wrapped for the server’s public key—counting uses the private key on trusted infrastructure only."
              />
              <FeatureCard
                icon={Fingerprint}
                title="Identity separate from votes"
                description="A simple flag stops double voting without storing who picked whom—anonymity stays in the design, not just the brochure."
              />
              <FeatureCard
                icon={Vote}
                title="One ballot per voter"
                description="Voters land on a focused dashboard; admins manage users, candidates, and decrypted analytics from their own hub."
              />
              <FeatureCard
                icon={Lock}
                title="Admin-gated accounts"
                description="After the first bootstrap admin, new voters are created by administrators—no public self-registration noise."
              />
              <FeatureCard
                icon={BarChart3}
                title="Live results"
                description="Authorized admins see tallies and participation insights without breaking ballot secrecy."
                className="sm:col-span-2"
              />
            </div>
          </div>
        </main>

        <footer className="relative z-10 border-t border-border/50 bg-background/60 py-8 text-center text-xs text-muted-foreground backdrop-blur-md sm:text-sm">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              SecureVote · DPDS e-voting project
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {signedIn ? (
                <Link
                  href={hubHref}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {hubLabel}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              )}
              {showSetup ? (
                <Link
                  href="/admin/register"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Admin setup
                </Link>
              ) : null}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
