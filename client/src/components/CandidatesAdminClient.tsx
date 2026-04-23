"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddCandidateForm } from "@/components/AddCandidateForm";
import type { AdminCandidateRow } from "@/lib/candidatesList";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function normalizeFromApiRow(raw: Record<string, unknown>): AdminCandidateRow {
  return {
    _id: String(raw._id),
    name: String(raw.name),
    party: String(raw.party),
    description: String(raw.description ?? ""),
    imageUrl: String(raw.imageUrl ?? ""),
    posterUrl: String(raw.posterUrl ?? ""),
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
  };
}

export function CandidatesAdminClient({
  initialCandidates,
}: {
  initialCandidates: AdminCandidateRow[];
}) {
  const [candidates, setCandidates] = useState<AdminCandidateRow[]>(initialCandidates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParty, setEditParty] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editPosterUrl, setEditPosterUrl] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const refetch = useCallback(async () => {
    setFormError("");
    const res = await fetch("/api/candidates");
    if (!res.ok) {
      setFormError("Could not refresh the list.");
      return;
    }
    const data = (await res.json()) as Record<string, unknown>[];
    setCandidates(data.map((row) => normalizeFromApiRow(row)));
  }, []);

  const onAdded = useCallback(
    (created: Record<string, unknown>) => {
      setCandidates((prev) => {
        const row = normalizeFromApiRow(created);
        if (prev.some((p) => p._id === row._id)) {
          return prev;
        }
        return [...prev, row].sort((a, b) => a.name.localeCompare(b.name));
      });
    },
    []
  );

  const startEdit = (c: AdminCandidateRow) => {
    setEditingId(c._id);
    setEditName(c.name);
    setEditParty(c.party);
    setEditDescription(c.description);
    setEditImageUrl(c.imageUrl);
    setEditPosterUrl(c.posterUrl);
    setFormError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormError("");
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSavingId(editingId);
    setFormError("");
    try {
      const res = await fetch(`/api/candidates/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          party: editParty,
          description: editDescription,
          imageUrl: editImageUrl.trim() || "",
          posterUrl: editPosterUrl.trim() || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(
          (data as { message?: string }).message || "Update failed."
        );
        return;
      }
      const row = normalizeFromApiRow(data as Record<string, unknown>);
      setCandidates((prev) =>
        prev.map((p) => (p._id === row._id ? row : p)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
    } catch {
      setFormError("Network error.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this candidate from the ballot? Existing anonymous votes for them still exist in the tally as legacy ballots.")) {
      return;
    }
    setDeletingId(id);
    setFormError("");
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      if (res.status === 204) {
        setCandidates((prev) => prev.filter((c) => c._id !== id));
        if (editingId === id) {
          setEditingId(null);
        }
        return;
      }
      const data = await res.json().catch(() => ({}));
      setFormError(
        (data as { message?: string }).message || "Delete failed."
      );
    } catch {
      setFormError("Network error.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <AddCandidateForm onCreated={onAdded} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold">Current ballot</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Refresh list
        </Button>
      </div>

      <div className="space-y-4">
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No candidates yet. Add one below.</p>
        ) : (
          candidates.map((c) => (
            <Card
              key={c._id}
              className={cn(
                c.posterUrl && "overflow-hidden",
                editingId === c._id && "ring-1 ring-primary/30"
              )}
            >
              {editingId === c._id ? (
                <form onSubmit={saveEdit}>
                  <CardHeader>
                    <CardTitle className="text-base">Edit candidate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      label="Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                    <Input
                      label="Party / label"
                      value={editParty}
                      onChange={(e) => setEditParty(e.target.value)}
                      required
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <Input
                      label="Portrait image URL"
                      type="url"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://… (optional)"
                    />
                    <Input
                      label="Poster / banner URL"
                      type="url"
                      value={editPosterUrl}
                      onChange={(e) => setEditPosterUrl(e.target.value)}
                      placeholder="https://… (optional)"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" size="sm" isLoading={savingId === c._id}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={savingId === c._id}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </form>
              ) : (
                <>
                  {c.posterUrl ? (
                    <div className="relative w-full h-32 overflow-hidden rounded-t-lg border-b">
                      <Image
                        src={c.posterUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 640px"
                      />
                    </div>
                  ) : null}
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                    <div className="flex items-start gap-3 min-w-0">
                      {c.imageUrl ? (
                        <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden ring-1 ring-border bg-muted">
                          <Image
                            src={c.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{c.name}</CardTitle>
                        <CardDescription className="text-primary font-medium">
                          {c.party}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => startEdit(c)}
                        aria-label="Edit candidate"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => void remove(c._id)}
                        isLoading={deletingId === c._id}
                        disabled={savingId !== null}
                        aria-label="Delete candidate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {c.description ? (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                    </CardContent>
                  ) : null}
                  <CardContent className="pt-0 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {c.updatedAt ? (
                      <span>Updated {new Date(c.updatedAt).toLocaleString()}</span>
                    ) : c.createdAt ? (
                      <span>Added {new Date(c.createdAt).toLocaleString()}</span>
                    ) : null}
                    <Badge variant="secondary" className="text-[10px]">
                      ID {c._id}
                    </Badge>
                  </CardContent>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
