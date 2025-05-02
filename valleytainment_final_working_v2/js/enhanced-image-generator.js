/**
 * Enhanced Image Generator for Valleytainment Productions Website
 * This file implements an AI-powered image generator with multiple style options
 * 
 * @version 1.0.0
 * @author Valleytainment Productions
 */

// Image generator configuration - Edit these to change the appearance and behavior
const imageGeneratorConfig = {
  containerSelector: '#image-gen-section .image-generator', // CSS selector for the container element
  defaultStyle: 'realistic',             // Default style to use
  defaultSize: 'medium',                 // Default size to use
  maxHistory: 10,                        // Maximum number of images to store in history
  placeholderText: 'Your generated image will appear here', // Text to show in placeholder
  suggestedPrompts: [                    // Suggested prompts for users
    "Neon city skyline at night",
    "Monster character with glowing eyes",
    "Abstract music visualization",
    "Urban street art with vibrant colors",
    "Futuristic entertainment stage"
  ],
  theme: {
    primaryColor: "#ff00aa",             // Hot pink - edit to match your brand colors
    secondaryColor: "#3eff00",           // Neon green - edit to match your brand colors
    accentColor: "#00ffff",              // Cyan blue - edit to match your brand colors
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Background color for the generator
    textColor: "#ffffff"                 // Text color
  }
};

// Style options configuration - Edit to change available styles
const STYLE_PROMPTS = {
  realistic: "ultra realistic, highly detailed, 8k, photorealistic",
  cartoon: "cartoon style, vibrant colors, cel shaded, illustration",
  abstract: "abstract art, colorful shapes, non-representational, modern art",
  neon: "neon lights, cyberpunk, glowing, dark background, synthwave",
  cyberpunk: "cyberpunk, futuristic, dystopian, high tech, low life, blade runner style",
  anime: "anime style, manga illustration, japanese animation, detailed, vibrant",
  painting: "oil painting, textured canvas, detailed brushstrokes, artistic",
  sketch: "pencil sketch, hand-drawn, detailed linework, shading",
  watercolor: "watercolor painting, soft colors, flowing pigment, artistic",
  retro: "retro 80s style, vintage, vaporwave aesthetic, nostalgic"
};

// Size options configuration - Edit to change available sizes
const SIZE_DIMENSIONS = {
  small: { width: 512, height: 512 },
  medium: { width: 768, height: 512 },
  large: { width: 1024, height: 576 }
};

// API configuration - Advanced settings for image generation
const apiConfig = {
  // Primary API for image generation
  primary: {
    endpoint: "https://image.pollinations.ai/prompt/",
    parameterFormat: "%width%x%height%/%prompt%",
    rateLimit: 5, // requests per minute
    requiresKey: false
  },
  // Fallback API if primary fails
  fallback: {
    endpoint: "https://source.unsplash.com/random/",
    parameterFormat: "%width%x%height%/?%prompt%",
    rateLimit: 10, // requests per minute
    requiresKey: false
  },
  // Local fallback if both APIs fail
  localFallback: {
    enabled: true,
    useRandomPlaceholders: true,
    placeholderCount: 5 // Number of placeholder images to cycle through
  }
};

// Initialize variables
let imageHistory = [];
let isGenerating = false;
let imageGeneratorInitialized = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.readyState==='loading') {document.addEventListener('DOMContentLoaded', initImageGenerator);} else {initImageGenerator();}
});

/**
 * Initialize the image generator UI and functionality
 */
function initImageGenerator() {
  if (imageGeneratorInitialized) return;
  
  // Get container element
  const container = document.querySelector(imageGeneratorConfig.containerSelector);
  
  if (!container) {
    console.error('Image generator container not found');
    return;
  }
  
  // Create image generator UI
  createImageGeneratorUI(container);
  
  // Load image history from localStorage if available
  loadImageHistory();
  
  // Add event listeners
  addImageGeneratorEventListeners();
  
  imageGeneratorInitialized = true;
}

/**
 * Create the image generator UI elements
 */
