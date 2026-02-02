import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/profile');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">โปรไฟล์</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">ข้อมูลส่วนตัว</h2>
          <ProfileForm user={user} />
        </div>

        {/* Account Info */}
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">ข้อมูลบัญชี</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">อีเมล</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">สมัครสมาชิกเมื่อ</p>
              <p className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">ประเภทบัญชี</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {user?.role || 'USER'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
