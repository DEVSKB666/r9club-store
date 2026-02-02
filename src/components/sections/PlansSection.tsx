import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: string | null;
  color: string;
  features: string;
  buttonText: string | null;
  buttonUrl: string | null;
  isPopular: boolean;
}

export async function PlansSection() {
  let plans: Plan[] = [];
  
  try {
    plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  } catch {
    // Prisma client not ready
    return null;
  }

  if (plans.length === 0) return null;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-4">
            <SparklesIcon className="w-4 h-4" />
            <span>Discord Membership</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Plan</span>
          </h2>
          <p className="text-gray-400 text-lg">เลือกแพ็คที่เหมาะกับคุณ</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            let features: string[] = [];
            try {
              features = JSON.parse(plan.features);
            } catch {}

            const periodLabel = plan.period === 'month' ? 'เดือน' 
              : plan.period === 'year' ? 'ปี' 
              : 'บาท';

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-1 transition-all duration-500 hover:scale-[1.02] group ${
                  plan.isPopular 
                    ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500' 
                    : 'bg-gradient-to-br from-white/10 to-white/5'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold rounded-full shadow-lg shadow-yellow-500/30 z-10">
                    🔥 ยอดนิยม
                  </div>
                )}

                <div className="bg-gray-900 rounded-[22px] p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    {plan.icon ? (
                      <img 
                        src={plan.icon} 
                        alt="" 
                        className="w-20 h-20 rounded-2xl shadow-lg group-hover:scale-110 transition-transform" 
                      />
                    ) : (
                      <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform"
                        style={{ 
                          background: `linear-gradient(135deg, ${plan.color}30, ${plan.color}10)`,
                          boxShadow: `0 10px 40px ${plan.color}20`
                        }}
                      >
                        💎
                      </div>
                    )}
                  </div>

                  {/* Name & Price */}
                  <h3 
                    className="text-2xl font-bold text-center mb-2"
                    style={{ color: plan.color }}
                  >
                    {plan.name}
                  </h3>
                  <div className="text-center mb-8">
                    <span className="text-4xl font-bold text-white">฿{plan.price.toLocaleString()}</span>
                    <span className="text-gray-400 text-lg"> / {periodLabel}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8 flex-grow">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: plan.color + '30' }}
                        >
                          <CheckIcon className="w-3 h-3" style={{ color: plan.color }} />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Link
                    href={plan.buttonUrl || '/contact'}
                    className="block w-full py-4 rounded-2xl text-center font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                      color: '#000',
                      boxShadow: `0 10px 30px ${plan.color}40`
                    }}
                  >
                    {plan.buttonText || 'เลือกแพ็คนี้'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
