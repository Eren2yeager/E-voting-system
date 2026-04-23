import type { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

const DEFAULT_CANDIDATES = [
  {
    name: "Alice Johnson",
    party: "Digital Privacy Party",
    description:
      "Advocating for digital rights and encryption for all citizens.",
  },
  {
    name: "Bob Smith",
    party: "Open Data Union",
    description: "Focused on transparency and open-source governance systems.",
  },
  {
    name: "Charlie Davis",
    party: "Security First Coalition",
    description: "Strengthening national infrastructure against cyber threats.",
  },
] as const;

/**
 * Ensure at least the default seed exists, then return all candidates.
 */
export async function listCandidatesWithSeed() {
  await dbConnect();
  if ((await Candidate.countDocuments()) === 0) {
    await Candidate.create([...DEFAULT_CANDIDATES]);
  }
  return Candidate.find({}).sort({ name: 1 }).lean();
}

export type AdminCandidateRow = {
  _id: string;
  name: string;
  party: string;
  description: string;
  imageUrl: string;
  posterUrl: string;
  createdAt?: string;
  updatedAt?: string;
};

type LeanDoc = {
  _id: Types.ObjectId;
  name: string;
  party: string;
  description?: string;
  imageUrl?: string;
  posterUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export function toAdminCandidateRow(doc: LeanDoc): AdminCandidateRow {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    party: doc.party,
    description: doc.description ?? "",
    imageUrl: doc.imageUrl ?? "",
    posterUrl: doc.posterUrl ?? "",
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function getAdminCandidateRows(): Promise<AdminCandidateRow[]> {
  const list = (await listCandidatesWithSeed()) as unknown as LeanDoc[];
  return list.map(toAdminCandidateRow);
}
