/**
 * =====================================================================
 * | VALLEYTAINMENT PRODUCTIONS - ADVANCED SECURITY FEATURES           |
 * | Version: 2.0.0                                                    |
 * | Last Updated: April 19, 2025                                      |
 * =====================================================================
 * | This file contains comprehensive security implementations to      |
 * | protect the Valleytainment website from common vulnerabilities    |
 * | and attacks while ensuring user data safety.                      |
 * =====================================================================
 */

// Configuration object - Edit these values to customize security features
const SECURITY_CONFIG = {
  // Content Security Policy settings
  csp: {
    enabled: true,
    reportOnly: false, // Set to true for testing without blocking
    reportUri: '/api/csp-report', // Endpoint to report CSP violations
    policies: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://api.pollinations.ai", "https://api-inference.huggingface.co"],
      styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://api.pollinations.ai", "https://api-inference.huggingface.co"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"]
    }
  },
  
  // XSS protection settings
  xss: {
    enabled: true,
    sanitizeInputs: true,
    sanitizeOutputs: true,
    validateUrls: true,
    blockEvalExecution: true,
    preventInlineScripts: false // Set to true for maximum security, but may break some functionality
  },
  
  // CSRF protection settings
  csrf: {
    enabled: true,
    tokenName: 'valleytainment_csrf_token',
    headerName: 'X-CSRF-Token',
    cookieName: 'valleytainment_csrf',
    expiry: 3600, // seconds
    validateReferrer: true,
    validateOrigin: true,
    protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH']
  },
  
  // Form validation settings
  formValidation: {
    enabled: true,
    validateEmail: true,
    validatePhone: true,
    maxInputLength: 1000,
    blockCommonAttackPatterns: true,
    blockSqlInjection: true,
    blockXssPatterns: true
  },
  
  // Suspicious activity monitoring
  activityMonitoring: {
    enabled: true,
    trackRapidRequests: true,
    trackInvalidInputs: true,
    trackBruteForceAttempts: true,
    maxRequestsPerMinute: 60,
    maxFailedAttempts: 5,
    blockThreshold: 10, // Number of suspicious activities before temporary blocking
    blockDuration: 300, // seconds
    notifyOnSuspiciousActivity: true
  },
  
  // HTTP security headers
  securityHeaders: {
    enabled: true,
    strictTransportSecurity: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    xFrameOptions: {
      enabled: true,
      mode: 'SAMEORIGIN' // 'DENY', 'SAMEORIGIN', or 'ALLOW-FROM uri'
    },
    xContentTypeOptions: {
      enabled: true,
      nosniff: true
    },
    referrerPolicy: {
      enabled: true,
      policy: 'strict-origin-when-cross-origin'
    },
    permissionsPolicy: {
      enabled: true,
      policies: {
        geolocation: ["'self'"],
        microphone: ["'none'"],
        camera: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"]
      }
    }
  },
  
  // Data protection settings
  dataProtection: {
    enabled: true,
    maskEmailAddresses: true,
    maskPhoneNumbers: true,
    secureLocalStorage: true,
    secureCookies: true,
    httpOnlyCookies: true,
    sameSiteCookies: 'Lax', // 'Strict', 'Lax', or 'None'
    cookieExpiry: 604800 // 1 week in seconds
  }
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Initialize security features
  const securityManager = new SecurityManager(SECURITY_CONFIG);
  securityManager.init();
});

/**
 * SecurityManager Class
 * Main implementation of security features
 */
class SecurityManager {
  constructor(config) {
    // Configuration
    this.config = config;
    
    // State
    this.csrfToken = null;
    this.suspiciousActivities = [];
    this.isBlocked = false;
    this.blockExpiry = null;
    this.requestCount = 0;
    this.requestCountResetTimer = null;
    this.failedAttempts = 0;
  }
  
  /**
   * Initialize security features
   */
  init() {
    console.log('Initializing Valleytainment security features...');
    
    // Apply Content Security Policy
    if (this.config.csp.enabled) {
      this.applyCsp();
    }
    
    // Apply security headers
    if (this.config.securityHeaders.enabled) {
      this.applySecurityHeaders();
    }
    
    // Initialize XSS protection
    if (this.config.xss.enabled) {
      this.initXssProtection();
    }
    
    // Initialize CSRF protection
    if (this.config.csrf.enabled) {
      this.initCsrfProtection();
    }
    
    // Initialize form validation
    if (this.config.formValidation.enabled) {
      this.initFormValidation();
    }
    
    // Initialize activity monitoring
    if (this.config.activityMonitoring.enabled) {
      this.initActivityMonitoring();
    }
    
    // Initialize data protection
    if (this.config.dataProtection.enabled) {
      this.initDataProtection();
    }
    
    console.log('Security features initialized successfully!');
  }
  
