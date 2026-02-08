import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@viralgoods.com';
const FROM_NAME = process.env.FROM_NAME || 'ViralGoods';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { title: string; price: number; quantity: number; variant: { color: string; size: string } }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: { line1: string; line2?: string; city: string; state: string; zip: string };
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.title} (${item.variant.color}/${item.variant.size})</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
      <div style="background:#0070f3;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">ViralGoods</h1>
      </div>
      <div style="padding:24px">
        <h2>Order Confirmed!</h2>
        <p>Hi ${data.customerName},</p>
        <p>Thanks for your order! We've received your order <strong>#${data.orderNumber}</strong> and are getting it ready.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f8f9fa">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="text-align:right;margin-top:16px">
          <p style="margin:4px 0">Subtotal: ${formatPrice(data.subtotal)}</p>
          <p style="margin:4px 0">Shipping: ${data.shipping === 0 ? 'Free' : formatPrice(data.shipping)}</p>
          <p style="margin:4px 0">Tax: ${formatPrice(data.tax)}</p>
          <p style="margin:4px 0;font-size:18px;font-weight:bold">Total: ${formatPrice(data.total)}</p>
        </div>
        <div style="margin-top:24px;padding:16px;background:#f8f9fa;border-radius:8px">
          <h3 style="margin-top:0">Shipping To:</h3>
          <p style="margin:0">${data.customerName}<br/>
          ${data.shippingAddress.line1}<br/>
          ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br/>' : ''}
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zip}</p>
        </div>
      </div>
      <div style="padding:16px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee">
        <p>ViralGoods &mdash; Trending Products for the Modern Lifestyle</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Order Confirmed - #${data.orderNumber}`,
      html,
    });
    console.log(`Order confirmation email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

export async function sendShippingUpdate(data: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
}): Promise<void> {
  const statusMessages: Record<string, string> = {
    processing: 'Your order is being prepared for shipment.',
    shipped: `Your order has been shipped!${data.trackingNumber ? ` Tracking number: ${data.trackingNumber}` : ''}`,
    delivered: 'Your order has been delivered! We hope you love your purchase.',
  };

  const message = statusMessages[data.status] || `Your order status has been updated to: ${data.status}`;

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
      <div style="background:#0070f3;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">ViralGoods</h1>
      </div>
      <div style="padding:24px">
        <h2>Order Update</h2>
        <p>Hi ${data.customerName},</p>
        <p>${message}</p>
        <p>Order: <strong>#${data.orderNumber}</strong></p>
        ${data.trackingUrl ? `<p><a href="${data.trackingUrl}" style="color:#0070f3">Track your package</a></p>` : ''}
      </div>
      <div style="padding:16px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee">
        <p>ViralGoods &mdash; Trending Products for the Modern Lifestyle</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Order #${data.orderNumber} - ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
      html,
    });
    console.log(`Shipping update email sent to ${data.customerEmail}`);
  } catch (error) {
    console.error('Failed to send shipping update email:', error);
  }
}

export async function sendInventoryAlert(data: {
  adminEmail: string;
  productTitle: string;
  variantSku: string;
  currentStock: number;
  type: string;
}): Promise<void> {
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
      <div style="background:#dc2626;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">Inventory Alert</h1>
      </div>
      <div style="padding:24px">
        <h2>${data.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock Warning'}</h2>
        <p><strong>Product:</strong> ${data.productTitle}</p>
        <p><strong>Variant:</strong> ${data.variantSku}</p>
        <p><strong>Current Stock:</strong> ${data.currentStock}</p>
        <p>Please review and restock as needed.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: data.adminEmail,
      subject: `[Alert] ${data.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}: ${data.productTitle}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send inventory alert email:', error);
  }
}
