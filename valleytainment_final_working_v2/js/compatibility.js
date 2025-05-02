/**
 * =====================================================================
 * | VALLEYTAINMENT PRODUCTIONS - CROSS-BROWSER COMPATIBILITY          |
 * | Version: 2.0.0                                                    |
 * | Last Updated: April 19, 2025                                      |
 * =====================================================================
 * | This file contains polyfills and compatibility fixes to ensure    |
 * | the website works consistently across all modern browsers.        |
 * =====================================================================
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Apply polyfills and compatibility fixes
  applyIntersectionObserverPolyfill();
  applyCustomCursorFix();
  applyWebpFallback();
  applyFlexGapFix();
  applyBackdropFilterFix();
  applyTouchSupport();
  applyReducedMotionSupport();
  
  /**
   * 1. INTERSECTION OBSERVER POLYFILL
   * For browsers that don't support IntersectionObserver (IE11)
   */
  function applyIntersectionObserverPolyfill() {
    if (!('IntersectionObserver' in window)) {
      console.log('Applying IntersectionObserver polyfill');
      
      // Load polyfill script
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
      document.head.appendChild(script);
      
      // Fallback for reveal animations
      const revealElements = document.querySelectorAll('.reveal-enhanced');
      
      function checkVisibility() {
        revealElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;
          
          if (rect.top <= windowHeight * 0.9) {
            element.classList.add('revealed');
          }
        });
      }
      
      // Check on scroll
      window.addEventListener('scroll', checkVisibility);
      
      // Initial check
      checkVisibility();
    }
  }
  
  /**
   * 2. CUSTOM CURSOR FIX
   * Disable custom cursor on touch devices and older browsers
   */
  function applyCustomCursorFix() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isOldBrowser = !CSS.supports('mix-blend-mode', 'difference');
    
    if (isTouchDevice || isOldBrowser) {
      // Disable custom cursor
      const customCursor = document.querySelector('.custom-cursor');
      const cursorDot = document.querySelector('.cursor-dot');
      const cursorTrail = document.querySelector('.cursor-trail');
      
      if (customCursor) customCursor.style.display = 'none';
      if (cursorDot) cursorDot.style.display = 'none';
      if (cursorTrail) cursorTrail.style.display = 'none';
      
      // Disable cursor trail canvas
      const cursorTrailCanvas = document.getElementById('cursor-trail');
      if (cursorTrailCanvas) cursorTrailCanvas.style.display = 'none';
    }
  }
  
  /**
   * 3. WEBP FALLBACK
   * Check for WebP support and provide fallbacks
   */
  function applyWebpFallback() {
    // Check WebP support
    const webpSupport = checkWebpSupport();
    
    if (!webpSupport) {
      // Replace WebP images with fallbacks
      const webpImages = document.querySelectorAll('img[src$=".webp"]');
      
      webpImages.forEach(img => {
        const src = img.getAttribute('src');
        const fallbackSrc = src.replace('.webp', '.jpg');
        img.setAttribute('src', fallbackSrc);
      });
      
      // Replace WebP background images in CSS
      const styleSheets = document.styleSheets;
      
      for (let i = 0; i < styleSheets.length; i++) {
        try {
          const rules = styleSheets[i].cssRules || styleSheets[i].rules;
          
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            
            if (rule.style && rule.style.backgroundImage) {
              const bgImage = rule.style.backgroundImage;
              
              if (bgImage.includes('.webp')) {
                rule.style.backgroundImage = bgImage.replace('.webp', '.jpg');
              }
            }
          }
        } catch (e) {
          // Skip cross-origin stylesheets
          console.log('Could not access stylesheet:', e);
        }
      }
    }
  }
  
  /**
   * 4. FLEX GAP FIX
   * Polyfill for flex gap property in Safari < 14.1
   */
  function applyFlexGapFix() {
    // Check if flex gap is supported
    const flexGapSupported = CSS.supports('gap', '1px');
    
    if (!flexGapSupported) {
      console.log('Applying flex gap fix');
      
      // Add class to body for CSS targeting
      document.body.classList.add('no-flex-gap');
      
      // Apply margin to flex children
      const flexContainers = document.querySelectorAll('.flex');
      
      flexContainers.forEach(container => {
        // Get gap size from computed style
        const computedStyle = window.getComputedStyle(container);
        let gapSize = '1rem'; // Default
        
        if (container.classList.contains('gap-sm')) {
          gapSize = '0.5rem';
        } else if (container.classList.contains('gap-md')) {
          gapSize = '1rem';
        } else if (container.classList.contains('gap-lg')) {
          gapSize = '1.5rem';
        }
        
        // Apply margin to children
        const children = container.children;
        
        for (let i = 0; i < children.length; i++) {
          if (container.classList.contains('flex-col')) {
            // Vertical gap
            if (i < children.length - 1) {
              children[i].style.marginBottom = gapSize;
            }
          } else {
            // Horizontal gap
            if (i < children.length - 1) {
              children[i].style.marginRight = gapSize;
            }
          }
        }
      });
    }
  }
  
  /**
   * 5. BACKDROP FILTER FIX
   * Fallback for backdrop-filter in unsupported browsers
   */
  function applyBackdropFilterFix() {
    // Check if backdrop-filter is supported
    const backdropFilterSupported = CSS.supports('backdrop-filter', 'blur(10px)');
    
    if (!backdropFilterSupported) {
      console.log('Applying backdrop filter fix');
      
      // Add class to body for CSS targeting
      document.body.classList.add('no-backdrop-filter');
      
      // Apply fallback to elements with backdrop-filter
      const glassElements = document.querySelectorAll('.glass-enhanced, header');
      
      glassElements.forEach(element => {
        // Increase background opacity for better readability
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;
        
        if (backgroundColor.includes('rgba')) {
          // Extract alpha value and increase it
          const rgba = backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
          
          if (rgba) {
            const r = rgba[1];
            const g = rgba[2];
            const b = rgba[3];
            let a = parseFloat(rgba[4]);
            
            // Increase opacity
            a = Math.min(a + 0.3, 1);
            
            element.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
          }
        }
      });
    }
  }
  
  /**
   * 6. TOUCH SUPPORT
   * Enhance touch support for mobile devices
   */
  function applyTouchSupport() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      console.log('Applying touch support enhancements');
      
      // Add class to body for CSS targeting
      document.body.classList.add('touch-device');
      
      // Replace hover effects with active states
      const hoverElements = document.querySelectorAll('.hover-scale, .hover-rotate, .hover-glow, .hover-neon-text, .hover-underline');
      
      hoverElements.forEach(element => {
        element.addEventListener('touchstart', () => {
          element.classList.add('touch-active');
        });
        
        element.addEventListener('touchend', () => {
          // Delay removal to allow for tap effect
          setTimeout(() => {
            element.classList.remove('touch-active');
          }, 300);
        });
      });
      
      // Enhance card tilt for touch
      const tiltCards = document.querySelectorAll('.card-tilt');
      
      tiltCards.forEach(card => {
        card.addEventListener('touchmove', (e) => {
          // Prevent scrolling
          e.preventDefault();
          
          // Get touch position
          const touch = e.touches[0];
          const rect = card.getBoundingClientRect();
          
          // Calculate touch position relative to card
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          
          // Calculate rotation
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 10;
          const rotateY = (centerX - x) / 10;
          
          // Apply transform
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        card.addEventListener('touchend', () => {
          // Reset transform
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
      });
      
      // Fix dropdown menus for touch
      const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
      
      dropdownToggles.forEach(toggle => {
        toggle.addEventListener('touchend', (e) => {
          // Prevent default link behavior
          e.preventDefault();
          
          // Close all other dropdowns
          dropdownToggles.forEach(otherToggle => {
            if (otherToggle !== toggle) {
              otherToggle.classList.remove('active');
              otherToggle.nextElementSibling.classList.remove('active');
            }
          });
          
          // Toggle current dropdown
          toggle.classList.toggle('active');
          toggle.nextElementSibling.classList.toggle('active');
        });
      });
      
      // Close dropdowns when touching outside
      document.addEventListener('touchend', (e) => {
        if (!e.target.closest('.has-dropdown')) {
          dropdownToggles.forEach(toggle => {
            toggle.classList.remove('active');
            toggle.nextElementSibling.classList.remove('active');
          });
        }
      });
    }
  }
  
  /**
   * 7. REDUCED MOTION SUPPORT
   * Respect user's reduced motion preference
   */
  function applyReducedMotionSupport() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      console.log('Applying reduced motion support');
      
      // Add class to body for CSS targeting
      document.body.classList.add('reduced-motion');
      
      // Disable animations
      const animatedElements = document.querySelectorAll('.neon-text-enhanced, .neon-border, .glitch-enhanced, .float, .rotate, .pulse, .shake');
      
      animatedElements.forEach(element => {
        element.style.animation = 'none';
      });
      
      // Disable transitions
      const transitionElements = document.querySelectorAll('[style*="transition"]');
      
      transitionElements.forEach(element => {
        element.style.transition = 'none';
      });
      
      // Disable scroll effects
      const scrollEffects = document.querySelectorAll('.parallax-layer, .scroll-scale, .scroll-rotate');
      
      scrollEffects.forEach(element => {
        element.style.transform = 'none';
      });
      
      // Disable particle effects
      const bgCanvas = document.getElementById('bg-canvas');
      if (bgCanvas) bgCanvas.style.opacity = '0.2';
      
      // Disable cursor trail
      const cursorTrail = document.getElementById('cursor-trail');
      if (cursorTrail) cursorTrail.style.display = 'none';
    }
  }
  
  /**
   * UTILITY FUNCTIONS
   */
  
  // Check WebP support
  function checkWebpSupport() {
    const canvas = document.createElement('canvas');
    
    if (canvas.getContext && canvas.getContext('2d')) {
      // Check if browser can encode WebP
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    return false;
  }
});

