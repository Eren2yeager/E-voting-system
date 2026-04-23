import type { Types } from "mongoose";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { ProfileView } from "@/components/ProfileView";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const doc = (await User.findById(session.user.id)
    .select("username role hasVoted imageUrl createdAt")
    .lean()) as {
    _id: Types.ObjectId;
    username: string;
    role: string;
    hasVoted: boolean;
    imageUrl?: string;
    createdAt?: Date;
  } | null;

  if (!doc) {
    redirect("/login");
  }

  const createdAt = doc.createdAt ? doc.createdAt.toLocaleString() : "—";

  return (
    <ProfileView
      username={doc.username}
      imageUrl={doc.imageUrl ?? ""}
      role={doc.role as "admin" | "voter"}
      hasVoted={!!doc.hasVoted}
      createdAt={createdAt}
    />
  );
}
