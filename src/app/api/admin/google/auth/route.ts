import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Client ID/Secret from URL (Fallback) or DB
    const { searchParams } = new URL(request.url);
    let clientId = searchParams.get('client_id');
    let clientSecret = searchParams.get('client_secret');

    // If provided in URL, save them to DB first (Fixing the Save bug)
    if (clientId && clientSecret) {
      await prisma.$transaction([
        prisma.siteSetting.upsert({
          where: { key: 'google_client_id' },
          update: { value: clientId },
          create: { key: 'google_client_id', value: clientId, group: 'googledrive' }
        }),
        prisma.siteSetting.upsert({
          where: { key: 'google_client_secret' },
          update: { value: clientSecret },
          create: { key: 'google_client_secret', value: clientSecret, group: 'googledrive' }
        })
      ]);
      console.log('Auth Route - Creds saved from URL params');
    } else {
      // Fetch from DB if not in URL
      const settings = await prisma.siteSetting.findMany({
        where: {
          key: {
            in: ['google_client_id', 'google_client_secret'],
          },
        },
      });
      clientId = settings.find(s => s.key === 'google_client_id')?.value || null;
      clientSecret = settings.find(s => s.key === 'google_client_secret')?.value || null;
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing Client ID or Secret' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${new URL(request.url).origin}/api/admin/google/callback`
    );

    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      scope: scopes,
      prompt: 'consent', // Force consent to ensure refresh token is returned
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error('OAuth Init Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
