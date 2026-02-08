import Product from '../models/Product';
import InventoryAlert from '../models/InventoryAlert';
import { sendInventoryAlert } from './email';

const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

export async function checkInventoryLevels(productId: string): Promise<void> {
  const product = await Product.findById(productId);
  if (!product) return;

  for (const variant of product.variants) {
    const existingAlert = await InventoryAlert.findOne({
      productId: product._id,
      variantSku: variant.sku,
      isResolved: false,
    });

    if (variant.stock === 0 && !existingAlert) {
      const alert = new InventoryAlert({
        productId: product._id,
        variantSku: variant.sku,
        type: 'out_of_stock',
        threshold: LOW_STOCK_THRESHOLD,
        currentStock: 0,
        notifiedAt: new Date(),
      });
      await alert.save();
      await sendInventoryAlert(ADMIN_EMAILS, product.title, variant.sku, 0, 'out_of_stock');
    } else if (variant.stock > 0 && variant.stock <= LOW_STOCK_THRESHOLD && !existingAlert) {
      const alert = new InventoryAlert({
        productId: product._id,
        variantSku: variant.sku,
        type: 'low_stock',
        threshold: LOW_STOCK_THRESHOLD,
        currentStock: variant.stock,
        notifiedAt: new Date(),
      });
      await alert.save();
      await sendInventoryAlert(ADMIN_EMAILS, product.title, variant.sku, variant.stock, 'low_stock');
    } else if (variant.stock > LOW_STOCK_THRESHOLD && existingAlert) {
      existingAlert.isResolved = true;
      existingAlert.resolvedAt = new Date();
      await existingAlert.save();
    }
  }
}

export async function processAutoReorders(): Promise<{ reordered: number; errors: number }> {
  const alerts = await InventoryAlert.find({
    isResolved: false,
    autoReorder: true,
    type: { $in: ['low_stock', 'out_of_stock'] },
  }).populate('productId');

  let reordered = 0;
  let errors = 0;

  for (const alert of alerts) {
    try {
      const product = await Product.findById(alert.productId);
      if (!product) continue;

      const variant = product.variants.find((v) => v.sku === alert.variantSku);
      if (!variant) continue;

      variant.stock += alert.reorderQuantity;
      await product.save();

      alert.isResolved = true;
      alert.resolvedAt = new Date();
      alert.type = 'reorder';
      await alert.save();

      console.log(
        `Auto-reordered ${alert.reorderQuantity} units of ${product.title} (${variant.sku})`
      );
      reordered++;
    } catch (error) {
      console.error('Auto-reorder error:', error);
      errors++;
    }
  }

  return { reordered, errors };
}
