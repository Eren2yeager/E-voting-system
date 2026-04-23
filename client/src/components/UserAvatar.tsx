"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
  alt?: string;
};

export function UserAvatar({
  name,
  imageUrl,
  size = 40,
  className,
  alt = "",
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = (name.trim().slice(0, 2) || "?").toUpperCase();
  const showImage = imageUrl && !failed;

  if (!showImage) {
    return (
      <div
        className={cn(
          "rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold shrink-0",
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt || `${name} profile photo`}
      width={size}
      height={size}
      className={cn("rounded-full object-cover shrink-0", className)}
      onError={() => setFailed(true)}
    />
  );
}