function createImageGeneratorUI(container) {
  // Create controls section
  const controlsSection = document.createElement('div');
  controlsSection.className = 'image-generator-controls';
  
  // Create prompt input
  const promptSection = document.createElement('div');
  promptSection.className = 'image-generator-prompt';
  promptSection.innerHTML = `
    <input type="text" class="image-generator-input" placeholder="Describe what you want to see...">
    <button class="image-generator-button">
      <i class="fas fa-magic"></i> Generate
    </button>
  `;
  
  // Create options section
  const optionsSection = document.createElement('div');
  optionsSection.className = 'image-generator-options';
  
  // Create style selector
  const styleGroup = document.createElement('div');
  styleGroup.className = 'image-generator-option-group';
  styleGroup.innerHTML = `
    <label for="image-style">Style</label>
    <select id="image-style" class="image-generator-style">
      ${Object.keys(STYLE_PROMPTS).map(style => 
        `<option value="${style}"${style === imageGeneratorConfig.defaultStyle ? ' selected' : ''}>${capitalizeFirstLetter(style)}</option>`
      ).join('')}
    </select>
  `;
  
  // Create size selector
  const sizeGroup = document.createElement('div');
  sizeGroup.className = 'image-generator-option-group';
  sizeGroup.innerHTML = `
    <label for="image-size">Size</label>
    <select id="image-size" class="image-generator-size">
      ${Object.keys(SIZE_DIMENSIONS).map(size => 
        `<option value="${size}"${size === imageGeneratorConfig.defaultSize ? ' selected' : ''}>${capitalizeFirstLetter(size)} (${SIZE_DIMENSIONS[size].width}x${SIZE_DIMENSIONS[size].height})</option>`
      ).join('')}
    </select>
  `;
  
  // Add options to options section
  optionsSection.appendChild(styleGroup);
  optionsSection.appendChild(sizeGroup);
  
  // Add sections to controls
  controlsSection.appendChild(promptSection);
  controlsSection.appendChild(optionsSection);
  
  // Create result section
  const resultSection = document.createElement('div');
  resultSection.className = 'image-generator-result';
  resultSection.innerHTML = `
    <div class="image-generator-placeholder">
      <i class="fas fa-image"></i>
      <p>${imageGeneratorConfig.placeholderText}</p>
    </div>
  `;
  
  // Create suggestions section
  const suggestionsSection = document.createElement('div');
  suggestionsSection.className = 'image-generator-suggestions';
  suggestionsSection.innerHTML = `
    <h4>Try these prompts:</h4>
    <div class="image-generator-suggestion-chips">
      ${imageGeneratorConfig.suggestedPrompts.map(prompt => 
        `<div class="image-generator-suggestion-chip">${prompt}</div>`
      ).join('')}
    </div>
  `;
  
  // Add all sections to container
  container.appendChild(controlsSection);
  container.appendChild(resultSection);
  container.appendChild(suggestionsSection);
  
  // Apply theme colors
  applyThemeColors();
}

/**
 * Apply theme colors to image generator elements
 */
function applyThemeColors() {
  const style = document.createElement('style');
  style.textContent = `
    .image-generator {
      background-color: ${imageGeneratorConfig.theme.backgroundColor};
    }
    .image-generator-button {
      background-color: ${imageGeneratorConfig.theme.primaryColor};
      color: ${imageGeneratorConfig.theme.textColor};
    }
    .image-generator-button:hover {
      background-color: ${imageGeneratorConfig.theme.secondaryColor};
    }
    .image-generator-spinner {
      border-top-color: ${imageGeneratorConfig.theme.primaryColor};
    }
    .image-generator-suggestion-chip:hover {
      background-color: ${imageGeneratorConfig.theme.primaryColor};
    }
    .image-generator-action:hover {
      background-color: ${imageGeneratorConfig.theme.primaryColor};
    }
  `;
  document.head.appendChild(style);
}

/**
 * Add event listeners to image generator elements
 */
function addImageGeneratorEventListeners() {
  const container = document.querySelector(imageGeneratorConfig.containerSelector);
  const generateButton = container.querySelector('.image-generator-button');
  const promptInput = container.querySelector('.image-generator-input');
  const suggestionChips = container.querySelectorAll('.image-generator-suggestion-chip');
  
  // Generate image on button click
  generateButton.addEventListener('click', () => {
    generateImage();
  });
  
  // Generate image on Enter key in input
  promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      generateImage();
    }
  });
  
  // Use suggested prompts
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      promptInput.value = chip.textContent;
      generateImage();
    });
  });
}

