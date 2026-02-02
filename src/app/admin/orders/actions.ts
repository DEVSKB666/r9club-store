'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteOrder(orderId: string) {
  try {
    // Get order details to delete associated downloads
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order) {
      // Delete associated downloads
      // We match by userId and productIds since there's no direct foreign key
      const productIds = order.items.map(item => item.productId);
      
      await prisma.download.deleteMany({
        where: {
          userId: order.userId,
          productId: { in: productIds },
        },
      });
    }

    await prisma.order.delete({
      where: { id: orderId },
    });
    
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete order:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}
