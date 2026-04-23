import { auth } from "@/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import { candidateUpdateSchema } from "@/lib/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const json = await req.json();
    const parsed = candidateUpdateSchema.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: first }, { status: 400 });
    }

    await dbConnect();
    const { name, party, description, imageUrl, posterUrl } = parsed.data;
    const updated = await Candidate.findByIdAndUpdate(
      id,
      {
        name,
        party,
        description: description ?? "",
        imageUrl: imageUrl ?? "",
        posterUrl: posterUrl ?? "",
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "Error updating candidate" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    await dbConnect();
    const removed = await Candidate.findByIdAndDelete(id);
    if (!removed) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: "Error removing candidate" },
      { status: 500 }
    );
  }
}
