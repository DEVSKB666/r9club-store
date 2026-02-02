import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { TransactionActions } from './TransactionActions';

export default async function AdminTransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    where: { type: 'TOPUP' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      approvedBy: true,
    },
  });

  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">รายการเติมเงิน</h1>
          <p className="text-gray-400">
            ทั้งหมด {transactions.length} รายการ
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-400">
                (รอตรวจสอบ {pendingCount})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ผู้ใช้</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">จำนวนเงิน</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">สลิป</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">สถานะ</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">วันที่</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{tx.user.name || '-'}</p>
                      <p className="text-sm text-gray-400">{tx.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-semibold">
                      {formatPrice(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tx.slipImageUrl ? (
                      <a
                        href={tx.slipImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:underline text-sm"
                      >
                        ดูสลิป
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'APPROVED'
                        ? 'bg-green-500/20 text-green-400'
                        : tx.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.status === 'APPROVED' ? 'อนุมัติแล้ว' : 
                       tx.status === 'PENDING' ? 'รอตรวจสอบ' : 'ปฏิเสธ'}
                    </span>
                    {tx.approvedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        โดย {tx.approvedBy.name}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(tx.createdAt).toLocaleString('th-TH')}
                  </td>
                  <td className="px-6 py-4">
                    {tx.status === 'PENDING' && (
                      <TransactionActions transactionId={tx.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            ยังไม่มีรายการเติมเงิน
          </div>
        )}
      </div>
    </div>
  );
}
