/**
 * =====================================================================
 * | VALLEYTAINMENT PRODUCTIONS - ADVANCED AI IMAGE GENERATOR          |
 * | Version: 2.0.0                                                    |
 * | Last Updated: April 19, 2025                                      |
 * =====================================================================
 * | This file contains the implementation of the AI image generator   |
 * | with multiple artistic styles, prompt optimization, and reliable  |
 * | fallback mechanisms for the Valleytainment website.               |
 * =====================================================================
 */

// Configuration object - Edit these values to customize the image generator
const IMAGE_GENERATOR_CONFIG = {
  // Generator settings
  generator: {
    defaultWidth: 512,
    defaultHeight: 512,
    maxPromptLength: 1000,
    defaultStyle: "neon-urban", // Default style preset
    defaultNegativePrompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy",
    promptPrefix: "Valleytainment style, high quality, detailed", // Added to all prompts
    maxGenerationTime: 30000, // milliseconds
    saveGeneratedImages: true, // Whether to allow users to save generated images
    maxHistoryItems: 10 // Maximum number of images to store in history
  },
  
  // UI settings
  ui: {
    showLoadingAnimation: true,
    loadingText: "Creating your Valleytainment vision...",
    errorText: "Unable to generate image. Please try again.",
    placeholderImagePath: "images/image-placeholder.jpg",
    historyEnabled: true,
    showStyleSelector: true,
    showAdvancedOptions: true,
    showPromptSuggestions: true
  },
  
  // API settings
  api: {
    useLocalFallback: true, // Use local generation if API fails
    endpoints: [
      {
        name: "pollinations",
        url: "https://image.pollinations.ai/prompt/",
        priority: 1,
        params: {
          width: 512,
          height: 512,
          nologo: true
        }
      },
      {
        name: "stability",
        url: "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        priority: 2
      },
      {
        name: "huggingface",
        url: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        priority: 3
      }
    ],
    timeout: 30000 // milliseconds
  },
  
  // Style presets
  styles: [
    {
      id: "neon-urban",
      name: "Neon Urban",
      description: "Vibrant neon colors with urban aesthetic",
      promptModifier: "neon lights, urban aesthetic, vibrant colors, city nightlife, cyberpunk influence",
      previewImage: "images/styles/neon-urban.jpg"
    },
    {
      id: "retro-wave",
      name: "Retro Wave",
      description: "80s inspired synthwave aesthetic",
      promptModifier: "retrowave, synthwave, 80s aesthetic, purple and blue gradient, grid patterns, sunset",
      previewImage: "images/styles/retro-wave.jpg"
    },
    {
      id: "graffiti",
      name: "Graffiti",
      description: "Street art and graffiti style",
      promptModifier: "graffiti art, street art, spray paint, urban walls, bold colors, tags and murals",
      previewImage: "images/styles/graffiti.jpg"
    },
    {
      id: "glitch",
      name: "Digital Glitch",
      description: "Digital glitch and distortion effects",
      promptModifier: "digital glitch, distortion, vaporwave, data moshing, RGB split, corrupted data aesthetic",
      previewImage: "images/styles/glitch.jpg"
    },
    {
      id: "minimalist",
      name: "Minimalist",
      description: "Clean, minimal design with bold elements",
      promptModifier: "minimalist design, clean lines, limited color palette, negative space, bold typography",
      previewImage: "images/styles/minimalist.jpg"
    },
    {
      id: "abstract",
      name: "Abstract",
      description: "Abstract shapes and patterns",
      promptModifier: "abstract art, geometric shapes, non-representational, bold colors, dynamic composition",
      previewImage: "images/styles/abstract.jpg"
    },
    {
      id: "photorealistic",
      name: "Photorealistic",
      description: "Highly detailed photorealistic style",
      promptModifier: "photorealistic, highly detailed, professional photography, 8k, sharp focus, realistic lighting",
      previewImage: "images/styles/photorealistic.jpg"
    },
    {
      id: "anime",
      name: "Anime",
      description: "Japanese anime and manga style",
      promptModifier: "anime style, manga illustration, cel shaded, vibrant colors, expressive characters",
      previewImage: "images/styles/anime.jpg"
    },
    {
      id: "3d-render",
      name: "3D Render",
      description: "3D rendered digital art",
      promptModifier: "3D render, octane render, blender, cinema 4D, volumetric lighting, ray tracing, subsurface scattering",
      previewImage: "images/styles/3d-render.jpg"
    },
    {
      id: "pop-art",
      name: "Pop Art",
      description: "Bold pop art inspired by Warhol and Lichtenstein",
      promptModifier: "pop art, Roy Lichtenstein, Andy Warhol, bold colors, comic book style, halftone dots, ben-day dots",
      previewImage: "images/styles/pop-art.jpg"
    }
  ],
  
  // Prompt suggestions
  promptSuggestions: [
    "Urban music studio with neon lights",
    "DJ performing at a futuristic nightclub",
    "Street dancer in an underground subway",
    "Graffiti artist creating a mural",
    "Futuristic concert with holographic displays",
    "Record store with vintage vinyl collection",
    "Music producer working in a high-tech studio",
    "Urban fashion photoshoot in city alleyway",
    "Neon sign with Valleytainment logo",
    "Abstract visualization of sound waves"
  ],
  
  // Analytics settings
  analytics: {
    enabled: true,
    trackPrompts: true,
    trackStyles: true,
    storageKey: "valleytainment_image_generator_analytics"
  }
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the image generator
  const imageGenerator = new ValleyImageGenerator(IMAGE_GENERATOR_CONFIG);
  imageGenerator.init();
});

