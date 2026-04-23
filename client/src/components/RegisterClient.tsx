"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldCheck, Lock, UserPlus, Info, ImageIcon } from "lucide-react";
import Link from "next/link";

interface RegisterClientProps {
  mode: "bootstrap" | "admin";
}

export default function RegisterClient({ mode }: RegisterClientProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed. Try a different username.");
      } else if (mode === "bootstrap") {
        router.push("/login");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === "bootstrap" ? "Create Initial Admin" : "Create Voter Account";
  const description =
    mode === "bootstrap"
      ? "Set up the first administrator account for this election system"
      : "Admin-only onboarding for new voter accounts";

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-transparent p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center justify-center gap-2 mb-2 cursor-pointer"  onClick={() => router.push("/")}>
          <ShieldCheck className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold tracking-tight">SecureVote</span>
        </div>
        <p className="text-muted-foreground">Secure account provisioning</p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10 animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="relative">
              <Input
                label="Choose Username"
                type="text"
                placeholder="unique_voter_id"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-9"
              />
              <UserPlus className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input
                label="Secure Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9"
              />
              <Lock className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
            </div>

            <div className="relative">
              <Input
                label="Profile image URL (optional)"
                type="url"
                inputMode="url"
                autoComplete="photo"
                placeholder="https://example.com/avatar.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="pl-9"
              />
              <ImageIcon className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary" />
              <p>
                Registration is restricted to administrators after bootstrap.
                Ballots remain anonymous and separate from account identity.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {mode === "bootstrap" ? "Create Admin Account" : "Register Voter"}
            </Button>
            {mode === "bootstrap" ? (
              <div className="text-center text-sm text-muted-foreground">
                Already configured?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            ) : null}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
