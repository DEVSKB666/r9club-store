'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: string | null;
}

export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/faqs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFaqs(data);
        } else {
          console.error('FAQs data is not an array:', data);
          setFaqs([]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch FAQs:', err);
        setFaqs([]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || faqs.length === 0) return null;

  return (
    <section className="py-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-500/10 border border-accent-500/20">
            <QuestionMarkCircleIcon className="w-5 h-5 text-accent-400" />
            <span className="text-accent-400 font-medium text-lg">ช่วยเหลือ</span>
          </div>
          <h2 className="text-3xl font-bold">
            คำถามที่<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-primary-400">พบบ่อย</span> ?
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;
            
            return (
              <div
                key={faq.id}
                className={`rounded-2xl overflow-hidden transition-all duration-200 ${
                  isExpanded 
                    ? 'bg-primary-500/10 border-2 border-primary-500/30' 
                    : 'bg-white/[0.02] border border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left"
                >
                  {/* Number */}
                  <span className={`text-base font-bold w-8 ${isExpanded ? 'text-primary-400' : 'text-gray-500'}`}>
                    {faq.icon || `${index + 1}.`}
                  </span>
                  
                  {/* Question */}
                  <span className={`flex-1 text-lg transition-colors ${
                    isExpanded ? 'text-white font-medium' : 'text-gray-300'
                  }`}>
                    {faq.question}
                  </span>
                  
                  {/* Arrow */}
                  <ChevronDownIcon className={`w-6 h-6 transition-transform ${
                    isExpanded ? 'rotate-180 text-primary-400' : 'text-gray-600'
                  }`} />
                </button>

                {/* Answer */}
                {isExpanded && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-400 text-base leading-relaxed pl-12">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className="text-gray-500 text-lg">ยังหาคำตอบไม่เจอ?</span>
          <a 
            href="/contact" 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            ติดต่อเรา
          </a>
        </div>
      </div>
    </section>
  );
}
