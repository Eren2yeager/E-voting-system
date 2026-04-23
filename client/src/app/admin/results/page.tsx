import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getElectionTally } from "@/lib/electionTally";
import { AdminResultsClient } from "./AdminResultsClient";

export default async function AdminResultsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await dbConnect();
  const me = (await User.findById(session.user.id)
    .select("username imageUrl")
    .lean()) as { username?: string; imageUrl?: string } | null;
  const adminDisplayName = me?.username ?? session.user.name ?? "Admin";
  const adminImageUrl = me?.imageUrl ?? session.user.image ?? "";

  const initialResults = await getElectionTally();
  return (
    <AdminResultsClient
      initialResults={initialResults}
      adminDisplayName={adminDisplayName}
      adminImageUrl={adminImageUrl}
    />
  );
}
