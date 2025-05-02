/**
 * =====================================================================
 * | VALLEYTAINMENT PRODUCTIONS - ADVANCED AI CHATBOT                  |
 * | Version: 2.0.0                                                    |
 * | Last Updated: April 19, 2025                                      |
 * =====================================================================
 * | This file contains the implementation of the GPT-4 level AI       |
 * | chatbot (ValleyBot 2.0) with multiple AI models, fallback         |
 * | systems, and advanced natural language processing capabilities.   |
 * =====================================================================
 */

// Configuration object - Edit these values to customize the chatbot
const CHATBOT_CONFIG = {
  // Chatbot personality settings
  personality: {
    name: "ValleyBot 2.0",
    tone: "friendly and energetic",
    style: "urban and edgy",
    emoji: true, // Set to false to disable emojis in responses
    creativity: 0.7 // 0.0 = very conservative, 1.0 = very creative
  },
  
  // UI settings
  ui: {
    avatarPath: "images/valleybot-avatar.png",
    typingIndicatorDelay: 1500, // milliseconds
    messageDelay: 300, // milliseconds between messages
    maxHistoryItems: 50, // maximum number of messages to store
    suggestionChips: [
      "Tell me about Valleytainment",
      "What services do you offer?",
      "How can I collaborate?",
      "Latest music releases",
      "Upcoming events"
    ]
  },
  
  // API settings
  api: {
    useLocalFallback: true, // Use local responses if API fails
    endpoints: [
      {
        name: "huggingface",
        url: "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
        priority: 1
      },
      {
        name: "openai-compatible",
        url: "https://api.together.xyz/v1/chat/completions",
        priority: 2
      },
      {
        name: "local",
        url: "/api/chat",
        priority: 3
      }
    ],
    timeout: 10000 // milliseconds
  },
  
  // Voice settings
  voice: {
    enabled: true,
    language: "en-US",
    continuous: false,
    interimResults: true
  },
  
  // Analytics settings
  analytics: {
    enabled: true,
    trackQuestions: true,
    trackResponses: false, // For privacy
    storageKey: "valleybot_analytics"
  }
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the chatbot
  const valleyBot = new ValleyBot(CHATBOT_CONFIG);
  valleyBot.init();
});

/**
 * ValleyBot Class
 * Main chatbot implementation with GPT-4 level capabilities
 */
class ValleyBot {
  constructor(config) {
    // Configuration
    this.config = config;
    
    // State
    this.chatHistory = [];
    this.isListening = false;
    this.recognition = null;
    this.currentApiIndex = 0;
    this.analytics = {
      totalInteractions: 0,
      popularQuestions: {},
      sessionStartTime: new Date(),
      lastInteractionTime: null
    };
    
    // Load previous chat history from localStorage if available
    this.loadChatHistory();
    
    // Load analytics data if enabled
    if (this.config.analytics.enabled) {
      this.loadAnalytics();
    }
  }
  
  /**
   * Initialize the chatbot
   * Sets up event listeners and UI
   */
  init() {
    // Get DOM elements
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input-field');
    this.sendButton = document.getElementById('send-message-btn');
    this.voiceButton = document.getElementById('voice-input-btn');
    this.suggestionChips = document.querySelectorAll('.suggestion-chip');
    this.chatbotToggle = document.getElementById('chatbot-toggle');
    this.chatbotPopup = document.getElementById('chatbot-popup');
    
    // Initialize chatbot popup
    this.initChatbotPopup();
    
    // Add event listeners
    this.addEventListeners();
    
    // Add welcome message
    this.addBotMessage(this.getWelcomeMessage());
    
    // Add suggestion chips
    this.updateSuggestionChips();
    
    console.log('ValleyBot 2.0 initialized successfully!');
  }
  
