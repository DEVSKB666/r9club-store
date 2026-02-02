'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  MusicalNoteIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeItem, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const [mounted, setMounted] = useState(false);

  // Mount for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle body overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    document.body.style.overflow = '';
    onClose();
    router.push('/checkout');
  };

  const handleClose = () => {
    document.body.style.overflow = '';
    onClose();
  };

  // Don't render anything on server or before mount
  if (!mounted) return null;

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#111827',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'transform 0.3s ease, visibility 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShoppingBagIcon style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'white' }}>ตะกร้าสินค้า</h2>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                {items.length > 0 ? `${items.length} รายการ` : 'ว่างเปล่า'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {items.length === 0 ? (
          // Empty State
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <ShoppingBagIcon style={{ width: '40px', height: '40px', color: '#6b7280' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'white' }}>ตะกร้าว่างเปล่า</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
              เลือกเพลงที่ชอบแล้วเพิ่มลงตะกร้ากันเถอะ!
            </p>
            <Button onClick={handleClose}>เลือกซื้อสินค้า</Button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              minHeight: 0,
            }}>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Cover Image */}
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                    }}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, padding: '10px', minWidth: 0 }}>
                    <h4 style={{ 
                      fontWeight: '600', 
                      fontSize: '14px', 
                      margin: 0,
                      color: 'white',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{item.title}</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#9ca3af' }}>
                      <UserIcon style={{ width: '12px', height: '12px' }} />
                      <span style={{ fontSize: '12px' }}>{item.artist}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#6b7280' }}>
                      <MusicalNoteIcon style={{ width: '12px', height: '12px' }} />
                      <span style={{ fontSize: '10px' }}>เพลงดิจิทัล</span>
                    </div>

                    <p style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '14px', margin: '4px 0 0 0' }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      alignSelf: 'flex-start',
                      margin: '8px',
                      padding: '6px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      color: '#f87171',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <TrashIcon style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              flexShrink: 0,
              backgroundColor: '#111827',
            }}>
              {/* Summary */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: 'white' }}>
                  <span style={{ color: '#9ca3af' }}>จำนวนสินค้า</span>
                  <span>{items.length} รายการ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: 'white' }}>
                  <span style={{ color: '#9ca3af' }}>ราคารวม</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}>
                  <span style={{ fontWeight: '600' }}>ยอดรวมทั้งหมด</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <Button className="w-full mb-3" size="lg" onClick={handleCheckout}>
                <ShoppingBagIcon className="w-5 h-5 mr-2" />
                ดำเนินการชำระเงิน
              </Button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    cursor: 'pointer',
                  }}
                >
                  เลือกซื้อต่อ
                </button>
                <button
                  onClick={clearCart}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    cursor: 'pointer',
                  }}
                >
                  ล้างตะกร้า
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );

  // Render in portal to document.body
  return createPortal(drawerContent, document.body);
}