  /**
   * Apply Content Security Policy
   * Sets CSP headers to prevent various attacks
   */
  applyCsp() {
    // In a real implementation, this would be done server-side
    // For client-side, we can use meta tags
    
    if (!this.config.csp.enabled) return;
    
    // Build CSP directive string
    let cspDirectives = '';
    
    for (const [directive, sources] of Object.entries(this.config.csp.policies)) {
      if (sources.length > 0) {
        // Convert camelCase to kebab-case
        const formattedDirective = directive.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        cspDirectives += `${formattedDirective} ${sources.join(' ')}; `;
      }
    }
    
    // Add report-uri if specified
    if (this.config.csp.reportUri) {
      cspDirectives += `report-uri ${this.config.csp.reportUri}; `;
    }
    
    // Create meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = this.config.csp.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    meta.content = cspDirectives.trim();
    
    // Add to head
    document.head.appendChild(meta);
    
    console.log('Content Security Policy applied');
  }
  
  /**
   * Apply security headers
   * Sets various security headers to enhance protection
   */
  applySecurityHeaders() {
    // In a real implementation, this would be done server-side
    // For client-side, we can use meta tags for some headers
    
    if (!this.config.securityHeaders.enabled) return;
    
    // X-Frame-Options
    if (this.config.securityHeaders.xFrameOptions.enabled) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Frame-Options';
      meta.content = this.config.securityHeaders.xFrameOptions.mode;
      document.head.appendChild(meta);
    }
    
