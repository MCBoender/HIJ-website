// CMS Data Loader for Netlify CMS
// Loads data from _data files and updates the website content

class CMSDataLoader {
    constructor() {
        this.data = {};
        this.isLoaded = false;
    }

    // Flexible YAML parser for all values including folded text
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
                
                // Check if this is a multi-line value
                if (value === '|') {
                    // Multiline literal block scalar (preserve formatting)
                    const multiLines = [];
                    let j = i + 1;
                    
                    while (j < lines.length) {
                        const nextLine = lines[j];
                        const trimmedNext = nextLine.trim();
                        
                        // Stop if we find a new top-level key (no indentation)
                        if (trimmedNext && trimmedNext.includes(':') && nextLine.match(/^[^\s]/)) {
                            break;
                        }
                        
                        // Skip empty lines
                        if (!trimmedNext) {
                            multiLines.push('');
                            j++;
                            continue;
                        }
                        
                        // Add content (remove leading indentation)
                        if (nextLine.match(/^\s/)) {
                            const leadingSpaces = nextLine.match(/^\s*/)[0].length;
                            const content = nextLine.substring(leadingSpaces);
                            multiLines.push(content);
                        } else {
                            multiLines.push(trimmedNext);
                        }
                        
                        j++;
                    }
                    
                    // Preserve line breaks for multiline content
                    result[key] = multiLines.join('\n');
                    i = j - 1;
                } else if (value === '>') {
                    // Folded scalar (convert to single line)
                    const multiLines = [];
                    let j = i + 1;
                    
                    while (j < lines.length) {
                        const nextLine = lines[j];
                        const trimmedNext = nextLine.trim();
                        
                        // Stop if we find a new top-level key (no indentation)
                        if (trimmedNext && trimmedNext.includes(':') && nextLine.match(/^[^\s]/)) {
                            break;
                        }
                        
                        // Skip empty lines
                        if (!trimmedNext) {
                            j++;
                            continue;
                        }
                        
                        // Add content
                        multiLines.push(trimmedNext);
                        
                        j++;
                    }
                    
                    result[key] = multiLines.join(' ');
                    i = j - 1;
                } else if (value === '') {
                    // Empty value, continue to next check
                } else {
                    // Check if this might be folded text (continuation lines)
                    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
                    
                    if (nextLine && nextLine.match(/^\s/) && nextLine.trim() && !nextLine.trim().startsWith('#')) {
                        // This looks like folded text - first line + continuation
                        const multiLines = [value];
                        let j = i + 1;
                        
                        while (j < lines.length) {
                            const continuationLine = lines[j];
                            const trimmed = continuationLine.trim();
                            
                            // Stop if we hit a new top-level key
                            if (trimmed && trimmed.includes(':') && !trimmed.startsWith('-') && !continuationLine.match(/^\s/) && !continuationLine.startsWith('-')) {
                                break;
                            }
                            
                            // Stop at empty lines
                            if (!trimmed) {
                                j++;
                                continue;
                            }
                            
                            // Add continuation line (just the content)
                            if (trimmed) {
                                multiLines.push(trimmed);
                            }
                            
                            j++;
                        }
                        
                        result[key] = multiLines.join(' ');
                        i = j - 1;
                    } else {
                        // Simple single-line value
                        result[key] = value.replace(/^"|"$/g, '');
                    }
                }
            }
        }
        
        return result;
    }

    // Process numbered fields and convert to arrays
    processNumberedFields(data, sectionName, requiredField) {
        const numberedFields = {};
        const items = [];
        
        // Find all fields that start with the section name followed by a number
        const pattern = new RegExp(`^${sectionName}(\\d+)_(\\w+)$`);
        
        for (const [key, value] of Object.entries(data)) {
            const match = key.match(pattern);
            if (match) {
                const itemNumber = parseInt(match[1]);
                const fieldName = match[2];
                
                if (!numberedFields[itemNumber]) {
                    numberedFields[itemNumber] = {};
                }
                numberedFields[itemNumber][fieldName] = value;
            }
        }
        
        // Convert to array, but only include items that have a required field
        for (let i = 1; i <= Object.keys(numberedFields).length; i++) {
            if (numberedFields[i] && numberedFields[i][requiredField] && numberedFields[i][requiredField].trim() !== '') {
                items.push(numberedFields[i]);
            }
        }
        
        return items;
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

            // Load agenda data (keep existing format for now)
            const agendaResponse = await fetch('./_data/agenda.yml');
            const agendaText = await agendaResponse.text();
            const agendaData = this.parseYAML(agendaText);
            // Handle both old format (direct array) and new format (wrapped in events)
            this.data.agenda = agendaData.events || agendaData;
            console.log('Agenda loaded:', this.data.agenda);

            // Load FAQ data - NEW: using numbered fields
            const faqResponse = await fetch('./_data/faq.yml');
            const faqText = await faqResponse.text();
            const faqData = this.parseYAML(faqText);
            console.log('FAQ raw data:', faqData);
            // Use numbered fields approach
            this.data.faq = this.processNumberedFields(faqData, 'faq', 'question');
            console.log('FAQ loaded:', this.data.faq);

            // Load gallery data - NEW: using numbered fields
            const galleryResponse = await fetch('./_data/gallery.yml');
            const galleryText = await galleryResponse.text();
            const galleryData = this.parseYAML(galleryText);
            console.log('Gallery raw data:', galleryData);
            // Use numbered fields approach
            this.data.gallery = this.processNumberedFields(galleryData, 'photo', 'image');
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
                console.log('Homepage DEBUG: Content data length:', Object.keys(data.content).length);
                console.log('Homepage DEBUG: Subtitle length:', data.content.homepage_subtitle ? this.data.content.homepage_subtitle.length : 'undefined');
                console.log('Homepage DEBUG: Full subtitle:', data.content.homepage_subtitle);
                console.log('Homepage DEBUG: Looking for .hero-subtitle element:', subtitleElement);
                
                // Handle case where subtitle might be an object
                let subtitleText = data.content.homepage_subtitle;
                if (typeof subtitleText === 'object') {
                    // If it's an object, try to extract the actual text content
                    if (subtitleText.value) {
                        subtitleText = subtitleText.value;
                    } else if (subtitleText.content) {
                        subtitleText = subtitleText.content;
                    } else {
                        subtitleText = JSON.stringify(subtitleText);
                    }
                }
                
                // Convert newlines to <br> tags for proper HTML display
                subtitleText = subtitleText.replace(/\n/g, '<br>');
                
                subtitleElement.innerHTML = subtitleText;
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
        console.log('FAQ DEBUG: Checking FAQ data...');
        console.log('FAQ DEBUG: data.faq exists:', !!data.faq);
        console.log('FAQ DEBUG: data.faq is array:', Array.isArray(data.faq));
        console.log('FAQ DEBUG: data.faq length:', data.faq ? data.faq.length : 'undefined');
        
        if (data.faq && Array.isArray(data.faq)) {
            console.log('FAQ DEBUG: Updating FAQ section with', data.faq.length, 'items');
            this.updateFAQSection(data.faq);
        } else {
            console.log('FAQ DEBUG: FAQ section update skipped');
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
        console.log('FAQ DEBUG: updateFAQSection called with', faqItems.length, 'items');
        const faqContainer = document.querySelector('#faq .faq-grid');
        console.log('FAQ DEBUG: faqContainer found:', !!faqContainer);
        if (!faqContainer) {
            console.log('FAQ DEBUG: Container not found - trying alternatives...');
            const faqSection = document.querySelector('#faq');
            console.log('FAQ DEBUG: faqSection found:', !!faqSection);
            return;
        }
        if (!faqItems) return;
        
        console.log('FAQ DEBUG: Clearing existing content');
        // Clear existing content
        faqContainer.innerHTML = '';

        // Add new FAQ items
        faqItems.forEach((item, index) => {
            console.log('FAQ DEBUG: Adding item', index, ':', item.question);
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <h3>${item.question}</h3>
                <p>${item.answer}</p>
            `;
            faqContainer.appendChild(faqItem);
        });
        console.log('FAQ DEBUG: FAQ section update complete');
    }

    // Update gallery section
    updateGallerySection(galleryItems) {
        console.log('Gallery DEBUG: Checking gallery data...');
        console.log('Gallery DEBUG: data.gallery exists:', !!galleryItems);
        console.log('Gallery DEBUG: data.gallery is array:', Array.isArray(galleryItems));
        console.log('Gallery DEBUG: data.gallery length:', galleryItems ? galleryItems.length : 'undefined');
        
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) {
            console.log('Gallery DEBUG: galleryGrid not found');
            return;
        }
        if (!galleryItems) {
            console.log('Gallery DEBUG: galleryItems not found');
            return;
        }

        console.log('Gallery DEBUG: Clearing existing content');
        // Clear existing content
        galleryGrid.innerHTML = '';

        // Add new gallery items
        galleryItems.forEach((item, index) => {
            console.log('Gallery DEBUG: Adding item', index, ':', item.caption);
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${item.image}" alt="${item.caption}" style="width: 100%; max-height: 400px; object-fit: contain; border-radius: 8px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="placeholder-icon" style="display: none; width: 100%; max-height: 400px; border-radius: 8px; background: #f5f5f5; align-items: center; justify-content: center; flex-direction: column;">
                    <div style="font-size: 48px;">🎵</div>
                    <p>${item.caption}</p>
                    <small>${item.location}</small>
                </div>
                <h3>${item.caption}</h3>
                <p class="gallery-location">${item.location}</p>
            `;
            galleryGrid.appendChild(galleryItem);
        });
        console.log('Gallery DEBUG: Gallery section update complete');
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