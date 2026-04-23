import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { registerBodySchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = registerBodySchema.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: first }, { status: 400 });
    }
    const { username, password, imageUrl: profileImage } = parsed.data;

    await dbConnect();
    const session = await auth();

    const userCount = await User.countDocuments();
    const imageUrl = profileImage ?? "";

    // Bootstrap mode: allow creating the very first admin account only.
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const firstUser = await User.create({
        username,
        password: hashedPassword,
        role: "admin",
        imageUrl,
      });

      return NextResponse.json(
        { message: "Initial admin registered successfully", userId: firstUser._id },
        { status: 201 }
      );
    }

    // After bootstrap, only logged-in admins can register users.
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || role !== "admin") {
      return NextResponse.json(
        { message: "Only admins can register new users" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
      role: "voter",
      imageUrl,
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: user._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
