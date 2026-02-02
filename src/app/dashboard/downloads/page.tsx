import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline';

export default async function DownloadsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/downloads');
  }

  const downloads = await prisma.download.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { product: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ดาวน์โหลดเพลง</h1>

      {downloads.length > 0 ? (
        <div className="grid gap-4">
          {downloads.map((download) => {
            const isExpired = new Date(download.expiresAt) < new Date();
            const remainingDownloads = 5 - download.downloadCount;
            
            return (
              <div
                key={download.id}
                className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <img
                  src={download.product.coverImage}
                  alt={download.product.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${download.product.id}`}
                    className="font-semibold text-lg hover:text-primary-400"
                  >
                    {download.product.title}
                  </Link>
                  <p className="text-gray-400">{download.product.artist}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {isExpired 
                          ? 'หมดอายุแล้ว' 
                          : `หมดอายุ ${new Date(download.expiresAt).toLocaleString('th-TH')}`
                        }
                      </span>
                    </div>
                    <div className="text-gray-400">
                      ดาวน์โหลดแล้ว {download.downloadCount}/5 ครั้ง
                    </div>
                  </div>
                </div>

                <div>
                  {!isExpired && remainingDownloads > 0 ? (
                    <a
                      href={`/api/download/${download.secureToken}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      ดาวน์โหลด
                    </a>
                  ) : (
                    <span className="inline-block px-6 py-3 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed">
                      {isExpired ? 'หมดอายุ' : 'ครบจำนวน'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 px-6 py-16 text-center">
          <ArrowDownTrayIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500 mb-4">ยังไม่มีเพลงที่ดาวน์โหลดได้</p>
          <Link
            href="/products"
            className="inline-block px-6 py-2 rounded-lg gradient-primary text-white"
          >
            เลือกซื้อเพลง
          </Link>
        </div>
      )}
    </div>
  );
}
