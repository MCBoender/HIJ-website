// CMS Data Loader for Netlify CMS
// Loads data from _data files and updates the website content

class CMSDataLoader {
    constructor() {
        this.data = {};
        this.isLoaded = false;
    }

    // Robust YAML parser for agenda/events style structures
    parseYAML(yamlText) {
        const lines = yamlText.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        const result = {};
        let currentSection = null;
        let currentArray = null;
        let currentObject = null;
        let indentLevel = 0;

        for (let line of lines) {
            const trimmed = line.trim();
            const match = line.match(/^(\s*)(.*)$/);
            const indent = match ? match[1].length : 0;
            const content = match ? match[2].trim() : trimmed;
            
            // Array item (starts with dash)
            if (content.startsWith('-')) {
                const itemContent = content.substring(1).trim();
                
                if (itemContent.includes(':')) {
                    // Array item with properties (object)
                    if (!currentArray) {
                        currentArray = [];
                        if (currentSection) {
                            result[currentSection] = currentArray;
                        }
                    }
                    
                    // Parse key-value pairs for this array item
                    const itemData = {};
                    const pairs = itemContent.split(':');
                    const firstKey = pairs[0].trim();
                    const firstValue = pairs.slice(1).join(':').trim();
                    
                    console.log(`YAML DEBUG: Array item property ${firstKey} = ${firstValue} in section '${currentSection}'`);
                    itemData[firstKey] = this.parseValue(firstValue);
                    currentArray.push(itemData);
                    
                    // FIX: Don't set currentObject to array item to prevent property assignment confusion
                    // currentObject = itemData; // REMOVED THIS LINE
                } else {
                    // Simple array item (string/number)
                    if (!currentArray) {
                        currentArray = [];
                        if (currentSection) {
                            result[currentSection] = currentArray;
                        }
                    }
                    currentArray.push(this.parseValue(itemContent));
                }
            }
            // Regular key-value pair
            else if (content.includes(':')) {
                const [key, ...valueParts] = content.split(':');
                const keyTrim = key.trim();
                const value = valueParts.join(':').trim();
                
                if (value === '' || value === '|') {
                    // Start of nested structure
                    currentSection = keyTrim;
                    currentArray = null;
                    currentObject = null;
                    console.log(`YAML DEBUG: Starting nested structure '${keyTrim}'`);
                } else {
                    // Simple key-value pair
                    console.log(`YAML DEBUG: Setting ${keyTrim} = ${value} in ${currentSection || 'root'}`);
                    result[keyTrim] = this.parseValue(value);
                }
            }
        }

        return result;
    }
    
    // Parse simple values (remove quotes, convert booleans/numbers)
    parseValue(value) {
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        
        // Boolean
        if (value === 'true') return true;
        if (value === 'false') return false;
        
        // Number
        if (!isNaN(value) && value.trim() !== '') {
            return Number(value);
        }
        
        return value;
    }

    // Fetch and parse YAML data files
    async loadData() {
        try {
            console.log('Loading CMS data...');
            
            // Load content data
            const contentResponse = await fetch('./_data/content.yml');
            const contentText = await contentResponse.text();
            this.data.content = this.parseYAML(contentText);
            console.log('Content loaded:', this.data.content);

            // Load agenda data
            const agendaResponse = await fetch('./_data/agenda.yml');
            const agendaText = await agendaResponse.text();
            this.data.agenda = this.parseYAML(agendaText);
            console.log('Agenda loaded:', this.data.agenda);
            console.log('Agenda structure:', typeof this.data.agenda, Array.isArray(this.data.agenda) ? 'Array' : 'Object');

            // Load FAQ data
            const faqResponse = await fetch('./_data/faq.yml');
            const faqText = await faqResponse.text();
            this.data.faq = this.parseYAML(faqText);
            console.log('FAQ loaded:', this.data.faq);
            console.log('FAQ structure:', typeof this.data.faq, Array.isArray(this.data.faq) ? 'Array' : 'Object');

            // Load gallery data
            const galleryResponse = await fetch('./_data/gallery.yml');
            const galleryText = await galleryResponse.text();
            this.data.gallery = this.parseYAML(galleryText);
            console.log('Gallery loaded:', this.data.gallery);
            console.log('Gallery structure:', typeof this.data.gallery, Array.isArray(this.data.gallery) ? 'Array' : 'Object');

            this.isLoaded = true;
            console.log('All CMS data loaded successfully!');
            
            // Update page content
            this.updatePageContent();
            
        } catch (error) {
            console.error('Error loading CMS data:', error);
            // Fallback: use static content if CMS loading fails
            console.log('Using fallback static content');
            this.isLoaded = false;
        }
    }

