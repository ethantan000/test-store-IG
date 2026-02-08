import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

const FROM = process.env.EMAIL_FROM || 'no-reply@viralgoods.com';
const isConfigured = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER);

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { title: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
  if (!isConfigured) {
    console.log(`[Email Mock] Order confirmation for ${data.orderNumber} → ${data.customerEmail}`);
    return true;
  }

  const itemRows = data.items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.title}</td>
         <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
         <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.price.toFixed(2)}</td></tr>`
    )
    .join('');

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333">
      <div style="background:linear-gradient(135deg,#0070f3,#6b21a8);padding:32px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:24px">Order Confirmed!</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Thank you for your purchase, ${data.customerName}</p>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #eee;border-top:none">
        <p style="color:#666;font-size:14px">Order Number: <strong style="color:#0070f3">${data.orderNumber}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#f9fafb">
            <th style="padding:8px;text-align:left">Item</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="border-top:2px solid #0070f3;padding-top:12px;margin-top:8px">
          <p style="margin:4px 0;font-size:14px;color:#666">Subtotal: $${data.subtotal.toFixed(2)}</p>
          <p style="margin:4px 0;font-size:14px;color:#666">Shipping: ${data.shipping === 0 ? 'Free' : '$' + data.shipping.toFixed(2)}</p>
          <p style="margin:4px 0;font-size:14px;color:#666">Tax: $${data.tax.toFixed(2)}</p>
          <p style="margin:8px 0 0;font-size:18px;font-weight:bold;color:#0070f3">Total: $${data.total.toFixed(2)}</p>
        </div>
      </div>
      <div style="padding:16px;text-align:center;color:#999;font-size:12px">
        <p>ViralGoods - Trending Products for the Modern Lifestyle</p>
      </div>
    </div>`;

  try {
    await transporter.sendMail({
      from: FROM,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendShippingUpdate(
  email: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string
): Promise<boolean> {
  if (!isConfigured) {
    console.log(`[Email Mock] Shipping update for ${orderNumber} → ${email}: ${status}`);
    return true;
  }

  const statusMessages: Record<string, string> = {
    processing: 'Your order is being prepared for shipment.',
    shipped: `Your order has been shipped!${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
    delivered: 'Your order has been delivered! We hope you love it.',
  };

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333">
      <div style="background:linear-gradient(135deg,#0070f3,#6b21a8);padding:32px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:24px">Order Update</h1>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #eee;border-top:none">
        <p><strong>Order:</strong> ${orderNumber}</p>
        <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
        <p style="color:#666">${statusMessages[status] || 'Your order status has been updated.'}</p>
        ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
      </div>
    </div>`;

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `Order ${orderNumber} - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendInventoryAlert(
  adminEmails: string[],
  productTitle: string,
  variantSku: string,
  currentStock: number,
  type: string
): Promise<boolean> {
  if (!isConfigured || adminEmails.length === 0) {
    console.log(`[Email Mock] Inventory alert: ${productTitle} (${variantSku}) - ${type}, stock: ${currentStock}`);
    return true;
  }

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333">
      <div style="background:#ef4444;padding:24px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">Inventory Alert</h1>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #eee;border-top:none">
        <p><strong>Product:</strong> ${productTitle}</p>
        <p><strong>Variant SKU:</strong> ${variantSku}</p>
        <p><strong>Alert Type:</strong> ${type.replace(/_/g, ' ').toUpperCase()}</p>
        <p><strong>Current Stock:</strong> ${currentStock}</p>
        <p style="color:#666;margin-top:16px">Please restock this item as soon as possible.</p>
      </div>
    </div>`;

  try {
    await transporter.sendMail({
      from: FROM,
      to: adminEmails.join(','),
      subject: `[Inventory Alert] ${productTitle} - ${type.replace(/_/g, ' ')}`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Inventory alert email error:', error);
    return false;
  }
}
