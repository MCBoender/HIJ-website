// CMS Data Loader for Netlify CMS
// Loads data from _data files and updates the website content

class CMSDataLoader {
    constructor() {
        this.data = {};
        this.isLoaded = false;
    }

    // Universal YAML parser for all multi-line values
    parseYAML(yamlText) {
        const result = {};
        const lines = yamlText.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip empty lines and comments
            if (!line.trim() || line.trim().startsWith('#')) {
                continue;
            }
            
            // Look for key-value patterns
            if (line.includes(':')) {
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // Check if this is a multi-line value (empty after colon or > or |)
                if (value === '' || value === '>' || value === '|') {
                    // Multi-line: collect all subsequent lines until next key
                    const multiLines = [];
                    let j = i + 1;
                    
                    while (j < lines.length) {
                        const nextLine = lines[j];
                        const trimmedNext = nextLine.trim();
                        
                        // Stop if we find a new key (not indented, contains colon)
                        if (trimmedNext && trimmedNext.includes(':') && !trimmedNext.startsWith('-') && !nextLine.match(/^\s/)) {
                            // This is a new top-level key
                            break;
                        }
                        
                        // Skip empty lines
                        if (!trimmedNext) {
                            j++;
                            continue;
                        }
                        
                        // Add content from this line
                        if (trimmedNext) {
                            multiLines.push(trimmedNext);
                        }
                        
                        j++;
                    }
                    
                    // Join all lines with spaces
                    result[key] = multiLines.join(' ');
                    i = j - 1; // Skip to before the next key
                } else {
                    // Single-line value
                    result[key] = value.replace(/^"|"$/g, '');
                }
            }
        }
        
        return result;
    }

    // Fetch and parse YAML data files
    async loadData() {
        try {
            console.log('Loading CMS data...');
            
            // Load content data
            const contentResponse = await fetch('./_data/content.yml');
            const contentText = await contentResponse.text();
            console.log('Raw YAML text:', contentText.substring(0, 200) + '...');
            this.data.content = this.parseYAML(contentText);
            console.log('Content loaded:', this.data.content);
            console.log('Homepage title:', this.data.content.homepage_title);
            console.log('Homepage subtitle:', this.data.content.homepage_subtitle);
            console.log('About text:', this.data.content.about_text);
            console.log('Subtitle length:', this.data.content.homepage_subtitle ? this.data.content.homepage_subtitle.length : 'undefined');

            // Load agenda data
            const agendaResponse = await fetch('./_data/agenda.yml');
            const agendaText = await agendaResponse.text();
            this.data.agenda = this.parseYAML(agendaText);
            console.log('Agenda loaded:', this.data.agenda);

            // Load FAQ data
            const faqResponse = await fetch('./_data/faq.yml');
            const faqText = await faqResponse.text();
            this.data.faq = this.parseYAML(faqText);
            console.log('FAQ loaded:', this.data.faq);

            // Load gallery data
            const galleryResponse = await fetch('./_data/gallery.yml');
            const galleryText = await galleryResponse.text();
            this.data.gallery = this.parseYAML(galleryText);
            console.log('Gallery loaded:', this.data.gallery);

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
        console.log('updatePageContent called');
        console.log('isLoaded:', this.isLoaded);
        
        if (!this.isLoaded) {
            console.log('Not loaded, skipping update');
            return;
        }

        const data = this.data;
        console.log('Data for update:', data.content);

        // Update homepage content
        if (data.content.homepage_title) {
            const titleElement = document.querySelector('.hero-title');
            console.log('Title element found:', titleElement);
            if (titleElement) {
                console.log('Updating title to:', data.content.homepage_title);
                titleElement.textContent = data.content.homepage_title;
            }
        }

        if (data.content.homepage_subtitle) {
            const subtitleElement = document.querySelector('.hero-subtitle');
            console.log('Subtitle element found:', subtitleElement);
            if (subtitleElement) {
                console.log('Updating subtitle to:', data.content.homepage_subtitle);
                subtitleElement.textContent = data.content.homepage_subtitle;
            }
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

        // Update agenda section
        if (data.agenda && Array.isArray(data.agenda)) {
            this.updateAgendaSection(data.agenda);
        }

        // Update FAQ section
        if (data.faq && Array.isArray(data.faq)) {
            this.updateFAQSection(data.faq);
        }

        // Update gallery section
        if (data.gallery && Array.isArray(data.gallery)) {
            this.updateGallerySection(data.gallery);
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