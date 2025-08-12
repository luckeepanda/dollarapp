import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Google Analytics 4 Event Tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views and user interactions
const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track scroll depth for engagement metrics
let maxScrollDepth = 0;
const trackScrollDepth = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = Math.round((scrollTop / docHeight) * 100);
  
  if (scrollPercent > maxScrollDepth && scrollPercent % 25 === 0) {
    maxScrollDepth = scrollPercent;
    trackEvent('scroll_depth', {
      scroll_depth: scrollPercent,
      page_title: document.title,
      page_location: window.location.href
    });
  }
};

// Track time on page for dwell time metrics
let startTime = Date.now();
const trackTimeOnPage = () => {
  const timeSpent = Math.round((Date.now() - startTime) / 1000);
  if (timeSpent > 30) { // Only track if user spent more than 30 seconds
    trackEvent('time_on_page', {
      time_spent: timeSpent,
      page_title: document.title,
      page_location: window.location.href
    });
  }
};

// Set up event listeners for engagement tracking
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', trackScrollDepth, { passive: true });
  window.addEventListener('beforeunload', trackTimeOnPage);
  
  // Track clicks on important elements
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      const elementText = target.textContent?.trim() || '';
      const elementType = target.tagName.toLowerCase();
      
      trackEvent('click', {
        element_type: elementType,
        element_text: elementText.substring(0, 50), // Limit text length
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }, { passive: true });
}

// Clear all localStorage data when the page is about to unload
window.addEventListener('beforeunload', () => {
  localStorage.clear();
  trackTimeOnPage(); // Track final time on page
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);