"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CandidateCard from "@/components/CandidateCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, CheckCircle2, ShieldAlert, Vote, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";

interface Candidate {
  _id: string;
  name: string;
  party: string;
  description: string;
  imageUrl?: string;
  posterUrl?: string;
}

export default function VoteClient() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load candidates. Please refresh.");
        setIsLoading(false);
      });
  }, []);

  const selectedCandidate = candidates.find((c) => c._id === selectedId);

  const handleVote = async () => {
    if (!selectedId) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: selectedId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "An error occurred during submission.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 3000);
      }
    } catch {
      setError("Network error. Your vote was not recorded.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-transparent p-4">
        <Card className="max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-500">
          <CardContent className="pt-12 pb-12 flex flex-col items-center text-center gap-6">
            <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 size={64} className="text-green-500 animate-in scale-in duration-700" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl">Vote Recorded</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Your secure ballot has been encrypted with RSA and stored.
                Thank you for participating in the election.
              </CardDescription>
            </div>
            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress" />
            </div>
            <p className="text-xs text-muted-foreground italic">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-transparent">
      <nav className="border-b glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <ArrowLeft size={16} />
              Exit to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Badge variant="outline" className="hidden sm:flex items-center p-3 gap-2">
                <ShieldAlert size={20} className="" />
                Session Secure
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Official Ballot</h1>
            <p className="text-muted-foreground max-w-2xl">
              Please review the candidates below carefully. You may only select one option.
              Once confirmed, your choice is final and cannot be altered.
            </p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg text-sm font-medium">
            <Vote size={18} className="text-primary" />
            <span>Select 1 Candidate</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-secondary/50 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                name={candidate.name}
                party={candidate.party}
                description={candidate.description}
                imageUrl={candidate.imageUrl}
                posterUrl={candidate.posterUrl}
                isSelected={selectedId === candidate._id}
                onVote={() => setSelectedId(candidate._id)}
                disabled={isSubmitting}
              />
            ))}
          </div>
        )}
      </main>

      {!isLoading && (
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 p-6 glass border-t transition-transform duration-500 z-50",
            selectedId ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={selectedCandidate?.name ?? "?"}
                imageUrl={selectedCandidate?.imageUrl}
                size={48}
                className="ring-2 ring-primary/25"
              />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Selected Choice</p>
                <p className="text-xl font-bold">{selectedCandidate?.name}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
                <Info size={14} />
                Clicking confirm will encrypt and submit your ballot permanently.
              </div>
              <Button
                onClick={handleVote}
                disabled={!selectedId || isSubmitting}
                isLoading={isSubmitting}
                className="w-full sm:w-64 h-14 text-lg shadow-xl shadow-primary/20"
              >
                Confirm Secure Vote
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
