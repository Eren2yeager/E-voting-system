"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldCheck, Lock, User } from "lucide-react";

export default function LoginClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push("/");
      }
    } catch {
      setError("A connection error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-transparent p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center justify-center gap-2 mb-2 cursor-pointer" onClick={() => router.push("/")}>
          <ShieldCheck className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold tracking-tight">SecureVote</span>
        </div>
        <p className="text-muted-foreground">The future of anonymous digital democracy</p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10 animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your secure ballot
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="relative">
              <Input
                label="Username"
                type="text"
                placeholder="voter_123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pl-9"
              />
              <User className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9"
              />
              <Lock className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
            </div>
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Access Ballot
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 text-xs text-muted-foreground flex items-center gap-4">
        <span>RSA-OAEP Encrypted Ballots</span>
        <span>•</span>
        <span>Zero-Knowledge Proofs</span>
        <span>•</span>
        <span>Fully Anonymous</span>
      </div>
    </div>
  );
}