/**
 * Generate image based on user input
 */
function generateImage() {
  const container = document.querySelector(imageGeneratorConfig.containerSelector);
  const promptInput = container.querySelector('.image-generator-input');
  const styleSelect = container.querySelector('.image-generator-style');
  const sizeSelect = container.querySelector('.image-generator-size');
  
  // Get user input
  const userPrompt = promptInput.value.trim();
  const selectedStyle = styleSelect.value;
  const selectedSize = sizeSelect.value;
  
  // Validate input
  if (userPrompt === '') {
    showError('Please enter a description of what you want to see');
    return;
  }
  
  // Check if already generating
  if (isGenerating) {
    showError('Please wait for the current image to finish generating');
    return;
  }
  
  // Show loading indicator
  showLoadingIndicator();
  
  // Generate image
  generateImageFromPrompt(userPrompt, selectedStyle, selectedSize)
    .then(imageUrl => {
      // Display generated image
      displayGeneratedImage(imageUrl, userPrompt, selectedStyle, selectedSize);
    })
    .catch(error => {
      console.error('Error generating image:', error);
      showError('Failed to generate image. Please try again.');
    })
    .finally(() => {
      // Hide loading indicator
      hideLoadingIndicator();
    });
}

/**
 * Generate image from prompt using API
 */
async function generateImageFromPrompt(prompt, style, size) {
  isGenerating = true;
  
  try {
    // Enhance prompt with style
    const enhancedPrompt = enhancePrompt(prompt, style);
    
    // Get size dimensions
    const dimensions = SIZE_DIMENSIONS[size];
    
    // Try primary API first
    try {
      const imageUrl = await callImageAPI(
        apiConfig.primary,
        enhancedPrompt,
        dimensions.width,
        dimensions.height
      );
      return imageUrl;
    } catch (primaryError) {
      console.error('Primary API failed:', primaryError);
      
      // Try fallback API
      try {
        const fallbackUrl = await callImageAPI(
          apiConfig.fallback,
          enhancedPrompt,
          dimensions.width,
          dimensions.height
        );
        return fallbackUrl;
      } catch (fallbackError) {
        console.error('Fallback API failed:', fallbackError);
        
        // Use local fallback if enabled
        if (apiConfig.localFallback.enabled) {
          return getLocalFallbackImage(prompt, dimensions);
        }
        
        throw new Error('All image generation methods failed');
      }
    }
  } finally {
    isGenerating = false;
  }
}

/**
 * Call image generation API
 */
async function callImageAPI(api, prompt, width, height) {
  // Format parameters according to API requirements
  const formattedParams = api.parameterFormat
    .replace('%width%', width)
    .replace('%height%', height)
    .replace('%prompt%', encodeURIComponent(prompt));
  
  // Construct URL
  const apiUrl = api.endpoint + formattedParams;
  
  // In a real implementation, this would make an API call
  // For this implementation, we'll simulate a delay and return the URL
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return apiUrl;
}

/**
 * Get local fallback image when APIs fail
 */
function getLocalFallbackImage(prompt, dimensions) {
  if (apiConfig.localFallback.useRandomPlaceholders) {
    // Generate a random placeholder image
    const placeholderIndex = Math.floor(Math.random() * apiConfig.localFallback.placeholderCount) + 1;
    return `images/placeholder-${placeholderIndex}.jpg`;
  }
  
  // Use a generic placeholder
  return `https://via.placeholder.com/${dimensions.width}x${dimensions.height}/1a1a1a/ff00aa?text=Image+Generation+Failed`;
}

/**
 * Enhance prompt with style keywords
 */
function enhancePrompt(prompt, style) {
  // Get style keywords
  const styleKeywords = STYLE_PROMPTS[style] || '';
  
  // Combine user prompt with style keywords
  return `${prompt}, ${styleKeywords}`;
}

/**
 * Display generated image in the result container
 */