    // Update page content with loaded data
    updatePageContent() {
        if (!this.isLoaded) return;

        const data = this.data;

        // Update homepage content
        if (data.content.homepage_title) {
            const titleElement = document.querySelector('.hero-title');
            if (titleElement) titleElement.textContent = data.content.homepage_title;
        }

        if (data.content.homepage_subtitle) {
            const subtitleElement = document.querySelector('.hero-subtitle');
            if (subtitleElement) subtitleElement.textContent = data.content.homepage_subtitle;
        }

        // Update about section
        if (data.content.about_title) {
            const aboutTitle = document.querySelector('#over-ons h2');
            if (aboutTitle) aboutTitle.textContent = data.content.about_title;
        }

        if (data.content.about_text) {
            const aboutText = document.querySelector('#over-ons .about-text');
            if (aboutText) {
                // Convert markdown-like formatting to HTML
                const formattedText = data.content.about_text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>');
                aboutText.innerHTML = `<p>${formattedText}</p>`;
            }
        }

        // Update agenda section with backwards compatibility
        if (data.agenda) {
            const agendaData = data.agenda.events || data.agenda; // New format (wrapped) or old format (direct array)
            console.log('Agenda data loaded:', agendaData);
            console.log('Agenda events object:', data.agenda.events);
            console.log('Is agendaData array:', Array.isArray(agendaData));
            console.log('Agenda events array length:', data.agenda.events ? data.agenda.events.length : 'N/A');
            if (Array.isArray(agendaData)) {
                this.updateAgendaSection(agendaData);
            } else {
                console.warn('Agenda data is not an array, skipping update');
            }
        }

        // Update FAQ section with backwards compatibility
        if (data.faq) {
            const faqData = data.faq.items || data.faq; // New format (wrapped) or old format (direct array)
            console.log('FAQ data loaded:', faqData);
            console.log('FAQ items object:', data.faq.items);
            console.log('Is faqData array:', Array.isArray(faqData));
            console.log('FAQ items array length:', data.faq.items ? data.faq.items.length : 'N/A');
            if (Array.isArray(faqData)) {
                this.updateFAQSection(faqData);
            } else {
                console.warn('FAQ data is not an array, skipping update');
            }
        }

        // Update gallery section with backwards compatibility
        if (data.gallery) {
            const galleryData = data.gallery.photos || data.gallery; // New format (wrapped) or old format (direct array)
            console.log('Gallery data loaded:', galleryData);
            console.log('Gallery photos object:', data.gallery.photos);
            console.log('Is galleryData array:', Array.isArray(galleryData));
            console.log('Gallery photos array length:', data.gallery.photos ? data.gallery.photos.length : 'N/A');
            if (Array.isArray(galleryData)) {
                this.updateGallerySection(galleryData);
            } else {
                console.warn('Gallery data is not an array, skipping update');
            }
        }
    }

    // Update agenda section
    updateAgendaSection(events) {
        const agendaGrid = document.querySelector('.agenda-grid');
        if (!agendaGrid || !events) return;

        // Clear existing content
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
    }

    // Update FAQ section
    updateFAQSection(faqItems) {
        const faqContainer = document.querySelector('#faq .faq-list');
        if (!faqContainer || !faqItems) return;

        // Clear existing content
        faqContainer.innerHTML = '';

        // Add new FAQ items
        faqItems.forEach((item, index) => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <h3>${item.question}</h3>
                <p>${item.answer}</p>
            `;
            faqContainer.appendChild(faqItem);
        });
    }

    // Update gallery section
    updateGallerySection(galleryItems) {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid || !galleryItems) return;

        // Clear existing content
        galleryGrid.innerHTML = '';

        // Add new gallery items
        galleryItems.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <div class="gallery-placeholder">
                    <div class="placeholder-icon">🎵</div>
                    <p>${item.caption}</p>
                    <small>${item.location}</small>
                </div>
            `;
            galleryGrid.appendChild(galleryItem);
        });
    }

    // Initialize the data loader
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadData());
        } else {
            this.loadData();
        }
    }
}

// Create and initialize the CMS data loader
const cmsLoader = new CMSDataLoader();
cmsLoader.init();