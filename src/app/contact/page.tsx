import { getSettings } from '@/lib/settings';
import Link from 'next/link';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

export const metadata = {
  title: 'ติดต่อเรา | R9Club',
  description: 'ติดต่อทีมงาน R9Club',
};

export default async function ContactPage() {
  const settings = await getSettings([
    'site_name',
    'contact_email',
    'contact_phone',
    'contact_address',
    'social_facebook',
    'social_line',
  ]);

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'อีเมล',
      value: settings.contact_email,
      href: settings.contact_email ? `mailto:${settings.contact_email}` : null,
    },
    {
      icon: PhoneIcon,
      title: 'โทรศัพท์',
      value: settings.contact_phone,
      href: settings.contact_phone ? `tel:${settings.contact_phone}` : null,
    },
    {
      icon: MapPinIcon,
      title: 'ที่อยู่',
      value: settings.contact_address,
      href: null,
    },
  ].filter(item => item.value);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-900/50 via-gray-900 to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-white">ติดต่อเรา</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              ติดต่อเรา
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              มีคำถาม หรือต้องการความช่วยเหลือ? ติดต่อทีมงานของเราได้เลย
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-gray-900/50 border border-white/10 text-center hover:border-blue-500/50 transition-all group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="text-gray-400 hover:text-blue-400 transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-gray-400">{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {contactInfo.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>ยังไม่มีข้อมูลติดต่อ กรุณาตั้งค่าในหน้า Admin</p>
            </div>
          )}
        </div>
      </section>

      {/* Social Links */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">ช่องทางติดต่ออื่นๆ</h2>
            <div className="flex justify-center gap-4">
              {settings.social_facebook && (
                <a 
                  href={settings.social_facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
              )}
              {settings.social_line && (
                <a 
                  href={settings.social_line} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  LINE
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