function displayGeneratedImage(imageUrl, prompt, style, size) {
  const resultContainer = document.querySelector('.image-generator-result');
  
  // Clear previous content
  resultContainer.innerHTML = '';
  
  // Create image element
  const imageElement = document.createElement('img');
  imageElement.className = 'image-generator-image';
  imageElement.src = imageUrl;
  imageElement.alt = prompt;
  
  // Add image to container
  resultContainer.appendChild(imageElement);
  
  // Create actions bar
  const actionsBar = document.createElement('div');
  actionsBar.className = 'image-generator-actions';
  actionsBar.innerHTML = `
    <button class="image-generator-action download-action">
      <i class="fas fa-download"></i> Download
    </button>
    <button class="image-generator-action regenerate-action">
      <i class="fas fa-redo"></i> Regenerate
    </button>
  `;
  
  // Add actions bar to container
  resultContainer.appendChild(actionsBar);
  
  // Add event listeners to actions
  const downloadButton = actionsBar.querySelector('.download-action');
  const regenerateButton = actionsBar.querySelector('.regenerate-action');
  
  downloadButton.addEventListener('click', () => {
    downloadImage(imageUrl, `valleytainment-${prompt.substring(0, 20).replace(/\s+/g, '-')}`);
  });
  
  regenerateButton.addEventListener('click', () => {
    generateImage();
  });
  
  // Add to history
  addToImageHistory(imageUrl, prompt, style, size);
}

/**
 * Download generated image
 */
function downloadImage(imageUrl, filename) {
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
  const resultContainer = document.querySelector('.image-generator-result');
  
  // Create loading overlay
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'image-generator-loading';
  loadingOverlay.innerHTML = `
    <div class="image-generator-spinner"></div>
    <p class="image-generator-loading-text">Generating your image...</p>
  `;
  
  // Add to container
  resultContainer.appendChild(loadingOverlay);
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
  const loadingOverlay = document.querySelector('.image-generator-loading');
  
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

/**
 * Show error message
 */
function showError(message) {
  // Create error toast
  const errorToast = document.createElement('div');
  errorToast.className = 'image-generator-error';
  errorToast.textContent = message;
  
  // Add to body
  document.body.appendChild(errorToast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    errorToast.remove();
  }, 3000);
}

/**
 * Add generated image to history
 */
function addToImageHistory(imageUrl, prompt, style, size) {
  // Create history item
  const historyItem = {
    imageUrl,
    prompt,
    style,
    size,
    timestamp: new Date().toISOString()
  };
  
  // Add to history array
  imageHistory.unshift(historyItem);
  
  // Limit history size
  if (imageHistory.length > imageGeneratorConfig.maxHistory) {
    imageHistory.pop();
  }
  
  // Save to localStorage
  saveImageHistory();
}

/**
 * Save image history to localStorage
 */
function saveImageHistory() {
  try {
    localStorage.setItem('valleytainment_image_history', JSON.stringify(imageHistory));
  } catch (error) {
    console.error('Error saving image history:', error);
  }
}

/**
 * Load image history from localStorage
 */
function loadImageHistory() {
  try {
    const savedHistory = localStorage.getItem('valleytainment_image_history');
    
    if (savedHistory) {
      imageHistory = JSON.parse(savedHistory);
    }
  } catch (error) {
    console.error('Error loading image history:', error);
    imageHistory = [];
  }
}

/**
 * Utility function to capitalize first letter of a string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Export functions for external access
 */
window.valleytainmentImageGenerator = {
  init: initImageGenerator,
  generate: (prompt, style, size) => {
    const container = document.querySelector(imageGeneratorConfig.containerSelector);
    const promptInput = container.querySelector('.image-generator-input');
    const styleSelect = container.querySelector('.image-generator-style');
    const sizeSelect = container.querySelector('.image-generator-size');
    
    // Set values
    promptInput.value = prompt;
    if (style && Object.keys(STYLE_PROMPTS).includes(style)) {
      styleSelect.value = style;
    }
    if (size && Object.keys(SIZE_DIMENSIONS).includes(size)) {
      sizeSelect.value = size;
    }
    
    // Generate image
    generateImage();
  }
};
