import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { closeThread } from "@/lib/discord";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find active ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        userId: user.id,
        status: "OPEN"
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: "No active ticket found" }, { status: 404 });
    }

    // Close ticket in DB
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "CLOSED" }
    });

    // Close thread in Discord
    if (ticket.discordThreadId) {
      await closeThread(ticket.discordThreadId);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Close Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
