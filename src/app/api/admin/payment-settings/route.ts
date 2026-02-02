import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - ดึงข้อมูลการตั้งค่าการชำระเงิน
export async function GET() {
  let setting = await prisma.paymentSetting.findFirst({
    where: { provider: 'slip2go' },
  });

  // ถ้ายังไม่มี ให้สร้างค่าเริ่มต้น
  if (!setting) {
    setting = await prisma.paymentSetting.create({
      data: {
        provider: 'slip2go',
        bankCode: 'KBANK',
        minAmount: 10,
        maxAmount: 100000,
        checkDuplicate: true,
        checkReceiver: true,
      },
    });
  }

  // ซ่อน API Secret ในการดึงข้อมูล (แสดงแค่ว่ามี)
  return NextResponse.json({
    ...setting,
    apiSecret: setting.apiSecret ? '••••••••' : null,
  });
}

// PUT - อัพเดทการตั้งค่า
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    let setting = await prisma.paymentSetting.findFirst({
      where: { provider: 'slip2go' },
    });

    if (setting) {
      // อัพเดท - ถ้า apiSecret เป็น '••••••••' ให้ไม่อัพเดท
      const updateData: Record<string, unknown> = {
        bankCode: data.bankCode,
        bankAccountNo: data.bankAccountNo,
        bankAccountName: data.bankAccountName,
        promptpayId: data.promptpayId,
        promptpayName: data.promptpayName,
        qrCodeImage: data.qrCodeImage,
        minAmount: parseFloat(data.minAmount) || 10,
        maxAmount: parseFloat(data.maxAmount) || 100000,
        checkDuplicate: data.checkDuplicate ?? true,
        checkReceiver: data.checkReceiver ?? true,
        isActive: data.isActive ?? true,
      };

      // อัพเดท API Key ถ้ามีการเปลี่ยนแปลง
      if (data.apiKey) {
        updateData.apiKey = data.apiKey;
      }

      // อัพเดท API Secret ถ้าไม่ใช่ค่าที่ซ่อน
      if (data.apiSecret && data.apiSecret !== '••••••••') {
        updateData.apiSecret = data.apiSecret;
      }

      setting = await prisma.paymentSetting.update({
        where: { id: setting.id },
        data: updateData,
      });
    } else {
      // สร้างใหม่
      setting = await prisma.paymentSetting.create({
        data: {
          provider: 'slip2go',
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
          bankCode: data.bankCode,
          bankAccountNo: data.bankAccountNo,
          bankAccountName: data.bankAccountName,
          promptpayId: data.promptpayId,
          promptpayName: data.promptpayName,
          qrCodeImage: data.qrCodeImage,
          minAmount: parseFloat(data.minAmount) || 10,
          maxAmount: parseFloat(data.maxAmount) || 100000,
          checkDuplicate: data.checkDuplicate ?? true,
          checkReceiver: data.checkReceiver ?? true,
          isActive: data.isActive ?? true,
        },
      });
    }

    return NextResponse.json({
      ...setting,
      apiSecret: setting.apiSecret ? '••••••••' : null,
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
