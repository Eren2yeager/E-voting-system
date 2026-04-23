import { redirect } from "next/navigation";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import VoteClient from "@/components/VoteClient";

export default async function VotePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const user = await User.findById(session.user.id).select("hasVoted");

  if (!user || user.hasVoted) {
    redirect("/dashboard");
  }

  return <VoteClient />;
}
