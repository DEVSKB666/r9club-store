import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendDiscordNotification } from '@/lib/notifications/discord';

// POST - ตรวจสอบสลิปผ่าน Slip2Go API
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบว่า user login แล้ว
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    // ดึงการตั้งค่า
    const settings = await prisma.paymentSetting.findFirst({
      where: { provider: 'slip2go', isActive: true },
    });

    if (!settings || !settings.apiSecret) {
      return NextResponse.json(
        { error: 'ระบบเติมเงินยังไม่พร้อมใช้งาน' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const slipImage = formData.get('slip') as File;
    const amount = parseFloat(formData.get('amount') as string);

    if (!slipImage) {
      return NextResponse.json({ error: 'กรุณาอัพโหลดสลิป' }, { status: 400 });
    }

    // ตรวจสอบจำนวนเงิน
    if (amount < settings.minAmount || amount > settings.maxAmount) {
      return NextResponse.json(
        { error: `จำนวนเงินต้องอยู่ระหว่าง ${settings.minAmount} - ${settings.maxAmount} บาท` },
        { status: 400 }
      );
    }

    // แปลง File เป็น Base64 (สำหรับบันทึกลง Database)
    const bytes = await slipImage.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = slipImage.type || 'image/jpeg';
    const base64Image = `data:${mimeType};base64,${base64}`;

    // Probing Logic: Try to find the correct host by hitting /api/account/info
    // This is based on the "Authentication" docs showing this endpoint.
    let validHost = '';
    const potentialHosts = ['https://api.slip2go.com', 'https://app.slip2go.com', 'https://slip2go.com'];
    
    // Helper to log to file
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(process.cwd(), 'slip2go-debug.log');
    const log = (msg: string) => {
        console.log(msg);
        try { fs.appendFileSync(logFile, new Date().toISOString() + ': ' + msg + '\n'); } catch (e) {}
    };

    log('--- Starting Dynamic Host Probe ---');

    for (const host of potentialHosts) {
        try {
            log(`Probing host: ${host}/api/account/info`);
            const res = await fetch(`${host}/api/account/info`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${settings.apiSecret}`,
                    'Content-Type': 'application/json'
                }
            });
            log(`Probe status: ${res.status}`);
            if (res.ok) {
                validHost = host;
                log(`Found valid host: ${validHost}`);
                break;
            }
        } catch (e) {
            log(`Probe failed for ${host}: ${e}`);
        }
    }

    // List of potential endpoints to try for verification
    // On failing probe, fall back to hardcoded full URLs
    // Added /shop prefix based on dashboard URL pattern
    let endpoints = [];
    if (validHost) {
        endpoints = [
            `${validHost}/api/verify-slip/qr-image/info`,
            `${validHost}/shop/api/verify-slip/qr-image/info`,
            `${validHost}/verify-slip/qr-image/info`
        ];
    } else {
        endpoints = [
            'https://connect.slip2go.com/api/verify-slip/qr-image/info'
        ];
    }

    let slip2goResponse = null;
    let slip2goData = null;
    let workingEndpoint = '';

    // Prepare FormData for Slip2Go API
    const apiFormData = new FormData();
    apiFormData.append('file', slipImage);

    // Construct payload strictly based on the user's curl example
    const payloadObj: any = {
        checkDuplicate: settings.checkDuplicate,
        checkAmount: { // Add checkAmount as per user example
            type: 'eq',
            amount: amount 
        }
    };

    if (settings.checkReceiver) {
        const targetAccount = settings.promptpayId || settings.bankAccountNo;
        if (targetAccount) {
            payloadObj.checkReceiver = [{
                accountNumber: targetAccount
            }];
        }
    }

    apiFormData.append('payload', JSON.stringify(payloadObj));

    log(`Testing endpoints: ${JSON.stringify(endpoints)}`);

    for (const url of endpoints) {
      try {
        log(`Trying Slip2Go API: ${url}`);
        
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.apiSecret}`, // Fixed Header
          },
          body: apiFormData,
        });

        log(`Status: ${res.status} ${res.statusText}`);
        
        const textFromBody = await res.text();
        log(`Body Preview: ${textFromBody.substring(0, 200)}`);

        let data;
        try {
            data = JSON.parse(textFromBody);
        } catch (e) { /* invalid json */ }

        // Check if it's a "Route not found" error despite being JSON
        const isRouteError = data && data.code === 404 && 
            (typeof data.message === 'string' && (data.message.includes('Cannot POST') || data.message.includes('Cannot GET')));

        // Success if 200 OK or if we get a structured API error/response (e.g. code 4001, etc)
        // BUT exclude generic "Cannot POST" route errors
        if (!isRouteError && (res.ok || (data && (data.code || data.status)))) {
           slip2goResponse = res;
           slip2goData = data || { error: textFromBody };
           workingEndpoint = url;
           log(`Hit valid endpoint: ${url}`);
           break;
        } else {
             log(`Endpoint ${url} failed with status ${res.status} (Route Error: ${isRouteError})`);
        }
      } catch (e) {
        log(`Failed to fetch ${url}: ${e}`);
      }
    }

    if (!slip2goResponse || !slip2goData) {
      return NextResponse.json(
        { error: 'ไม่สามารถเชื่อมต่อกับ Slip2Go API ได้ (ทุก Endpoint ผิดพลาด)' },
        { status: 502 }
      );
    }

    console.log('Slip2Go Response data:', JSON.stringify(slip2goData, null, 2));

    // Slip2Go API response codes:
    // 200xxx = Success (but may have validation warnings like account mismatch)
    // 200401 = Recipient account Mismatch
    // 200501 = Slip is Duplicated
    // 400xxx = Client Error
    // 500xxx = Server Error
    const slip2goCode = slip2goData.code?.toString() || '';
    const isSuccess = slip2goCode.startsWith('200') || slip2goCode === '200';
    const isAccountMismatch = slip2goCode === '200401';
    const isDuplicate = slip2goCode === '200501';
    
    // Block duplicate slips immediately
    if (isDuplicate) {
      return NextResponse.json(
        { error: 'สลิปนี้เคยใช้เติมเงินแล้ว ไม่สามารถใช้ซ้ำได้' },
        { status: 400 }
      );
    }
    
    // If not a 200xxx code, it's a real error
    if (!isSuccess && !slip2goResponse.ok) {
      return NextResponse.json(
        { error: slip2goData.message || slip2goData.error || `ตรวจสอบสลิปไม่สำเร็จ (${slip2goCode})` },
        { status: 400 }
      );
    }

    // ตรวจสอบข้อมูลจาก slip2go
    const slipData = slip2goData.data;
    
    // ตรวจสอบว่าโอนมาถูกบัญชี (ถ้าเปิดใช้งาน checkReceiver)
    if (settings.checkReceiver && isAccountMismatch) {
      const receiverId = settings.promptpayId || settings.bankAccountNo;
      const actualReceiver = slipData.receiver?.account?.proxy?.account || 
                             slipData.receiver?.account?.bank?.account ||
                             slipData.receiver?.accountNo || 'ไม่ทราบ';
      return NextResponse.json(
        { error: `บัญชีปลายทางไม่ถูกต้อง (สลิปโอนไปที่ ${actualReceiver} แต่ต้องการ ${receiverId})` },
        { status: 400 }
      );
    }

    // ตรวจสอบจำนวนเงิน (ต้องตรงกับที่ระบุ)
    const slipAmount = parseFloat(slipData.amount);
    if (Math.abs(slipAmount - amount) > 0.01) {
      return NextResponse.json(
        { error: `จำนวนเงินในสลิป (${slipAmount}) ไม่ตรงกับที่ระบุ (${amount})` },
        { status: 400 }
      );
    }

    // บันทึกรายการเติมเงิน
    const topup = await prisma.topupTransaction.create({
      data: {
        userId: session.user.id,
        amount: slipAmount,
        transactionRef: slipData.transactionRef || slipData.transRef,
        senderName: slipData.sender?.name || '',
        senderAccountNo: slipData.sender?.accountNo || '',
        receiverName: slipData.receiver?.name || '',
        receiverAccountNo: slipData.receiver?.accountNo || '',
        bankCode: slipData.bankCode || 'KBANK',
        slipImage: base64Image.substring(0, 500), // เก็บแค่บางส่วน
        verifiedAt: new Date(),
        status: 'COMPLETED',
      },
    });

    // อัพเดทยอดเงินใน wallet
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        creditBalance: { increment: slipAmount },
      },
    });

    // Send Discord notification (non-blocking)
    sendDiscordNotification({
      type: 'topup',
      data: {
        userName: user.name || user.email,
        totalAmount: slipAmount,
        transactionId: topup.id,
        status: 'COMPLETED',
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: `เติมเงินสำเร็จ ${slipAmount.toLocaleString()} บาท`,
      transaction: {
        id: topup.id,
        amount: slipAmount,
        transactionRef: topup.transactionRef,
      },
    });
  } catch (error) {
    console.error('Topup error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
