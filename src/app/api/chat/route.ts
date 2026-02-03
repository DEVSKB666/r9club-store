import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Assuming auth is available
import { prisma } from "@/lib/prisma";
import { createTicketThread, sendToThread } from "@/lib/discord";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    // For now, require login. Later can support guests if needed.
    if (!user || !user.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, topic, ticketId } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    let ticket;

    // If ticketId is provided, validation check
    if (ticketId) {
      ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      
      if (!ticket) {
          return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      }
    } else {
        // Find existing open ticket for this user
        // OR always create new if topic is provided? 
        // Let's assume one active ticket per user for simplicity or check if they passed a topic to start new.
        
        // If topic is present, we try to create a NEW ticket
        if (topic) {
             ticket = await prisma.ticket.findFirst({
                where: {
                    userId: user.id,
                    status: "OPEN"
                }
             });

             if (!ticket) {
                 // Create new ticket
                 ticket = await prisma.ticket.create({
                     data: {
                         userId: user.id,
                         topic: topic,
                         status: "OPEN"
                     }
                 });

                 // Create Discord Thread
                 const threadId = await createTicketThread(topic, user.name || user.email, content);
                 if (threadId) {
                     await prisma.ticket.update({
                         where: { id: ticket.id },
                         data: { discordThreadId: threadId }
                     });
                 }
             } else {
                 // Existing ticket found, but user tried to start new. Just join the existing one.
                 // Ideally prompt user properly, but for now reuse.
             }
        } else {
             // No topic, maybe replying to existing?
             ticket = await prisma.ticket.findFirst({
                where: { userId: user.id, status: "OPEN" }
             });
             
             if (!ticket) {
                 return NextResponse.json({ error: "No active ticket found. Please start a new chat." }, { status: 400 });
             }
        }
    }

    // Save message to DB
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        sender: "USER",
        content: content,
      },
    });

    // Send to Discord
    if (ticket.discordThreadId) {
        await sendToThread(ticket.discordThreadId, content, user.name || user.email);
    } else {
        // If thread doesn't exist yet (failed creation?), try creating it again
        const threadId = await createTicketThread(ticket.topic, user.name || user.email, content);
         if (threadId) {
             await prisma.ticket.update({
                 where: { id: ticket.id },
                 data: { discordThreadId: threadId }
             });
         }
    }

    return NextResponse.json(message);

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;

        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get active ticket
        const ticket = await prisma.ticket.findFirst({
            where: {
                userId: user.id,
                status: "OPEN"
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ ticket: null });
        }

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error("Chat GET API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
