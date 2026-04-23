"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ImageIcon } from "lucide-react";

export function ProfileImageForm({ initialImageUrl }: { initialImageUrl: string }) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const save = async (next: string) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: next.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message || "Could not update image URL.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Profile photo URL
        </CardTitle>
        <CardDescription>
          Paste a direct link to an image (https). Leave empty to use initials only. If the header still shows an old
          photo, sign out and back in to refresh the session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save(imageUrl);
          }}
          className="space-y-3"
        >
          <Input
            label="Image URL"
            type="url"
            inputMode="url"
            autoComplete="photo"
            placeholder="https://example.com/avatars/me.png"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" isLoading={isLoading}>
              Save image URL
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setImageUrl("");
                void save("");
              }}
            >
              Clear
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
