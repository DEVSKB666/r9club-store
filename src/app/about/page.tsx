import { getSetting, getSettings, getSocialLinks } from '@/lib/settings';
import Link from 'next/link';
import { 
  MusicalNoteIcon, 
  ShieldCheckIcon, 
  BoltIcon, 
  HeartIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

export const metadata = {
  title: 'เกี่ยวกับเรา | R9Club',
  description: 'R9Club - ร้านขายเพลงดิจิทัลคุณภาพ',
};

export default async function AboutPage() {
  const settings = await getSettings(['site_name', 'site_description']);
  const socialLinks = await getSocialLinks();

  const features = [
    {
      icon: MusicalNoteIcon,
      title: 'เพลงคุณภาพสูง',
      description: 'ไฟล์เสียงคุณภาพระดับสตูดิโอ พร้อมใช้งานทันที',
    },
    {
      icon: ShieldCheckIcon,
      title: 'ปลอดภัย 100%',
      description: 'ระบบชำระเงินที่ปลอดภัย ไม่ต้องกังวลเรื่องข้อมูล',
    },
    {
      icon: BoltIcon,
      title: 'ดาวน์โหลดทันที',
      description: 'หลังจากชำระเงิน สามารถดาวน์โหลดได้ทันที',
    },
    {
      icon: HeartIcon,
      title: 'บริการด้วยใจ',
      description: 'ทีมงานพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary-900/50 via-gray-900 to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white">เกี่ยวกับเรา</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              ยินดีต้อนรับสู่{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                {settings.site_name || 'R9Club'}
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              {settings.site_description || 'แหล่งรวมเพลงดิจิทัลคุณภาพสูง พร้อมบริการที่รวดเร็วและปลอดภัย'}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">ทำไมต้องเลือกเรา?</h2>
            <p className="text-gray-400">สิ่งที่ทำให้เราแตกต่าง</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-gray-900/50 border border-white/10 hover:border-primary-500/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-accent-600 p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              พร้อมเริ่มต้นแล้วหรือยัง?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              เลือกซื้อเพลงที่คุณชื่นชอบได้เลยวันนี้
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/products"
                className="px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold hover:bg-white/90 transition-colors"
              >
                ดูสินค้าทั้งหมด
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/20"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      {Object.values(socialLinks).some(v => v) && (
        <section className="py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-6">ติดตามเราได้ที่</h3>
            <div className="flex justify-center gap-4">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" 
                   className="p-3 rounded-full bg-white/5 hover:bg-blue-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {socialLinks.line && (
                <a href={socialLinks.line} target="_blank" rel="noopener noreferrer" 
                   className="p-3 rounded-full bg-white/5 hover:bg-green-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
