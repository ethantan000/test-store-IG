import Product from '../models/Product';
import InventoryAlert from '../models/InventoryAlert';
import { sendInventoryAlert } from './email';

const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD || '5', 10);
const AUTO_REORDER_QUANTITY = parseInt(process.env.AUTO_REORDER_QUANTITY || '50', 10);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@viralgoods.com';

export async function checkInventoryLevels(productId: string): Promise<void> {
  const product = await Product.findById(productId);
  if (!product) return;

  for (const variant of product.variants) {
    if (variant.stock <= 0) {
      const existing = await InventoryAlert.findOne({
        productId,
        variantSku: variant.sku,
        type: 'out_of_stock',
        isResolved: false,
      });

      if (!existing) {
        await InventoryAlert.create({
          productId,
          productTitle: product.title,
          variantSku: variant.sku,
          type: 'out_of_stock',
          threshold: LOW_STOCK_THRESHOLD,
          currentStock: variant.stock,
          reorderQuantity: AUTO_REORDER_QUANTITY,
        });

        await sendInventoryAlert({
          adminEmail: ADMIN_EMAIL,
          productTitle: product.title,
          variantSku: variant.sku,
          currentStock: variant.stock,
          type: 'out_of_stock',
        });
      }
    } else if (variant.stock <= LOW_STOCK_THRESHOLD) {
      const existing = await InventoryAlert.findOne({
        productId,
        variantSku: variant.sku,
        type: 'low_stock',
        isResolved: false,
      });

      if (!existing) {
        await InventoryAlert.create({
          productId,
          productTitle: product.title,
          variantSku: variant.sku,
          type: 'low_stock',
          threshold: LOW_STOCK_THRESHOLD,
          currentStock: variant.stock,
          reorderQuantity: AUTO_REORDER_QUANTITY,
        });

        await sendInventoryAlert({
          adminEmail: ADMIN_EMAIL,
          productTitle: product.title,
          variantSku: variant.sku,
          currentStock: variant.stock,
          type: 'low_stock',
        });
      }
    }
  }
}

export async function triggerAutoReorder(alertId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const alert = await InventoryAlert.findById(alertId);
  if (!alert || alert.isResolved) {
    return { success: false, message: 'Alert not found or already resolved' };
  }

  const product = await Product.findById(alert.productId);
  if (!product) {
    return { success: false, message: 'Product not found' };
  }

  const variant = product.variants.find((v) => v.sku === alert.variantSku);
  if (!variant) {
    return { success: false, message: 'Variant not found' };
  }

  variant.stock += alert.reorderQuantity;
  await product.save();

  alert.isResolved = true;
  alert.resolvedAt = new Date();
  await alert.save();

  await InventoryAlert.create({
    productId: alert.productId,
    productTitle: alert.productTitle,
    variantSku: alert.variantSku,
    type: 'auto_reorder',
    threshold: alert.threshold,
    currentStock: variant.stock,
    reorderQuantity: alert.reorderQuantity,
    isResolved: true,
    resolvedAt: new Date(),
  });

  return {
    success: true,
    message: `Restocked ${alert.reorderQuantity} units of ${alert.variantSku}. New stock: ${variant.stock}`,
  };
}
