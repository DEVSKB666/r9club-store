import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { TopupTransaction } from '@prisma/client';

export default async function WalletPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/wallet');
  }

  const [user, topupHistory] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.topupTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">กระเป๋าเงิน</h1>
        <Link 
          href="/topup"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircleIcon className="w-5 h-5" />
          เติมเงิน
        </Link>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BanknotesIcon className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-gray-400 mb-2 font-medium">เครดิตคงเหลือ</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              {formatPrice(user?.creditBalance || 0)}
            </span>
            <span className="text-gray-500 font-medium">THB</span>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-1">ต้องการเติมเงิน?</h3>
          <p className="text-gray-400 text-sm">เติมเงินเข้าระบบง่ายๆ ด้วย QR Code พร้อมเพย์ อัตโนมัติ 24 ชม.</p>
        </div>
        <Link 
          href="/topup"
          className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors text-center"
        >
          เติมเงินเลย
        </Link>
      </div>

      {/* Topup History */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold">ประวัติการเติมเงิน</h2>
        </div>

        {topupHistory.length > 0 ? (
          <div className="divide-y divide-white/5">
            {topupHistory.map((tx: TopupTransaction) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    tx.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                    tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {tx.status === 'COMPLETED' ? <PlusCircleIcon className="w-6 h-6" /> : <BanknotesIcon className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-medium">เติมเงินเข้าระบบ</p>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.createdAt).toLocaleString('th-TH', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                    {tx.transactionRef && (
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        Ref: {tx.transactionRef.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400 text-lg">
                    +{formatPrice(tx.amount)}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tx.status === 'COMPLETED'
                      ? 'bg-green-500/10 text-green-400'
                      : tx.status === 'PENDING'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {tx.status === 'COMPLETED' ? 'สำเร็จ' : 
                     tx.status === 'PENDING' ? 'รอตรวจสอบ' : 'ปฏิเสธ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <BanknotesIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>ยังไม่มีประวัติการเติมเงิน</p>
          </div>
        )}
      </div>
    </div>
  );
}

