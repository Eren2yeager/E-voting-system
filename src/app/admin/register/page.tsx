import { redirect } from "next/navigation";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import RegisterClient from "@/components/RegisterClient";

export default async function AdminRegisterPage() {
  await dbConnect();
  const userCount = await User.countDocuments();

  // Bootstrap the first account as admin.
  if (userCount === 0) {
    return <RegisterClient mode="bootstrap" />;
  }

  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "admin") {
    redirect("/dashboard");
  }

  return <RegisterClient mode="admin" />;
}
