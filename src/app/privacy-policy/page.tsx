
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัว (Privacy Policy)',
  description: 'นโยบายความเป็นส่วนตัวและเงื่อนไขการใช้งานเว็บไซต์',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-primary-400">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
      
      <div className="space-y-6 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">1. บทนำ</h2>
          <p>
            เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีที่เราเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของคุณเมื่อคุณใช้งานเว็บไซต์ของเรา
            การเข้าใช้เว็บไซต์นี้ถือว่าคุณยอมรับข้อตกลงและเงื่อนไขที่ระบุไว้ในนโยบายนี้
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">2. ข้อมูลที่เราเก็บรวบรวม</h2>
          <p className="mb-2">เราอาจเก็บรวบรวมข้อมูลประเภทต่างๆ ดังนี้:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-gray-400">
            <li>ข้อมูลระบุตัวตน (เช่น ชื่อ, นามสกุล)</li>
            <li>ข้อมูลการติดต่อ (เช่น อีเมล, เบอร์โทรศัพท์)</li>
            <li>ข้อมูลบัญชีผู้ใช้ (เช่น ชื่อผู้ใช้, รหัสผ่านที่เข้ารหัสแล้ว)</li>
            <li>ข้อมูลการทำธุรกรรม (เช่น ประวัติการสั่งซื้อ, การชำระเงิน)</li>
            <li>ข้อมูลทางเทคนิค (เช่น IP Address, ข้อมูลคุกกี้, ข้อมูลอุปกรณ์)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">3. วัตถุประสงค์การใช้ข้อมูล</h2>
          <p className="mb-2">เราใช้ข้อมูลของคุณเพื่อ:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-gray-400">
            <li>ให้บริการและดำเนินการตามคำสั่งซื้อของคุณ</li>
            <li>ปรับปรุงและพัฒนาประสบการณ์การใช้งานเว็บไซต์</li>
            <li>ติดต่อสื่อสาร แจ้งข่าวสาร หรือโปรโมชั่น (หากคุณยินยอม)</li>
            <li>ปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้อง</li>
            <li>รักษาความปลอดภัยของระบบและบัญชีผู้ใช้</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">4. คุกกี้ (Cookies)</h2>
          <p>
            เว็บไซต์ของเรามีการใช้งานคุกกี้เพื่อช่วยให้การใช้งานเว็บไซต์ของคุณสะดวกยิ่งขึ้น คุกกี้คือไฟล์ข้อมูลขนาดเล็กที่ถูกบันทึกลงในอุปกรณ์ของคุณ
            คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่อาจทำให้ฟังก์ชันบางอย่างของเว็บไซต์ทำงานได้ไม่สมบูรณ์
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">5. การเปิดเผยข้อมูล</h2>
          <p>
            เราจะไม่จำหน่าย แลกเปลี่ยน หรือโอนข้อมูลส่วนบุคคลของคุณไปยังบุคคลภายนอก ยกเว้นในกรณีที่จำเป็นเพื่อการให้บริการ (เช่น ผู้ให้บริการชำระเงิน) 
            หรือตามที่กฎหมายกำหนด
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">6. ความปลอดภัยของข้อมูล</h2>
          <p>
            เรามีมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการเข้าถึง การใช้ หรือการเปิดเผยโดยไม่ได้รับอนุญาต
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">7. การเปลี่ยนแปลงนโยบาย</h2>
          <p>
            เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว โดยจะประกาศการเปลี่ยนแปลงบนหน้าเว็บไซต์นี้ 
            ขอแนะนำให้คุณตรวจสอบหน้านี้อย่างสม่ำเสมอ
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">8. ติดต่อเรา</h2>
          <p>
            หากคุณมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ โปรดติดต่อเราผ่านช่องทางที่ระบุไว้ในหน้าติดต่อเรา หรือส่วนท้ายของเว็บไซต์
          </p>
        </section>
      </div>
    </div>
  );
}
