/**
 * =====================================================================
 * | VALLEYTAINMENT PRODUCTIONS - INTERACTIVE JAVASCRIPT               |
 * | Version: 2.0.0                                                    |
 * | Last Updated: April 19, 2025                                      |
 * =====================================================================
 * | This file contains all interactive functionality for the          |
 * | Valleytainment website including animations, effects, and         |
 * | advanced features like AI chatbot and image generator.            |
 * =====================================================================
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Global variables
  let visitorCount = localStorage.getItem('visitorCount') || 0;
  let darkMode = localStorage.getItem('darkMode') === 'true';
  let scrollY = 0;
  
  // Initialize all features
  initVisitorCounter();
  initThreeJsBackground();
  initCursorTrail();
  initScrollProgress();
  initDarkModeToggle();
  initMobileMenu();
  initDropdowns();
  initTabs();
  initCreativeStudioModal();
  initCardTilt();
  initRevealAnimations();
  initMagneticButtons();
  initAIImageGenerator();
  initChatbot();
  initAudioVisualizer();
  initBackToTop();
  
  /**
   * 1. THREE.JS PARTICLE BACKGROUND
   * Creates an interactive particle background with Three.js
   */
  function initThreeJsBackground() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Particle background disabled.');
      return;
    }
    
    const canvas = document.getElementById('bg-canvas');
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create particles
    const particlesCount = window.innerWidth < 768 ? 100 : 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xff00aa,
      size: 3,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    const particlesPositions = new Float32Array(particlesCount * 3);
    const particlesVelocities = [];
    
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      particlesPositions[i3] = (Math.random() - 0.5) * window.innerWidth * 0.5;
      particlesPositions[i3 + 1] = (Math.random() - 0.5) * window.innerHeight * 0.5;
      particlesPositions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      particlesVelocities.push({
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.2
      });
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Position camera
    camera.position.z = 30;
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Update particles positions
      const positions = particlesGeometry.attributes.position.array;
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Update position based on velocity
        positions[i3] += particlesVelocities[i].x;
        positions[i3 + 1] += particlesVelocities[i].y;
        positions[i3 + 2] += particlesVelocities[i].z;
        
        // Boundary check and bounce
        if (Math.abs(positions[i3]) > window.innerWidth * 0.25) {
          particlesVelocities[i].x *= -1;
        }
        
        if (Math.abs(positions[i3 + 1]) > window.innerHeight * 0.25) {
          particlesVelocities[i].y *= -1;
        }
        
        if (Math.abs(positions[i3 + 2]) > 10) {
          particlesVelocities[i].z *= -1;
        }
      }
      
      particlesGeometry.attributes.position.needsUpdate = true;
      
      // Rotate particles based on mouse position
      particles.rotation.x += mouseY * 0.001;
      particles.rotation.y += mouseX * 0.001;
      
      renderer.render(scene, camera);
    }
    
    animate();
  }
  
  /**
   * 2. CURSOR TRAIL
   * Creates a neon cursor trail effect
   */
  function initCursorTrail() {
    const canvas = document.getElementById('cursor-trail');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Mouse position
    let mouseX = 0;
    let mouseY = 0;
    
    // Trail points
    const trail = [];
    const trailLength = 20;
    
    // Handle mouse movement
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Add point to trail
      trail.push({ x: mouseX, y: mouseY });
      
      // Limit trail length
      if (trail.length > trailLength) {
        trail.shift();
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw trail
      ctx.strokeStyle = '#ff00aa';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Draw trail line
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        
        ctx.stroke();
      }
      
      // Draw trail points with glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff00aa';
      
      for (let i = 0; i < trail.length; i++) {
        const size = (i / trailLength) * 10;
        
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 0, 170, ${i / trailLength})`;
        ctx.fill();
      }
    }
    
    animate();
  }
  
  /**
   * 3. SCROLL PROGRESS
   * Shows a progress bar at the top of the page
   */
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    
    window.addEventListener('scroll', () => {
      // Calculate scroll progress
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollProgress = (scrollTop / scrollHeight) * 100;
      
      // Update progress bar width
      progressBar.style.width = `${scrollProgress}%`;
      
      // Update global scrollY variable
      scrollY = window.scrollY;
      document.documentElement.style.setProperty('--scroll-y', scrollY);
      
      // Handle header styling on scroll
      const header = document.querySelector('header');
      if (scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Show/hide back to top button
      const backToTop = document.querySelector('.back-to-top');
      if (scrollTop > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
  }
  
  /**
   * 4. DARK MODE TOGGLE
   * Toggles between light and dark mode
   */
  function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Apply dark mode if enabled
    if (darkMode) {
      document.body.classList.add('dark-mode');
      darkModeToggle.textContent = '🌞';
    }
    
    // Toggle dark mode on click
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      darkMode = !darkMode;
      
      // Update toggle icon
      darkModeToggle.textContent = darkMode ? '🌞' : '🌓';
      
      // Save preference to localStorage
      localStorage.setItem('darkMode', darkMode);
    });
  }
  
  /**
   * 5. COMPANY TABS
   * Handles tab switching in the team section
   */
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding content
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });
  }
  
  /**
   * 6. CREATIVE STUDIO MODAL
   * Handles the creative studio modal
   */
  function initCreativeStudioModal() {
    const modalButton = document.getElementById('creative-studio-btn');
    const modal = document.getElementById('creative-studio-modal');
    const closeButton = modal.querySelector('.modal-close');
    const navButtons = modal.querySelectorAll('.modal-nav-btn');
    
    // Open modal on button click
    modalButton.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    // Close modal on close button click
    closeButton.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Handle navigation buttons
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
  
  /**
   * 7. AI IMAGE GENERATOR
   * Handles the AI image generator functionality
   */
  function initAIImageGenerator() {
    const generateButton = document.getElementById('generate-image-btn');
    const promptInput = document.getElementById('image-prompt');
    const styleSelect = document.getElementById('image-style');
    const sizeSelect = document.getElementById('image-size');
    const resultContainer = document.getElementById('image-result-container');
    const downloadButton = document.getElementById('download-image-btn');
    const shareButton = document.getElementById('share-image-btn');
    const historyContainer = document.getElementById('image-history-container');
    
    // Image history
    let imageHistory = JSON.parse(localStorage.getItem('imageHistory')) || [];
    
    // Display image history
    displayImageHistory();
    
    // Generate image on button click
    generateButton.addEventListener('click', async () => {
      const prompt = promptInput.value.trim();
      const style = styleSelect.value;
      const size = sizeSelect.value;
      
      if (!prompt) {
        alert('Please enter a prompt to generate an image.');
        return;
      }
      
      // Show loading state
      resultContainer.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Generating your image...</p>
        </div>
      `;
      
      try {
        // Call image generation API
        const imageUrl = await generateImage(prompt, style, size);
        
        // Display generated image
        resultContainer.innerHTML = `
          <img src="${imageUrl}" alt="${prompt}" id="generated-image">
        `;
        
        // Enable download and share buttons
        downloadButton.disabled = false;
        shareButton.disabled = false;
        
        // Add to history
        addToImageHistory(prompt, style, imageUrl);
      } catch (error) {
        console.error('Error generating image:', error);
        
        // Show error message
        resultContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to generate image. Please try again.</p>
          </div>
        `;
      }
    });
    
    // Download image
    downloadButton.addEventListener('click', () => {
      const image = document.getElementById('generated-image');
      if (!image) return;
      
      const link = document.createElement('a');
      link.href = image.src;
      link.download = `valleytainment-${Date.now()}.png`;
      link.click();
    });
    
    // Share image
    shareButton.addEventListener('click', () => {
      const image = document.getElementById('generated-image');
      if (!image) return;
      
      if (navigator.share) {
        navigator.share({
          title: 'My Valleytainment Creation',
          text: 'Check out this image I created with Valleytainment AI!',
          url: image.src
        }).catch(console.error);
      } else {
        // Fallback for browsers that don't support Web Share API
        const textarea = document.createElement('textarea');
        textarea.value = image.src;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Image URL copied to clipboard!');
      }
    });
    
    // Generate image function (simulated for now)
    async function generateImage(prompt, style, size) {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate with a placeholder
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return placeholder image URL based on style
      const styleImages = {
        neon: 'https://source.unsplash.com/random/800x800/?neon,city',
        cyberpunk: 'https://source.unsplash.com/random/800x800/?cyberpunk',
        graffiti: 'https://source.unsplash.com/random/800x800/?graffiti',
        abstract: 'https://source.unsplash.com/random/800x800/?abstract',
        realistic: 'https://source.unsplash.com/random/800x800/?urban',
        anime: 'https://source.unsplash.com/random/800x800/?anime',
        synthwave: 'https://source.unsplash.com/random/800x800/?synthwave',
        vaporwave: 'https://source.unsplash.com/random/800x800/?vaporwave',
        glitch: 'https://source.unsplash.com/random/800x800/?glitch',
        '3d': 'https://source.unsplash.com/random/800x800/?3d,render'
      };
      
      return styleImages[style] || styleImages.neon;
      
      /* 
      // Real implementation would look something like this:
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, style, size })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      return data.url;
      */
    }
    
    // Add image to history
    function addToImageHistory(prompt, style, url) {
      const image = {
        id: Date.now(),
        prompt,
        style,
        url,
        date: new Date().toISOString()
      };
      
      // Add to beginning of array
      imageHistory.unshift(image);
      
      // Limit history to 8 items
      if (imageHistory.length > 8) {
        imageHistory = imageHistory.slice(0, 8);
      }
      
      // Save to localStorage
      localStorage.setItem('imageHistory', JSON.stringify(imageHistory));
      
      // Update display
      displayImageHistory();
    }
    
    // Display image history
    function displayImageHistory() {
      if (imageHistory.length === 0) {
        historyContainer.innerHTML = `
          <p class="text-center">No images yet. Generate your first image!</p>
        `;
        return;
      }
      
      historyContainer.innerHTML = '';
      
      imageHistory.forEach(image => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
          <img src="${image.url}" alt="${image.prompt}" loading="lazy">
        `;
        
        // Click to load image
        historyItem.addEventListener('click', () => {
          resultContainer.innerHTML = `
            <img src="${image.url}" alt="${image.prompt}" id="generated-image">
          `;
          
          // Enable download and share buttons
          downloadButton.disabled = false;
          shareButton.disabled = false;
          
          // Set form values
          promptInput.value = image.prompt;
          styleSelect.value = image.style;
        });
        
        historyContainer.appendChild(historyItem);
      });
    }
  }
  
  /**
   * 8. VALLEYBOT 2.0 (GPT-4 CHATBOT)
   * Handles the AI chatbot functionality
   */
  function initChatbot() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input-field');
    const sendButton = document.getElementById('send-message-btn');
    const voiceButton = document.getElementById('voice-input-btn');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotPopup = document.getElementById('chatbot-popup');
    
    // Chat history
    let chatHistory = [];
    
    // Initialize chatbot popup
    initChatbotPopup();
    
    // Send message on button click
    sendButton.addEventListener('click', () => {
      sendMessage();
    });
    
    // Send message on Enter key
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Voice input
    voiceButton.addEventListener('click', () => {
      // Check if browser supports speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        
        // Change button appearance
        voiceButton.classList.add('recording');
        voiceButton.innerHTML = '<i class="fas fa-microphone-alt"></i>';
        
        recognition.start();
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          chatInput.value = transcript;
          
          // Reset button appearance
          voiceButton.classList.remove('recording');
          voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
          
          // Send message after a short delay
          setTimeout(() => {
            sendMessage();
          }, 500);
        };
        
        recognition.onerror = () => {
          // Reset button appearance
          voiceButton.classList.remove('recording');
          voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
          
          alert('Voice recognition failed. Please try again or type your message.');
        };
        
        recognition.onend = () => {
          // Reset button appearance
          voiceButton.classList.remove('recording');
          voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        };
      } else {
        alert('Voice recognition is not supported in your browser.');
      }
    });
    
    // Suggestion chips
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        chatInput.value = chip.textContent;
        sendMessage();
      });
    });
    
    // Send message function
    function sendMessage() {
      const message = chatInput.value.trim();
      
      if (!message) return;
      
      // Add user message to chat
      addMessage(message, 'user');
      
      // Clear input
      chatInput.value = '';
      
      // Get bot response
      getBotResponse(message);
    }
    
    // Add message to chat
    function addMessage(message, sender) {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${sender}`;
      
      let avatar;
      if (sender === 'user') {
        avatar = '<div class="message-avatar"><i class="fas fa-user"></i></div>';
      } else {
        avatar = '<div class="message-avatar"><img src="images/valleybot-avatar.png" alt="ValleyBot"></div>';
      }
      
      messageElement.innerHTML = `
        ${avatar}
        <div class="message-content">
          <p>${message}</p>
        </div>
      `;
      
      chatMessages.appendChild(messageElement);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Add to history
      chatHistory.push({
        sender,
        message
      });
    }
    
    // Get bot response (simulated for now)
    async function getBotResponse(message) {
      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'message bot typing';
      typingIndicator.innerHTML = `
        <div class="message-avatar">
          <img src="images/valleybot-avatar.png" alt="ValleyBot">
        </div>
        <div class="message-content">
          <p>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </p>
        </div>
      `;
      
      chatMessages.appendChild(typingIndicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove typing indicator
      chatMessages.removeChild(typingIndicator);
      
      // Predefined responses
      const responses = {
        'hello': 'Hey there! How can I help you with Valleytainment Productions today?',
        'hi': 'Hello! What can I do for you today?',
        'who are you': 'I\'m ValleyBot 2.0, your AI assistant for all things Valleytainment. I can help with information about our services, team, and upcoming events.',
        'tell me about valleytainment': 'Valleytainment Productions is a cutting-edge entertainment company specializing in content creation, talent management, and music production with an edgy, vibrant urban aesthetic. Founded in 2018, we\'ve grown from a small collective of creatives to a full-service production company with a global reach.',
        'what services do you offer': 'We offer a wide range of services including content creation, music production, talent management, event production, creative direction, and digital marketing. Each service is tailored to help artists and brands stand out in today\'s competitive landscape.',
        'how can i collaborate': 'We\'re always looking for talented individuals and brands to collaborate with! You can submit your idea through our "Submit Idea" form, or contact us directly at info@valleytainment.com to discuss potential collaborations.',
        'latest music releases': 'Our latest release is "Neon Dreams" by Maya Johnson, which dropped last week. We also have upcoming releases from Neon Pulse and DJ Vertex scheduled for next month. Stay tuned to our social media for announcements!',
        'merchandise': 'Check out our merchandise section for the latest Valleytainment apparel and accessories. We have everything from t-shirts and hoodies to limited edition posters and collectibles.',
        'events': 'We have several upcoming events including the Summer Neon Festival in July and our monthly Underground Sessions at Club Vertex. Visit our events page for tickets and more information.',
        'contact': 'You can reach us at info@valleytainment.com or call us at +1 (555) 123-4567. Our office is located at 123 Urban Avenue, Suite 456, Los Angeles, CA 90001.',
        'social media': 'Follow us on Instagram, YouTube, TikTok, and Twitter @valleytainment for the latest updates, behind-the-scenes content, and exclusive announcements.'
      };
      
      // Default response
      let response = 'I\'m not sure how to respond to that. Can you try asking something about Valleytainment Productions, our services, or upcoming events?';
      
      // Check for matching keywords
      for (const [key, value] of Object.entries(responses)) {
        if (message.toLowerCase().includes(key)) {
          response = value;
          break;
        }
      }
      
      // Add bot response to chat
      addMessage(response, 'bot');
      
      /* 
      // Real implementation would look something like this:
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            history: chatHistory
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to get response');
        }
        
        const data = await response.json();
        addMessage(data.message, 'bot');
      } catch (error) {
        console.error('Error getting bot response:', error);
        addMessage('Sorry, I\'m having trouble connecting right now. Please try again later.', 'bot');
      }
      */
    }
    
    // Initialize chatbot popup
    function initChatbotPopup() {
      // Clone main chatbot content
      const chatbotSection = document.getElementById('chatbot-section');
      const chatbotContent = chatbotSection.querySelector('.chatbot-container').cloneNode(true);
      
      // Add to popup
      chatbotPopup.appendChild(chatbotContent);
      
      // Toggle popup on button click
      chatbotToggle.addEventListener('click', () => {
        chatbotPopup.classList.toggle('active');
      });
    }
  }
  
  /**
   * 9. AUDIO VISUALIZER
   * Creates an audio visualizer for the rave section
   */
  function initAudioVisualizer() {
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas.getContext('2d');
    const playButton = document.getElementById('play-audio-btn');
    const volumeSlider = document.getElementById('volume-slider');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Audio context
    let audioContext;
    let audioSource;
    let analyser;
    let audio;
    let isPlaying = false;
    
    // Create audio element
    audio = new Audio('audio/rave-loop.mp3');
    audio.loop = true;
    
    // Set volume from slider
    audio.volume = volumeSlider.value / 100;
    
    // Handle play button click
    playButton.addEventListener('click', () => {
      if (!isPlaying) {
        playAudio();
      } else {
        pauseAudio();
      }
    });
    
    // Handle volume change
    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value / 100;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    
    // Play audio function
    function playAudio() {
      // Initialize audio context if not already created
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioSource = audioContext.createMediaElementSource(audio);
        analyser = audioContext.createAnalyser();
        
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
      }
      
      // Play audio
      audio.play().then(() => {
        isPlaying = true;
        playButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        // Start visualization
        visualize();
      }).catch(error => {
        console.error('Error playing audio:', error);
        alert('Failed to play audio. Please try again.');
      });
    }
    
    // Pause audio function
    function pauseAudio() {
      audio.pause();
      isPlaying = false;
      playButton.innerHTML = '<i class="fas fa-play"></i> Play';
    }
    
    // Visualize function
    function visualize() {
      if (!isPlaying) return;
      
      // Create data array for frequency data
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Animation function
      function animate() {
        if (!isPlaying) return;
        
        requestAnimationFrame(animate);
        
        // Get frequency data
        analyser.getByteFrequencyData(dataArray);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set bar width and spacing
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        // Draw bars
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] * 1.5;
          
          // Create gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, '#ff00aa');
          gradient.addColorStop(0.5, '#aa00ff');
          gradient.addColorStop(1, '#3eff00');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      }
      
      animate();
    }
  }
  
  /**
   * UTILITY FUNCTIONS
   */
  
  // Initialize visitor counter
  function initVisitorCounter() {
    const visitorCountElement = document.getElementById('visitor-count');
    
    // Increment visitor count
    visitorCount = parseInt(visitorCount) + 1;
    localStorage.setItem('visitorCount', visitorCount);
    
    // Display visitor count with animation
    let currentCount = 0;
    const targetCount = visitorCount;
    const duration = 2000; // 2 seconds
    const interval = 50; // 50ms
    const increment = Math.ceil(targetCount / (duration / interval));
    
    const counter = setInterval(() => {
      currentCount += increment;
      
      if (currentCount >= targetCount) {
        currentCount = targetCount;
        clearInterval(counter);
      }
      
      visitorCountElement.textContent = currentCount.toLocaleString();
    }, interval);
  }
  
  // Initialize mobile menu
  function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('active');
    });
  }
  
  // Initialize dropdowns
  function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Toggle active class
        toggle.classList.toggle('active');
        
        // Toggle dropdown visibility
        const dropdown = toggle.nextElementSibling;
        dropdown.classList.toggle('active');
      });
    });
  }
  
  // Initialize card tilt effect
  function initCardTilt() {
    const cards = document.querySelectorAll('.card-tilt');
    
    cards.forEach(card => {
      // Add shine element
      const shine = document.createElement('div');
      shine.className = 'card-shine';
      card.appendChild(shine);
      
      // Handle mouse movement
      card.addEventListener('mousemove', (e) => {
        // Get card position
        const rect = card.getBoundingClientRect();
        
        // Calculate mouse position relative to card
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        // Apply transform
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        
        // Update shine position
        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 80%)`;
      });
      
      // Reset on mouse leave
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }
  
  // Initialize reveal animations
  function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal-enhanced');
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe each element
    revealElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  // Initialize magnetic buttons
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn-enhanced');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        // Get button position
        const rect = button.getBoundingClientRect();
        
        // Calculate mouse position relative to button
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate distance from center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate magnetic pull (stronger at edges)
        const magneticPullX = (x - centerX) / (rect.width / 2) * 10;
        const magneticPullY = (y - centerY) / (rect.height / 2) * 10;
        
        // Apply transform
        button.style.transform = `translate3d(${magneticPullX}px, ${magneticPullY}px, 0) scale(1.1)`;
      });
      
      button.addEventListener('mouseleave', () => {
        // Reset transform
        button.style.transform = 'translate3d(0, 0, 0) scale(1)';
      });
    });
  }
  
  // Initialize back to top button
  function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}
