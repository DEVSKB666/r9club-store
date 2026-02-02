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

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Get credentials from DB
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['google_client_id', 'google_client_secret'],
        },
      },
    });

    const clientId = settings.find(s => s.key === 'google_client_id')?.value;
    const clientSecret = settings.find(s => s.key === 'google_client_secret')?.value;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing Client ID or Secret' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${new URL(request.url).origin}/api/admin/google/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      // Save refresh token to DB
      await prisma.siteSetting.upsert({
        where: { key: 'google_refresh_token' },
        update: { value: tokens.refresh_token },
        create: { 
          key: 'google_refresh_token', 
          value: tokens.refresh_token,
          group: 'googledrive'
        },
      });
      console.log('Refresh token saved successfully');
    } else {
      console.warn('No refresh token returned. User might have approved already without prompt=consent');
    }

    // Redirect back to settings with success query param
    return NextResponse.redirect(`${new URL(request.url).origin}/admin/settings?google_auth=success`);

  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.json({ error: `Authentication failed: ${(error as Error).message}` }, { status: 500 });
  }
}
