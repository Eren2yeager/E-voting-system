"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface CandidateCardProps {
  name: string;
  party: string;
  description?: string;
  imageUrl?: string;
  posterUrl?: string;
  onVote?: () => void;
  disabled?: boolean;
  isSelected?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  name,
  party,
  description,
  imageUrl,
  posterUrl,
  onVote,
  disabled,
  isSelected,
}) => {
  const [posterError, setPosterError] = useState(false);
  const [portraitError, setPortraitError] = useState(false);

  return (
    <Card
      className={cn(
        "card-hover group flex flex-col justify-between relative overflow-hidden",
        isSelected && "ring-2 ring-primary border-primary/50"
      )}
    >
      {posterUrl && !posterError ? (
        <div className="relative w-full h-36 border-b">
          <Image
            src={posterUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setPosterError(true)}
          />
        </div>
      ) : null}

      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-2 min-w-0">
            {imageUrl && !portraitError ? (
              <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden ring-1 ring-border bg-muted">
                <Image
                  src={imageUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="object-cover h-full w-full"
                  onError={() => setPortraitError(true)}
                />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-secondary text-secondary-foreground mb-0 shrink-0">
                <User size={20} />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="mt-0 text-balance break-words">{name}</CardTitle>
              <CardDescription className="line-clamp-2 pt-0.5">{description}</CardDescription>
            </div>
          </div>
          <Badge variant={isSelected ? "default" : "secondary"} className="shrink-0">
            {party}
          </Badge>
        </div>
      </CardHeader>

      <CardFooter className="relative z-10 ">
        <Button
          onClick={onVote}
          disabled={disabled}
          variant={isSelected ? "default" : "outline"}
          className="w-full"
        >
          {isSelected ? "Selected Candidate" : "Choose Candidate"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
