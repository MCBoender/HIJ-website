// CMS Data Loader for Netlify CMS
// Loads data from _data files and updates the website content

class CMSDataLoader {
    constructor() {
        this.data = {};
        this.isLoaded = false;
    }

    // Helper method to check if section name suggests it's an array
    isCommonArraySection(sectionName) {
        const commonArrayNames = ['photos', 'items', 'events', 'faq', 'questions', 'images', 'media', 'content'];
        const isArraySection = commonArrayNames.some(name => sectionName.toLowerCase().includes(name));
        console.log(`YAML DEBUG: Checking '${sectionName}' against array names: ${isArraySection ? 'ARRAY SECTION' : 'NO MATCH'}`);
        return isArraySection;
    }

    // Helper method to check if the next lines contain array items
    isNextLinesArray(lines, startIndex, expectedIndent) {
        for (let i = startIndex; i < Math.min(startIndex + 15, lines.length); i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) continue;
            
            const match = lines[i].match(/^(\s*)(.*)$/);
            const indent = match ? match[1].length : 0;
            const content = match ? match[2].trim() : line;
            
            // Found array item - this is definitely an array section
            if (content.startsWith('-')) {
                return true;
            } else if (content.includes(':')) {
                const [key, value] = content.split(':');
                const valueTrim = value.trim();
                
                // If this is a property (has non-empty value) at same level, it's not an array section
                if (valueTrim !== '' && indent === expectedIndent) {
                    return false;
                }
            }
        }
        // If we get here and haven't found anything, check last few lines for array items
        // Sometimes array sections are at the very end
        for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
            const content = lines[i].trim();
            if (content.startsWith('-')) {
                return true;
            }
        }
        return false;
    }

    // Robust YAML parser for agenda/events style structures
    parseYAML(yamlText) {
        const lines = yamlText.split('\n');
        const result = {};
        const contextStack = []; // Tracks: {type: 'root'|'section'|'array_item', data: object, indent: number}
        
        let currentLine = 0;
        
        for (let line of lines) {
            const trimmed = line.trim();
            const match = line.match(/^(\s*)(.*)$/);
            const indent = match ? match[1].length : 0;
            const content = match ? match[2].trim() : trimmed;
            
            // Skip empty lines and comments
            if (!content || content.startsWith('#')) continue;
            
            // Adjust context stack based on indentation
            while (contextStack.length > 0 && indent <= contextStack[contextStack.length - 1].indent) {
                contextStack.pop();
            }
            
            console.log(`YAML DEBUG: Line ${currentLine+1} (indent ${indent}): ${content} | Context: ${contextStack.length > 0 ? contextStack[contextStack.length - 1].type : 'root'}`);
            
            // Array item (starts with dash)
            if (content.startsWith('-')) {
                const itemContent = content.substring(1).trim();
                
                if (itemContent.includes(':')) {
                    // Array item with properties (object)
                    const parentContext = contextStack[contextStack.length - 1];
                    
                    if (!parentContext || parentContext.type !== 'section') {
                        console.warn('YAML DEBUG: Array item not within a section');
                        continue;
                    }
                    
                    // Create new array item
                    const itemData = {};
                    const pairs = itemContent.split(':');
                    const firstKey = pairs[0].trim();
                    const firstValue = pairs.slice(1).join(':').trim();
                    
                    console.log(`YAML DEBUG: Creating array item with property ${firstKey} = ${firstValue} in section '${parentContext.sectionName}'`);
                    itemData[firstKey] = this.parseValue(firstValue);
                    
                    // Store items directly in the section array
                    parentContext.data.push(itemData);
                    
                    // Push new context for this array item
                    contextStack.push({
                        type: 'array_item',
                        data: itemData,
                        indent: indent
                    });
                } else {
                    // Simple array item (string/number)
                    console.log(`YAML DEBUG: Adding simple array item: ${itemContent}`);
                    
                    // Get parent context
                    const parentContext = contextStack[contextStack.length - 1];
                    if (parentContext && parentContext.type === 'section') {
                        // Store items directly in the section array
                        parentContext.data.push(this.parseValue(itemContent));
                    }
                }
            }
            // Regular key-value pair
            else if (content.includes(':')) {
                const [key, ...valueParts] = content.split(':');
                const keyTrim = key.trim();
                const value = valueParts.join(':').trim();
                
                if (value === '' || value === '|') {
                    // Start of nested structure (section)
                    console.log(`YAML DEBUG: Starting section '${keyTrim}'`);
                    
                    // Look ahead to see if this section contains array items
                    const isArraySection = this.isNextLinesArray(lines, currentLine + 1, indent + 2) || 
                                         this.isCommonArraySection(keyTrim);
                    console.log(`YAML DEBUG: Section '${keyTrim}' array detection result: ${isArraySection ? 'ARRAY' : 'OBJECT'}`);
                    
                    if (isArraySection) {
                        // This section will contain an array
                        console.log(`YAML DEBUG: Section '${keyTrim}' detected as array section`);
                        const parentContext = contextStack[contextStack.length - 1];
                        if (parentContext) {
                            parentContext.data[keyTrim] = [];
                            contextStack.push({
                                type: 'section',
                                data: parentContext.data[keyTrim],
                                indent: indent,
                                sectionName: keyTrim
                            });
                        } else {
                            result[keyTrim] = [];
                            contextStack.push({
                                type: 'section',
                                data: result[keyTrim],
                                indent: indent,
                                sectionName: keyTrim
                            });
                        }
                    } else {
                        // This section will contain object properties
                        const parentContext = contextStack[contextStack.length - 1];
                        if (parentContext) {
                            parentContext.data[keyTrim] = {};
                            contextStack.push({
                                type: 'section',
                                data: parentContext.data[keyTrim],
                                indent: indent,
                                sectionName: keyTrim
                            });
                        } else {
                            result[keyTrim] = {};
                            contextStack.push({
                                type: 'section',
                                data: result[keyTrim],
                                indent: indent,
                                sectionName: keyTrim
                            });
                        }
                    }
                } else {
                    // Simple key-value pair
                    const currentContext = contextStack[contextStack.length - 1];
                    
                    if (currentContext && currentContext.type === 'array_item') {
                        console.log(`YAML DEBUG: Setting ${keyTrim} = ${value} in current array item`);
                        currentContext.data[keyTrim] = this.parseValue(value);
                    } else if (currentContext && currentContext.type === 'section') {
                        console.log(`YAML DEBUG: Setting ${keyTrim} = ${value} in section '${currentContext.sectionName || 'unknown'}'`);
                        currentContext.data[keyTrim] = this.parseValue(value);
                    } else {
                        console.log(`YAML DEBUG: Setting ${keyTrim} = ${value} in root`);
                        result[keyTrim] = this.parseValue(value);
                    }
                }
            }
            
            currentLine++;
        }
        
        console.log('YAML DEBUG: Final parsed structure:', result);
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
            
            // Load content data with cache busting
            const contentResponse = await fetch(`./_data/content.yml?v=${Date.now()}`);
            const contentText = await contentResponse.text();
            this.data.content = this.parseYAML(contentText);
            console.log('Content loaded:', this.data.content);

            // Load agenda data with cache busting
            const agendaResponse = await fetch(`./_data/agenda.yml?v=${Date.now()}`);
            const agendaText = await agendaResponse.text();
            const agendaData = this.parseYAML(agendaText);
            // New parser format: agendaData IS already the correct array
            this.data.agenda = agendaData;
            console.log('Agenda loaded:', this.data.agenda);
            console.log('Agenda structure:', typeof this.data.agenda, Array.isArray(this.data.agenda) ? 'Array' : 'Object');

            // Load FAQ data with cache busting
            const faqResponse = await fetch(`./_data/faq.yml?v=${Date.now()}`);
            const faqText = await faqResponse.text();
            const faqData = this.parseYAML(faqText);
            // New parser format: faqData IS already the correct array
            this.data.faq = faqData;
            console.log('FAQ loaded:', this.data.faq);
            console.log('FAQ structure:', typeof this.data.faq, Array.isArray(this.data.faq) ? 'Array' : 'Object');

            // Load gallery data with cache busting
            const galleryResponse = await fetch(`./_data/gallery.yml?v=${Date.now()}`);
            const galleryText = await galleryResponse.text();
            const galleryData = this.parseYAML(galleryText);
            // New parser format: galleryData IS already the correct array
            this.data.gallery = galleryData;
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

        console.log('Homepage DEBUG: Content data:', data.content);
        console.log('Homepage DEBUG: Looking for .hero-subtitle element:', document.querySelector('.hero-subtitle'));

        // Update homepage content
        if (data.homepage_title) {
            const titleElement = document.querySelector('.hero-title');
            if (titleElement) {
                console.log('Homepage DEBUG: Updating title to:', data.homepage_title);
                titleElement.textContent = data.homepage_title;
            } else {
                console.log('Homepage DEBUG: Title element not found (.hero-title)');
            }
        } else {
            console.log('Homepage DEBUG: homepage_title not found in content data');
        }

        if (data.homepage_subtitle) {
            const subtitleElement = document.querySelector('.hero-subtitle');
            if (subtitleElement) {
                console.log('Homepage DEBUG: Updating subtitle to:', data.homepage_subtitle);
                subtitleElement.textContent = data.homepage_subtitle;
            } else {
                console.log('Homepage DEBUG: Subtitle element not found (.hero-subtitle)');
                console.log('Homepage DEBUG: All elements with "subtitle":', document.querySelectorAll('[class*="subtitle"]'));
            }
        } else {
            console.log('Homepage DEBUG: homepage_subtitle not found in content data');
        }

        // Update about section
        if (data.about_title) {
            const aboutTitle = document.querySelector('#over-ons h2');
            if (aboutTitle) aboutTitle.textContent = data.about_title;
        }

        if (data.about_text) {
            const aboutText = document.querySelector('#over-ons .about-text');
            if (aboutText) {
                // Convert markdown-like formatting to HTML
                const formattedText = data.about_text
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

        // Update FAQ section
        if (data.faq) {
            const faqData = Array.isArray(data.faq) ? data.faq : (data.faq.items || []);
            console.log('FAQ data loaded:', faqData);
            console.log('Is faqData array:', Array.isArray(faqData));
            console.log('FAQ data array length:', faqData.length);
            if (faqData.length > 0) {
                this.updateFAQSection(faqData);
            } else {
                console.warn('FAQ data array is empty, skipping update');
            }
        } else {
            console.warn('FAQ data not found, skipping update');
        }

        // Update gallery section 
        if (data.gallery) {
            const galleryData = Array.isArray(data.gallery) ? data.gallery : (data.gallery.photos || []);
            console.log('Gallery data loaded:', galleryData);
            console.log('Is galleryData array:', Array.isArray(galleryData));
            console.log('Gallery data array length:', galleryData.length);
            if (galleryData.length > 0) {
                this.updateGallerySection(galleryData);
            } else {
                console.warn('Gallery data array is empty, skipping update');
            }
        } else {
            console.warn('Gallery data not found, skipping update');
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
            
            // Create actual image element instead of placeholder
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.caption || 'Gallery image';
            img.onerror = function() {
                // Fallback to placeholder if image fails to load
                this.parentNode.innerHTML = `
                    <div class="gallery-placeholder">
                        <div class="placeholder-icon">🎵</div>
                        <p>${item.caption || 'Gallery Image'}</p>
                        <small>${item.location || ''}</small>
                    </div>
                `;
            };
            
            // Create overlay with caption and location
            const overlay = document.createElement('div');
            overlay.className = 'gallery-overlay';
            overlay.innerHTML = `
                <p>${item.caption}</p>
                <small>${item.location}</small>
            `;
            
            galleryItem.appendChild(img);
            galleryItem.appendChild(overlay);
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