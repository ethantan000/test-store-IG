'use client';

import Script from 'next/script';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  if (!PIXEL_ID || PIXEL_ID === 'your_pixel_id') return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

export function trackMetaEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as Record<string, unknown>).fbq) {
    (window as Record<string, (...args: unknown[]) => void>).fbq('track', eventName, params);
  }
}

export function trackMetaPurchase(total: number, currency: string = 'USD', contentIds?: string[]) {
  trackMetaEvent('Purchase', {
    value: total,
    currency,
    content_ids: contentIds,
    content_type: 'product',
  });
}

export function trackMetaAddToCart(productId: string, price: number, name: string) {
  trackMetaEvent('AddToCart', {
    content_ids: [productId],
    content_name: name,
    content_type: 'product',
    value: price,
    currency: 'USD',
  });
}

export function trackMetaViewContent(productId: string, price: number, name: string) {
  trackMetaEvent('ViewContent', {
    content_ids: [productId],
    content_name: name,
    content_type: 'product',
    value: price,
    currency: 'USD',
  });
}
