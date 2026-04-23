"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

type CreatedPayload = Record<string, unknown>;

export function AddCandidateForm({ onCreated }: { onCreated?: (doc: CreatedPayload) => void }) {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          party,
          description,
          imageUrl: imageUrl.trim() || undefined,
          posterUrl: posterUrl.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as CreatedPayload;
      if (!res.ok) {
        setError((data as { message?: string }).message || "Could not add candidate.");
        return;
      }
      setSuccess(true);
      onCreated?.(data);
      setName("");
      setParty("");
      setDescription("");
      setImageUrl("");
      setPosterUrl("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add candidate</CardTitle>
        <CardDescription>New candidates appear on the ballot immediately for signed-in voters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Full name"
          />
          <Input
            label="Party / label"
            value={party}
            onChange={(e) => setParty(e.target.value)}
            required
            placeholder="Party or list name"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short platform summary"
            />
          </div>
          <Input
            label="Portrait image URL (optional)"
            type="url"
            inputMode="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
          <Input
            label="Poster / banner URL (optional)"
            type="url"
            inputMode="url"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://…"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? (
            <p className="text-sm text-green-600 dark:text-green-400">Candidate added.</p>
          ) : null}
          <Button type="submit" className="w-full sm:w-auto" isLoading={isLoading}>
            Save candidate
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