/**
 * BROWSER DETECTION
 * Detect browser and version for specific fixes
 */
function detectBrowser() {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Detect Chrome
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = 'Chrome';
    const match = userAgent.match(/(?:chrome|chromium|crios)\/(\d+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect Firefox
  else if (userAgent.match(/firefox|fxios/i)) {
    browserName = 'Firefox';
    const match = userAgent.match(/(?:firefox|fxios)\/(\d+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect Safari
  else if (userAgent.match(/safari/i) && !userAgent.match(/chrome|chromium|crios/i)) {
    browserName = 'Safari';
    const match = userAgent.match(/version\/(\d+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect Edge
  else if (userAgent.match(/edg/i)) {
    browserName = 'Edge';
    const match = userAgent.match(/edg\/(\d+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect IE
  else if (userAgent.match(/trident/i)) {
    browserName = 'Internet Explorer';
    const match = userAgent.match(/(?:msie |rv:)(\d+)/i);
    if (match) browserVersion = match[1];
  }
  // Detect Opera
  else if (userAgent.match(/opera|opr/i)) {
    browserName = 'Opera';
    const match = userAgent.match(/(?:opera|opr)\/(\d+)/i);
    if (match) browserVersion = match[1];
  }
  
  return {
    name: browserName,
    version: parseInt(browserVersion) || 0
  };
}

// Apply browser-specific classes
const browser = detectBrowser();
document.documentElement.classList.add(`browser-${browser.name.toLowerCase()}`);
document.documentElement.classList.add(`browser-version-${browser.version}`);

// Log browser info
console.log(`Browser: ${browser.name} ${browser.version}`);

/**
 * FEATURE DETECTION
 * Check for modern features and apply fallbacks
 */
const features = {
  webp: checkWebpSupport(),
  webgl: checkWebGLSupport(),
  webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
  speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
  intersectionObserver: 'IntersectionObserver' in window,
  mutationObserver: 'MutationObserver' in window,
  resizeObserver: 'ResizeObserver' in window,
  serviceWorker: 'serviceWorker' in navigator,
  touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  pointerEvents: 'PointerEvent' in window,
  webShare: 'share' in navigator,
  webStorage: 'localStorage' in window && 'sessionStorage' in window,
  webWorkers: 'Worker' in window,
  webSockets: 'WebSocket' in window,
  webRTC: 'RTCPeerConnection' in window,
  webAnimations: 'animate' in document.createElement('div'),
  webComponents: 'customElements' in window,
  webNotifications: 'Notification' in window,
  webVR: 'getVRDisplays' in navigator,
  webXR: 'xr' in navigator,
  webBluetooth: 'bluetooth' in navigator,
  webUSB: 'usb' in navigator,
  webMIDI: 'requestMIDIAccess' in navigator,
  webSerial: 'serial' in navigator,
  webHID: 'hid' in navigator,
  webNFC: 'NDEFReader' in window,
  webPayments: 'PaymentRequest' in window,
  webCredentials: 'credentials' in navigator,
  webAuthn: 'PublicKeyCredential' in window,
  webCrypto: 'crypto' in window && 'subtle' in window.crypto,
  webCodecs: 'VideoEncoder' in window,
  webTransport: 'WebTransport' in window,
  webGPU: 'GPU' in window,
  webML: 'ml' in navigator,
  webAssembly: 'WebAssembly' in window,
  webBadging: 'setAppBadge' in navigator,
  webPeriodicSync: 'periodicSync' in navigator.serviceWorker,
  webBackgroundSync: 'sync' in navigator.serviceWorker,
  webBackgroundFetch: 'backgroundFetch' in navigator.serviceWorker,
  webPushNotifications: 'PushManager' in window,
  webFileSystem: 'showOpenFilePicker' in window,
  webClipboard: 'clipboard' in navigator,
  webShare: 'share' in navigator,
  webShareTarget: 'onshare' in navigator,
  webContactPicker: 'ContactsManager' in window,
  webWakeLock: 'wakeLock' in navigator,
  webScreenOrientation: 'screen' in window && 'orientation' in screen,
  webScreenWakeLock: 'screen' in window && 'keepAwake' in screen,
  webVibration: 'vibrate' in navigator,
  webBattery: 'getBattery' in navigator,
  webConnection: 'connection' in navigator,
  webGeolocation: 'geolocation' in navigator,
  webDeviceOrientation: 'DeviceOrientationEvent' in window,
  webDeviceMotion: 'DeviceMotionEvent' in window,
  webAmbientLightSensor: 'AmbientLightSensor' in window,
  webProximitySensor: 'ProximitySensor' in window,
  webAccelerometer: 'Accelerometer' in window,
  webGyroscope: 'Gyroscope' in window,
  webMagnetometer: 'Magnetometer' in window,
  webAbsoluteOrientation: 'AbsoluteOrientationSensor' in window,
  webRelativeOrientation: 'RelativeOrientationSensor' in window,
  webLinearAcceleration: 'LinearAccelerationSensor' in window,
  webGravitySensor: 'GravitySensor' in window,
  webPermissions: 'permissions' in navigator,
  webLocks: 'locks' in navigator,
  webIdleDetection: 'IdleDetector' in window,
  webMediaSession: 'mediaSession' in navigator,
  webMediaCapabilities: 'mediaCapabilities' in navigator,
  webMediaDevices: 'mediaDevices' in navigator,
  webMediaRecorder: 'MediaRecorder' in window,
  webMediaSource: 'MediaSource' in window,
  webMediaStream: 'MediaStream' in window,
  webMediaStreamTrack: 'MediaStreamTrack' in window,
  webMediaStreamTrackProcessor: 'MediaStreamTrackProcessor' in window,
  webMediaStreamTrackGenerator: 'MediaStreamTrackGenerator' in window,
  webImageCapture: 'ImageCapture' in window,
  webPictureInPicture: 'pictureInPictureEnabled' in document,
  webFullscreen: 'fullscreenEnabled' in document,
  webPointerLock: 'pointerLockElement' in document,
  webGamepad: 'Gamepad' in window,
  webGamepadHaptic: 'GamepadHapticActuator' in window,
  webSpeechSynthesis: 'speechSynthesis' in window,
  webSpeechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
  webTextToSpeech: 'speechSynthesis' in window,
  webTextDetection: 'FaceDetector' in window,
  webBarcodeDetection: 'BarcodeDetector' in window,
  webShapeDetection: 'FaceDetector' in window || 'BarcodeDetector' in window || 'TextDetector' in window,
  webPaymentRequest: 'PaymentRequest' in window,
  webCredentialManagement: 'credentials' in navigator,
  webPublicKeyCredential: 'PublicKeyCredential' in window,
  webCrypto: 'crypto' in window && 'subtle' in window.crypto,
  webCryptoSubtle: 'crypto' in window && 'subtle' in window.crypto,
  webCryptoKey: 'CryptoKey' in window,
  webCryptoKeyPair: 'CryptoKeyPair' in window,
  webIndexedDB: 'indexedDB' in window,
  webCacheStorage: 'caches' in window,
  webServiceWorker: 'serviceWorker' in navigator,
  webPushManager: 'PushManager' in window,
  webNotifications: 'Notification' in window,
  webBadging: 'setAppBadge' in navigator,
  webPeriodicSync: 'periodicSync' in navigator.serviceWorker,
  webBackgroundSync: 'sync' in navigator.serviceWorker,
  webBackgroundFetch: 'backgroundFetch' in navigator.serviceWorker,
  webPushNotifications: 'PushManager' in window,
  webFileSystem: 'showOpenFilePicker' in window,
  webClipboard: 'clipboard' in navigator,
  webShare: 'share' in navigator,
  webShareTarget: 'onshare' in navigator,
  webContactPicker: 'ContactsManager' in window,
  webWakeLock: 'wakeLock' in navigator,
  webScreenOrientation: 'screen' in window && 'orientation' in screen,
  webScreenWakeLock: 'screen' in window && 'keepAwake' in screen,
  webVibration: 'vibrate' in navigator,
  webBattery: 'getBattery' in navigator,
  webConnection: 'connection' in navigator,
  webGeolocation: 'geolocation' in navigator,
  webDeviceOrientation: 'DeviceOrientationEvent' in window,
  webDeviceMotion: 'DeviceMotionEvent' in window,
  webAmbientLightSensor: 'AmbientLightSensor' in window,
  webProximitySensor: 'ProximitySensor' in window,
  webAccelerometer: 'Accelerometer' in window,
  webGyroscope: 'Gyroscope' in window,
  webMagnetometer: 'Magnetometer' in window,
  webAbsoluteOrientation: 'AbsoluteOrientationSensor' in window,
  webRelativeOrientation: 'RelativeOrientationSensor' in window,
  webLinearAcceleration: 'LinearAccelerationSensor' in window,
  webGravitySensor: 'GravitySensor' in window,
  webPermissions: 'permissions' in navigator,
  webLocks: 'locks' in navigator,
  webIdleDetection: 'IdleDetector' in window,
  webMediaSession: 'mediaSession' in navigator,
  webMediaCapabilities: 'mediaCapabilities' in navigator,
  webMediaDevices: 'mediaDevices' in navigator,
  webMediaRecorder: 'MediaRecorder' in window,
  webMediaSource: 'MediaSource' in window,
  webMediaStream: 'MediaStream' in window,
  webMediaStreamTrack: 'MediaStreamTrack' in window,
  webMediaStreamTrackProcessor: 'MediaStreamTrackProcessor' in window,
  webMediaStreamTrackGenerator: 'MediaStreamTrackGenerator' in window,
  webImageCapture: 'ImageCapture' in window,
  webPictureInPicture: 'pictureInPictureEnabled' in document,
  webFullscreen: 'fullscreenEnabled' in document,
  webPointerLock: 'pointerLockElement' in document,
  webGamepad: 'Gamepad' in window,
  webGamepadHaptic: 'GamepadHapticActuator' in window,
  webSpeechSynthesis: 'speechSynthesis' in window,
  webSpeechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
  webTextToSpeech: 'speechSynthesis' in window,
  webTextDetection: 'FaceDetector' in window,
  webBarcodeDetection: 'BarcodeDetector' in window,
  webShapeDetection: 'FaceDetector' in window || 'BarcodeDetector' in window || 'TextDetector' in window,
};

// Log feature support
console.log('Feature detection:', features);

// Check WebP support
function checkWebpSupport() {
  const canvas = document.createElement('canvas');
  
  if (canvas.getContext && canvas.getContext('2d')) {
    // Check if browser can encode WebP
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  
  return false;
}

// Check WebGL support
function checkWebGLSupport() {
  const canvas = document.createElement('canvas');
  
  try {
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// Apply feature classes to document
for (const [feature, supported] of Object.entries(features)) {
  if (supported) {
    document.documentElement.classList.add(`has-${feature}`);
  } else {
    document.documentElement.classList.add(`no-${feature}`);
  }
}

/**
 * POLYFILLS
 * Add polyfills for missing features
 */

// Polyfill for requestAnimationFrame
(function() {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  }
  
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();

// Polyfill for Element.matches
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// Polyfill for Element.closest
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    let el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// Polyfill for NodeList.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// Polyfill for Object.entries
if (!Object.entries) {
  Object.entries = function(obj) {
    return Object.keys(obj).map(key => [key, obj[key]]);
  };
}

// Polyfill for Array.from
if (!Array.from) {
  Array.from = function(iterable) {
    return [].slice.call(iterable);
  };
}

// Polyfill for CustomEvent
(function() {
  if (typeof window.CustomEvent === 'function') return;
  
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  
  window.CustomEvent = CustomEvent;
})();
