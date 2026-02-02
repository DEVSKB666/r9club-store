import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST - สร้าง QR Code PromptPay สำหรับการเติมเงิน
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบว่า user login แล้ว
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount < 10) {
      return NextResponse.json(
        { error: 'จำนวนเงินขั้นต่ำ 10 บาท' },
        { status: 400 }
      );
    }

    // ดึงการตั้งค่า Payment
    const settings = await prisma.paymentSetting.findFirst({
      where: { provider: 'slip2go', isActive: true },
    });

    if (!settings?.apiSecret) {
      return NextResponse.json(
        { error: 'ยังไม่ได้ตั้งค่า Slip2Go API' },
        { status: 400 }
      );
    }

    // เรียก Slip2Go API เพื่อสร้าง QR Code
    const slip2goUrl = 'https://connect.slip2go.com/api/qr-payment/generate-qr-code';
    
    const payload = {
      promptPayCode: settings.promptpayId || settings.bankAccountNo,
      promptPayType: 'phone_number', // หรือ 'citizen_id', 'e_wallet'
      accountName: settings.promptpayName || settings.bankAccountName || 'ร้านค้า',
      amount: amount.toString()
    };

    console.log('Generating QR Code with payload:', payload);

    const response = await fetch(slip2goUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiSecret}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Slip2Go QR Response:', JSON.stringify(data, null, 2));

    // Check for error codes
    const codeStr = data.code?.toString() || '';
    if (!response.ok || codeStr.startsWith('4') || codeStr.startsWith('5')) {
      return NextResponse.json(
        { 
          error: data.message || 'ไม่สามารถสร้าง QR Code ได้',
          debug: { code: data.code, payload, response: data }
        },
        { status: 400 }
      );
    }

    // Try to get QR image from various possible response formats
    const qrImage = data.data?.qrImage || 
                    data.data?.qrImageUrl || 
                    data.data?.qr_image ||
                    data.qrImage ||
                    data.qrImageUrl ||
                    data.data?.image ||
                    data.image;
    
    const qrCode = data.data?.qrCode || 
                   data.data?.qr_code ||
                   data.qrCode;

    // ส่ง QR Code กลับไปให้ client
    return NextResponse.json({
      success: true,
      qrCode: qrCode,
      qrImage: qrImage,
      amount: amount,
      expireAt: data.data?.expireAt,
      referenceId: data.data?.referenceId,
      rawResponse: data // Include raw response for debugging
    });

  } catch (error) {
    console.error('Generate QR Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้าง QR Code' },
      { status: 500 }
    );
  }
}
