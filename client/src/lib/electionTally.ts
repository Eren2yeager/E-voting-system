import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";
import Candidate from "@/models/Candidate";
import { decryptBallot } from "@/lib/ballotCrypto";

export type TallyRow = {
  id: string;
  name: string;
  party: string;
  count: number;
  imageUrl: string;
  posterUrl: string;
};

export async function getElectionTally(): Promise<TallyRow[]> {
  await dbConnect();

  const votes = await Vote.find({});
  const candidates = await Candidate.find({});

  const results: Record<string, number> = {};
  candidates.forEach((c) => {
    results[c._id.toString()] = 0;
  });

  votes.forEach((v) => {
    try {
      const candidateId = decryptBallot(v.encryptedBallot);
      if (results[candidateId] !== undefined) {
        results[candidateId]++;
      }
    } catch {
      // skip corrupted legacy rows
    }
  });

  return candidates.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    party: c.party,
    count: results[c._id.toString()] || 0,
    imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : "",
    posterUrl: typeof c.posterUrl === "string" ? c.posterUrl : "",
  }));
}
