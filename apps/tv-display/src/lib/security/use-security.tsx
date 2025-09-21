/**
 * Security React Hook
 * 
 * React hook that provides security utilities for components including
 * input validation, sanitization, CSRF protection, and security monitoring.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { securityManager, validationSchemas } from './security-manager';

interface UseSecurityOptions {
  enableCSRFProtection?: boolean;
  enableInputValidation?: boolean;
  enableXSSProtection?: boolean;
  sessionId?: string;
  componentName?: string;
}

interface SecurityHookReturn {
  // CSRF Protection
  csrfToken: string | null;
  generateCSRFToken: () => string;
  validateCSRFToken: (token: string) => boolean;
  
  // Input Validation and Sanitization
  sanitizeInput: (input: string, allowHTML?: boolean) => string;
  validateInput: <T>(input: any, schema: Record<string, any>) => {
    isValid: boolean;
    errors: string[];
    sanitized?: T;
  };
  
  // Secure API Requests
  secureRequest: (url: string, options?: RequestInit) => Promise<Response>;
  
  // Security Monitoring
  securityEvents: any[];
  reportSecurityEvent: (type: string, details: any) => void;
  
  // Component Security
  SecureInput: React.FC<SecureInputProps>;
  SecureForm: React.FC<SecureFormProps>;
  SecureImage: React.FC<SecureImageProps>;
}

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationSchema?: Record<string, any>;
  onSecurityViolation?: (violation: string) => void;
  sanitizeOnChange?: boolean;
}

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  validationSchema?: Record<string, any>;
  enableCSRFProtection?: boolean;
  className?: string;
}

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  trustedDomains?: string[];
  onSecurityViolation?: (violation: string) => void;
}

export const useSecurity = (options: UseSecurityOptions = {}): SecurityHookReturn => {
  const {
    enableCSRFProtection = true,
    enableInputValidation = true,
    enableXSSProtection = true,
    sessionId = 'default-session',
    componentName = 'UnknownComponent'
  } = options;

  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);

  // Generate CSRF token on mount
  useEffect(() => {
    if (enableCSRFProtection) {
      const token = securityManager.generateCSRFToken(sessionId);
      setCsrfToken(token);
    }
  }, [enableCSRFProtection, sessionId]);

  // Monitor security events
  useEffect(() => {
    const updateSecurityEvents = () => {
      const events = securityManager.getSecurityLogs(undefined, undefined, 10);
      setSecurityEvents(events);
    };

    updateSecurityEvents();
    const interval = setInterval(updateSecurityEvents, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate CSRF token function
  const generateCSRFToken = useCallback(() => {
    const token = securityManager.generateCSRFToken(sessionId);
    setCsrfToken(token);
    return token;
  }, [sessionId]);

  // Validate CSRF token function
  const validateCSRFToken = useCallback((token: string) => {
    return securityManager.validateCSRFToken(sessionId, token);
  }, [sessionId]);

  // Sanitize input function
  const sanitizeInput = useCallback((input: string, allowHTML = false) => {
    if (!enableXSSProtection) return input;
    return securityManager.sanitizeInput(input, allowHTML);
  }, [enableXSSProtection]);

  // Validate input function
  // Input validation with schema support
  const validateInput = useCallback(function <T>(input: any, schema: Record<string, any>) {
    if (!enableInputValidation) {
      return { isValid: true, errors: [], sanitized: input };
    }
    
    return securityManager.validateInput<T>(input, schema);
  }, [enableInputValidation]);

  // Secure request function
  const secureRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    return securityManager.secureRequest(url, options, sessionId);
  }, [sessionId]);

  // Report security event function
  const reportSecurityEvent = useCallback((type: string, details: any) => {
    console.warn(`Security event in ${componentName}:`, type, details);
  }, [componentName]);

  // Secure Input Component
  const SecureInput = useMemo(() => {
    return React.forwardRef<HTMLInputElement, SecureInputProps>(({
      validationSchema,
      onSecurityViolation,
      sanitizeOnChange = true,
      onChange,
      value,
      ...props
    }, ref) => {
      const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = event.target.value;

        // Sanitize input
        if (sanitizeOnChange && enableXSSProtection) {
          const sanitized = sanitizeInput(inputValue);
          if (sanitized !== inputValue) {
            onSecurityViolation?.('XSS attempt detected and blocked');
            inputValue = sanitized;
            event.target.value = sanitized;
          }
        }

        // Validate input if schema provided
        if (validationSchema && enableInputValidation) {
          const validation = validateInput(inputValue, { value: validationSchema });
          if (!validation.isValid) {
            onSecurityViolation?.(`Validation failed: ${validation.errors.join(', ')}`);
          }
        }

        onChange?.(event);
      }, [validationSchema, onSecurityViolation, onChange]);

      return (
        <input
          ref={ref}
          {...props}
          value={value}
          onChange={handleChange}
          autoComplete={props.autoComplete || 'off'}
          spellCheck={props.spellCheck || false}
        />
      );
    });
  }, [sanitizeInput, validateInput, enableXSSProtection, enableInputValidation]);

  // Secure Form Component
  const SecureForm = useMemo(() => {
    return ({ 
      children, 
      onSubmit, 
      validationSchema, 
      enableCSRFProtection: formEnableCSRF = true,
      className,
      ...props 
    }: SecureFormProps) => {
      const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Validate CSRF token
        if (formEnableCSRF && enableCSRFProtection) {
          const submittedToken = data['csrf_token'] as string;
          if (!submittedToken || !validateCSRFToken(submittedToken)) {
            reportSecurityEvent('csrf_violation', { submittedToken });
            return;
          }
        }

        // Validate form data
        if (validationSchema && enableInputValidation) {
          const validation = validateInput(data, validationSchema);
          if (!validation.isValid) {
            reportSecurityEvent('validation_failed', { errors: validation.errors });
            return;
          }
          onSubmit(validation.sanitized);
        } else {
          // Sanitize all string values
          const sanitizedData: any = {};
          for (const [key, value] of Object.entries(data)) {
            sanitizedData[key] = typeof value === 'string' ? sanitizeInput(value) : value;
          }
          onSubmit(sanitizedData);
        }
      }, [onSubmit, validationSchema, formEnableCSRF]);

      return (
        <form 
          {...props}
          className={className}
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Hidden CSRF token */}
          {formEnableCSRF && enableCSRFProtection && csrfToken && (
            <input type="hidden" name="csrf_token" value={csrfToken} />
          )}
          {children}
        </form>
      );
    };
  }, [csrfToken, validateCSRFToken, sanitizeInput, validateInput, reportSecurityEvent, enableCSRFProtection, enableInputValidation]);

  // Secure Image Component
  const SecureImage = useMemo(() => {
    return ({ 
      trustedDomains = [], 
      onSecurityViolation, 
      src, 
      ...props 
    }: SecureImageProps) => {
      const [safeSrc, setSafeSrc] = useState<string | undefined>(src);
      const [hasError, setHasError] = useState(false);

      useEffect(() => {
        if (!src) {
          setSafeSrc(undefined);
          return;
        }

        try {
          const url = new URL(src, window.location.origin);
          
          // Check for data URLs (potential XSS vector)
          if (url.protocol === 'data:') {
            if (!url.href.startsWith('data:image/')) {
              onSecurityViolation?.('Non-image data URL blocked');
              setSafeSrc(undefined);
              setHasError(true);
              return;
            }
          }

          // Check trusted domains
          if (trustedDomains.length > 0 && url.origin !== window.location.origin) {
            const isAllowed = trustedDomains.some(domain => 
              url.hostname === domain || url.hostname.endsWith(`.${domain}`)
            );
            
            if (!isAllowed) {
              onSecurityViolation?.(`Untrusted domain blocked: ${url.hostname}`);
              setSafeSrc(undefined);
              setHasError(true);
              return;
            }
          }

          setSafeSrc(src);
          setHasError(false);
        } catch (error) {
          onSecurityViolation?.('Invalid image URL');
          setSafeSrc(undefined);
          setHasError(true);
        }
      }, [src, trustedDomains, onSecurityViolation]);

      if (hasError || !safeSrc) {
        return (
          <div className="bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 text-sm">
            Image blocked for security
          </div>
        );
      }

      return (
        <img
          {...props}
          src={safeSrc}
          onError={() => {
            setHasError(true);
            onSecurityViolation?.('Image failed to load');
          }}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    };
  }, []);

  return {
    // CSRF Protection
    csrfToken,
    generateCSRFToken,
    validateCSRFToken,
    
    // Input Validation and Sanitization
    sanitizeInput,
    validateInput,
    
    // Secure API Requests
    secureRequest,
    
    // Security Monitoring
    securityEvents,
    reportSecurityEvent,
    
    // Component Security
    SecureInput,
    SecureForm,
    SecureImage
  };
};

// Security validation schemas for TV display components
export const tvDisplaySchemas = {
  displayContent: validationSchemas.displayContent,
  prayerTimes: validationSchemas.prayerTimes,
  displayConfig: validationSchemas.displayConfig,
  
  // Additional schemas for forms
  userInput: {
    name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    email: { 
      type: 'string', 
      required: false, 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254
    },
    message: { type: 'string', required: false, maxLength: 1000 }
  },
  
  searchInput: {
    query: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    filters: { type: 'array', required: false, maxItems: 10 }
  }
};

// Higher-order component for automatic security
export function withSecurity<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  securityOptions: UseSecurityOptions = {}
) {
  return React.forwardRef<any, P>((props, ref) => {
    const security = useSecurity(securityOptions);
    
    return React.createElement(WrappedComponent, {
      ...props,
      ref,
      security
    } as any);
  });
}

export default useSecurity;