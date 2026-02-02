import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Discord from 'next-auth/providers/discord';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface User {
    role: 'USER' | 'ADMIN';
    creditBalance: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: 'USER' | 'ADMIN';
      creditBalance: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
    creditBalance: number;
  }
}

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        // If user has no password (e.g. signed up with Discord previously), return null
        if (!user.password) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          creditBalance: user.creditBalance,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.creditBalance = user.creditBalance;
      }

      // Update token when session is updated
      if (trigger === 'update' && session) {
        token.creditBalance = session.creditBalance;
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.creditBalance = token.creditBalance;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Send Discord notification for login (dynamic import to avoid circular dependencies)
      const { sendDiscordNotification } = await import('@/lib/notifications/discord');
      sendDiscordNotification({
        type: 'login',
        data: {
          userName: user.name || undefined,
          userEmail: user.email || undefined,
        },
      }).catch(console.error);
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  debug: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
