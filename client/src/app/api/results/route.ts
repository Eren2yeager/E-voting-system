import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getElectionTally } from "@/lib/electionTally";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formattedResults = await getElectionTally();
    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Results error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
