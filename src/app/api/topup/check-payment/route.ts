import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST - ตรวจสอบสถานะการชำระเงิน
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, referenceId } = await request.json();

    // ดึงการตั้งค่า
    const settings = await prisma.paymentSetting.findFirst({
      where: { provider: 'slip2go', isActive: true },
    });

    if (!settings?.apiSecret) {
      return NextResponse.json(
        { error: 'ยังไม่ได้ตั้งค่า Slip2Go API', paid: false },
        { status: 400 }
      );
    }

    // เรียก Slip2Go API เพื่อตรวจสอบ QR Payment Status
    const checkUrl = 'https://connect.slip2go.com/api/qr-payment/check-status';
    
    const response = await fetch(checkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiSecret}`,
      },
      body: JSON.stringify({ 
        referenceId,
        amount: amount.toString()
      }),
    });

    const data = await response.json();
    console.log('Payment status check:', JSON.stringify(data, null, 2));

    // ตรวจสอบว่าชำระเงินแล้วหรือยัง
    const isPaid = data.code === '200200' || 
                   data.data?.status === 'paid' || 
                   data.data?.status === 'completed' ||
                   data.paid === true;

    if (isPaid) {
      // เพิ่มเครดิตให้ user
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          creditBalance: {
            increment: amount,
          },
        },
      });

      // บันทึก TopupTransaction
      await prisma.topupTransaction.create({
        data: {
          userId: session.user.id,
          amount: amount,
          transactionRef: referenceId || `AUTO-${Date.now()}`,
          senderName: '',
          senderAccountNo: '',
          receiverName: settings.promptpayName || '',
          receiverAccountNo: settings.promptpayId || '',
          bankCode: 'PROMPTPAY',
          slipImage: '',
          verifiedAt: new Date(),
          status: 'COMPLETED',
        },
      });

      return NextResponse.json({
        paid: true,
        message: 'ชำระเงินสำเร็จ',
        amount: amount,
      });
    }

    return NextResponse.json({
      paid: false,
      message: 'รอการชำระเงิน',
    });

  } catch (error) {
    console.error('Check payment error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด', paid: false },
      { status: 500 }
    );
  }
}
