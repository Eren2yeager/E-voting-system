import { auth } from "@/auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { profileImageBodySchema } from "@/lib/schemas";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = profileImageBodySchema.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: first }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.imageUrl = parsed.data.imageUrl;
    await user.save();

    return NextResponse.json({
      message: "Profile image URL updated",
      imageUrl: user.imageUrl,
    });
  } catch (e: unknown) {
    console.error("Profile update error:", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