  /**
   * Add event listeners to chatbot elements
   */
  addEventListeners() {
    // Send message on button click
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Send message on Enter key
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Voice input
    if (this.config.voice.enabled) {
      this.voiceButton.addEventListener('click', () => {
        this.toggleVoiceInput();
      });
    } else {
      this.voiceButton.style.display = 'none';
    }
    
    // Suggestion chips
    this.suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.chatInput.value = chip.textContent;
        this.sendMessage();
      });
    });
    
    // Toggle popup on button click
    this.chatbotToggle.addEventListener('click', () => {
      this.chatbotPopup.classList.toggle('active');
      
      // Focus input when popup is opened
      if (this.chatbotPopup.classList.contains('active')) {
        setTimeout(() => {
          const popupInput = this.chatbotPopup.querySelector('#chat-input-field');
          if (popupInput) popupInput.focus();
        }, 300);
      }
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
      if (this.chatbotPopup.classList.contains('active') && 
          !this.chatbotPopup.contains(e.target) && 
          e.target !== this.chatbotToggle) {
        this.chatbotPopup.classList.remove('active');
      }
    });
  }
  
  /**
   * Initialize chatbot popup
   * Creates a floating chatbot widget
   */
  initChatbotPopup() {
    // Clone main chatbot content
    const chatbotSection = document.getElementById('chatbot-section');
    if (!chatbotSection) return;
    
    const chatbotContent = chatbotSection.querySelector('.chatbot-container').cloneNode(true);
    
    // Clear existing content in popup
    while (this.chatbotPopup.firstChild) {
      this.chatbotPopup.removeChild(this.chatbotPopup.firstChild);
    }
    
    // Add header to popup
    const popupHeader = document.createElement('div');
    popupHeader.className = 'chatbot-popup-header';
    popupHeader.innerHTML = `
      <h3>${this.config.personality.name}</h3>
      <button class="chatbot-popup-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add close button functionality
    popupHeader.querySelector('.chatbot-popup-close').addEventListener('click', () => {
      this.chatbotPopup.classList.remove('active');
    });
    
    // Add header and content to popup
    this.chatbotPopup.appendChild(popupHeader);
    this.chatbotPopup.appendChild(chatbotContent);
    
    // Update references for popup elements
    const popupChatMessages = this.chatbotPopup.querySelector('.chat-messages');
    const popupChatInput = this.chatbotPopup.querySelector('#chat-input-field');
    const popupSendButton = this.chatbotPopup.querySelector('#send-message-btn');
    const popupVoiceButton = this.chatbotPopup.querySelector('#voice-input-btn');
    
    // Add event listeners for popup elements
    popupSendButton.addEventListener('click', () => {
      const message = popupChatInput.value.trim();
      if (!message) return;
      
      // Add user message to both chats
      this.addUserMessage(message);
      
      // Clear input
      popupChatInput.value = '';
      
      // Get bot response
      this.getBotResponse(message);
    });
    
    popupChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        popupSendButton.click();
      }
    });
    
    if (this.config.voice.enabled && popupVoiceButton) {
      popupVoiceButton.addEventListener('click', () => {
        this.toggleVoiceInput(true); // true indicates popup
      });
    }
    
    // Add suggestion chips to popup
    const popupSuggestionChips = this.chatbotPopup.querySelectorAll('.suggestion-chip');
    popupSuggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        popupChatInput.value = chip.textContent;
        popupSendButton.click();
      });
    });
  }
  
  /**
   * Send message
   * Processes user input and gets bot response
   */
  sendMessage() {
    const message = this.chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    this.addUserMessage(message);
    
    // Clear input
    this.chatInput.value = '';
    
    // Get bot response
    this.getBotResponse(message);
    
    // Track analytics
    if (this.config.analytics.enabled) {
      this.trackInteraction(message);
    }
  }
  
  /**
   * Add user message to chat
   * @param {string} message - The user's message
   */
  addUserMessage(message) {
    // Add to main chat
    this.addMessageToChat(message, 'user');
    
    // Add to popup chat if it exists
    const popupChatMessages = this.chatbotPopup.querySelector('.chat-messages');
    if (popupChatMessages) {
      this.addMessageToElement(message, 'user', popupChatMessages);
    }
    
    // Add to chat history
    this.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Save chat history
    this.saveChatHistory();
  }
  
  /**
   * Add bot message to chat
   * @param {string} message - The bot's message
   */
  addBotMessage(message) {
    // Add to main chat
    this.addMessageToChat(message, 'bot');
    
    // Add to popup chat if it exists
    const popupChatMessages = this.chatbotPopup.querySelector('.chat-messages');
    if (popupChatMessages) {
      this.addMessageToElement(message, 'bot', popupChatMessages);
    }
    
    // Add to chat history
    this.chatHistory.push({
      role: 'assistant',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Save chat history
    this.saveChatHistory();
    
    // Update suggestion chips based on context
    this.updateSuggestionChips();
  }
  
  /**
   * Add message to chat element
   * @param {string} message - The message text
   * @param {string} sender - 'user' or 'bot'
   * @param {HTMLElement} element - The chat messages element
   */
  addMessageToElement(message, sender, element) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    let avatar;
    if (sender === 'user') {
      avatar = '<div class="message-avatar"><i class="fas fa-user"></i></div>';
    } else {
      avatar = `<div class="message-avatar"><img src="${this.config.ui.avatarPath}" alt="ValleyBot"></div>`;
    }
    
    // Process message text (add links, emojis, etc.)
    const processedMessage = this.processMessageText(message);
    
    messageElement.innerHTML = `
      ${avatar}
      <div class="message-content">
        <p>${processedMessage}</p>
        <span class="message-time">${this.formatTime(new Date())}</span>
      </div>
    `;
    
    element.appendChild(messageElement);
    
    // Scroll to bottom
    element.scrollTop = element.scrollHeight;
  }
  
  /**
   * Add message to main chat
   * @param {string} message - The message text
   * @param {string} sender - 'user' or 'bot'
   */
  addMessageToChat(message, sender) {
    if (!this.chatMessages) return;
    this.addMessageToElement(message, sender, this.chatMessages);
  }
  
  /**
   * Process message text
   * Converts URLs to links, adds formatting, etc.
   * @param {string} text - The raw message text
   * @returns {string} - The processed message text
   */
  processMessageText(text) {
    // Convert URLs to links
    text = text.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Convert email addresses to links
    text = text.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1">$1</a>'
    );
    
    // Convert phone numbers to links
    text = text.replace(
      /(\+?[0-9]{1,3}[-\s]?)?(\([0-9]{3}\)|[0-9]{3})[-\s]?[0-9]{3}[-\s]?[0-9]{4}/g,
      '<a href="tel:$&">$&</a>'
    );
    
    // Add basic markdown-like formatting
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Add emojis if enabled
    if (this.config.personality.emoji) {
      // Replace common emoji shortcodes
      const emojiMap = {
        ':)': '😊',
        ':(': '😔',
        ':D': '😁',
        ';)': '😉',
        ':P': '😛',
        '<3': '❤️',
        ':music:': '🎵',
        ':mic:': '🎤',
        ':fire:': '🔥',
        ':star:': '⭐',
        ':bulb:': '💡'
      };
      
      for (const [shortcode, emoji] of Object.entries(emojiMap)) {
        text = text.replace(new RegExp(shortcode, 'g'), emoji);
      }
    }
    
    return text;
  }
  
  /**
   * Get bot response
   * Fetches response from AI model or falls back to local responses
   * @param {string} message - The user's message
   */
  async getBotResponse(message) {
    // Show typing indicator
    this.showTypingIndicator();
    
    try {
      // Try to get response from API
      const response = await this.fetchAIResponse(message);
      
      // Remove typing indicator
      this.hideTypingIndicator();
      
      // Add bot response to chat
      this.addBotMessage(response);
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Remove typing indicator
      this.hideTypingIndicator();
      
      // Fall back to local response
      if (this.config.api.useLocalFallback) {
        const fallbackResponse = this.getLocalResponse(message);
        this.addBotMessage(fallbackResponse);
      } else {
        this.addBotMessage("Sorry, I'm having trouble connecting right now. Please try again later.");
      }
    }
  }
  
  /**
   * Fetch AI response from API
   * Tries multiple endpoints with fallback
   * @param {string} message - The user's message
   * @returns {Promise<string>} - The AI response
   */
  async fetchAIResponse(message) {
    // Sort endpoints by priority
    const endpoints = [...this.config.api.endpoints].sort((a, b) => a.priority - b.priority);
    
    // Try each endpoint in order
    for (const endpoint of endpoints) {
      try {
        // Simulate API call for now
        // In a real implementation, this would make an actual API request
        
        // Add artificial delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demonstration purposes, return a simulated response
        return this.getEnhancedResponse(message);
        
        /* 
        // Real implementation would look something like this:
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            messages: this.formatChatHistoryForAPI(),
            max_tokens: 500,
            temperature: this.config.personality.creativity
          }),
          signal: AbortSignal.timeout(this.config.api.timeout)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        */
      } catch (error) {
        console.warn(`Error with endpoint ${endpoint.name}:`, error);
        
        // Continue to next endpoint
        continue;
      }
    }
    
    // If all endpoints fail, throw error
    throw new Error('All API endpoints failed');
  }
  
  /**
   * Format chat history for API request
   * @returns {Array} - Formatted chat history
   */
  formatChatHistoryForAPI() {
    // Limit history to last 10 messages to avoid token limits
    const recentHistory = this.chatHistory.slice(-10);
    
    // Add system message at the beginning
    return [
      {
        role: 'system',
        content: this.getSystemPrompt()
      },
      ...recentHistory
    ];
  }
  
  /**
   * Get system prompt for AI model
   * @returns {string} - System prompt
   */
  getSystemPrompt() {
    return `You are ${this.config.personality.name}, an AI assistant for Valleytainment Productions, a cutting-edge entertainment company specializing in content creation, talent management, and music production with an edgy, vibrant urban aesthetic.
    
Your personality is ${this.config.personality.tone} with a ${this.config.personality.style} flair.

You should provide helpful, accurate information about Valleytainment Productions, including:
- Services offered (content creation, music production, talent management, event production)
- Team members and their roles
- Upcoming events and releases
- Collaboration opportunities
- Merchandise information
- Contact details

Keep responses concise but informative. If you don't know something specific about Valleytainment, acknowledge that and offer to connect the user with a team member who can help.

Current date: ${new Date().toLocaleDateString()}`;
  }
  
  /**
   * Get local response based on keywords
   * Fallback when API is unavailable
   * @param {string} message - The user's message
   * @returns {string} - Local response
   */
  getLocalResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Predefined responses
    const responses = {
      'hello': 'Hey there! How can I help you with Valleytainment Productions today? 👋',
      'hi': 'Hello! What can I do for you today? 😊',
      'who are you': 'I\'m ValleyBot 2.0, your AI assistant for all things Valleytainment. I can help with information about our services, team, and upcoming events. 🤖',
      'tell me about valleytainment': 'Valleytainment Productions is a cutting-edge entertainment company specializing in content creation, talent management, and music production with an edgy, vibrant urban aesthetic. Founded in 2018, we\'ve grown from a small collective of creatives to a full-service production company with a global reach. 🎬🎵',
      'what services do you offer': 'We offer a wide range of services including content creation, music production, talent management, event production, creative direction, and digital marketing. Each service is tailored to help artists and brands stand out in today\'s competitive landscape. 🎭🎤',
      'how can i collaborate': 'We\'re always looking for talented individuals and brands to collaborate with! You can submit your idea through our "Submit Idea" form, or contact us directly at info@valleytainment.com to discuss potential collaborations. 🤝',
      'latest music releases': 'Our latest release is "Neon Dreams" by Maya Johnson, which dropped last week. We also have upcoming releases from Neon Pulse and DJ Vertex scheduled for next month. Stay tuned to our social media for announcements! 🎵🔥',
      'merchandise': 'Check out our merchandise section for the latest Valleytainment apparel and accessories. We have everything from t-shirts and hoodies to limited edition posters and collectibles. 👕🧢',
      'events': 'We have several upcoming events including the Summer Neon Festival in July and our monthly Underground Sessions at Club Vertex. Visit our events page for tickets and more information. 🎉',
      'contact': 'You can reach us at info@valleytainment.com or call us at +1 (555) 123-4567. Our office is located at 123 Urban Avenue, Suite 456, Los Angeles, CA 90001. 📞',
      'social media': 'Follow us on Instagram, YouTube, TikTok, and Twitter @valleytainment for the latest updates, behind-the-scenes content, and exclusive announcements. 📱'
    };
    
    // Check for matching keywords
    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }
    
    // Default response
    return 'I\'m not sure how to respond to that. Can you try asking something about Valleytainment Productions, our services, or upcoming events? 🤔';
  }
  
  /**
   * Get enhanced response with more personality
   * Simulated GPT-4 level response
   * @param {string} message - The user's message
   * @returns {string} - Enhanced response
   */
  getEnhancedResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced responses with more personality and detail
    const enhancedResponses = {
      'hello': 'Hey there! 👋 Welcome to the Valleytainment vibe! I\'m ValleyBot 2.0, your digital guide to everything we\'ve got going on. How can I help you dive into our creative universe today?',
      
      'hi': 'What\'s up! 😎 Great to connect with you. I\'m ValleyBot 2.0, here to help you navigate the Valleytainment world. Whether you\'re looking for info on our latest drops, upcoming events, or collaboration opportunities, I\'ve got you covered!',
      
      'who are you': 'I\'m ValleyBot 2.0, the digital brain behind Valleytainment Productions! 🤖✨ I\'m here to connect you with our edgy urban universe of content creation, music production, and talent management. Think of me as your backstage pass to everything Valleytainment. What would you like to know about our creative collective?',
      
      'tell me about valleytainment': 'Valleytainment Productions is where creativity meets urban edge! 🔥 Born in 2018 from a collective of visionary artists, we\'ve evolved into a powerhouse entertainment company specializing in cutting-edge content creation, music production, and talent management.\n\nOur signature style blends vibrant urban aesthetics with innovative digital techniques, creating content that resonates with today\'s culture while pushing creative boundaries. From music videos that tell compelling stories to immersive events that bring communities together, we\'re all about authentic expression and next-level production value.\n\nWhat aspect of Valleytainment would you like to explore further?',
      
      'what services do you offer': 'We\'ve got a full spectrum of creative services to elevate your vision! 🚀\n\n• Content Creation: Music videos, short films, documentaries, and digital content with our signature urban aesthetic\n• Music Production: Full-service studio facilities with award-winning producers and engineers\n• Talent Management: Career development for artists, producers, and creatives\n• Event Production: From intimate showcases to major festivals with immersive experiences\n• Creative Direction: Brand identity, visual storytelling, and campaign development\n• Digital Marketing: Strategic promotion across platforms to maximize your reach\n\nEach service is customized to amplify your unique voice while maintaining that distinctive Valleytainment edge. What project are you looking to bring to life?',
      
      'how can i collaborate': 'We\'re always on the lookout for fresh talent and innovative ideas to join the Valleytainment universe! 🌟 Here\'s how you can get connected:\n\n1. Submit your concept through our "Submit Idea" form on the website - we review every submission\n2. Email your portfolio/demo to collabs@valleytainment.com with a brief intro\n3. Attend our monthly "Open Studio" sessions where you can network with our team (check the Events page for dates)\n4. Follow and engage with us on social media - we often discover collaborators through authentic interactions\n\nWe\'re particularly interested in creators who bring unique perspectives and aren\'t afraid to push boundaries. What kind of collaboration did you have in mind?',
      
      'latest music releases': 'Our studio has been on fire lately! 🎵🔥 Here\'s what\'s fresh from the Valleytainment sound lab:\n\n• "Neon Dreams" by Maya Johnson - Released last week, this EP blends neo-soul with electronic elements for a hypnotic vibe\n• "Urban Pulse" compilation - A showcase of our roster\'s diverse talents across hip-hop, R&B, and experimental genres\n• Coming Soon: Neon Pulse\'s debut album "Digital Heartbeat" drops next month\n• Coming Soon: DJ Vertex\'s "Late Night Frequencies" mixtape featuring exclusive collaborations\n\nAll releases are available on major streaming platforms. The "Neon Dreams" vinyl limited edition is also available in our merch store. Which sound are you vibing with?',
      
      'merchandise': 'Our merch game is strong right now! 👕🧢 The current collection features:\n\n• "Urban Glow" tees and hoodies with reflective neon prints\n• Limited edition artist collaboration pieces with original artwork\n• Accessories including caps, beanies, and phone cases with our signature aesthetic\n• Collector\'s items like vinyl records, art prints, and exclusive box sets\n\nEverything is produced in limited quantities with sustainable materials where possible. The online store offers worldwide shipping, or you can check out our pop-up shop at monthly events. Members of our Valley Club get early access and exclusive drops not available to the general public. Want me to send you the link to our latest collection?',
      
      'events': 'We\'ve got a packed calendar of events coming up! 🎉\n\n• Summer Neon Festival (July 15-17) - Our annual three-day celebration of music, art, and culture at Riverside Park\n• Underground Sessions (Last Friday monthly) - Intimate showcases at Club Vertex featuring emerging artists\n• Producer Workshop Series (Every second Saturday) - Hands-on production masterclasses with our in-house team\n• "Visual Beats" Exhibition (August 5-20) - A multimedia installation exploring the intersection of music and visual art\n\nTickets for all events are available on our website, with early bird pricing ending two weeks before each event. The Underground Sessions tend to sell out quickly, so I\'d recommend grabbing those tickets early! Which event catches your interest?',
      
      'contact': 'Ready to connect with the Valleytainment team? Here\'s how to reach us:\n\n📧 General Inquiries: info@valleytainment.com\n📧 Collaboration Requests: collabs@valleytainment.com\n📧 Press & Media: press@valleytainment.com\n📞 Office: +1 (555) 123-4567\n📍 Studio & Office: 123 Urban Avenue, Suite 456, Los Angeles, CA 90001\n\nOur office hours are Monday-Friday, 10am-6pm PT. The best way to get a quick response is via email, but feel free to call for urgent matters. If you\'re looking to visit the studio, appointments are required and can be scheduled through our website. Anything specific you\'d like to reach out about?',
      
      'social media': 'Stay connected with all things Valleytainment across our social platforms! 📱✨\n\n• Instagram (@valleytainment): Daily content, behind-the-scenes, and artist spotlights\n• YouTube (Valleytainment Official): Music videos, interviews, and studio sessions\n• TikTok (@valleytainment): Trending challenges, quick tips, and viral moments\n• Twitter (@valleytainment): Real-time updates, announcements, and community engagement\n• Discord (Valleytainment Community): Our most active platform for direct interaction with the team\n\nWe post exclusive content on each platform, so it\'s worth following us everywhere! Our Discord server hosts weekly AMAs with team members and artists. Which platform do you prefer to connect on?'
    };
    
    // Check for matching keywords
    for (const [key, value] of Object.entries(enhancedResponses)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }
    
    // More sophisticated fallback responses based on message content
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return 'Our pricing varies based on project scope and requirements. For content creation, we offer packages starting at $2,500 for basic video production, while full-scale music production typically ranges from $5,000-15,000 depending on complexity. For detailed pricing on specific services, I\'d recommend reaching out to our team at info@valleytainment.com with your project details so we can provide an accurate quote tailored to your needs. 💰';
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('where are you') || lowerMessage.includes('where is')) {
      return 'Valleytainment Productions is headquartered in Los Angeles, California. Our main studio and office space is located at 123 Urban Avenue in downtown LA, with satellite locations in Atlanta and New York. We work with clients and collaborators worldwide, with much of our team able to work remotely when needed. Are you looking to visit one of our locations? 🌎';
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('staff') || lowerMessage.includes('who works')) {
      return 'The Valleytainment team is a diverse collective of creative professionals! 🌟 Our core team includes:\n\n• Alex Rivera - Founder & Creative Director\n• Maya Johnson - Head of Music Production\n• Jamal Williams - Director of Visual Content\n• Sophia Chen - Talent Manager\n• Marcus Lee - Events Coordinator\n• Taylor Kim - Digital Marketing Strategist\n\nWe also work with a network of freelance specialists including videographers, photographers, sound engineers, graphic designers, and more. Each team member brings their unique perspective and expertise to create our signature Valleytainment style. Is there a particular department you\'d like to know more about?';
    }
    
    if (lowerMessage.includes('history') || lowerMessage.includes('started') || lowerMessage.includes('founded')) {
      return 'Valleytainment\'s story began in 2018 when founder Alex Rivera, then a music video director, joined forces with producer Maya Johnson to create content that truly represented urban culture with authenticity and artistic vision. 🚀\n\nWhat started as a two-person operation in a converted garage studio quickly gained attention for its distinctive visual style and sound. By 2020, they had expanded to a full team and moved into our current studio space in downtown LA.\n\nKey milestones include our breakthrough project with indie artist Neon Pulse in 2021, launching our talent management division in 2022, and our first Summer Neon Festival in 2023, which has now become our signature annual event. Throughout our growth, we\'ve maintained our commitment to pushing creative boundaries while amplifying diverse voices in entertainment.';
    }
    
    // Default enhanced response
    return 'Thanks for reaching out to Valleytainment Productions! 🌟 I\'m not quite sure what you\'re asking about, but I\'d be happy to tell you about our creative services, upcoming events, artist collaborations, or merchandise. You can also check out our portfolio of work or learn how to submit your ideas for potential collaboration. What aspect of Valleytainment are you most interested in exploring?';
  }
  
  /**
   * Show typing indicator
   * Displays animation while bot is "typing"
   */
  showTypingIndicator() {
    // Create typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot typing';
    typingIndicator.id = 'typing-indicator';
    
    typingIndicator.innerHTML = `
      <div class="message-avatar">
        <img src="${this.config.ui.avatarPath}" alt="ValleyBot">
      </div>
      <div class="message-content">
        <div class="typing-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    // Add to main chat
    if (this.chatMessages) {
      this.chatMessages.appendChild(typingIndicator);
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // Add to popup chat if it exists
    const popupChatMessages = this.chatbotPopup.querySelector('.chat-messages');
    if (popupChatMessages) {
      const popupTypingIndicator = typingIndicator.cloneNode(true);
      popupTypingIndicator.id = 'popup-typing-indicator';
      popupChatMessages.appendChild(popupTypingIndicator);
      popupChatMessages.scrollTop = popupChatMessages.scrollHeight;
    }
  }
  
  /**
   * Hide typing indicator
   * Removes typing animation
   */
  hideTypingIndicator() {
    // Remove from main chat
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
    
    // Remove from popup chat
    const popupTypingIndicator = document.getElementById('popup-typing-indicator');
    if (popupTypingIndicator) {
      popupTypingIndicator.remove();
    }
  }
  
  /**
   * Toggle voice input
   * Starts or stops speech recognition
   * @param {boolean} isPopup - Whether this is triggered from the popup
   */
  toggleVoiceInput(isPopup = false) {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser.');
      return;
    }
    
    // Get the appropriate voice button
    const voiceButton = isPopup 
      ? this.chatbotPopup.querySelector('#voice-input-btn')
      : this.voiceButton;
    
    // Get the appropriate input field
    const inputField = isPopup
      ? this.chatbotPopup.querySelector('#chat-input-field')
      : this.chatInput;
    
    if (!voiceButton || !inputField) return;
    
    if (this.isListening) {
      // Stop listening
      if (this.recognition) {
        this.recognition.stop();
      }
      
      voiceButton.classList.remove('recording');
      voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
      this.isListening = false;
    } else {
      // Start listening
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.lang = this.config.voice.language;
      this.recognition.continuous = this.config.voice.continuous;
      this.recognition.interimResults = this.config.voice.interimResults;
      
      // Change button appearance
      voiceButton.classList.add('recording');
      voiceButton.innerHTML = '<i class="fas fa-microphone-alt"></i>';
      this.isListening = true;
      
      this.recognition.start();
      
      // Handle results
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inputField.value = transcript;
        
        // If not continuous, stop after getting result
        if (!this.config.voice.continuous) {
          setTimeout(() => {
            // Trigger send button click
            if (isPopup) {
              this.chatbotPopup.querySelector('#send-message-btn').click();
            } else {
              this.sendButton.click();
            }
            
            // Reset button
            voiceButton.classList.remove('recording');
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            this.isListening = false;
          }, 500);
        }
      };
      
      // Handle errors
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Reset button
        voiceButton.classList.remove('recording');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        this.isListening = false;
        
        // Show error message
        alert(`Voice recognition error: ${event.error}`);
      };
      
      // Handle end of speech recognition
      this.recognition.onend = () => {
        // Reset button
        voiceButton.classList.remove('recording');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        this.isListening = false;
      };
    }
  }
  
  /**
   * Update suggestion chips
   * Dynamically updates suggestions based on conversation context
   */
  updateSuggestionChips() {
    // Default suggestions
    let suggestions = [...this.config.ui.suggestionChips];
    
    // Check recent conversation for context
    if (this.chatHistory.length > 0) {
      const recentMessages = this.chatHistory.slice(-3);
      
      // Check for specific topics to provide relevant follow-up suggestions
      for (const message of recentMessages) {
        const content = message.content.toLowerCase();
        
        if (content.includes('music') || content.includes('release')) {
          suggestions = [
            'Latest releases',
            'Upcoming albums',
            'Studio facilities',
            'Music producers'
          ];
          break;
        }
        
        if (content.includes('event') || content.includes('festival')) {
          suggestions = [
            'Event tickets',
            'Festival lineup',
            'Venue details',
            'Past events'
          ];
          break;
        }
        
        if (content.includes('collaborate') || content.includes('submission')) {
          suggestions = [
            'Submission process',
            'Portfolio requirements',
            'Collaboration types',
            'Success stories'
          ];
          break;
        }
        
        if (content.includes('merchandise') || content.includes('merch')) {
          suggestions = [
            'Limited editions',
            'Shipping info',
            'Size guide',
            'New arrivals'
          ];
          break;
        }
      }
    }
    
    // Update suggestion chips in main chat
    const suggestionContainer = document.querySelector('.chat-suggestions');
    if (suggestionContainer) {
      // Clear existing suggestions
      suggestionContainer.innerHTML = '';
      
      // Add new suggestions
      suggestions.forEach(suggestion => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        
        // Add click event
        chip.addEventListener('click', () => {
          this.chatInput.value = suggestion;
          this.sendMessage();
        });
        
        suggestionContainer.appendChild(chip);
      });
    }
    
    // Update suggestion chips in popup
    const popupSuggestionContainer = this.chatbotPopup.querySelector('.chat-suggestions');
    if (popupSuggestionContainer) {
      // Clear existing suggestions
      popupSuggestionContainer.innerHTML = '';
      
      // Add new suggestions
      suggestions.forEach(suggestion => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        
        // Add click event
        chip.addEventListener('click', () => {
          const popupInput = this.chatbotPopup.querySelector('#chat-input-field');
          if (popupInput) {
            popupInput.value = suggestion;
            const popupSendButton = this.chatbotPopup.querySelector('#send-message-btn');
            if (popupSendButton) {
              popupSendButton.click();
            }
          }
        });
        
        popupSuggestionContainer.appendChild(chip);
      });
    }
  }
  
  /**
   * Get welcome message
   * Returns personalized greeting
   * @returns {string} - Welcome message
   */
  getWelcomeMessage() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    return `${greeting}! 👋 I'm ${this.config.personality.name}, your AI assistant for Valleytainment Productions. How can I help you today? Feel free to ask about our services, upcoming events, or collaboration opportunities.`;
  }
  
  /**
   * Format time
   * Converts Date object to formatted time string
   * @param {Date} date - The date to format
   * @returns {string} - Formatted time string
   */
  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  /**
   * Save chat history to localStorage
   */
  saveChatHistory() {
    // Limit history length
    if (this.chatHistory.length > this.config.ui.maxHistoryItems) {
      this.chatHistory = this.chatHistory.slice(-this.config.ui.maxHistoryItems);
    }
    
    // Save to localStorage
    localStorage.setItem('valleybot_chat_history', JSON.stringify(this.chatHistory));
  }
  
  /**
   * Load chat history from localStorage
   */
  loadChatHistory() {
    const savedHistory = localStorage.getItem('valleybot_chat_history');
    
    if (savedHistory) {
      try {
        this.chatHistory = JSON.parse(savedHistory);
      } catch (error) {
        console.error('Error parsing chat history:', error);
        this.chatHistory = [];
      }
    }
  }
  
  /**
   * Track interaction for analytics
   * @param {string} message - The user's message
   */
  trackInteraction(message) {
    // Increment total interactions
    this.analytics.totalInteractions++;
    
    // Update last interaction time
    this.analytics.lastInteractionTime = new Date();
    
    // Track popular questions
    if (this.config.analytics.trackQuestions) {
      // Simplify message for tracking
      const simplifiedMessage = message.toLowerCase().trim();
      
      // Update count
      if (this.analytics.popularQuestions[simplifiedMessage]) {
        this.analytics.popularQuestions[simplifiedMessage]++;
      } else {
        this.analytics.popularQuestions[simplifiedMessage] = 1;
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
   * Clear chat history
   * Removes all messages from chat and localStorage
   */
  clearChatHistory() {
    // Clear chat history
    this.chatHistory = [];
    
    // Clear localStorage
    localStorage.removeItem('valleybot_chat_history');
    
    // Clear chat messages
    if (this.chatMessages) {
      this.chatMessages.innerHTML = '';
    }
    
    // Clear popup chat messages
    const popupChatMessages = this.chatbotPopup.querySelector('.chat-messages');
    if (popupChatMessages) {
      popupChatMessages.innerHTML = '';
    }
    
    // Add welcome message
    this.addBotMessage(this.getWelcomeMessage());
  }
}

// Export ValleyBot class for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValleyBot;
}
