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
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      // เพิ่ม authorization parameters
      authorization: {
        params: {
          prompt: 'none',
        },
      },
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
        token.id = user.id!;
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
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.creditBalance = token.creditBalance;
      }
      return session;
    },
    // เพิ่ม redirect callback เพื่อป้องกัน loop
    async redirect({ url, baseUrl }) {
      // ถ้า url เป็น relative path (เริ่มต้นด้วย /)
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // ถ้า url เป็น same origin กับ baseUrl
      else if (new URL(url).origin === baseUrl) return url;
      // default redirect ไปหน้าแรก
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        const { sendDiscordNotification } = await import('@/lib/notifications/discord');
        await sendDiscordNotification({
          type: 'login',
          data: {
            userName: user.name || undefined,
            userEmail: user.email || undefined,
          },
        });
      } catch (error) {
        console.error('Discord notification error:', error);
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ปิด debug ใน production
  debug: process.env.NODE_ENV === 'development',
  // เพิ่ม cookies config สำหรับ production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);