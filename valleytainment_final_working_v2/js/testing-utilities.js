/**
 * =====================================================================
 * | VALLEYTAINMENT PRODUCTIONS - TESTING UTILITIES                    |
 * | Version: 1.0.0                                                    |
 * | Last Updated: April 19, 2025                                      |
 * =====================================================================
 * | This file contains testing utilities to verify all functionality  |
 * | of the Valleytainment website is working correctly.               |
 * =====================================================================
 */

// Configuration object - Edit these values to customize testing
const TESTING_CONFIG = {
  // General settings
  general: {
    autoRunTests: false, // Whether to automatically run tests on page load
    logResults: true, // Whether to log test results to console
    showVisualIndicators: false, // Whether to show visual indicators for test results
    testTimeout: 10000, // Timeout for async tests in milliseconds
    retryCount: 2 // Number of times to retry failed tests
  },
  
  // Component tests
  components: {
    testNavigation: true,
    testAnimations: true,
    testResponsiveness: true,
    testForms: true,
    testChatbot: true,
    testImageGenerator: true,
    testSecurity: true,
    testPerformance: true
  },
  
  // Test data
  testData: {
    chatbotPrompts: [
      "What services does Valleytainment offer?",
      "Tell me about your music production",
      "How can I book a DJ?",
      "What's your pricing for events?"
    ],
    imageGeneratorPrompts: [
      "Urban music studio with neon lights",
      "DJ performing at a nightclub",
      "Street dancer in an underground subway"
    ],
    formData: {
      name: "Test User",
      email: "test@example.com",
      phone: "555-123-4567",
      message: "This is a test message from the automated testing system."
    }
  }
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Initialize testing utilities
  const testingUtils = new TestingUtilities(TESTING_CONFIG);
  
  // Auto-run tests if enabled
  if (TESTING_CONFIG.general.autoRunTests) {
    testingUtils.runAllTests();
  }
  
  // Add to window for console access
  window.valleytainmentTesting = testingUtils;
  
  console.log('Valleytainment testing utilities initialized. Access via window.valleytainmentTesting');
});

/**
 * TestingUtilities Class
 * Main implementation of testing utilities
 */
class TestingUtilities {
  constructor(config) {
    // Configuration
    this.config = config;
    
    // Test results
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      details: []
    };
    
