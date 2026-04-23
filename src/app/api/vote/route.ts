import { auth } from "@/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Vote from "@/models/Vote";
import Candidate from "@/models/Candidate";
import { encryptBallot } from "@/lib/ballotCrypto";
import { voteBodySchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = voteBodySchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: first }, { status: 400 });
    }

    const { candidateId } = parsed.data;
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return NextResponse.json({ message: "Invalid candidate" }, { status: 400 });
    }

    await dbConnect();
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 400 });
    }

    // Atomic update to prevent double voting
    const user = await User.findOneAndUpdate(
      { _id: session.user.id, hasVoted: false },
      { $set: { hasVoted: true } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found or you have already cast your vote" },
        { status: 400 }
      );
    }

    try {
      const encryptedBallot = encryptBallot(candidateId);
      await Vote.create({ encryptedBallot });
      return NextResponse.json({ message: "Vote cast successfully" });
    } catch (error: unknown) {
      await User.findByIdAndUpdate(session.user.id, { $set: { hasVoted: false } });
      console.error("Ballot creation error:", error);
      return NextResponse.json({ message: "Failed to record vote" }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error("Voting error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