/**
 * ValleyImageGenerator Class
 * Main image generator implementation with multiple styles and fallback systems
 */
class ValleyImageGenerator {
  constructor(config) {
    // Configuration
    this.config = config;
    
    // State
    this.isGenerating = false;
    this.selectedStyle = config.generator.defaultStyle;
    this.generationHistory = [];
    this.currentEndpointIndex = 0;
    this.analytics = {
      totalGenerations: 0,
      popularPrompts: {},
      popularStyles: {},
      sessionStartTime: new Date(),
      lastGenerationTime: null
    };
    
    // Load generation history from localStorage if available
    this.loadGenerationHistory();
    
    // Load analytics data if enabled
    if (this.config.analytics.enabled) {
      this.loadAnalytics();
    }
  }
  
  /**
   * Initialize the image generator
   * Sets up event listeners and UI
   */
  init() {
    // Get DOM elements
    this.promptInput = document.getElementById('image-prompt-input');
    this.generateButton = document.getElementById('generate-image-btn');
    this.imageOutput = document.getElementById('generated-image');
    this.loadingIndicator = document.getElementById('image-loading-indicator');
    this.errorMessage = document.getElementById('image-error-message');
    this.styleSelector = document.getElementById('image-style-selector');
    this.promptSuggestions = document.getElementById('prompt-suggestions');
    this.imageHistory = document.getElementById('image-history');
    this.advancedOptions = document.getElementById('advanced-options');
    this.advancedToggle = document.getElementById('advanced-toggle');
    this.saveImageButton = document.getElementById('save-image-btn');
    this.clearHistoryButton = document.getElementById('clear-history-btn');
    
    // Initialize UI
    this.initializeUI();
    
    // Add event listeners
    this.addEventListeners();
    
    // Initialize style selector
    this.initializeStyleSelector();
    
    // Initialize prompt suggestions
    this.initializePromptSuggestions();
    
    // Initialize image history
    if (this.config.ui.historyEnabled) {
      this.initializeImageHistory();
    }
    
    console.log('ValleyImageGenerator initialized successfully!');
  }
  
  /**
   * Initialize UI elements
   */
  initializeUI() {
    // Set placeholder image
    if (this.imageOutput && this.config.ui.placeholderImagePath) {
      this.imageOutput.src = this.config.ui.placeholderImagePath;
      this.imageOutput.alt = 'Generate an image by entering a prompt';
    }
    
    // Hide loading indicator initially
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
    
    // Hide error message initially
    if (this.errorMessage) {
      this.errorMessage.style.display = 'none';
    }
    
    // Hide advanced options initially
    if (this.advancedOptions) {
      this.advancedOptions.style.display = 'none';
    }
    
    // Hide save button initially
    if (this.saveImageButton) {
      this.saveImageButton.style.display = 'none';
    }
    
    // Hide elements based on config
    if (!this.config.ui.showStyleSelector && this.styleSelector) {
      this.styleSelector.parentElement.style.display = 'none';
    }
    
    if (!this.config.ui.showPromptSuggestions && this.promptSuggestions) {
      this.promptSuggestions.style.display = 'none';
    }
    
    if (!this.config.ui.showAdvancedOptions && this.advancedToggle) {
      this.advancedToggle.style.display = 'none';
    }
    
    if (!this.config.ui.historyEnabled && this.imageHistory) {
      this.imageHistory.style.display = 'none';
    }
    
    if (!this.config.generator.saveGeneratedImages && this.saveImageButton) {
      this.saveImageButton.style.display = 'none';
    }
  }
  
