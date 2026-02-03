import { Client, GatewayIntentBits, TextChannel, ThreadChannel } from 'discord.js';
import { prisma } from "@/lib/prisma";

// Global client instance to prevent multiple connections in dev (though for a script it's fine)
// usage: getDiscordClient().then(client => ...)

let client: Client | null = null;

export const getDiscordClient = async () => {
  if (client) return client;

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Fetch credential from DB
  const tokenSetting = await prisma.siteSetting.findUnique({
    where: { key: 'discord_bot_token' }
  });

  // Fallback to env if not in DB (for backward compatibility)
  const token = tokenSetting?.value || process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    console.error("DISCORD_BOT_TOKEN is missing (checked DB and ENV)");
    return null;
  }

  try {
    await client.login(token);
    console.log(`Logged in as ${client.user?.tag}!`);
    return client;
  } catch (error) {
    console.error("Failed to login to Discord:", error);
    return null;
  }
};

export const createTicketThread = async (
  topic: string,
  username: string,
  initialMessage: string
) => {
  const client = await getDiscordClient();
  if (!client) return null;

  // Fetch channel ID from DB
  const channelSetting = await prisma.siteSetting.findUnique({
      where: { key: 'discord_ticket_channel_id' }
  });
  const channelId = channelSetting?.value || process.env.DISCORD_TICKET_CHANNEL_ID;

  if (!channelId) {
    console.error("DISCORD_TICKET_CHANNEL_ID is missing");
    return null;
  }

  const channel = await client.channels.fetch(channelId) as TextChannel;
  if (!channel) {
    console.error("Ticket channel not found");
    return null;
  }

  // Create a thread
  const threadName = `[${topic}] ${username}`;
  const thread = await channel.threads.create({
    name: threadName,
    autoArchiveDuration: 60, // 1 hour
    reason: `Support ticket for ${username}`,
  });

  // Send initial message
  await thread.send(`**Head:** ${topic}\n**User:** ${username}\n**Message:** ${initialMessage}`);

  return thread.id;
};

export const sendToThread = async (threadId: string, message: string, username: string) => {
    const client = await getDiscordClient();
    if (!client) return null;

    try {
        const channel = await client.channels.fetch(threadId) as ThreadChannel;
        if (channel) {
            await channel.send(`**${username}:** ${message}`);
            return true;
        }
    } catch (e) {
        console.error("Error sending to thread:", e);
    }
    return false;
}

export const closeThread = async (threadId: string) => {
    const client = await getDiscordClient();
    if (!client) return null;

    try {
        const channel = await client.channels.fetch(threadId) as ThreadChannel;
        if (channel) {
            await channel.send(`🛑 **User ended the chat.** Thread archived.`);
            await channel.setArchived(true);
            return true;
        }
    } catch (e) {
        console.error("Error closing thread:", e);
    }
    return false;
}
