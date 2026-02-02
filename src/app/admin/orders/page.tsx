import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import OrderActions from './OrderActions';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">คำสั่งซื้อ</h1>
        <p className="text-gray-400">คำสั่งซื้อทั้งหมด {orders.length} รายการ</p>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Order ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ลูกค้า</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">สินค้า</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ยอดรวม</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">สถานะ</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">วันที่</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-400">
                      {order.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{order.user.name || '-'}</span>
                      <span className="text-sm text-gray-400">{order.user.email}</span>
                      {order.email && (
                        <div className="mt-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 w-fit">
                          <span className="text-xs text-blue-400">Email สั่งซื้อ: {order.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <img 
                            src={item.product.coverImage || '/placeholder.png'} 
                            alt={item.product.title}
                            className="w-8 h-8 rounded object-cover bg-white/5" 
                          />
                          <span className="text-sm text-gray-300">
                            {item.product.title}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs text-gray-500 pl-10">
                          +{order.items.length - 2} รายการ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-semibold">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'COMPLETED'
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(order.createdAt).toLocaleString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <OrderActions orderId={order.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            ยังไม่มีคำสั่งซื้อ
          </div>
        )}
      </div>
    </div>
  );
}
