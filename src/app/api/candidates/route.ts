import { auth } from "@/auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import { candidateCreateSchema } from "@/lib/schemas";
import { listCandidatesWithSeed } from "@/lib/candidatesList";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const candidates = await listCandidatesWithSeed();

    return NextResponse.json(candidates);
  } catch {
    return NextResponse.json(
      { message: "Error fetching candidates" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const json = await req.json();
    const parsed = candidateCreateSchema.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: first }, { status: 400 });
    }

    await dbConnect();
    const { name, party, description, imageUrl, posterUrl } = parsed.data;
    const candidate = await Candidate.create({
      name,
      party,
      description: description ?? "",
      imageUrl: imageUrl ?? "",
      posterUrl: posterUrl ?? "",
    });
    return NextResponse.json(candidate, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Error creating candidate" },
      { status: 500 }
    );
  }
}
