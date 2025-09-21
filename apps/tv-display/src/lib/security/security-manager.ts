/**
 * Security Manager
 * 
 * Comprehensive security implementation for TV display application including
 * input validation, XSS protection, CSRF tokens, secure communication, and
 * security monitoring.
 */

import { cacheManager } from '../performance/cache-manager';

// Security configuration
export interface SecurityConfig {
  enableCSRFProtection: boolean;
  enableXSSProtection: boolean;
  enableInputValidation: boolean;
  enableSecureHeaders: boolean;
  enableRateLimiting: boolean;
  enableAuditLogging: boolean;
  maxRequestsPerMinute: number;
  sessionTimeout: number;
  encryptionKey?: string;
}

// Security event types
export type SecurityEventType = 
  | 'xss_attempt'
  | 'csrf_violation'
  | 'rate_limit_exceeded'
  | 'invalid_input'
  | 'unauthorized_access'
  | 'malicious_request'
  | 'security_scan'
  | 'data_breach_attempt';

// Security audit log entry
export interface SecurityAuditLog {
  id: string;
  timestamp: number;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  blocked: boolean;
}

class SecurityManager {
  private config: SecurityConfig;
  private csrfTokens = new Map<string, { token: string; timestamp: number }>();
  private rateLimitTracker = new Map<string, number[]>();
  private securityLogs: SecurityAuditLog[] = [];
  private blockedIPs = new Set<string>();
  private suspiciousPatterns: RegExp[];

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableCSRFProtection: true,
      enableXSSProtection: true,
      enableInputValidation: true,
      enableSecureHeaders: true,
      enableRateLimiting: true,
      enableAuditLogging: true,
      maxRequestsPerMinute: 60,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      ...config
    };

    this.suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi,
      /update\s+set/gi
    ];

    this.initializeSecurity();
  }

  /**
   * Initialize security measures
   */
  private initializeSecurity(): void {
    if (typeof window !== 'undefined') {
      // Set up security headers
      this.setupSecurityHeaders();
      
      // Monitor for security events
      this.setupSecurityMonitoring();
      
      // Clean up expired tokens periodically
      setInterval(() => this.cleanupExpiredTokens(), 5 * 60 * 1000); // Every 5 minutes
      
      console.log('🔒 Security Manager initialized');
    }
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(sessionId: string): string {
    if (!this.config.enableCSRFProtection) return '';

    const token = this.generateSecureToken();
    this.csrfTokens.set(sessionId, {
      token,
      timestamp: Date.now()
    });

    this.logSecurityEvent('csrf_violation', 'low', 'token_generated', {
      sessionId,
      tokenLength: token.length
    });

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(sessionId: string, providedToken: string): boolean {
    if (!this.config.enableCSRFProtection) return true;

    const tokenData = this.csrfTokens.get(sessionId);
    
    if (!tokenData) {
      this.logSecurityEvent('csrf_violation', 'medium', 'missing_token', {
        sessionId,
        providedToken: providedToken.substring(0, 10) + '...'
      });
      return false;
    }

    // Check token expiration
    if (Date.now() - tokenData.timestamp > this.config.sessionTimeout) {
      this.csrfTokens.delete(sessionId);
      this.logSecurityEvent('csrf_violation', 'medium', 'expired_token', {
        sessionId,
        age: Date.now() - tokenData.timestamp
      });
      return false;
    }

    const isValid = tokenData.token === providedToken;
    
    if (!isValid) {
      this.logSecurityEvent('csrf_violation', 'high', 'invalid_token', {
        sessionId,
        expected: tokenData.token.substring(0, 10) + '...',
        provided: providedToken.substring(0, 10) + '...'
      });
    }

    return isValid;
  }

  /**
   * Sanitize input to prevent XSS attacks
   */
  sanitizeInput(input: string, allowHTML = false): string {
    if (!this.config.enableXSSProtection) return input;

    let sanitized = input;

    // Basic XSS prevention
    if (!allowHTML) {
      sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    } else {
      // More sophisticated sanitization for allowed HTML
      sanitized = this.sanitizeHTML(sanitized);
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        this.logSecurityEvent('xss_attempt', 'high', 'suspicious_pattern_detected', {
          pattern: pattern.toString(),
          input: input.substring(0, 100) + '...',
          sanitized: sanitized.substring(0, 100) + '...'
        });
        
        // Block the request
        return '';
      }
    }

    return sanitized;
  }

  /**
   * Validate input data structure and types
   */
  validateInput<T>(
    input: any,
    schema: Record<string, any>,
    strict = true
  ): { isValid: boolean; errors: string[]; sanitized?: T } {
    if (!this.config.enableInputValidation) {
      return { isValid: true, errors: [], sanitized: input };
    }

    const errors: string[] = [];
    const sanitized: any = {};

    try {
      for (const [key, validator] of Object.entries(schema)) {
        const value = input[key];

        // Check required fields
        if (validator.required && (value === undefined || value === null)) {
          errors.push(`Field '${key}' is required`);
          continue;
        }

        // Skip validation for optional missing fields
        if (!validator.required && (value === undefined || value === null)) {
          continue;
        }

        // Type validation
        if (validator.type && typeof value !== validator.type) {
          errors.push(`Field '${key}' must be of type ${validator.type}`);
          continue;
        }

        // String validations
        if (validator.type === 'string') {
          let sanitizedValue = this.sanitizeInput(value, validator.allowHTML);

          if (validator.minLength && sanitizedValue.length < validator.minLength) {
            errors.push(`Field '${key}' must be at least ${validator.minLength} characters`);
          }

          if (validator.maxLength && sanitizedValue.length > validator.maxLength) {
            sanitizedValue = sanitizedValue.substring(0, validator.maxLength);
          }

          if (validator.pattern && !validator.pattern.test(sanitizedValue)) {
            errors.push(`Field '${key}' does not match required pattern`);
          }

          sanitized[key] = sanitizedValue;
        }

        // Number validations
        if (validator.type === 'number') {
          const numValue = Number(value);

          if (isNaN(numValue)) {
            errors.push(`Field '${key}' must be a valid number`);
            continue;
          }

          if (validator.min !== undefined && numValue < validator.min) {
            errors.push(`Field '${key}' must be at least ${validator.min}`);
          }

          if (validator.max !== undefined && numValue > validator.max) {
            errors.push(`Field '${key}' must be at most ${validator.max}`);
          }

          sanitized[key] = numValue;
        }

        // Array validations
        if (validator.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push(`Field '${key}' must be an array`);
            continue;
          }

          if (validator.minItems && value.length < validator.minItems) {
            errors.push(`Field '${key}' must have at least ${validator.minItems} items`);
          }

          if (validator.maxItems && value.length > validator.maxItems) {
            errors.push(`Field '${key}' must have at most ${validator.maxItems} items`);
          }

          // Sanitize array items if they're strings
          sanitized[key] = value.map((item: any) => 
            typeof item === 'string' ? this.sanitizeInput(item) : item
          );
        }

        // Object validations
        if (validator.type === 'object' && validator.properties) {
          const nestedValidation = this.validateInput(value, validator.properties, strict);
          
          if (!nestedValidation.isValid) {
            errors.push(...nestedValidation.errors.map(err => `${key}.${err}`));
          } else {
            sanitized[key] = nestedValidation.sanitized;
          }
        }

        // Custom validation function
        if (validator.validate && typeof validator.validate === 'function') {
          const customResult = validator.validate(value);
          if (customResult !== true) {
            errors.push(typeof customResult === 'string' ? customResult : `Field '${key}' is invalid`);
          }
        }
      }

      // Check for extra fields in strict mode
      if (strict) {
        for (const key of Object.keys(input)) {
          if (!schema[key]) {
            errors.push(`Unexpected field '${key}'`);
          }
        }
      }

      const isValid = errors.length === 0;

      if (!isValid) {
        this.logSecurityEvent('invalid_input', 'medium', 'validation_failed', {
          errors,
          inputKeys: Object.keys(input),
          schemaKeys: Object.keys(schema)
        });
      }

      return { isValid, errors, sanitized: isValid ? sanitized as T : undefined };

    } catch (error) {
      this.logSecurityEvent('invalid_input', 'high', 'validation_error', {
        error: (error as Error).message,
        input: JSON.stringify(input).substring(0, 200)
      });

      return { isValid: false, errors: ['Validation error occurred'] };
    }
  }

  /**
   * Check rate limiting for requests
   */
  checkRateLimit(identifier: string): boolean {
    if (!this.config.enableRateLimiting) return true;

    const now = Date.now();
    const windowStart = now - 60 * 1000; // 1 minute window
    
    // Get or create request timestamps for this identifier
    let timestamps = this.rateLimitTracker.get(identifier) || [];
    
    // Remove old timestamps
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    // Check if rate limit exceeded
    if (timestamps.length >= this.config.maxRequestsPerMinute) {
      this.logSecurityEvent('rate_limit_exceeded', 'medium', 'too_many_requests', {
        identifier,
        requestCount: timestamps.length,
        limit: this.config.maxRequestsPerMinute
      });
      
      return false;
    }
    
    // Add current timestamp
    timestamps.push(now);
    this.rateLimitTracker.set(identifier, timestamps);
    
    return true;
  }

  /**
   * Secure API request wrapper
   */
  async secureRequest(
    url: string,
    options: RequestInit = {},
    sessionId?: string
  ): Promise<Response> {
    // Rate limiting check
    const clientId = this.getClientIdentifier();
    if (!this.checkRateLimit(clientId)) {
      throw new Error('Rate limit exceeded');
    }

    // Add security headers
    const secureHeaders: Record<string, string> = {
      ...options.headers as Record<string, string>,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Add CSRF token if session exists
    if (sessionId && this.config.enableCSRFProtection) {
      const csrfToken = this.csrfTokens.get(sessionId)?.token;
      if (csrfToken) {
        secureHeaders['X-CSRF-Token'] = csrfToken;
      }
    }

    // Validate and sanitize request body
    if (options.body && typeof options.body === 'string') {
      try {
        const parsedBody = JSON.parse(options.body);
        const sanitizedBody = this.sanitizeRequestBody(parsedBody);
        options.body = JSON.stringify(sanitizedBody);
      } catch (error) {
        this.logSecurityEvent('malicious_request', 'high', 'invalid_json_body', {
          url,
          bodyPreview: options.body.substring(0, 100)
        });
        throw new Error('Invalid request body');
      }
    }

    const secureOptions: RequestInit = {
      ...options,
      headers: secureHeaders
    };

    this.logSecurityEvent('security_scan', 'low', 'secure_request_made', {
      url,
      method: options.method || 'GET',
      hasBody: !!options.body
    });

    return fetch(url, secureOptions);
  }

  /**
   * Get security audit logs
   */
  getSecurityLogs(
    eventType?: SecurityEventType,
    severity?: 'low' | 'medium' | 'high' | 'critical',
    limit = 100
  ): SecurityAuditLog[] {
    let filteredLogs = [...this.securityLogs];

    if (eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }

    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }

    return filteredLogs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get security summary
   */
  getSecuritySummary(): {
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<string, number>;
    blockedRequests: number;
    recentEvents: SecurityAuditLog[];
  } {
    const eventsByType = {} as Record<SecurityEventType, number>;
    const eventsBySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    let blockedRequests = 0;

    for (const log of this.securityLogs) {
      eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1;
      eventsBySeverity[log.severity]++;
      if (log.blocked) blockedRequests++;
    }

    return {
      totalEvents: this.securityLogs.length,
      eventsByType,
      eventsBySeverity,
      blockedRequests,
      recentEvents: this.getSecurityLogs(undefined, undefined, 10)
    };
  }

  /**
   * Export security data for analysis
   */
  exportSecurityData(): string {
    const data = {
      config: this.config,
      summary: this.getSecuritySummary(),
      logs: this.securityLogs,
      activeTokens: this.csrfTokens.size,
      blockedIPs: Array.from(this.blockedIPs),
      rateLimitTracking: Object.keys(this.rateLimitTracker).length,
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Private helper methods
   */

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private sanitizeHTML(html: string): string {
    // Basic HTML sanitization - remove dangerous tags and attributes
    let sanitized = html;

    // Remove script tags and their content
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    
    // Remove dangerous attributes
    sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\sjavascript:/gi, '');
    sanitized = sanitized.replace(/\svbscript:/gi, '');
    
    // Remove dangerous tags
    const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button'];
    for (const tag of dangerousTags) {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }

    return sanitized;
  }

  private sanitizeRequestBody(body: any): any {
    if (typeof body === 'string') {
      return this.sanitizeInput(body);
    }

    if (Array.isArray(body)) {
      return body.map(item => this.sanitizeRequestBody(item));
    }

    if (body && typeof body === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(body)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeRequestBody(value);
      }
      return sanitized;
    }

    return body;
  }

  private getClientIdentifier(): string {
    // In a real implementation, this would use more sophisticated client identification
    return 'tv-display-client';
  }

  private logSecurityEvent(
    eventType: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    source: string,
    details: Record<string, any>,
    blocked = false
  ): void {
    if (!this.config.enableAuditLogging) return;

    const logEntry: SecurityAuditLog = {
      id: this.generateSecureToken(),
      timestamp: Date.now(),
      eventType,
      severity,
      source,
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ipAddress: 'unknown', // Would be provided by server in real implementation
      blocked
    };

    this.securityLogs.push(logEntry);

    // Keep only last 1000 log entries to prevent memory leaks
    if (this.securityLogs.length > 1000) {
      this.securityLogs = this.securityLogs.slice(-1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 Security Event [${severity.toUpperCase()}]: ${eventType} from ${source}`, details);
    }

    // Cache security events for dashboard
    cacheManager.set(`security-event-${logEntry.id}`, logEntry, 24 * 60 * 60 * 1000, ['security']);
  }

  private setupSecurityHeaders(): void {
    if (!this.config.enableSecureHeaders) return;

    // Add security headers to all outgoing requests
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('X-XSS-Protection', '1; mode=block');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return originalFetch(input, { ...init, headers });
    };
  }

  private setupSecurityMonitoring(): void {
    // Monitor for suspicious activity
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Check for suspicious JavaScript execution attempts
      if (target.getAttribute('onclick') || target.getAttribute('href')?.startsWith('javascript:')) {
        this.logSecurityEvent('xss_attempt', 'high', 'suspicious_click', {
          tagName: target.tagName,
          onclick: target.getAttribute('onclick'),
          href: target.getAttribute('href')
        }, true);
        
        event.preventDefault();
        event.stopPropagation();
      }
    });

    // Monitor console for eval attempts
    const originalEval = window.eval;
    window.eval = function(code: string) {
      securityManager.logSecurityEvent('xss_attempt', 'critical', 'eval_attempt', {
        code: code.substring(0, 100)
      }, true);
      
      throw new Error('eval() is disabled for security reasons');
    };
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    
    for (const [sessionId, tokenData] of this.csrfTokens.entries()) {
      if (now - tokenData.timestamp > this.config.sessionTimeout) {
        this.csrfTokens.delete(sessionId);
      }
    }

    // Clean up rate limit tracking
    const windowStart = now - 60 * 1000;
    for (const [identifier, timestamps] of this.rateLimitTracker.entries()) {
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
      if (validTimestamps.length === 0) {
        this.rateLimitTracker.delete(identifier);
      } else {
        this.rateLimitTracker.set(identifier, validTimestamps);
      }
    }
  }
}

// Create singleton instance
export const securityManager = new SecurityManager();

// Export validation schemas for common data types
export const validationSchemas = {
  displayContent: {
    title: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    description: { type: 'string', required: false, maxLength: 1000 },
    type: { 
      type: 'string', 
      required: true, 
      validate: (value: string) => 
        ['text_announcement', 'image', 'youtube_video'].includes(value) || 'Invalid content type'
    },
    url: { type: 'string', required: false, maxLength: 500 },
    sponsorship_amount: { type: 'number', required: true, min: 0, max: 999999 },
    duration: { type: 'number', required: true, min: 1, max: 3600 },
    start_date: { 
      type: 'string', 
      required: true, 
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
    end_date: { 
      type: 'string', 
      required: true, 
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
    status: {
      type: 'string',
      required: true,
      validate: (value: string) => 
        ['active', 'inactive', 'pending'].includes(value) || 'Invalid status'
    }
  },

  prayerTimes: {
    masjid_id: { type: 'string', required: true, minLength: 1, maxLength: 50 },
    prayer_date: { 
      type: 'string', 
      required: true, 
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
    fajr_time: { 
      type: 'string', 
      required: true, 
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    sunrise_time: { 
      type: 'string', 
      required: true, 
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    dhuhr_time: { 
      type: 'string', 
      required: true, 
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    asr_time: { 
      type: 'string', 
      required: true, 
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    maghrib_time: { 
      type: 'string', 
      required: true, 
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    isha_time: { 
      type: 'string', 
      required: true, 
      pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    source: { type: 'string', required: true, minLength: 1, maxLength: 50 }
  },

  displayConfig: {
    name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    location: { type: 'string', required: false, maxLength: 200 },
    prayer_times_position: {
      type: 'string',
      required: false,
      validate: (value: string) => 
        ['top', 'bottom', 'left', 'right', 'overlay'].includes(value) || 'Invalid position'
    },
    content_rotation_interval: { type: 'number', required: false, min: 5, max: 300 },
    enable_prayer_alerts: { type: 'boolean', required: false },
    timezone: { type: 'string', required: false, maxLength: 50 }
  }
};

export default SecurityManager;