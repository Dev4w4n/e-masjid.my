/**
 * Security Integration for TV Display
 * 
 * Main security integration file that combines all security features
 * and provides a unified security system for the TV display application.
 */

import { securityManager } from './security-manager';
import { useSecurity, tvDisplaySchemas } from './use-security';

// Initialize security system
export const initializeSecuritySystem = () => {
  console.log('🔒 Initializing TV Display Security System');
  
  // Set up global security monitoring
  if (typeof window !== 'undefined') {
    // Content Security Policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.youtube.com https://youtube.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: http:",
      "media-src 'self' https://www.youtube.com https://youtube.com",
      "connect-src 'self' https://api.aladhan.com",
      "frame-src https://www.youtube.com https://youtube.com",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
    document.head.appendChild(meta);
    
    // Security event monitoring
    window.addEventListener('securitypolicyviolation', (event) => {
      console.error('🚨 CSP Violation:', event);
      // Log CSP violation as security event
      console.warn('CSP Violation detected:', event.violatedDirective);
    });
    
    // Disable dangerous JavaScript features
    Object.defineProperty(window, 'eval', {
      value: () => {
        throw new Error('eval() is disabled for security reasons');
      },
      writable: false,
      configurable: false
    });
    
    // Monitor for malicious iframe injection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check for suspicious iframe injections
            if (element.tagName === 'IFRAME' || element.querySelector('iframe')) {
              const iframes = element.tagName === 'IFRAME' ? [element] : element.querySelectorAll('iframe');
              
              iframes.forEach((iframe) => {
                const src = iframe.getAttribute('src');
                if (src && !isAllowedIframeSrc(src)) {
                  console.warn('🚨 Suspicious iframe blocked:', src);
                  iframe.remove();
                }
              });
            }
            
            // Check for suspicious script injections
            if (element.tagName === 'SCRIPT' || element.querySelector('script')) {
              const scripts = element.tagName === 'SCRIPT' ? [element] : element.querySelectorAll('script');
              
              scripts.forEach((script) => {
                const src = script.getAttribute('src');
                if (src && !isAllowedScriptSrc(src)) {
                  console.warn('🚨 Suspicious script blocked:', src);
                  script.remove();
                }
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  console.log('✅ Security system initialized');
};

// Helper functions for security checks
const isAllowedIframeSrc = (src: string): boolean => {
  const allowedDomains = [
    'youtube.com',
    'www.youtube.com',
    'youtu.be'
  ];
  
  try {
    const url = new URL(src);
    return allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

const isAllowedScriptSrc = (src: string): boolean => {
  try {
    const url = new URL(src);
    // Only allow scripts from same origin or trusted CDNs
    return url.origin === window.location.origin || 
           url.hostname === 'www.youtube.com' ||
           url.hostname === 'youtube.com';
  } catch {
    return false;
  }
};

// Security middleware for API requests
export const securityMiddleware = {
  /**
   * Validate API request data
   */
  validateRequest: (endpoint: string, data: any) => {
    const schemas: Record<string, any> = {
      '/api/displays': tvDisplaySchemas.displayConfig,
      '/api/content': tvDisplaySchemas.displayContent,
      '/api/prayer-times': tvDisplaySchemas.prayerTimes
    };
    
    for (const [path, schema] of Object.entries(schemas)) {
      if (endpoint.includes(path)) {
        return securityManager.validateInput(data, schema);
      }
    }
    
    // Default validation for unknown endpoints
    return securityManager.validateInput(data, {});
  },
  
  /**
   * Sanitize API response data
   */
  sanitizeResponse: (data: any): any => {
    if (typeof data === 'string') {
      return securityManager.sanitizeInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => securityMiddleware.sanitizeResponse(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = securityMiddleware.sanitizeResponse(value);
      }
      return sanitized;
    }
    
    return data;
  },
  
  /**
   * Check rate limits for API endpoints
   */
  checkRateLimit: (endpoint: string): boolean => {
    return securityManager.checkRateLimit(`api-${endpoint}`);
  }
};

// Security utilities for TV display components
export const tvSecurityUtils = {
  /**
   * Validate YouTube URL for iframe embedding
   */
  validateYouTubeUrl: (url: string): { isValid: boolean; embedUrl?: string; error?: string } => {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a valid YouTube domain
      if (!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(urlObj.hostname)) {
        return { isValid: false, error: 'Invalid YouTube domain' };
      }
      
      let videoId: string | null = null;
      
      // Extract video ID from different YouTube URL formats
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
<<<<<<< HEAD
        const parts = urlObj.pathname.split('/embed/');
        videoId = parts[1] || null;
=======
        videoId = urlObj.pathname.split('/embed/')[1];
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
      }
      
      if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return { isValid: false, error: 'Invalid YouTube video ID' };
      }
      
      // Generate secure embed URL
      const embedUrl = `https://www.youtube.com/embed/${videoId}?` + 
        'autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1';
      
      return { isValid: true, embedUrl };
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  },
  
  /**
   * Validate image URL for safe display
   */
  validateImageUrl: (url: string): { isValid: boolean; safeUrl?: string; error?: string } => {
    try {
      const urlObj = new URL(url);
      
      // Block data URLs that might contain malicious content
      if (urlObj.protocol === 'data:') {
        if (!urlObj.href.startsWith('data:image/')) {
          return { isValid: false, error: 'Non-image data URL not allowed' };
        }
        
        // Check for suspicious data URL content
        const base64Part = urlObj.href.split(',')[1];
        if (base64Part && base64Part.length > 1000000) { // 1MB limit
          return { isValid: false, error: 'Data URL too large' };
        }
      }
      
      // Only allow HTTPS or same-origin HTTP
      if (urlObj.protocol !== 'https:' && urlObj.origin !== window.location.origin) {
        return { isValid: false, error: 'Only HTTPS images allowed from external sources' };
      }
      
      return { isValid: true, safeUrl: url };
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  },
  
  /**
   * Sanitize content for display
   */
  sanitizeDisplayContent: (content: any) => {
    const sanitized = { ...content };
    
    // Sanitize text content
    if (sanitized.title) {
      sanitized.title = securityManager.sanitizeInput(sanitized.title);
    }
    
    if (sanitized.description) {
      sanitized.description = securityManager.sanitizeInput(sanitized.description, true);
    }
    
    // Validate URLs based on content type
    if (sanitized.url) {
      switch (sanitized.type) {
        case 'youtube_video':
          const youtubeValidation = tvSecurityUtils.validateYouTubeUrl(sanitized.url);
          if (!youtubeValidation.isValid) {
            console.warn('Invalid YouTube URL blocked:', sanitized.url);
            sanitized.url = null;
            sanitized.error = youtubeValidation.error;
          } else {
            sanitized.embedUrl = youtubeValidation.embedUrl;
          }
          break;
          
        case 'image':
          const imageValidation = tvSecurityUtils.validateImageUrl(sanitized.url);
          if (!imageValidation.isValid) {
            console.warn('Invalid image URL blocked:', sanitized.url);
            sanitized.url = null;
            sanitized.error = imageValidation.error;
          }
          break;
          
        default:
          // For other content types, basic URL validation
          try {
            new URL(sanitized.url);
          } catch {
            console.warn('Invalid URL blocked:', sanitized.url);
            sanitized.url = null;
            sanitized.error = 'Invalid URL format';
          }
      }
    }
    
    return sanitized;
  }
};

// Security monitoring dashboard data
export const getSecurityDashboard = () => {
  const summary = securityManager.getSecuritySummary();
  const recentEvents = securityManager.getSecurityLogs(undefined, undefined, 20);
  
  return {
    summary,
    recentEvents,
    recommendations: generateSecurityRecommendations(summary),
    systemStatus: getSecuritySystemStatus()
  };
};

// Generate security recommendations based on current state
const generateSecurityRecommendations = (summary: any) => {
  const recommendations = [];
  
  if (summary.eventsBySeverity.high > 0 || summary.eventsBySeverity.critical > 0) {
    recommendations.push({
      type: 'critical',
      message: 'High severity security events detected. Review logs immediately.',
      action: 'Review security logs'
    });
  }
  
  if (summary.blockedRequests > 10) {
    recommendations.push({
      type: 'warning',
      message: `${summary.blockedRequests} requests blocked. Monitor for potential attacks.`,
      action: 'Review blocked requests'
    });
  }
  
  if (summary.eventsByType.xss_attempt > 0) {
    recommendations.push({
      type: 'warning',
      message: 'XSS attempts detected. Ensure input sanitization is working properly.',
      action: 'Review XSS protection'
    });
  }
  
  if (Object.keys(summary.eventsByType).length === 0) {
    recommendations.push({
      type: 'info',
      message: 'No security events detected. System appears secure.',
      action: 'Continue monitoring'
    });
  }
  
  return recommendations;
};

// Get overall security system status
const getSecuritySystemStatus = () => {
  const summary = securityManager.getSecuritySummary();
  
  const criticalEvents = summary.eventsBySeverity.critical || 0;
  const highSeverityEvents = summary.eventsBySeverity.high || 0;
  
  if (criticalEvents > 0) {
    return { status: 'critical', message: 'Critical security issues detected' };
  }
  
  if (highSeverityEvents > 5) {
    return { status: 'warning', message: 'Multiple high severity events detected' };
  }
  
  if (summary.totalEvents > 0) {
    return { status: 'monitoring', message: 'Security monitoring active' };
  }
  
  return { status: 'secure', message: 'System secure' };
};

// Export main security components
export {
  securityManager,
  useSecurity,
  tvDisplaySchemas
};

// Export default security system
export default {
  initialize: initializeSecuritySystem,
  middleware: securityMiddleware,
  utils: tvSecurityUtils,
  getDashboard: getSecurityDashboard
};