    // X-Content-Type-Options
    if (this.config.securityHeaders.xContentTypeOptions.enabled && this.config.securityHeaders.xContentTypeOptions.nosniff) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Content-Type-Options';
      meta.content = 'nosniff';
      document.head.appendChild(meta);
    }
    
    // Referrer-Policy
    if (this.config.securityHeaders.referrerPolicy.enabled) {
      const meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = this.config.securityHeaders.referrerPolicy.policy;
      document.head.appendChild(meta);
    }
    
    // Permissions-Policy
    if (this.config.securityHeaders.permissionsPolicy.enabled) {
      let permissionsPolicy = '';
      
      for (const [feature, allowlist] of Object.entries(this.config.securityHeaders.permissionsPolicy.policies)) {
        permissionsPolicy += `${feature}=(${allowlist.join(' ')}), `;
      }
      
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Permissions-Policy';
      meta.content = permissionsPolicy.slice(0, -2); // Remove trailing comma and space
      document.head.appendChild(meta);
    }
    
    console.log('Security headers applied');
  }
  
  /**
   * Initialize XSS protection
   * Sets up protection against cross-site scripting attacks
   */
  initXssProtection() {
    if (!this.config.xss.enabled) return;
    
    // Sanitize inputs
    if (this.config.xss.sanitizeInputs) {
      // Add event listeners to all input elements
      document.addEventListener('input', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          event.target.value = this.sanitizeInput(event.target.value);
        }
      });
      
      // Add event listeners to all form submissions
      document.addEventListener('submit', (event) => {
        const form = event.target;
        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
          input.value = this.sanitizeInput(input.value);
        });
      });
    }
    
    // Block eval execution
    if (this.config.xss.blockEvalExecution) {
      // Override eval
      const originalEval = window.eval;
      window.eval = function() {
        console.warn('Eval execution blocked by security policy');
        return null;
      };
      
      // Override Function constructor
      const originalFunction = window.Function;
      window.Function = function() {
        console.warn('Dynamic function creation blocked by security policy');
        return function() {};
      };
      
      // Override setTimeout and setInterval with string arguments
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function(callback, timeout) {
        if (typeof callback === 'string') {
          console.warn('String-based setTimeout blocked by security policy');
          return null;
        }
        return originalSetTimeout.apply(this, arguments);
      };
      
      const originalSetInterval = window.setInterval;
      window.setInterval = function(callback, timeout) {
        if (typeof callback === 'string') {
          console.warn('String-based setInterval blocked by security policy');
          return null;
        }
        return originalSetInterval.apply(this, arguments);
      };
    }
    
    console.log('XSS protection initialized');
  }
  
  /**
   * Sanitize input
   * Removes potentially malicious content from input
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return input;
    
    // Replace HTML special characters
    let sanitized = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    // Check for common XSS patterns
    if (this.config.formValidation.blockXssPatterns) {
      const xssPatterns = [
        /javascript:/i,
        /data:text\/html/i,
        /vbscript:/i,
        /onerror=/i,
        /onload=/i,
        /onclick=/i,
        /onmouseover=/i,
        /onfocus=/i,
        /onblur=/i,
        /alert\s*\(/i,
        /document\.cookie/i,
        /document\.location/i,
        /document\.write/i,
        /localStorage/i,
        /sessionStorage/i,
        /eval\s*\(/i,
        /setTimeout\s*\(/i,
        /setInterval\s*\(/i,
        /new\s+Function/i
      ];
      
      for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
          console.warn('Potential XSS attack detected:', input);
          this.logSuspiciousActivity('Potential XSS attack', input);
          return '[removed for security]';
        }
      }
    }
    
    return sanitized;
  }
  
  /**
   * Initialize CSRF protection
   * Sets up protection against cross-site request forgery
   */
  initCsrfProtection() {
    if (!this.config.csrf.enabled) return;
    
    // Generate CSRF token
    this.csrfToken = this.generateCsrfToken();
    
    // Store token in cookie
    this.setCookie(this.config.csrf.cookieName, this.csrfToken, {
      expires: this.config.csrf.expiry,
      path: '/',
      sameSite: 'Strict',
      secure: true
    });
    
    // Add token to forms
    document.addEventListener('submit', (event) => {
      const form = event.target;
      
      // Skip if form has data-no-csrf attribute
      if (form.hasAttribute('data-no-csrf')) return;
      
      // Check if form method requires CSRF protection
      const method = (form.method || 'GET').toUpperCase();
      if (this.config.csrf.protectedMethods.includes(method)) {
        // Check if token input already exists
        let tokenInput = form.querySelector(`input[name="${this.config.csrf.tokenName}"]`);
        
        if (!tokenInput) {
          // Create token input
          tokenInput = document.createElement('input');
          tokenInput.type = 'hidden';
          tokenInput.name = this.config.csrf.tokenName;
          tokenInput.value = this.csrfToken;
          form.appendChild(tokenInput);
        } else {
          // Update existing token
          tokenInput.value = this.csrfToken;
        }
      }
    });
    
    // Add token to AJAX requests
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      const originalMethod = method.toUpperCase();
      
      // Store original method for later use
      this._csrfMethod = originalMethod;
      
      // Call original open method
      originalXhrOpen.apply(this, arguments);
    };
    
    const originalXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
      // Check if method requires CSRF protection
      if (this._csrfMethod && this.config.csrf.protectedMethods.includes(this._csrfMethod)) {
        // Add CSRF token header
        this.setRequestHeader(this.config.csrf.headerName, this.csrfToken);
      }
      
      // Call original send method
      originalXhrSend.apply(this, arguments);
    };
    
    // Add token to fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      // Clone options to avoid modifying the original
      const newOptions = { ...options };
      
      // Initialize headers if not present
      newOptions.headers = newOptions.headers || {};
      
      // Check if method requires CSRF protection
      const method = (newOptions.method || 'GET').toUpperCase();
      if (this.config.csrf.protectedMethods.includes(method)) {
        // Add CSRF token header
        newOptions.headers[this.config.csrf.headerName] = this.csrfToken;
      }
      
      // Call original fetch
      return originalFetch(url, newOptions);
    };
    
    console.log('CSRF protection initialized');
  }
  
  /**
   * Generate CSRF token
   * Creates a random token for CSRF protection
   * @returns {string} - Random token
   */
  generateCsrfToken() {
    // Generate random bytes
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    
    // Convert to hex string
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Initialize form validation
   * Sets up validation for form inputs
   */
  initFormValidation() {
    if (!this.config.formValidation.enabled) return;
    
    // Add validation to all forms
    document.addEventListener('submit', (event) => {
      const form = event.target;
      
      // Skip if form has data-no-validate attribute
      if (form.hasAttribute('data-no-validate')) return;
      
      // Validate all inputs
      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;
      
      inputs.forEach(input => {
        // Skip if input has data-no-validate attribute
        if (input.hasAttribute('data-no-validate')) return;
        
        // Get input type
        const type = input.type || 'text';
        
        // Validate based on type
        switch (type) {
          case 'email':
            if (this.config.formValidation.validateEmail && !this.validateEmail(input.value)) {
              this.showValidationError(input, 'Please enter a valid email address');
              isValid = false;
            }
            break;
            
          case 'tel':
            if (this.config.formValidation.validatePhone && !this.validatePhone(input.value)) {
              this.showValidationError(input, 'Please enter a valid phone number');
              isValid = false;
            }
            break;
            
          case 'url':
            if (this.config.xss.validateUrls && !this.validateUrl(input.value)) {
              this.showValidationError(input, 'Please enter a valid URL');
              isValid = false;
            }
            break;
            
          default:
            // Check input length
            if (input.value.length > this.config.formValidation.maxInputLength) {
              this.showValidationError(input, `Input is too long (maximum ${this.config.formValidation.maxInputLength} characters)`);
              isValid = false;
            }
            
            // Check for SQL injection
            if (this.config.formValidation.blockSqlInjection && this.detectSqlInjection(input.value)) {
              this.showValidationError(input, 'Invalid input detected');
              this.logSuspiciousActivity('Potential SQL injection', input.value);
              isValid = false;
            }
            
            // Check for common attack patterns
            if (this.config.formValidation.blockCommonAttackPatterns && this.detectCommonAttackPatterns(input.value)) {
              this.showValidationError(input, 'Invalid input detected');
              this.logSuspiciousActivity('Potential attack pattern', input.value);
              isValid = false;
            }
            break;
        }
      });
      
      // Prevent form submission if validation fails
      if (!isValid) {
        event.preventDefault();
      }
    });
    
    console.log('Form validation initialized');
  }
  
  /**
   * Show validation error
   * Displays error message for invalid input
   * @param {HTMLElement} input - Input element
   * @param {string} message - Error message
   */
  showValidationError(input, message) {
    // Remove existing error message
    const existingError = input.parentNode.querySelector('.validation-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Add error class to input
    input.classList.add('invalid');
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'validation-error';
    errorElement.textContent = message;
    
    // Add error message after input
    input.parentNode.insertBefore(errorElement, input.nextSibling);
    
    // Remove error when input changes
    input.addEventListener('input', function onInput() {
      input.classList.remove('invalid');
      const error = input.parentNode.querySelector('.validation-error');
      if (error) {
        error.remove();
      }
      input.removeEventListener('input', onInput);
    });
  }
  
  /**
   * Validate email
   * Checks if email address is valid
   * @param {string} email - Email address to validate
   * @returns {boolean} - Whether email is valid
   */
  validateEmail(email) {
    if (!email) return false;
    
    // Basic email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate phone
   * Checks if phone number is valid
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Whether phone number is valid
   */
  validatePhone(phone) {
    if (!phone) return false;
    
    // Remove non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check length (7-15 digits)
    return digits.length >= 7 && digits.length <= 15;
  }
  
  /**
   * Validate URL
   * Checks if URL is valid and safe
   * @param {string} url - URL to validate
   * @returns {boolean} - Whether URL is valid and safe
   */
  validateUrl(url) {
    if (!url) return false;
    
    try {
      // Parse URL
      const parsedUrl = new URL(url);
      
      // Check protocol (only allow http and https)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Detect SQL injection
   * Checks if input contains SQL injection patterns
   * @param {string} input - Input to check
   * @returns {boolean} - Whether input contains SQL injection patterns
   */
  detectSqlInjection(input) {
    if (!input || typeof input !== 'string') return false;
    
    // SQL injection patterns
    const sqlPatterns = [
      /'\s*OR\s*'1'\s*=\s*'1/i,
      /'\s*OR\s*1\s*=\s*1/i,
      /'\s*OR\s*'\w+'\s*=\s*'\w+/i,
      /'\s*OR\s*\d+\s*=\s*\d+/i,
      /'\s*;\s*DROP\s+TABLE/i,
      /'\s*;\s*DELETE\s+FROM/i,
      /'\s*;\s*INSERT\s+INTO/i,
      /'\s*;\s*UPDATE\s+/i,
      /'\s*;\s*SELECT\s+/i,
      /UNION\s+SELECT/i,
      /UNION\s+ALL\s+SELECT/i,
      /SELECT\s+.*\s+FROM/i,
      /ALTER\s+TABLE/i,
      /EXEC\s*\(/i,
      /EXECUTE\s*\(/i,
      /WAITFOR\s+DELAY/i,
      /CAST\s*\(/i,
      /CONVERT\s*\(/i
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Detect common attack patterns
   * Checks if input contains common attack patterns
   * @param {string} input - Input to check
   * @returns {boolean} - Whether input contains common attack patterns
   */
  detectCommonAttackPatterns(input) {
    if (!input || typeof input !== 'string') return false;
    
    // Common attack patterns
    const attackPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /onmouseover=/i,
      /onfocus=/i,
      /onblur=/i,
      /alert\s*\(/i,
      /prompt\s*\(/i,
      /confirm\s*\(/i,
      /eval\s*\(/i,
      /document\.cookie/i,
      /document\.location/i,
      /document\.write/i,
      /localStorage/i,
      /sessionStorage/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /new\s+Function/i,
      /\.\.\//i, // Path traversal
      /\/etc\/passwd/i,
      /\/bin\/bash/i,
      /cmd\.exe/i,
      /powershell\.exe/i,
      /system\s*\(/i,
      /exec\s*\(/i,
      /shell_exec\s*\(/i,
      /passthru\s*\(/i,
      /proc_open\s*\(/i,
      /popen\s*\(/i,
      /curl\s+/i,
      /wget\s+/i,
      /nc\s+/i,
      /netcat\s+/i,
      /ping\s+/i,
      /traceroute\s+/i,
      /nslookup\s+/i
    ];
    
    for (const pattern of attackPatterns) {
      if (pattern.test(input)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Initialize activity monitoring
   * Sets up monitoring for suspicious activities
   */
  initActivityMonitoring() {
    if (!this.config.activityMonitoring.enabled) return;
    
    // Track rapid requests
    if (this.config.activityMonitoring.trackRapidRequests) {
      // Reset request count every minute
      this.requestCountResetTimer = setInterval(() => {
        this.requestCount = 0;
      }, 60000);
      
      // Track clicks
      document.addEventListener('click', () => {
        this.requestCount++;
        this.checkRequestRate();
      });
      
      // Track form submissions
      document.addEventListener('submit', () => {
        this.requestCount++;
        this.checkRequestRate();
      });
      
      // Track AJAX requests
      const originalXhrSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function() {
        this.requestCount++;
        this.checkRequestRate();
        originalXhrSend.apply(this, arguments);
      };
      
      // Track fetch requests
      const originalFetch = window.fetch;
      window.fetch = function() {
        this.requestCount++;
        this.checkRequestRate();
        return originalFetch.apply(this, arguments);
      };
    }
    
    // Track invalid inputs
    if (this.config.activityMonitoring.trackInvalidInputs) {
      document.addEventListener('input', (event) => {
        const input = event.target;
        
        // Skip if not input or textarea
        if (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA') return;
        
        // Check for SQL injection
        if (this.config.formValidation.blockSqlInjection && this.detectSqlInjection(input.value)) {
          this.logSuspiciousActivity('Potential SQL injection in input', input.value);
          this.failedAttempts++;
          this.checkFailedAttempts();
        }
        
        // Check for common attack patterns
        if (this.config.formValidation.blockCommonAttackPatterns && this.detectCommonAttackPatterns(input.value)) {
          this.logSuspiciousActivity('Potential attack pattern in input', input.value);
          this.failedAttempts++;
          this.checkFailedAttempts();
        }
      });
    }
    
    console.log('Activity monitoring initialized');
  }
  
  /**
   * Check request rate
   * Monitors for rapid requests that might indicate an attack
   */
  checkRequestRate() {
    if (this.requestCount > this.config.activityMonitoring.maxRequestsPerMinute) {
      this.logSuspiciousActivity('Excessive request rate', `${this.requestCount} requests in one minute`);
      
      // Block if threshold exceeded
      if (this.suspiciousActivities.length >= this.config.activityMonitoring.blockThreshold) {
        this.blockUser();
      }
    }
  }
  
  /**
   * Check failed attempts
   * Monitors for multiple failed attempts that might indicate an attack
   */
  checkFailedAttempts() {
    if (this.failedAttempts >= this.config.activityMonitoring.maxFailedAttempts) {
      this.logSuspiciousActivity('Excessive failed attempts', `${this.failedAttempts} failed attempts`);
      
      // Block if threshold exceeded
      if (this.suspiciousActivities.length >= this.config.activityMonitoring.blockThreshold) {
        this.blockUser();
      }
      
      // Reset failed attempts
      this.failedAttempts = 0;
    }
  }
  
  /**
   * Log suspicious activity
   * Records potentially malicious activity
   * @param {string} type - Type of activity
   * @param {string} details - Activity details
   */
  logSuspiciousActivity(type, details) {
    // Create activity record
    const activity = {
      type,
      details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Add to suspicious activities
    this.suspiciousActivities.push(activity);
    
    // Log to console
    console.warn('Suspicious activity detected:', activity);
    
    // Notify if enabled
    if (this.config.activityMonitoring.notifyOnSuspiciousActivity) {
      // In a real implementation, this would send a notification to the server
      // For this client-side implementation, we just log to console
      console.warn('Security notification: Suspicious activity detected');
    }
  }
  
  /**
   * Block user
   * Temporarily blocks user after suspicious activities
   */
  blockUser() {
    // Set block flag
    this.isBlocked = true;
    
    // Set block expiry
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + this.config.activityMonitoring.blockDuration);
    this.blockExpiry = expiryTime;
    
    // Store block in localStorage
    localStorage.setItem('valleytainment_security_block', JSON.stringify({
      blocked: true,
      expiry: this.blockExpiry.toISOString()
    }));
    
    // Show block message
    this.showBlockMessage();
    
    // Set timeout to unblock
    setTimeout(() => {
      this.unblockUser();
    }, this.config.activityMonitoring.blockDuration * 1000);
    
    console.warn('User blocked due to suspicious activity');
  }
  
  /**
   * Unblock user
   * Removes temporary block
   */
  unblockUser() {
    // Reset block flag
    this.isBlocked = false;
    this.blockExpiry = null;
    
    // Remove block from localStorage
    localStorage.removeItem('valleytainment_security_block');
    
    // Remove block message
    const blockMessage = document.getElementById('security-block-message');
    if (blockMessage) {
      blockMessage.remove();
    }
    
    console.log('User unblocked');
  }
  
  /**
   * Show block message
   * Displays message when user is blocked
   */
  showBlockMessage() {
    // Create block message element
    const blockMessage = document.createElement('div');
    blockMessage.id = 'security-block-message';
    blockMessage.className = 'security-block-message';
    
    // Calculate remaining time
    const remainingSeconds = Math.ceil((this.blockExpiry - new Date()) / 1000);
    
    // Set message content
    blockMessage.innerHTML = `
      <div class="block-message-content">
        <h3>Access Temporarily Restricted</h3>
        <p>For security reasons, your access has been temporarily restricted due to suspicious activity.</p>
        <p>Please try again in <span id="block-countdown">${remainingSeconds}</span> seconds.</p>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(blockMessage);
    
    // Start countdown
    const countdownElement = document.getElementById('block-countdown');
    if (countdownElement) {
      const countdownInterval = setInterval(() => {
        const remaining = Math.ceil((this.blockExpiry - new Date()) / 1000);
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          this.unblockUser();
        } else {
          countdownElement.textContent = remaining;
        }
      }, 1000);
    }
  }
  
  /**
   * Initialize data protection
   * Sets up protection for user data
   */
  initDataProtection() {
    if (!this.config.dataProtection.enabled) return;
    
    // Secure localStorage
    if (this.config.dataProtection.secureLocalStorage) {
      // Override localStorage methods
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        // Encrypt sensitive data
        if (key.includes('token') || key.includes('auth') || key.includes('password') || key.includes('credit') || key.includes('card')) {
          // In a real implementation, this would use proper encryption
          // For this example, we use a simple encoding
          const encodedValue = btoa(value);
          originalSetItem.call(this, key, encodedValue);
        } else {
          originalSetItem.call(this, key, value);
        }
      };
      
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function(key) {
        const value = originalGetItem.call(this, key);
        
        // Decrypt sensitive data
        if (value && (key.includes('token') || key.includes('auth') || key.includes('password') || key.includes('credit') || key.includes('card'))) {
          try {
            // In a real implementation, this would use proper decryption
            // For this example, we use a simple decoding
            return atob(value);
          } catch (error) {
            // If decoding fails, return original value
            return value;
          }
        }
        
        return value;
      };
    }
    
    // Mask sensitive data in DOM
    if (this.config.dataProtection.maskEmailAddresses || this.config.dataProtection.maskPhoneNumbers) {
      // Create mutation observer to watch for changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.maskSensitiveData(node);
              }
            });
          } else if (mutation.type === 'characterData') {
            const parentNode = mutation.target.parentNode;
            if (parentNode) {
              this.maskSensitiveData(parentNode);
            }
          }
        });
      });
      
      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      // Initial scan
      this.maskSensitiveData(document.body);
    }
    
    console.log('Data protection initialized');
  }
  
  /**
   * Mask sensitive data
   * Hides sensitive information in the DOM
   * @param {HTMLElement} element - Element to scan for sensitive data
   */
  maskSensitiveData(element) {
    // Skip if element has data-no-mask attribute
    if (element.hasAttribute && element.hasAttribute('data-no-mask')) return;
    
    // Get all text nodes
    const textNodes = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
      textNodes.push(node);
    }
    
    // Process each text node
    textNodes.forEach((textNode) => {
      let text = textNode.nodeValue;
      let modified = false;
      
      // Mask email addresses
      if (this.config.dataProtection.maskEmailAddresses) {
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        text = text.replace(emailRegex, (match) => {
          modified = true;
          const parts = match.split('@');
          const username = parts[0];
          const domain = parts[1];
          
          // Mask username except first and last character
          let maskedUsername = username;
          if (username.length > 2) {
            maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
          }
          
          return `${maskedUsername}@${domain}`;
        });
      }
      
      // Mask phone numbers
      if (this.config.dataProtection.maskPhoneNumbers) {
        const phoneRegex = /(\+?[0-9]{1,3}[-\s]?)?(\([0-9]{3}\)|[0-9]{3})[-\s]?[0-9]{3}[-\s]?[0-9]{4}/g;
        text = text.replace(phoneRegex, (match) => {
          modified = true;
          
          // Keep last 4 digits, mask the rest
          const digits = match.replace(/\D/g, '');
          const lastFour = digits.slice(-4);
          const maskedPart = '*'.repeat(digits.length - 4);
          
          return `${maskedPart}${lastFour}`;
        });
      }
      
      // Update node value if modified
      if (modified) {
        textNode.nodeValue = text;
      }
    });
  }
  
  /**
   * Set cookie
   * Sets a cookie with the specified options
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {Object} options - Cookie options
   */
  setCookie(name, value, options = {}) {
    // Set default options
    options = {
      path: '/',
      ...options
    };
    
    // Set secure and httpOnly if enabled
    if (this.config.dataProtection.secureCookies) {
      options.secure = true;
    }
    
    if (this.config.dataProtection.httpOnlyCookies) {
      options.httpOnly = true;
    }
    
    // Set SameSite if specified
    if (this.config.dataProtection.sameSiteCookies) {
      options.sameSite = this.config.dataProtection.sameSiteCookies;
    }
    
    // Set expiry if specified
    if (options.expires && typeof options.expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 1000);
      options.expires = date;
    }
    
    // Build cookie string
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    // Add options
    for (const [key, value] of Object.entries(options)) {
      if (value === true) {
        cookieString += `; ${key}`;
      } else if (value !== false) {
        cookieString += `; ${key}=${value}`;
      }
    }
    
    // Set cookie
    document.cookie = cookieString;
  }
  
  /**
   * Get cookie
   * Gets a cookie by name
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value or null if not found
   */
  getCookie(name) {
    const matches = document.cookie.match(new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'
    ));
    
    return matches ? decodeURIComponent(matches[1]) : null;
  }
  
  /**
   * Delete cookie
   * Deletes a cookie by name
   * @param {string} name - Cookie name
   */
  deleteCookie(name) {
    this.setCookie(name, '', {
      expires: -1
    });
  }
}

// Export SecurityManager class for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityManager;
}
