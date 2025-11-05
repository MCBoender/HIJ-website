// H.I.J. Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // ================================
    // Navigation Functionality
    // ================================
    
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    
    console.log('Hamburger found:', !!hamburger);
    console.log('NavMenu found:', !!navMenu);
    console.log('MenuCloseBtn found:', !!menuCloseBtn);
    
    if (hamburger && navMenu) {
        function toggleMenu() {
            const isActive = navMenu.classList.contains('active');
            console.log('ToggleMenu called. Menu isActive:', isActive); // Debug log
            console.log('navMenu classes:', navMenu.className); // Debug log
            console.log('hamburger classes:', hamburger.className); // Debug log
            
            if (isActive) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                console.log('Menu closed via hamburger');
            } else {
                hamburger.classList.add('active');
                navMenu.classList.add('active');
                document.body.classList.add('menu-open');
                console.log('Menu opened via hamburger');
                console.log('After opening - navMenu classes:', navMenu.className);
            }
        }
        
        function closeMenu() {
            console.log('CloseMenu called'); // Debug log
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            console.log('Menu closed via close button');
        }
        
        hamburger.addEventListener('click', function(e) {
            console.log('Hamburger clicked!'); // Debug log
            e.preventDefault();
            e.stopPropagation();
            console.log('Calling toggleMenu...'); // Debug log
            toggleMenu();
        });
        
        // Also handle touch events for mobile
        hamburger.addEventListener('touchstart', function(e) {
            console.log('Hamburger touched!'); // Debug log
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        
        // Handle close button clicks
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', function(e) {
                console.log('Close button clicked!'); // Debug log
                e.preventDefault();
                e.stopPropagation();
                closeMenu();
            });
        }
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMenu();
                console.log('Menu closed via link click');
            });
        });
        
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('active') && !navbar.contains(event.target)) {
                closeMenu();
                console.log('Menu closed via outside click');
            }
        });
    }
    
    // Smooth scrolling for navigation links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active nav link based on scroll position
        updateActiveNavLink();
    });
    
    // ================================
    // Contact Form Functionality
    // ================================
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Basic validation
            if (!name || !email || !subject || !message) {
                showFormMessage('Vul alle velden in.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormMessage('Voer een geldig email adres in.', 'error');
                return;
            }
            
            // Simulate form submission
            showFormMessage('Bericht wordt verstuurd...', 'loading');
            
            setTimeout(() => {
                // Create mailto link
                const mailtoLink = `mailto:info@hijjeugdorkest.nl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                    `Naam: ${name}\nEmail: ${email}\n\n${message}`
                )}`;
                
                // Open email client
                window.location.href = mailtoLink;
                
                // Show success message
                showFormMessage('Bericht verstuurd! Check je email programma.', 'success');
                this.reset();
            }, 1500);
        });
    }
    
    // ================================
    // FAQ Toggle Functionality
    // ================================
    
    // Make FAQ items expandable/collapsible
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        
        if (question && answer) {
            // Initially collapse FAQ items
            answer.style.display = 'none';
            answer.style.maxHeight = '0';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'all 300ms ease';
            
            // Add click handler
            question.style.cursor = 'pointer';
            question.innerHTML += ' <span class="faq-toggle">+</span>';
            
            question.addEventListener('click', function() {
                const toggle = this.querySelector('.faq-toggle');
                const answer = this.parentElement.querySelector('p');
                
                if (answer.style.display === 'none' || !answer.style.display) {
                    // Expand
                    answer.style.display = 'block';
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    toggle.textContent = '−';
                } else {
                    // Collapse
                    answer.style.maxHeight = '0';
                    setTimeout(() => {
                        answer.style.display = 'none';
                    }, 300);
                    toggle.textContent = '+';
                }
            });
        }
    });
    
    // ================================
    // Scroll Animations
    // ================================
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.about-card, .event-card, .faq-item, .gallery-item, .info-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // ================================
    // Confetti Animation
    // ================================
    
    // Create floating confetti elements
    createConfetti();
    
    // ================================
    // Instagram Integration
    // ================================
    
    // Placeholder for Instagram feed integration
    setupInstagramPlaceholder();
    
    // ================================
    // Utility Functions
    // ================================
    
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showFormMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 12px 16px;
            margin-top: 16px;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            ${type === 'error' ? 'background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;' : ''}
            ${type === 'success' ? 'background: #e8f5e8; color: #2e7d32; border: 1px solid #c8e6c9;' : ''}
            ${type === 'loading' ? 'background: #fff3e0; color: #ef6c00; border: 1px solid #ffcc02;' : ''}
        `;
        
        // Add to form
        const form = document.getElementById('contact-form');
        if (form) {
            form.appendChild(messageElement);
            
            // Auto-remove after 5 seconds for success/error messages
            if (type !== 'loading') {
                setTimeout(() => {
                    messageElement.remove();
                }, 5000);
            }
        }
    }
    
    function createConfetti() {
        const colors = ['#FFC700', '#00AFA5', '#E63946', '#F4ACB7'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        document.body.appendChild(confettiContainer);
        
        // Create floating confetti particles
        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 4; // 4-12px
            const left = Math.random() * 100; // 0-100%
            const animationDuration = Math.random() * 3 + 3; // 3-6s
            
            confetti.style.cssText = `
                position: absolute;
                top: -10px;
                left: ${left}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                opacity: 0.6;
                animation: confetti-fall ${animationDuration}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            
            confettiContainer.appendChild(confetti);
        }
        
        // Add confetti animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confetti-fall {
                0% {
                    transform: translateY(-10px) rotate(0deg);
                    opacity: 0.6;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    function setupInstagramPlaceholder() {
        const instagramPlaceholder = document.querySelector('.instagram-placeholder');
        if (instagramPlaceholder) {
            // Add click handler to show info
            instagramPlaceholder.addEventListener('click', function() {
                const info = this.querySelector('p');
                info.textContent = 'Volg @hijjeugdorkest voor de laatste foto\'s!';
                info.style.fontWeight = 'bold';
                setTimeout(() => {
                    info.textContent = 'Hier komen onze laatste foto\'s te staan';
                    info.style.fontWeight = 'normal';
                }, 3000);
            });
        }
    }
    
    // ================================
    // Event Card Hover Effects
    // ================================
    
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // ================================
    // Gallery Lightbox Simulation
    // ================================
    
    const galleryItems = document.querySelectorAll('.gallery-placeholder');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const location = this.querySelector('p').textContent;
            showLightboxInfo(location);
        });
    });
    
    function showLightboxInfo(location) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 32px;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
            margin: 0 16px;
        `;
        
        content.innerHTML = `
            <h3 style="color: #7B2A4B; margin-bottom: 16px;">${location}</h3>
            <p style="margin-bottom: 24px; color: #6B5F63;">Hier komt binnenkort een echte foto te staan! Bekijk eerst ons Instagram account voor meer foto's.</p>
            <a href="https://www.instagram.com/hijjeugdorkest/" target="_blank" style="background: #7B2A4B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Bekijk Instagram</a>
        `;
        
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                document.body.removeChild(lightbox);
            }
        });
        
        document.body.appendChild(lightbox);
    }
    
    // ================================
    // Add Loading Animation
    // ================================
    
    // Show page content with a fade-in effect
    const pageContent = document.querySelector('body');
    if (pageContent) {
        pageContent.style.opacity = '0';
        pageContent.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            pageContent.style.opacity = '1';
        }, 100);
    }
    
    // ================================
    // Mobile Logo Hide Functionality
    // ================================
    
    function hideHomepageLogoOnMobile() {
        const heroLogo = document.querySelector('.hero-logo');
        const screenWidth = window.innerWidth;
        
        console.log('Checking mobile logo - Screen width:', screenWidth); // Debug log
        
        if (screenWidth <= 768) {
            // Hide the homepage logo on mobile but preserve space
            if (heroLogo) {
                heroLogo.style.visibility = 'hidden';
                heroLogo.style.height = '80px';
                console.log('Homepage logo hidden on mobile (80px space preserved)'); // Debug log
            }
        } else {
            // Show the homepage logo on desktop
            if (heroLogo) {
                heroLogo.style.visibility = 'visible';
                heroLogo.style.height = 'auto';
                console.log('Homepage logo shown on desktop'); // Debug log
            }
        }
    }
    
    // Hide logo on page load and on resize
    hideHomepageLogoOnMobile();
    window.addEventListener('resize', hideHomepageLogoOnMobile);
    
    // ================================
    // Performance Monitoring
    // ================================
    
    // Add some performance tracking (if needed)
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'navigation') {
                    console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart);
                }
            });
        });
        observer.observe({entryTypes: ['navigation']});
    }
    
    // ================================
    // Keyboard Navigation
    // ================================
    
    document.addEventListener('keydown', function(e) {
        // Escape key closes modals and mobile menu
        if (e.key === 'Escape') {
            const lightbox = document.querySelector('.lightbox');
            if (lightbox) {
                document.body.removeChild(lightbox);
            }
            
            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('active')) {
                closeMenu();
                console.log('Menu closed via Escape key');
            }
        }
        
        // Enter key on buttons
        if (e.key === 'Enter' && e.target.classList.contains('btn')) {
            e.target.click();
        }
    });
    
    // Add focus management for accessibility
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusable = document.querySelectorAll(focusableElements);
            const firstFocusable = focusable[0];
            const lastFocusable = focusable[focusable.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
    
    // ================================
    // Error Handling
    // ================================
    
    // Add global error handler
    window.addEventListener('error', function(e) {
        console.error('JavaScript Error:', e.error);
        // In production, you might want to send this to an error tracking service
    });
    
    // Add promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled Promise Rejection:', e.reason);
        e.preventDefault();
    });
    
    console.log('H.I.J. Website loaded successfully! 🎵');
});

// ================================
// Service Worker Registration (for future PWA features)
// ================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker registration can be added here for offline functionality
        console.log('Service Worker support detected');
    });
}

// ================================
// Utility Functions for External Use
// ================================

// Function to update agenda events (for future admin use)
window.updateAgenda = function(events) {
    const agendaGrid = document.querySelector('.agenda-grid');
    if (!agendaGrid) return;
    
    // Clear existing events
    agendaGrid.innerHTML = '';
    
    // Add new events
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-date">
                <span class="day">${event.day}</span>
                <span class="month">${event.month}</span>
            </div>
            <div class="event-details">
                <h3>${event.title}</h3>
                <p class="event-time">${event.time}</p>
                <p class="event-location">${event.location}</p>
                <p class="event-description">${event.description}</p>
                ${event.link ? `<a href="${event.link}" class="btn btn-small">Meer info</a>` : ''}
            </div>
        `;
        agendaGrid.appendChild(eventCard);
    });
};

// Function to update gallery images (for future admin use)
window.updateGallery = function(images) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Clear existing items
    galleryGrid.innerHTML = '';
    
    // Add new images
    images.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <div class="gallery-placeholder">
                <div class="placeholder-icon">${image.icon || '🎵'}</div>
                <p>${image.caption || 'Foto komt binnenkort'}</p>
            </div>
        `;
        galleryGrid.appendChild(galleryItem);
    });
};