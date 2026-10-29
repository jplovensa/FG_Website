// Shared GA4 tag. The measurement ID is public, not a credential.
(() => {
  const production = ['fjallgroup.com', 'www.fjallgroup.com'].includes(location.hostname)
    || (location.hostname === 'jplovensa.github.io' && location.pathname.startsWith('/FG_Website/'));
  if (!production || window.self !== window.top || window.__fjallAnalyticsLoaded) return;
  window.__fjallAnalyticsLoaded = true;

  const measurementId = 'G-MQ5LQD2C15';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const withoutDetails = (value) => {
    try {
      const url = new URL(value);
      return url.origin + url.pathname;
    } catch {
      return '';
    }
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    // Shared project briefs can contain user-entered details in the URL.
    page_location: withoutDetails(location.href),
    page_referrer: withoutDetails(document.referrer),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(tag);
})();
