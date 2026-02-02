export const APP_NAME = 'R9Club Music';
export const APP_DESCRIPTION = 'Digital Music Store - r9clubradio.com';

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const TRANSACTION_TYPE = {
  TOPUP: 'TOPUP',
  PURCHASE: 'PURCHASE',
  REFUND: 'REFUND',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  CART: '/cart',
  CHECKOUT: '/checkout',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
} as const;

export const DOWNLOAD_LINK_EXPIRY_HOURS = 24;
export const MAX_DOWNLOAD_COUNT = 5;
