import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.paymentSetting.findFirst({
      where: { provider: 'slip2go' },
    });

    if (!setting) {
      return NextResponse.json({ isActive: false });
    }

    // Return only necessary public info
    return NextResponse.json({
      bankCode: setting.bankCode,
      bankAccountNo: setting.bankAccountNo,
      bankAccountName: setting.bankAccountName,
      promptpayId: setting.promptpayId,
      promptpayName: setting.promptpayName,
      qrCodeImage: setting.qrCodeImage,
      minAmount: setting.minAmount,
      maxAmount: setting.maxAmount,
      isActive: setting.isActive,
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