    // Test status
    this.isRunning = false;
    this.startTime = null;
    this.endTime = null;
  }
  
  /**
   * Run all tests
   * Executes all enabled tests
   * @returns {Promise<Object>} - Test results
   */
  async runAllTests() {
    // Check if tests are already running
    if (this.isRunning) {
      console.warn('Tests are already running');
      return;
    }
    
    // Reset test results
    this.resetTestResults();
    
    // Set running flag
    this.isRunning = true;
    this.startTime = performance.now();
    
    // Log test start
    console.log('Starting Valleytainment website tests...');
    
    try {
      // Run component tests
      if (this.config.components.testNavigation) {
        await this.testNavigation();
      }
      
      if (this.config.components.testAnimations) {
        await this.testAnimations();
      }
      
      if (this.config.components.testResponsiveness) {
        await this.testResponsiveness();
      }
      
      if (this.config.components.testForms) {
        await this.testForms();
      }
      
      if (this.config.components.testChatbot) {
        await this.testChatbot();
      }
      
      if (this.config.components.testImageGenerator) {
        await this.testImageGenerator();
      }
      
      if (this.config.components.testSecurity) {
        await this.testSecurity();
      }
      
      if (this.config.components.testPerformance) {
        await this.testPerformance();
      }
      
      // Calculate test duration
      this.endTime = performance.now();
      const duration = (this.endTime - this.startTime) / 1000;
      
      // Log test results
      if (this.config.general.logResults) {
        console.log(`
          ========================================
          Valleytainment Website Test Results
          ========================================
          Total Tests: ${this.testResults.total}
          Passed: ${this.testResults.passed}
          Failed: ${this.testResults.failed}
          Skipped: ${this.testResults.skipped}
          Duration: ${duration.toFixed(2)} seconds
          ========================================
        `);
        
        // Log detailed results
        console.log('Detailed Test Results:');
        this.testResults.details.forEach((result, index) => {
          console.log(`${index + 1}. ${result.name}: ${result.status} ${result.message ? '- ' + result.message : ''}`);
        });
      }
      
      // Return test results
      return this.testResults;
    } catch (error) {
      console.error('Error running tests:', error);
      
      // Log error
      this.logTestResult({
        name: 'Test Suite',
        status: 'FAILED',
        message: `Unexpected error: ${error.message}`
      });
      
      // Return test results
      return this.testResults;
    } finally {
      // Reset running flag
      this.isRunning = false;
    }
  }
  
  /**
   * Reset test results
   * Clears previous test results
   */
  resetTestResults() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      details: []
    };
  }
  
  /**
   * Log test result
   * Records the result of a test
   * @param {Object} result - Test result
   */
  logTestResult(result) {
    // Increment counters
    this.testResults.total++;
    
    switch (result.status) {
      case 'PASSED':
        this.testResults.passed++;
        break;
      case 'FAILED':
        this.testResults.failed++;
        break;
      case 'SKIPPED':
        this.testResults.skipped++;
        break;
    }
    
    // Add to details
    this.testResults.details.push(result);
    
    // Log to console
    if (this.config.general.logResults) {
      const statusColor = result.status === 'PASSED' ? 'color: green;' : result.status === 'FAILED' ? 'color: red;' : 'color: orange;';
      console.log(`%c${result.name}: ${result.status}`, statusColor, result.message ? '- ' + result.message : '');
    }
    
    // Show visual indicator
    if (this.config.general.showVisualIndicators) {
      this.showTestIndicator(result);
    }
  }
  
  /**
   * Show test indicator
   * Displays a visual indicator for test result
   * @param {Object} result - Test result
   */
  showTestIndicator(result) {
    // Create indicator element
    const indicator = document.createElement('div');
    indicator.className = 'test-indicator';
    indicator.classList.add(`test-${result.status.toLowerCase()}`);
    
    // Set content
    indicator.innerHTML = `
      <div class="test-indicator-content">
        <h4>${result.name}</h4>
        <p>${result.status}</p>
        ${result.message ? `<p>${result.message}</p>` : ''}
      </div>
    `;
    
    // Add to body
    document.body.appendChild(indicator);
    
    // Remove after 3 seconds
    setTimeout(() => {
      indicator.classList.add('fade-out');
      setTimeout(() => {
        indicator.remove();
      }, 500);
    }, 3000);
  }
  
  /**
   * Test navigation
   * Tests navigation functionality
   * @returns {Promise<void>}
   */
  async testNavigation() {
    console.log('Testing navigation...');
    
    try {
      // Test navigation links
      const navLinks = document.querySelectorAll('nav a');
      
      if (navLinks.length === 0) {
        this.logTestResult({
          name: 'Navigation Links',
          status: 'FAILED',
          message: 'No navigation links found'
        });
        return;
      }
      
      // Test each link
      let allLinksValid = true;
      let invalidLinks = [];
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip if no href
        if (!href) {
          invalidLinks.push(`Link "${link.textContent}" has no href attribute`);
          allLinksValid = false;
          return;
        }
        
        // Skip external links
        if (href.startsWith('http') || href.startsWith('//')) {
          return;
        }
        
        // Check if href is valid
        if (href === '#') {
          return;
        }
        
        // Check if href points to existing element
        if (href.startsWith('#')) {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (!targetElement) {
            invalidLinks.push(`Link "${link.textContent}" points to non-existent element #${targetId}`);
            allLinksValid = false;
          }
        }
      });
      
      // Log result
      if (allLinksValid) {
        this.logTestResult({
          name: 'Navigation Links',
          status: 'PASSED',
          message: `${navLinks.length} links validated`
        });
      } else {
        this.logTestResult({
          name: 'Navigation Links',
          status: 'FAILED',
          message: `Invalid links found: ${invalidLinks.join(', ')}`
        });
      }
      
      // Test mobile menu
      const mobileMenuButton = document.querySelector('.mobile-menu-toggle');
      
      if (mobileMenuButton) {
        // Test opening menu
        mobileMenuButton.click();
        await this.wait(500);
        
        const mobileMenu = document.querySelector('.mobile-menu');
        const isMenuOpen = mobileMenu && (mobileMenu.classList.contains('open') || mobileMenu.classList.contains('active') || getComputedStyle(mobileMenu).display !== 'none');
        
        if (isMenuOpen) {
          this.logTestResult({
            name: 'Mobile Menu Open',
            status: 'PASSED',
            message: 'Mobile menu opens correctly'
          });
          
          // Test closing menu
          mobileMenuButton.click();
          await this.wait(500);
          
          const isMenuClosed = mobileMenu && (mobileMenu.classList.contains('closed') || !mobileMenu.classList.contains('open') || !mobileMenu.classList.contains('active') || getComputedStyle(mobileMenu).display === 'none');
          
          if (isMenuClosed) {
            this.logTestResult({
              name: 'Mobile Menu Close',
              status: 'PASSED',
              message: 'Mobile menu closes correctly'
            });
          } else {
            this.logTestResult({
              name: 'Mobile Menu Close',
              status: 'FAILED',
              message: 'Mobile menu does not close correctly'
            });
          }
        } else {
          this.logTestResult({
            name: 'Mobile Menu Open',
            status: 'FAILED',
            message: 'Mobile menu does not open correctly'
          });
        }
      } else {
        this.logTestResult({
          name: 'Mobile Menu',
          status: 'SKIPPED',
          message: 'Mobile menu button not found'
        });
      }
      
      // Test scroll behavior
      const scrollLinks = document.querySelectorAll('a[href^="#"]');
      
      if (scrollLinks.length > 0) {
        // Test first scroll link
        const firstScrollLink = scrollLinks[0];
        const targetId = firstScrollLink.getAttribute('href').substring(1);
        
        if (targetId && document.getElementById(targetId)) {
          // Click link
          firstScrollLink.click();
          await this.wait(1000);
          
          // Check if scrolled to target
          const targetElement = document.getElementById(targetId);
          const targetPosition = targetElement.getBoundingClientRect().top;
          
          // Allow some margin for fixed headers
          if (Math.abs(targetPosition) < 100) {
            this.logTestResult({
              name: 'Smooth Scrolling',
              status: 'PASSED',
              message: 'Smooth scrolling works correctly'
            });
          } else {
            this.logTestResult({
              name: 'Smooth Scrolling',
              status: 'FAILED',
              message: 'Smooth scrolling does not work correctly'
            });
          }
        } else {
          this.logTestResult({
            name: 'Smooth Scrolling',
            status: 'SKIPPED',
            message: 'No valid scroll target found'
          });
        }
      } else {
        this.logTestResult({
          name: 'Smooth Scrolling',
          status: 'SKIPPED',
          message: 'No scroll links found'
        });
      }
    } catch (error) {
      console.error('Error testing navigation:', error);
      
      this.logTestResult({
        name: 'Navigation',
        status: 'FAILED',
        message: `Error: ${error.message}`
      });
    }
  }
  
  /**
   * Test animations
   * Tests animation functionality
   * @returns {Promise<void>}
   */
  async testAnimations() {
    console.log('Testing animations...');
    
    try {
      // Test scroll animations
      const animatedElements = document.querySelectorAll('.animate-on-scroll, .fade-in, .slide-in, [data-aos]');
      
      if (animatedElements.length === 0) {
        this.logTestResult({
          name: 'Scroll Animations',
          status: 'SKIPPED',
          message: 'No animated elements found'
        });
      } else {
        // Scroll to each element
        let animationsWorking = true;
        
        for (const element of animatedElements) {
          // Skip if not in viewport
          if (!this.isElementInViewport(element)) {
            // Scroll to element
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await this.wait(1000);
            
            // Check if animation class is applied
            const hasAnimationClass = element.classList.contains('animated') || 
                                     element.classList.contains('aos-animate') || 
                                     getComputedStyle(element).opacity === '1';
            
            if (!hasAnimationClass) {
              animationsWorking = false;
              break;
            }
          }
        }
        
        // Log result
        if (animationsWorking) {
          this.logTestResult({
            name: 'Scroll Animations',
            status: 'PASSED',
            message: `${animatedElements.length} animations tested`
          });
        } else {
          this.logTestResult({
            name: 'Scroll Animations',
            status: 'FAILED',
            message: 'Some animations did not trigger correctly'
          });
        }
      }
      
      // Test hover animations
      const hoverElements = document.querySelectorAll('.btn, .card, .hover-effect, .social-icon');
      
      if (hoverElements.length === 0) {
        this.logTestResult({
          name: 'Hover Animations',
          status: 'SKIPPED',
          message: 'No hover elements found'
        });
      } else {
        // Test first hover element
        const firstHoverElement = hoverElements[0];
        
        // Get initial styles
        const initialTransform = getComputedStyle(firstHoverElement).transform;
        const initialScale = getComputedStyle(firstHoverElement).scale;
        const initialOpacity = getComputedStyle(firstHoverElement).opacity;
        const initialBoxShadow = getComputedStyle(firstHoverElement).boxShadow;
        
        // Trigger hover
        const hoverEvent = new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        firstHoverElement.dispatchEvent(hoverEvent);
        await this.wait(500);
        
        // Get hover styles
        const hoverTransform = getComputedStyle(firstHoverElement).transform;
        const hoverScale = getComputedStyle(firstHoverElement).scale;
        const hoverOpacity = getComputedStyle(firstHoverElement).opacity;
        const hoverBoxShadow = getComputedStyle(firstHoverElement).boxShadow;
        
        // Check if styles changed
        const stylesChanged = initialTransform !== hoverTransform || 
                             initialScale !== hoverScale || 
                             initialOpacity !== hoverOpacity || 
                             initialBoxShadow !== hoverBoxShadow;
        
        // Trigger mouseout
        const mouseoutEvent = new MouseEvent('mouseout', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        firstHoverElement.dispatchEvent(mouseoutEvent);
        
        // Log result
        if (stylesChanged) {
          this.logTestResult({
            name: 'Hover Animations',
            status: 'PASSED',
            message: 'Hover animations work correctly'
          });
        } else {
          this.logTestResult({
            name: 'Hover Animations',
            status: 'FAILED',
            message: 'Hover animations do not work correctly'
          });
        }
      }
      
      // Test particle animations
      const particleContainer = document.getElementById('particles-js') || document.querySelector('.particles-container');
      
      if (particleContainer) {
        // Check if particles are rendered
        const hasParticles = particleContainer.children.length > 0 || particleContainer.innerHTML.includes('canvas');
        
        if (hasParticles) {
          this.logTestResult({
            name: 'Particle Animations',
            status: 'PASSED',
            message: 'Particle animations are rendered'
          });
        } else {
          this.logTestResult({
            name: 'Particle Animations',
            status: 'FAILED',
            message: 'Particle animations are not rendered'
          });
        }
      } else {
        this.logTestResult({
          name: 'Particle Animations',
          status: 'SKIPPED',
          message: 'No particle container found'
        });
      }
    } catch (error) {
      console.error('Error testing animations:', error);
      
      this.logTestResult({
        name: 'Animations',
        status: 'FAILED',
        message: `Error: ${error.message}`
      });
    }
  }
  
  /**
   * Test responsiveness
   * Tests responsive design
   * @returns {Promise<void>}
   */
  async testResponsiveness() {
    console.log('Testing responsiveness...');
    
    try {
      // Get current viewport size
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      // Test viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      
      if (viewportMeta) {
        const content = viewportMeta.getAttribute('content');
        
        if (content && content.includes('width=device-width') && content.includes('initial-scale=1')) {
          this.logTestResult({
            name: 'Viewport Meta Tag',
            status: 'PASSED',
            message: 'Viewport meta tag is correctly set'
          });
        } else {
          this.logTestResult({
            name: 'Viewport Meta Tag',
            status: 'FAILED',
            message: 'Viewport meta tag is not correctly set'
          });
        }
      } else {
        this.logTestResult({
          name: 'Viewport Meta Tag',
          status: 'FAILED',
          message: 'Viewport meta tag not found'
        });
      }
      
      // Test responsive images
      const images = document.querySelectorAll('img');
      let responsiveImagesCount = 0;
      
      for (const image of images) {
        const hasSrcset = image.hasAttribute('srcset');
        const hasSizes = image.hasAttribute('sizes');
        const hasStyle = image.hasAttribute('style');
        const hasClass = image.className.includes('img-fluid') || image.className.includes('responsive');
        
        if (hasSrcset || hasSizes || (hasStyle && image.style.maxWidth === '100%') || hasClass) {
          responsiveImagesCount++;
        }
      }
      
      if (images.length === 0) {
        this.logTestResult({
          name: 'Responsive Images',
          status: 'SKIPPED',
          message: 'No images found'
        });
      } else if (responsiveImagesCount === images.length) {
        this.logTestResult({
          name: 'Responsive Images',
          status: 'PASSED',
          message: `All ${images.length} images are responsive`
        });
      } else {
        this.logTestResult({
          name: 'Responsive Images',
          status: 'FAILED',
          message: `Only ${responsiveImagesCount} out of ${images.length} images are responsive`
        });
      }
      
      // Test responsive layout
      // Simulate different screen sizes
      const screenSizes = [
        { width: 320, height: 568, name: 'Mobile Small' },
        { width: 375, height: 667, name: 'Mobile Medium' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Laptop' },
        { width: 1440, height: 900, name: 'Desktop' }
      ];
      
      // Check if any elements overflow at different screen sizes
      let overflowDetected = false;
      let overflowScreens = [];
      
      for (const size of screenSizes) {
        // Resize window (simulation only)
        const originalOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'auto';
        
        // Set viewport meta for testing
        let testViewport = document.createElement('meta');
        testViewport.name = 'viewport';
        testViewport.content = `width=${size.width}, initial-scale=1`;
        document.head.appendChild(testViewport);
        
        // Wait for layout to update
        await this.wait(500);
        
        // Check for horizontal overflow
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = size.width;
        
        if (bodyWidth > windowWidth) {
          overflowDetected = true;
          overflowScreens.push(`${size.name} (${bodyWidth}px > ${windowWidth}px)`);
        }
        
        // Remove test viewport
        document.head.removeChild(testViewport);
        
        // Restore original viewport
        if (viewportMeta) {
          document.head.appendChild(viewportMeta.cloneNode(true));
        }
        
        // Restore original overflow
        document.documentElement.style.overflow = originalOverflow;
      }
      
      // Log result
      if (overflowDetected) {
        this.logTestResult({
          name: 'Responsive Layout',
          status: 'FAILED',
          message: `Horizontal overflow detected at: ${overflowScreens.join(', ')}`
        });
      } else {
        this.logTestResult({
          name: 'Responsive Layout',
          status: 'PASSED',
          message: 'No horizontal overflow detected at any screen size'
        });
      }
      
      // Test media queries
      const styleSheets = document.styleSheets;
      let mediaQueryCount = 0;
      
      for (const sheet of styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          
          if (!rules) continue;
          
          for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            
            if (rule.type === CSSRule.MEDIA_RULE) {
              mediaQueryCount++;
            }
          }
        } catch (e) {
          // Skip cross-origin stylesheets
          continue;
        }
      }
      
      if (mediaQueryCount > 0) {
        this.logTestResult({
          name: 'Media Queries',
          status: 'PASSED',
          message: `${mediaQueryCount} media queries found`
        });
      } else {
        this.logTestResult({
          name: 'Media Queries',
          status: 'FAILED',
          message: 'No media queries found'
        });
      }
    } catch (error) {
      console.error('Error testing responsiveness:', error);
      
      this.logTestResult({
        name: 'Responsiveness',
        status: 'FAILED',
        message: `Error: ${error.message}`
      });
    }
  }
  
  /**
   * Test forms
   * Tests form functionality
   * @returns {Promise<void>}
   */
  async testForms() {
    console.log('Testing forms...');
    
    try {
      // Find all forms
      const forms = document.querySelectorAll('form');
      
      if (forms.length === 0) {
        this.logTestResult({
          name: 'Forms',
          status: 'SKIPPED',
          message: 'No forms found'
        });
        return;
      }
      
      // Test each form
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const formName = form.id || form.name || `Form ${i + 1}`;
        
        // Test form validation
        const requiredInputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let validationWorking = true;
        
        if (requiredInputs.length > 0) {
          // Try to submit form without filling required fields
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
          
          // Check if form was prevented from submitting
          if (!submitEvent.defaultPrevented) {
            validationWorking = false;
          }
          
          // Log result
          if (validationWorking) {
            this.logTestResult({
              name: `${formName} Validation`,
              status: 'PASSED',
              message: 'Form validation works correctly'
            });
          } else {
            this.logTestResult({
              name: `${formName} Validation`,
              status: 'FAILED',
              message: 'Form validation does not work correctly'
            });
          }
        } else {
          this.logTestResult({
            name: `${formName} Validation`,
            status: 'SKIPPED',
            message: 'No required fields found'
          });
        }
        
        // Test form inputs
        const inputs = form.querySelectorAll('input, textarea, select');
        let inputsWorking = true;
        
        for (const input of inputs) {
          // Skip submit buttons
          if (input.type === 'submit' || input.type === 'button') {
            continue;
          }
          
          // Get input type
          const type = input.type || 'text';
          
          // Set test value based on type
          let testValue = '';
          
          switch (type) {
            case 'text':
            case 'textarea':
              testValue = this.config.testData.formData.name;
              break;
            case 'email':
              testValue = this.config.testData.formData.email;
              break;
            case 'tel':
              testValue = this.config.testData.formData.phone;
              break;
            case 'number':
              testValue = '42';
              break;
            case 'date':
              testValue = '2025-04-19';
              break;
            case 'checkbox':
            case 'radio':
              // Just check/uncheck
              input.checked = !input.checked;
              break;
            case 'select-one':
              // Select first option
              if (input.options.length > 0) {
                input.selectedIndex = 0;
              }
              break;
            default:
              testValue = 'Test value';
              break;
          }
          
          // Set value if not checkbox/radio
          if (type !== 'checkbox' && type !== 'radio' && type !== 'select-one') {
            input.value = testValue;
            
            // Trigger input event
            const inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
            
            // Check if value was set
            if (input.value !== testValue) {
              inputsWorking = false;
              break;
            }
          }
        }
        
        // Log result
        if (inputsWorking) {
          this.logTestResult({
            name: `${formName} Inputs`,
            status: 'PASSED',
            message: `${inputs.length} inputs tested successfully`
          });
        } else {
          this.logTestResult({
            name: `${formName} Inputs`,
            status: 'FAILED',
            message: 'Some inputs did not work correctly'
          });
        }
      }
    } catch (error) {
      console.error('Error testing forms:', error);
      
      this.logTestResult({
        name: 'Forms',
        status: 'FAILED',
        message: `Error: ${error.message}`
      });
    }
  }
  
  /**
   * Test chatbot
   * Tests chatbot functionality
   * @returns {Promise<void>}
   */
  async testChatbot() {
    console.log('Testing chatbot...');
    
    try {
      // Find chatbot container
      const chatbotContainer = document.querySelector('.chatbot-container');
      
      if (!chatbotContainer) {
        this.logTestResult({
          name: 'Chatbot',
          status: 'SKIPPED',
          message: 'Chatbot container not found'
        });
        return;
      }
      
      // Find chatbot toggle button
      const chatbotToggle = document.querySelector('.chatbot-toggle, .chat-icon, [data-toggle="chatbot"]');
      
      if (!chatbotToggle) {
        this.logTestResult({
          name: 'Chatbot Toggle',
          status: 'FAILED',
          message: 'Chatbot toggle button not found'
        });
        return;
      }
      
      // Test opening chatbot
      chatbotToggle.click();
      await this.wait(1000);
      
      // Check if chatbot is open
      const isChatbotOpen = chatbotContainer.classList.contains('open') || 
                           chatbotContainer.classList.contains('active') || 
                           getComputedStyle(chatbotContainer).display !== 'none';
      
      if (isChatbotOpen) {
        this.logTestResult({
          name: 'Chatbot Open',
          status: 'PASSED',
          message: 'Chatbot opens correctly'
        });
      } else {
        this.logTestResult({
          name: 'Chatbot Open',
          status: 'FAILED',
          message: 'Chatbot does not open correctly'
        });
        return;
      }
      
      // Find chatbot input
      const chatbotInput = chatbotContainer.querySelector('input, textarea');
      
      if (!chatbotInput) {
        this.logTestResult({
          name: 'Chatbot Input',
          status: 'FAILED',
          message: 'Chatbot input not found'
        });
        return;
      }
      
      // Find chatbot submit button
      const chatbotSubmit = chatbotContainer.querySelector('button[type="submit"], .send-btn, .submit-btn');
      
      if (!chatbotSubmit) {
        this.logTestResult({
          name: 'Chatbot Submit',
          status: 'FAILED',
          message: 'Chatbot submit button not found'
        });
        return;
      }
      
      // Find chatbot messages container
      const chatbotMessages = chatbotContainer.querySelector('.chat-messages, .messages, .conversation');
      
      if (!chatbotMessages) {
        this.logTestResult({
          name: 'Chatbot Messages',
          status: 'FAILED',
          message: 'Chatbot messages container not found'
        });
        return;
      }
      
      // Count initial messages
      const initialMessageCount = chatbotMessages.children.length;
      
      // Test sending a message
      const testPrompt = this.config.testData.chatbotPrompts[0];
      chatbotInput.value = testPrompt;
      
      // Trigger input event
      const inputEvent = new Event('input', { bubbles: true });
      chatbotInput.dispatchEvent(inputEvent);
      
      // Submit message
      chatbotSubmit.click();
      
      // Wait for response
      await this.wait(3000);
      
      // Check if new messages were added
      const newMessageCount = chatbotMessages.children.length;
      
      if (newMessageCount > initialMessageCount) {
        this.logTestResult({
          name: 'Chatbot Response',
          status: 'PASSED',
          message: 'Chatbot responds to messages'
        });
      } else {
        this.logTestResult({
          name: 'Chatbot Response',
          status: 'FAILED',
          message: 'Chatbot does not respond to messages'
        });
      }
      
      // Test closing chatbot
      const chatbotClose = chatbotContainer.querySelector('.close-btn, .chatbot-close, [data-dismiss="chatbot"]');
      
      if (chatbotClose) {
        chatbotClose.click();
        await this.wait(1000);
        
        // Check if chatbot is closed
        const isChatbotClosed = !chatbotContainer.classList.contains('open') || 
                               !chatbotContainer.classList.contains('active') || 
                               getComputedStyle(chatbotContainer).display === 'none';
        
        if (isChatbotClosed) {
          this.logTestResult({
            name: 'Chatbot Close',
            status: 'PASSED',
            message: 'Chatbot closes correctly'
          });
        } else {
          this.logTestResult({
            name: 'Chatbot Close',
            status: 'FAILED',
            message: 'Chatbot does not close correctly'
          });
        }
      } else {
        this.logTestResult({
          name: 'Chatbot Close',
          status: 'SKIPPED',
          message: 'Chatbot close button not found'
        });
      }
    } catch (error) {
      console.error('Error testing chatbot:', error);
      
      this.logTestResult({
        name: 'Chatbot',
        status: 'FAILED',
        message: `Error: ${error.message}`
      });
    }
  }
  
  /**
   * Test image generator
   * Tests image generator functionality
   * @returns {Promise<void>}
   */
  async testImageGenerator() {
    console.log('Testing image generator...');
    
    try {
      // Find image generator container
      const imageGeneratorContainer = document.querySelector('.image-generator, #image-generator, [data-component="image-generator"]');
      
      if (!imageGeneratorContainer) {
        this.logTestResult({
          name: 'Image Generator',
          status: 'SKIPPED',
          message: 'Image generator container not found'
        });
        return;
      }
      
      // Find image generator input
      const promptInput = imageGeneratorContainer.querySelector('input, textarea');
      
      if (!promptInput) {
        this.logTestResult({
          name: 'Image Generator Input',
          status: 'FAILED',
          message: 'Image generator input not found'
        });
        return;
      }
      
      // Find image generator submit button
      const generateButton = imageGeneratorContainer.querySelector('button[type="submit"], .generate-btn, #generate-image-btn');
      
      if (!generateButton) {
        this.logTestResult({
          name: 'Image Generator Button',
          status: 'FAILED',
          message: 'Image generator button not found'
        });
        return;
      }
      
      // Find image output
      const imageOutput = imageGeneratorContainer.querySelector('img, .generated-image, #generated-image');
      
      if (!imageOutput) {
        this.logTestResult({
          name: 'Image Generator Output',
          status: 'FAILED',
          message: 'Image generator output not found'
        });
        return;
      }
      
      // Get initial image source
      const initialSrc = imageOutput.src;
      
      // Test generating an image
      const testPrompt = this.config.testData.imageGeneratorPrompts[0];
      promptInput.value = testPrompt;
      
      // Trigger input event
      const inputEvent = new Event('input', { bubbles: true });
      promptInput.dispatchEvent(inputEvent);
      
      // Submit prompt
      generateButton.click();
      
      // Wait for image generation
      await this.wait(5000);
      
      // Check if image source changed
      const newSrc = imageOutput.src;
      
      if (newSrc !== initialSrc) {
        this.logTestResult({
          name: 'Image Generation',
          status: 'PASSED',
          message: 'Image generator produces images'
        });
      } else {
        this.logTestResult({
          name: 'Image Generation',
          status: 'FAILED',
          message: 'Image generator does not produce images'
        });
      }
      
      // Test style selector if available
      const styleSelector = imageGeneratorContainer.querySelector('select, .style-selector, #image-style-selector');
      
      if (styleSelector) {
        // Get initial selected style
        const initialStyle = styleSelector.value;
        
        // Change style
        if (styleSelector.options.length > 1) {
          // Select a different option
          for (let i = 0; i < styleSelector.options.length; i++) {
            if (styleSelector.options[i].value !== initialStyle) {
              styleSelector.value = styleSelector.options[i].value;
              break;
            }
          }
          
          // Trigger change event
          const changeEvent = new Event('change', { bubbles: true });
          styleSelector.dispatchEvent(changeEvent);
          
          // Check if style changed
          if (styleSelector.value !== initialStyle) {
            this.logTestResult({
              name: 'Image Style Selection',
              status: 'PASSED',
              message: 'Style selector works correctly'
            });
          } else {
            this.logTestResult({
              name: 'Image Style Selection',
              status: 'FAILED',
              message: 'Style selector does not work correctly'
            });
          }
        } else {
          this.logTestResult({
            name: 'Image Style Selection',
            status: 'SKIPPED',
            message: 'Not enough style options to test'
          });
        }
      } else {
        this.logTestResult({
          name: 'Image Style Selection',
          status: 'SKIPPED',
          message: 'Style selector not found'
        });
      }
    } catch (error) {
      console.error('Error testing image generator:', error);
      
      this.logTestResult({
        name: 'Image Generator',
        status: 'FAILED',
        message: `Error: ${error.message}`
      });
    }
  }
  
  /**
   * Test security features
   * Tests security implementations
   * @returns {Promise<void>}
   */
  async testSecurity() {
    console.log('Testing security features...');
    
    try {
      // Test Content Security Policy
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      
      if (cspMeta) {
        const content = cspMeta.getAttribute('content');
        
        if (content && content.includes('default-src') && content.includes('script-src')) {
          this.logTestResult({
            name: 'Content Security Policy',
            status: 'PASSED',
            message: 'CSP is properly configured'
          });
        } else {
          this.logTestResult({
            name: 'Content Security Policy',
            status: 'FAILED',
            message: 'CSP is not properly configured'
          });
        }
      } else {
        this.logTestResult({
          name: 'Content Security Policy',
          status: 'SKIPPED',
          message: 'CSP meta tag not found'
        });
      }
      
      // Test XSS protection
      const testScript = '<script>alert("XSS")</script>';
      const testDiv = document.createElement('div');
      testDiv.style.display = 'none';
      document.body.appendChild(testDiv);
      
      // Try to inject script
      testDiv.innerHTML = testScript;
      
      // Check if script was sanitized
      const isScriptSanitized = !testDiv.innerHTML.includes('<script>');
      
      // Remove test div
      document.body.removeChild(testDiv);
      
      // Log result
      if (isScriptSanitized) {
        this.logTestResult({
          name: 'XSS Protection',
          status: 'PASSED',
          message: 'XSS injection is prevented'
        });
      } else {
        this.logTestResult({
          name: 'XSS Protection',
          status: 'FAILED',
          message: 'XSS injection is not prevented'
        });
      }
      
      // Test CSRF protection
      const forms = document.querySelectorAll('form');
      let csrfProtectionFound = false;
      
      for (const form of forms) {
        // Skip if form has data-no-csrf attribute
        if (form.hasAttribute('data-no-csrf')) continue;
        
        // Check if form has CSRF token
        const csrfInput = form.querySelector('input[name*="csrf"], input[name*="token"], input[name*="xsrf"]');
        
        if (csrfInput) {
          csrfProtectionFound = true;
          break;
        }
      }
      
      if (forms.length === 0) {
        this.logTestResult({
          name: 'CSRF Protection',
          status: 'SKIPPED',
          message: 'No forms found to test CSRF protection'
        });
      } else if (csrfProtectionFound) {
        this.logTestResult({
          name: 'CSRF Protection',
          status: 'PASSED',
          message: 'CSRF protection is implemented'
        });
      } else {
        this.logTestResult({
          name: 'CSRF Protection',
          status: 'FAILED',
          message: 'CSRF protection is not implemented'
        });
      }
      
      // Test form validation
      const formWithValidation = document.querySelector('form:not([data-no-validate])');
      
      if (formWithValidation) {
        // Find email input
        const emailInput = formWithValidation.querySelector('input[type="email"]');
        
        if (emailInput) {
          // Try invalid email
          emailInput.value = 'invalid-email';
          
          // Trigger validation
          const invalidEvent = new Event('invalid', { bubbles: true, cancelable: true });
          emailInput.dispatchEvent(invalidEvent);
          
          // Check if validation triggered
          const isValidationTriggered = invalidEvent.defaultPrevented || emailInput.validity.valid === false;
          
          if (isValidationTriggered) {
            this.logTestResult({
              name: 'Form Validation',
              status: 'PASSED',
              message: 'Form validation works correctly'
            });
          } else {
            this.logTestResult({
              name: 'Form Validation',
              status: 'FAILED',
              message: 'Form validation does not work correctly'
            });
          }
        } else {
          this.logTestResult({
            name: 'Form Validation',
            status: 'SKIPPED',
            message: 'No email input found to test validation'
          });
        }
      } else {
        this.logTestResult({
          name: 'Form Validation',
          status: 'SKIPPED',
          message: 'No form with validation found'
        });
      }
      
      // Test security headers
      const securityHeaders = [
        { name: 'X-Frame-Options', metaName: 'X-Frame-Options' },
        { name: 'X-Content-Type-Options', metaName: 'X-Content-Type-Options' },
        { name: 'Referrer-Policy', metaName: 'referrer' },
        { name: 'Permissions-Policy', metaName: 'Permissions-Policy' }
      ];
      
      let securityHeadersFound = 0;
      
      for (const header of securityHeaders) {
        const meta = document.querySelector(`meta[http-equiv="${header.metaName}"], meta[name="${header.metaName}"]`);
        
        if (meta) {
          securityHeadersFound++;
        }
      }
      
      if (securityHeadersFound === securityHeaders.length) {
        this.logTestResult({
          name: 'Security Headers',
          status: 'PASSED',
          message: 'All security headers are implemented'
        });
      } else if (securityHeadersFound > 0) {
        this.logTestResult({
          name: 'Security Headers',
          status: 'PASSED',
          message: `${securityHeadersFound} out of ${securityHeaders.length} security headers are implemented`
        });
      } else {
        this.logTestResult({
          name: 'Security Headers',
          status: 'FAILED',
          message: 'No security headers are implemented'
        });
      }
    } catch (error) {
      console.error('Error testing security features:', error);
      
      this.logTestResult({
        name: 'Security Features',
        status: 'FAILED',
        message: `Error: ${error.message}`
      });
    }
  }
  
  /**
   * Test performance
   * Tests website performance
   * @returns {Promise<void>}
   */
  async testPerformance() {
    console.log('Testing performance...');
    
    try {
      // Test page load time
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      
      if (loadTime < 3000) {
        this.logTestResult({
          name: 'Page Load Time',
          status: 'PASSED',
          message: `Page loaded in ${loadTime}ms (fast)`
        });
      } else if (loadTime < 5000) {
        this.logTestResult({
          name: 'Page Load Time',
          status: 'PASSED',
          message: `Page loaded in ${loadTime}ms (acceptable)`
        });
      } else {
        this.logTestResult({
          name: 'Page Load Time',
          status: 'FAILED',
          message: `Page loaded in ${loadTime}ms (slow)`
        });
      }
      
      // Test image optimization
      const images = document.querySelectorAll('img');
      let largeImagesCount = 0;
      
      for (const image of images) {
        // Skip if image has not loaded
        if (!image.complete) continue;
        
        // Get image dimensions
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        
        // Check if image is larger than displayed size
        const displayWidth = image.clientWidth;
        const displayHeight = image.clientHeight;
        
        if (width > displayWidth * 2 || height > displayHeight * 2) {
          largeImagesCount++;
        }
      }
      
      if (images.length === 0) {
        this.logTestResult({
          name: 'Image Optimization',
          status: 'SKIPPED',
          message: 'No images found'
        });
      } else if (largeImagesCount === 0) {
        this.logTestResult({
          name: 'Image Optimization',
          status: 'PASSED',
          message: 'All images are properly sized'
        });
      } else {
        this.logTestResult({
          name: 'Image Optimization',
          status: 'FAILED',
          message: `${largeImagesCount} out of ${images.length} images are oversized`
        });
      }
      
      // Test resource hints
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
      const preconnectLinks = document.querySelectorAll('link[rel="preconnect"]');
      
      const totalResourceHints = preloadLinks.length + prefetchLinks.length + preconnectLinks.length;
      
      if (totalResourceHints > 0) {
        this.logTestResult({
          name: 'Resource Hints',
          status: 'PASSED',
          message: `${totalResourceHints} resource hints found`
        });
      } else {
        this.logTestResult({
          name: 'Resource Hints',
          status: 'FAILED',
          message: 'No resource hints found'
        });
      }
      
      // Test JavaScript execution time
      const startTime = performance.now();
      
      // Execute a simple benchmark
      let sum = 0;
      for (let i = 0; i < 1000000; i++) {
        sum += i;
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      if (executionTime < 100) {
        this.logTestResult({
          name: 'JavaScript Performance',
          status: 'PASSED',
          message: `JavaScript benchmark completed in ${executionTime.toFixed(2)}ms (fast)`
        });
      } else if (executionTime < 300) {
        this.logTestResult({
          name: 'JavaScript Performance',
          status: 'PASSED',
          message: `JavaScript benchmark completed in ${executionTime.toFixed(2)}ms (acceptable)`
        });
      } else {
        this.logTestResult({
          name: 'JavaScript Performance',
          status: 'FAILED',
          message: `JavaScript benchmark completed in ${executionTime.toFixed(2)}ms (slow)`
        });
      }
      
      // Test render blocking resources
      const renderBlockingStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"]):not([media="(max-width: 0px)"])');
      const renderBlockingScripts = document.querySelectorAll('script:not([async]):not([defer]):not([type="module"])');
      
      const totalRenderBlockingResources = renderBlockingStyles.length + renderBlockingScripts.length;
      
      if (totalRenderBlockingResources <= 3) {
        this.logTestResult({
          name: 'Render Blocking Resources',
          status: 'PASSED',
          message: `${totalRenderBlockingResources} render blocking resources found`
        });
      } else {
        this.logTestResult({
          name: 'Render Blocking Resources',
          status: 'FAILED',
          message: `${totalRenderBlockingResources} render blocking resources found`
        });
      }
    } catch (error) {
      console.error('Error testing performance:', error);
      
      this.logTestResult({
        name: 'Performance',
        status: 'FAILED',
        message: `Error: ${error.message}`
      });
    }
  }
  
  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} - Whether element is in viewport
   */
  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  /**
   * Wait for specified time
   * @param {number} ms - Time to wait in milliseconds
   * @returns {Promise<void>}
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export TestingUtilities class for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestingUtilities;
}
