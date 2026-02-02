import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { testDiscordWebhook } from '@/lib/notifications/discord';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhookUrl } = await request.json();

    if (!webhookUrl) {
      return NextResponse.json({ error: 'กรุณาระบุ Webhook URL' }, { status: 400 });
    }

    const result = await testDiscordWebhook(webhookUrl);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Discord test error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
