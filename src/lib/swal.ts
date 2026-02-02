// SweetAlert2 Utility with Dark Theme
// Falls back to native methods if sweetalert2 is not installed

let Swal: any = null;
let Toast: any = null;

// Try to load SweetAlert2, fallback to native methods if not available
try {
  Swal = require('sweetalert2').default;
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1f2937',
    color: '#fff',
    customClass: {
      popup: 'rounded-xl',
    },
  });
} catch (e) {
  // SweetAlert2 not installed, will use native fallbacks
}

const nativeFallback = {
  success: (message: string) => {
    console.log('✅ ' + message);
  },
  error: (message: string) => {
    console.error('❌ ' + message);
  },
  info: (message: string) => {
    console.info('ℹ️ ' + message);
  },
  warning: (message: string) => {
    console.warn('⚠️ ' + message);
  },
  confirm: async (title: string, _text?: string) => {
    return confirm(title);
  },
  confirmDelete: async (itemName?: string) => {
    return confirm(itemName ? `ต้องการลบ "${itemName}" ใช่หรือไม่?` : 'ยืนยันการลบ?');
  },
  loading: (_title?: string) => {},
  close: () => {},
};

export const swal = Swal ? {
  // Success toast
  success: (message: string) => {
    Toast.fire({
      icon: 'success',
      title: message,
      iconColor: '#22c55e',
    });
  },

  // Error toast
  error: (message: string) => {
    Toast.fire({
      icon: 'error',
      title: message,
      iconColor: '#ef4444',
    });
  },

  // Info toast
  info: (message: string) => {
    Toast.fire({
      icon: 'info',
      title: message,
      iconColor: '#3b82f6',
    });
  },

  // Warning toast
  warning: (message: string) => {
    Toast.fire({
      icon: 'warning',
      title: message,
      iconColor: '#f59e0b',
    });
  },

  // Confirm dialog
  confirm: async (title: string, text?: string) => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a855f7',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      background: '#111827',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
        confirmButton: 'rounded-lg px-6',
        cancelButton: 'rounded-lg px-6',
      },
    });
    return result.isConfirmed;
  },

  // Delete confirm dialog
  confirmDelete: async (itemName?: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: itemName ? `คุณต้องการลบ "${itemName}" ใช่หรือไม่?` : 'การดำเนินการนี้ไม่สามารถย้อนกลับได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบเลย',
      cancelButtonText: 'ยกเลิก',
      background: '#111827',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
        confirmButton: 'rounded-lg px-6',
        cancelButton: 'rounded-lg px-6',
      },
    });
    return result.isConfirmed;
  },

  // Loading
  loading: (title = 'กำลังโหลด...') => {
    Swal.fire({
      title,
      allowOutsideClick: false,
      showConfirmButton: false,
      background: '#111827',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
      },
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  // Generic fire with default theme
  fire: (options: any) => {
    return Swal.fire({
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#22c55e',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
        confirmButton: 'rounded-lg px-6',
        cancelButton: 'rounded-lg px-6',
      },
      ...options,
    });
  },

  // Close any open dialog
  close: () => {
    Swal.close();
  },
} : nativeFallback;

export default swal;