  /**
   * Add event listeners to image generator elements
   */
  addEventListeners() {
    // Generate image on button click
    if (this.generateButton) {
      this.generateButton.addEventListener('click', () => {
        this.generateImage();
      });
    }
    
    // Generate image on Enter key in prompt input
    if (this.promptInput) {
      this.promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.generateImage();
        }
      });
    }
    
    // Toggle advanced options
    if (this.advancedToggle) {
      this.advancedToggle.addEventListener('click', () => {
        if (this.advancedOptions) {
          if (this.advancedOptions.style.display === 'none') {
            this.advancedOptions.style.display = 'block';
            this.advancedToggle.textContent = 'Hide Advanced Options';
          } else {
            this.advancedOptions.style.display = 'none';
            this.advancedToggle.textContent = 'Show Advanced Options';
          }
        }
      });
    }
    
    // Save generated image
    if (this.saveImageButton) {
      this.saveImageButton.addEventListener('click', () => {
        this.saveGeneratedImage();
      });
    }
    
    // Clear history
    if (this.clearHistoryButton) {
      this.clearHistoryButton.addEventListener('click', () => {
        this.clearGenerationHistory();
      });
    }
  }
  
  /**
   * Initialize style selector
   * Creates style selection options
   */
  initializeStyleSelector() {
    if (!this.styleSelector || !this.config.ui.showStyleSelector) return;
    
    // Clear existing options
    this.styleSelector.innerHTML = '';
    
    // Add style options
    this.config.styles.forEach(style => {
      const option = document.createElement('option');
      option.value = style.id;
      option.textContent = style.name;
      
      // Set default selected style
      if (style.id === this.config.generator.defaultStyle) {
        option.selected = true;
      }
      
      this.styleSelector.appendChild(option);
    });
    
    // Add change event listener
    this.styleSelector.addEventListener('change', () => {
      this.selectedStyle = this.styleSelector.value;
      
      // Update style description if element exists
      const styleDescription = document.getElementById('style-description');
      if (styleDescription) {
        const selectedStyleObj = this.config.styles.find(style => style.id === this.selectedStyle);
        if (selectedStyleObj) {
          styleDescription.textContent = selectedStyleObj.description;
        }
      }
      
      // Update style preview if element exists
      const stylePreview = document.getElementById('style-preview');
      if (stylePreview) {
        const selectedStyleObj = this.config.styles.find(style => style.id === this.selectedStyle);
        if (selectedStyleObj && selectedStyleObj.previewImage) {
          stylePreview.src = selectedStyleObj.previewImage;
          stylePreview.alt = `${selectedStyleObj.name} style preview`;
          stylePreview.style.display = 'block';
        } else {
          stylePreview.style.display = 'none';
        }
      }
    });
    
    // Trigger change event to set initial description and preview
    this.styleSelector.dispatchEvent(new Event('change'));
  }
  
  /**
   * Initialize prompt suggestions
   * Creates clickable suggestion chips
   */
  initializePromptSuggestions() {
    if (!this.promptSuggestions || !this.config.ui.showPromptSuggestions) return;
    
    // Clear existing suggestions
    this.promptSuggestions.innerHTML = '';
    
    // Add suggestion chips
    this.config.promptSuggestions.forEach(suggestion => {
      const chip = document.createElement('div');
      chip.className = 'prompt-suggestion-chip';
      chip.textContent = suggestion;
      
      // Add click event
      chip.addEventListener('click', () => {
        if (this.promptInput) {
          this.promptInput.value = suggestion;
          this.generateImage();
        }
      });
      
      this.promptSuggestions.appendChild(chip);
    });
  }
  
  /**
   * Initialize image history
   * Creates image history display
   */
  initializeImageHistory() {
    if (!this.imageHistory || !this.config.ui.historyEnabled) return;
    
    // Clear existing history
    this.imageHistory.innerHTML = '';
    
    // Add history title
    const historyTitle = document.createElement('h3');
    historyTitle.textContent = 'Generation History';
    this.imageHistory.appendChild(historyTitle);
    
    // Add history items container
    const historyItems = document.createElement('div');
    historyItems.className = 'history-items';
    historyItems.id = 'history-items';
    this.imageHistory.appendChild(historyItems);
    
    // Add clear history button if not already added
    if (!this.clearHistoryButton) {
      this.clearHistoryButton = document.createElement('button');
      this.clearHistoryButton.id = 'clear-history-btn';
      this.clearHistoryButton.className = 'btn btn-secondary';
      this.clearHistoryButton.textContent = 'Clear History';
      
      this.clearHistoryButton.addEventListener('click', () => {
        this.clearGenerationHistory();
      });
      
      this.imageHistory.appendChild(this.clearHistoryButton);
    }
    
    // Populate history items
    this.updateHistoryDisplay();
  }
  
  /**
   * Update history display
   * Updates the image history with latest generated images
   */
  updateHistoryDisplay() {
    const historyItems = document.getElementById('history-items');
    if (!historyItems) return;
    
    // Clear existing items
    historyItems.innerHTML = '';
    
    // Add history items in reverse order (newest first)
    this.generationHistory.slice().reverse().forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      // Create thumbnail
      const thumbnail = document.createElement('img');
      thumbnail.src = item.imageUrl;
      thumbnail.alt = `Generated image: ${item.prompt.substring(0, 30)}...`;
      thumbnail.className = 'history-thumbnail';
      
      // Create prompt text
      const promptText = document.createElement('p');
      promptText.className = 'history-prompt';
      promptText.textContent = this.truncateText(item.prompt, 50);
      
      // Create style badge
      const styleBadge = document.createElement('span');
      styleBadge.className = 'history-style-badge';
      
      // Get style name from ID
      const styleObj = this.config.styles.find(style => style.id === item.style);
      styleBadge.textContent = styleObj ? styleObj.name : item.style;
      
      // Create timestamp
      const timestamp = document.createElement('span');
      timestamp.className = 'history-timestamp';
      timestamp.textContent = this.formatTimestamp(item.timestamp);
      
      // Add click event to load this image and prompt
      historyItem.addEventListener('click', () => {
        if (this.promptInput) {
          this.promptInput.value = item.prompt;
        }
        
        if (this.styleSelector) {
          this.styleSelector.value = item.style;
          this.styleSelector.dispatchEvent(new Event('change'));
        }
        
        if (this.imageOutput) {
          this.imageOutput.src = item.imageUrl;
          this.imageOutput.alt = `Generated image: ${item.prompt}`;
        }
        
        // Show save button
        if (this.saveImageButton) {
          this.saveImageButton.style.display = 'block';
        }
      });
      
      // Assemble history item
      historyItem.appendChild(thumbnail);
      historyItem.appendChild(promptText);
      historyItem.appendChild(styleBadge);
      historyItem.appendChild(timestamp);
      
      historyItems.appendChild(historyItem);
    });
    
    // Show "no history" message if empty
    if (this.generationHistory.length === 0) {
      const noHistory = document.createElement('p');
      noHistory.className = 'no-history';
      noHistory.textContent = 'No generation history yet. Create your first image!';
      historyItems.appendChild(noHistory);
    }
  }
  
  /**
   * Generate image
   * Processes user prompt and generates an image
   */
  async generateImage() {
    // Get prompt from input
    const prompt = this.promptInput ? this.promptInput.value.trim() : '';
    
    // Validate prompt
    if (!prompt) {
      this.showError('Please enter a prompt to generate an image.');
      return;
    }
    
    // Check prompt length
    if (prompt.length > this.config.generator.maxPromptLength) {
      this.showError(`Prompt is too long. Maximum length is ${this.config.generator.maxPromptLength} characters.`);
      return;
    }
    
    // Prevent multiple generations
    if (this.isGenerating) {
      return;
    }
    
    // Show loading indicator
    this.showLoading();
    
    // Set generating flag
    this.isGenerating = true;
    
    try {
      // Get enhanced prompt with style
      const enhancedPrompt = this.enhancePrompt(prompt);
      
      // Get negative prompt
      const negativePrompt = this.getNegativePrompt();
      
      // Get image dimensions
      const dimensions = this.getImageDimensions();
      
      // Generate image
      const imageUrl = await this.fetchGeneratedImage(enhancedPrompt, negativePrompt, dimensions);
      
      // Hide loading indicator
      this.hideLoading();
      
      // Display generated image
      if (this.imageOutput) {
        this.imageOutput.src = imageUrl;
        this.imageOutput.alt = `Generated image: ${prompt}`;
      }
      
      // Show save button
      if (this.saveImageButton) {
        this.saveImageButton.style.display = 'block';
      }
      
      // Add to history
      this.addToHistory(prompt, imageUrl);
      
      // Track analytics
      if (this.config.analytics.enabled) {
        this.trackGeneration(prompt);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Hide loading indicator
      this.hideLoading();
      
      // Show error message
      this.showError('Failed to generate image. Please try again.');
    } finally {
      // Reset generating flag
      this.isGenerating = false;
    }
  }
  
  /**
   * Enhance prompt with style modifiers
   * @param {string} prompt - The user's prompt
   * @returns {string} - Enhanced prompt with style modifiers
   */
  enhancePrompt(prompt) {
    // Get selected style
    const selectedStyleObj = this.config.styles.find(style => style.id === this.selectedStyle);
    
    // Start with base prompt
    let enhancedPrompt = prompt;
    
    // Add style modifier if available
    if (selectedStyleObj && selectedStyleObj.promptModifier) {
      enhancedPrompt += `, ${selectedStyleObj.promptModifier}`;
    }
    
    // Add prompt prefix if configured
    if (this.config.generator.promptPrefix) {
      enhancedPrompt = `${this.config.generator.promptPrefix}, ${enhancedPrompt}`;
    }
    
    return enhancedPrompt;
  }
  
  /**
   * Get negative prompt
   * @returns {string} - Negative prompt for image generation
   */
  getNegativePrompt() {
    // Get negative prompt from input if available
    const negativePromptInput = document.getElementById('negative-prompt-input');
    if (negativePromptInput && negativePromptInput.value.trim()) {
      return negativePromptInput.value.trim();
    }
    
    // Otherwise use default
    return this.config.generator.defaultNegativePrompt;
  }
  
  /**
   * Get image dimensions
   * @returns {Object} - Width and height for image generation
   */
  getImageDimensions() {
    // Get dimensions from inputs if available
    const widthInput = document.getElementById('image-width-input');
    const heightInput = document.getElementById('image-height-input');
    
    let width = this.config.generator.defaultWidth;
    let height = this.config.generator.defaultHeight;
    
    if (widthInput && widthInput.value) {
      const parsedWidth = parseInt(widthInput.value);
      if (!isNaN(parsedWidth) && parsedWidth > 0) {
        width = parsedWidth;
      }
    }
    
    if (heightInput && heightInput.value) {
      const parsedHeight = parseInt(heightInput.value);
      if (!isNaN(parsedHeight) && parsedHeight > 0) {
        height = parsedHeight;
      }
    }
    
    return { width, height };
  }
  
  /**
   * Fetch generated image from API
   * Tries multiple endpoints with fallback
   * @param {string} prompt - The enhanced prompt
   * @param {string} negativePrompt - The negative prompt
   * @param {Object} dimensions - Width and height for image generation
   * @returns {Promise<string>} - URL of generated image
   */
  async fetchGeneratedImage(prompt, negativePrompt, dimensions) {
    // Sort endpoints by priority
    const endpoints = [...this.config.api.endpoints].sort((a, b) => a.priority - b.priority);
    
    // Try each endpoint in order
    for (const endpoint of endpoints) {
      try {
        // For Pollinations.ai (which works without API key)
        if (endpoint.name === 'pollinations') {
          // Encode prompt for URL
          const encodedPrompt = encodeURIComponent(prompt);
          
          // Construct URL with parameters
          let url = `${endpoint.url}${encodedPrompt}`;
          
          // Add dimensions if specified
          if (dimensions.width && dimensions.height) {
            url += `?width=${dimensions.width}&height=${dimensions.height}`;
          }
          
          // Add nologo parameter if specified
          if (endpoint.params && endpoint.params.nologo) {
            url += url.includes('?') ? '&nologo=true' : '?nologo=true';
          }
          
          // Add timestamp to prevent caching
          url += url.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
          
          // For Pollinations, we can just return the URL directly
          return url;
        }
        
        // For other APIs, we would make actual fetch requests
        // This is a simplified example - in a real implementation,
        // you would need to handle authentication and API-specific parameters
        
        /* 
        // Example for Stability API
        if (endpoint.name === 'stability') {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              text_prompts: [
                {
                  text: prompt,
                  weight: 1
                },
                {
                  text: negativePrompt,
                  weight: -1
                }
              ],
              height: dimensions.height,
              width: dimensions.width,
              cfg_scale: 7,
              steps: 30,
              samples: 1
            }),
            signal: AbortSignal.timeout(this.config.api.timeout)
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          // Extract image data and convert to URL
          const base64Image = data.artifacts[0].base64;
          return `data:image/png;base64,${base64Image}`;
        }
        */
        
        // Fallback to local generation if API calls fail
        if (endpoint.name === 'local' && this.config.api.useLocalFallback) {
          return this.generateLocalImage(prompt, dimensions);
        }
      } catch (error) {
        console.warn(`Error with endpoint ${endpoint.name}:`, error);
        
        // Continue to next endpoint
        continue;
      }
    }
    
    // If all endpoints fail, throw error
    throw new Error('All image generation endpoints failed');
  }
  
  /**
   * Generate local image
   * Fallback when API is unavailable
   * @param {string} prompt - The enhanced prompt
   * @param {Object} dimensions - Width and height for image generation
   * @returns {Promise<string>} - URL of generated image
   */
  async generateLocalImage(prompt, dimensions) {
    // This is a fallback that creates a placeholder image with the prompt text
    // In a real implementation, you might use a local model or a more sophisticated fallback
    
    return new Promise((resolve) => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      // Get context
      const ctx = canvas.getContext('2d');
      
      // Fill background
      const gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      gradient.addColorStop(0, '#6a11cb');
      gradient.addColorStop(1, '#2575fc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text
      const maxWidth = dimensions.width - 40;
      const lineHeight = 30;
      const words = prompt.split(' ');
      let line = '';
      let lines = [];
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
          lines.push(line);
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      // Limit to 5 lines
      if (lines.length > 5) {
        lines = lines.slice(0, 4);
        lines.push('...');
      }
      
      // Draw text
      const startY = dimensions.height / 2 - (lines.length * lineHeight) / 2;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], dimensions.width / 2, startY + i * lineHeight);
      }
      
      // Add watermark
      ctx.font = '14px Arial';
      ctx.fillText('Valleytainment Image Generator', dimensions.width / 2, dimensions.height - 20);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Simulate delay
      setTimeout(() => {
        resolve(dataUrl);
      }, 1500);
    });
  }
  
  /**
   * Show loading indicator
   */
  showLoading() {
    if (!this.loadingIndicator || !this.config.ui.showLoadingAnimation) return;
    
    // Show loading indicator
    this.loadingIndicator.style.display = 'flex';
    
    // Update loading text if element exists
    const loadingText = this.loadingIndicator.querySelector('.loading-text');
    if (loadingText && this.config.ui.loadingText) {
      loadingText.textContent = this.config.ui.loadingText;
    }
    
    // Hide error message
    if (this.errorMessage) {
      this.errorMessage.style.display = 'none';
    }
  }
  
  /**
   * Hide loading indicator
   */
  hideLoading() {
    if (!this.loadingIndicator) return;
    
    // Hide loading indicator
    this.loadingIndicator.style.display = 'none';
  }
  
  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    if (!this.errorMessage) return;
    
    // Show error message
    this.errorMessage.style.display = 'block';
    this.errorMessage.textContent = message || this.config.ui.errorText;
    
    // Hide after 5 seconds
    setTimeout(() => {
      this.errorMessage.style.display = 'none';
    }, 5000);
  }
  
  /**
   * Add to history
   * @param {string} prompt - The user's prompt
   * @param {string} imageUrl - URL of generated image
   */
  addToHistory(prompt, imageUrl) {
    // Create history item
    const historyItem = {
      prompt,
      imageUrl,
      style: this.selectedStyle,
      timestamp: new Date().toISOString()
    };
    
    // Add to history
    this.generationHistory.unshift(historyItem);
    
    // Limit history length
    if (this.generationHistory.length > this.config.generator.maxHistoryItems) {
      this.generationHistory = this.generationHistory.slice(0, this.config.generator.maxHistoryItems);
    }
    
    // Save history
    this.saveGenerationHistory();
    
    // Update history display
    this.updateHistoryDisplay();
  }
  
  /**
   * Save generation history to localStorage
   */
  saveGenerationHistory() {
    localStorage.setItem('valleytainment_image_history', JSON.stringify(this.generationHistory));
  }
  
  /**
   * Load generation history from localStorage
   */
  loadGenerationHistory() {
    const savedHistory = localStorage.getItem('valleytainment_image_history');
    
    if (savedHistory) {
      try {
        this.generationHistory = JSON.parse(savedHistory);
      } catch (error) {
        console.error('Error parsing generation history:', error);
        this.generationHistory = [];
      }
    } else {
      this.generationHistory = [];
    }
  }
  
  /**
   * Clear generation history
   */
  clearGenerationHistory() {
    // Clear history
    this.generationHistory = [];
    
    // Clear localStorage
    localStorage.removeItem('valleytainment_image_history');
    
    // Update history display
    this.updateHistoryDisplay();
  }
  
  /**
   * Save generated image
   * Allows user to download the current image
   */
  saveGeneratedImage() {
    if (!this.imageOutput || !this.config.generator.saveGeneratedImages) return;
    
    // Get image source
    const imageUrl = this.imageOutput.src;
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `valleytainment-image-${Date.now()}.png`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
  
  /**
   * Track generation for analytics
   * @param {string} prompt - The user's prompt
   */
  trackGeneration(prompt) {
    // Increment total generations
    this.analytics.totalGenerations++;
    
    // Update last generation time
    this.analytics.lastGenerationTime = new Date();
    
    // Track popular prompts
    if (this.config.analytics.trackPrompts) {
      // Simplify prompt for tracking
      const simplifiedPrompt = prompt.toLowerCase().trim();
      
      // Update count
      if (this.analytics.popularPrompts[simplifiedPrompt]) {
        this.analytics.popularPrompts[simplifiedPrompt]++;
      } else {
        this.analytics.popularPrompts[simplifiedPrompt] = 1;
      }
    }
    
    // Track popular styles
    if (this.config.analytics.trackStyles) {
      // Update count
      if (this.analytics.popularStyles[this.selectedStyle]) {
        this.analytics.popularStyles[this.selectedStyle]++;
      } else {
        this.analytics.popularStyles[this.selectedStyle] = 1;
      }
    }
    
    // Save analytics data
    this.saveAnalytics();
  }
  
  /**
   * Save analytics data to localStorage
   */
  saveAnalytics() {
    if (!this.config.analytics.enabled) return;
    
    localStorage.setItem(this.config.analytics.storageKey, JSON.stringify(this.analytics));
  }
  
  /**
   * Load analytics data from localStorage
   */
  loadAnalytics() {
    if (!this.config.analytics.enabled) return;
    
    const savedAnalytics = localStorage.getItem(this.config.analytics.storageKey);
    
    if (savedAnalytics) {
      try {
        this.analytics = JSON.parse(savedAnalytics);
        
        // Update session start time
        this.analytics.sessionStartTime = new Date();
      } catch (error) {
        console.error('Error parsing analytics data:', error);
      }
    }
  }
  
  /**
   * Format timestamp
   * @param {string} isoString - ISO timestamp string
   * @returns {string} - Formatted timestamp
   */
  formatTimestamp(isoString) {
    const date = new Date(isoString);
    
    // Format as relative time if less than 24 hours ago
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      } else {
        const hours = Math.floor(diffHours);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }
    } else {
      // Format as date
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  }
  
  /**
   * Truncate text
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated text
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength) + '...';
  }
}

// Export ValleyImageGenerator class for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValleyImageGenerator;
}
