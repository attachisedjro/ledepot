import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

const ADMIN_CLERK_IDS = ["user_3BfUEKIgwgcZ97tshB4NIVjEtag"];

export async function GET() {
  const user = await currentUser();
  if (!user || !ADMIN_CLERK_IDS.includes(user.id)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({ limit: 500 });

  return NextResponse.json(
    users.map((u) => ({
      clerkId: u.id,
      email: u.emailAddresses[0]?.emailAddress ?? null,
    }))
  );
}
