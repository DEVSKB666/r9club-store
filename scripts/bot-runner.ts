import { Client, GatewayIntentBits, Partials, ChannelType } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.on('ready', () => {
  console.log(`Bot Logged in as ${client.user?.tag}!`);
  console.log(`Listening for support replies...`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Check if it's in a thread
  if (message.channel.type !== ChannelType.PublicThread && message.channel.type !== ChannelType.PrivateThread) {
    return;
  }

  const threadId = message.channel.id;

  // Check if this thread belongs to a ticket
  const ticket = await prisma.ticket.findFirst({
    where: { discordThreadId: threadId },
  });

  if (!ticket) return;

  console.log(`Received reply for ticket ${ticket.id}: ${message.content}`);

  // Save to DB as ADMIN message
  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      sender: "ADMIN",
      content: message.content,
    },
  });
});

const startBot = async () => {
    // Fetch token from DB
    const tokenSetting = await prisma.siteSetting.findUnique({
        where: { key: 'discord_bot_token' }
    });
    const token = tokenSetting?.value || process.env.DISCORD_BOT_TOKEN;

    if (!token) {
        console.error("No DISCORD_BOT_TOKEN found in DB or .env");
        process.exit(1);
    }

    try {
        await client.login(token);
    } catch (e) {
        console.error("Failed to login bot:", e);
    }
};

startBot();
