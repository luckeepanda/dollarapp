import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = 'https://dollarfood.app/og-image.jpg',
  type = 'website',
  noindex = false
}) => {
  const location = useLocation();
  const { language } = useLanguage();
  
  const baseUrl = 'https://dollarfood.app';
  const currentUrl = `${baseUrl}${location.pathname}`;
  
  // Default SEO values
  const defaultTitle = 'Dollar App | Play $1 Games, Win Real Food Prizes';
  const defaultDescription = 'Play skill-based mobile games for just $1 and win real food prizes at local restaurants. Join tournaments, compete with friends, and redeem QR codes for delicious meals.';
  const defaultKeywords = 'mobile games, food prizes, restaurant games, skill games, tournament gaming, food rewards, mobile gaming app, arcade games';
  
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  
  React.useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = finalDescription;
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = finalKeywords;
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;
    
    // Update Open Graph tags
    const ogTags = [
      { property: 'og:title', content: finalTitle },
      { property: 'og:description', content: finalDescription },
      { property: 'og:url', content: currentUrl },
      { property: 'og:image', content: image },
      { property: 'og:type', content: type },
      { property: 'og:locale', content: language === 'es' ? 'es_ES' : 'en_US' }
    ];
    
    ogTags.forEach(({ property, content }) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
    
    // Update Twitter Card tags
    const twitterTags = [
      { name: 'twitter:title', content: finalTitle },
      { name: 'twitter:description', content: finalDescription },
      { name: 'twitter:image', content: image }
    ];
    
    twitterTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
    
    // Update robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    
    // Update hreflang tags
    const hreflangTags = [
      { hreflang: 'en', href: currentUrl },
      { hreflang: 'es', href: currentUrl },
      { hreflang: 'x-default', href: currentUrl }
    ];
    
    // Remove existing hreflang tags
    document.querySelectorAll('link[hreflang]').forEach(link => link.remove());
    
    // Add new hreflang tags
    hreflangTags.forEach(({ hreflang, href }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hrefLang = hreflang;
      link.href = href;
      document.head.appendChild(link);
    });
    
  }, [finalTitle, finalDescription, finalKeywords, currentUrl, image, type, language, noindex]);
  
  return null; // This component doesn't render anything visible
};

export default SEOHead;