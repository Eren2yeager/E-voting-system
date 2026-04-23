"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BarChart3, RefreshCw, ShieldCheck, TrendingUp, User, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/UserAvatar";
import type { TallyRow } from "@/lib/electionTally";
import { cn } from "@/lib/utils";

function TallyCandidateCard({ row, percentage }: { row: TallyRow; percentage: number }) {
  const [posterError, setPosterError] = useState(false);
  const [portraitError, setPortraitError] = useState(false);

  return (
    <Card className="overflow-hidden card-hover">
      {row.posterUrl && !posterError ? (
        <div className="relative w-full h-28 border-b">
          <Image
            src={row.posterUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            onError={() => setPosterError(true)}
          />
        </div>
      ) : null}
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {row.imageUrl && !portraitError ? (
              <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden ring-1 ring-border bg-muted">
                <Image
                  src={row.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="object-cover h-full w-full"
                  onError={() => setPortraitError(true)}
                />
              </div>
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                <User className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-xl text-balance break-words">{row.name}</CardTitle>
              <CardDescription className="font-medium text-primary">{row.party}</CardDescription>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold">
              {row.count} <span className="text-sm font-normal text-muted-foreground">votes</span>
            </p>
            <p className="text-sm font-semibold text-primary">{percentage.toFixed(1)}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full bg-secondary/30 h-4 rounded-full overflow-hidden border border-border/50">
          <div
            className="bg-primary h-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface AdminResultsClientProps {
  initialResults: TallyRow[];
  adminDisplayName: string;
  adminImageUrl: string;
}

export function AdminResultsClient({
  initialResults,
  adminDisplayName,
  adminImageUrl,
}: AdminResultsClientProps) {
  const [results, setResults] = useState<TallyRow[]>(initialResults);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadResults = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/results");
      if (!res.ok) {
        setError("You do not have access or the server could not return results.");
        return;
      }
      const data = (await res.json()) as TallyRow[];
      setResults(data);
    } catch {
      setError("Could not load results. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalVotes = results.reduce((acc, curr) => acc + curr.count, 0);
  const leadingCandidate = [...results].sort((a, b) => b.count - a.count)[0];
  const sorted = [...results].sort((a, b) => b.count - a.count);

  return (
    <div className="flex min-h-dvh flex-col overflow-y-hidden bg-transparent">
      <nav className="border-b glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back to admin
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-border/60">
                <UserAvatar
                  name={adminDisplayName}
                  imageUrl={adminImageUrl}
                  size={36}
                  className="ring-1 ring-border shrink-0"
                />
                <span className="text-sm text-muted-foreground max-w-[100px] truncate" title={adminDisplayName}>
                  {adminDisplayName}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <BarChart3 className="text-primary h-10 w-10" />
              Live election analytics
            </h1>
            <p className="text-muted-foreground">
              Tallies are derived from stored ballots (decryption is server-side, admin only).
            </p>
          </div>
          <Button
            onClick={() => void loadResults()}
            variant="outline"
            size="lg"
            className="gap-2"
            isLoading={isLoading}
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        {error ? (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="pt-6 text-center text-destructive">
              <p className="font-bold">Access denied</p>
              <p className="text-sm mt-1">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Users size={14} /> Total participation
                  </CardDescription>
                  <CardTitle className="text-3xl">{totalVotes}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp size={14} /> Leading candidate
                  </CardDescription>
                  {leadingCandidate && leadingCandidate.count > 0 ? (
                    <div className="flex items-center gap-3 min-w-0 pt-1">
                      <UserAvatar
                        name={leadingCandidate.name}
                        imageUrl={leadingCandidate.imageUrl}
                        size={44}
                        className="ring-1 ring-border shrink-0"
                      />
                      <CardTitle className="text-xl sm:text-2xl leading-tight truncate min-w-0">
                        {leadingCandidate.name}
                      </CardTitle>
                    </div>
                  ) : (
                    <CardTitle className="text-3xl">N/A</CardTitle>
                  )}
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <ShieldCheck size={14} /> Report status
                  </CardDescription>
                  <CardTitle className="text-3xl text-green-500">Decrypted</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-4">
              {sorted.map((candidate) => {
                const percentage = totalVotes > 0 ? (candidate.count / totalVotes) * 100 : 0;
                return (
                  <TallyCandidateCard key={candidate.id} row={candidate} percentage={percentage} />
                );
              })}
            </div>

            <div className="p-6 rounded-xl border bg-secondary/10 flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm">Privacy note</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Results aggregate anonymous ballots. Ballots are not stored with voter identity, so this report cannot
                  identify who voted for which candidate.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
