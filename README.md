# H.I.J. Website - Editing Guide

Congratulations! Your website for the Haags Instrumentaal Jeugdensemble is ready! 🎵

## 📁 Website Files

Your website consists of these main files:
- `index.html` - The main website file
- `styles.css` - All the styling and design
- `script.js` - Interactive features and functionality
- `hijbanner.jpeg` - Your banner image
- `hij-logo.jpeg` - Your logo
- `hij-multomap.png` - Music sheet design
- `postcard.jpg` - Postcard design
- And other design assets

## ✏️ How to Edit the Website

### 🔧 Basic Editing (For Non-Technical Users)

**Content Updates:**
- **Schedule Changes:** Look for "Zaterdag 10:00 - 12:00" in the HTML file to change rehearsal times
- **Contact Information:** Find "info@hijjeugdorkest.nl" to change email addresses
- **Event Dates:** Look for the "agenda-grid" section to update concert dates
- **Text Changes:** Any visible text can be found and changed in the HTML file

**Images:**
- Replace image files with the same names (e.g., replace `hijbanner.jpeg` with your new banner)
- For new images, place them in the same folder and update the file references in HTML

### 🛠️ Technical Editing (For Advanced Users)

**Structure Changes:**
- **Adding Sections:** Copy any `<section>` block and modify the content
- **Changing Colors:** Edit the CSS variables at the top of `styles.css`
- **Navigation:** Update the `<nav>` section to add/remove menu items

**Advanced Features:**
- **Instagram Integration:** The `script.js` file contains functions to update the Instagram feed
- **Contact Form:** Currently opens email client, can be modified to use a form service
- **Gallery Updates:** Use the `window.updateGallery()` function to add new photos

## 🚀 Going Live

### Option 1: Simple Web Hosting
1. Upload all files to any web hosting service
2. Make sure `index.html` is in the root directory
3. Your site will be live immediately!

**Recommended hosting services:**
- Netlify (free)
- Vercel (free)
- GitHub Pages (free)
- Any shared hosting provider

### Option 2: Professional Setup
1. **Domain:** Buy hijjeugdorkest.nl or similar
2. **Hosting:** Use the domain with your hosting provider
3. **SSL:** Most hosts provide free SSL certificates

## 📱 Website Features

✅ **Mobile Responsive** - Works perfectly on phones and tablets
✅ **Fast Loading** - Optimized for quick page loads
✅ **SEO Friendly** - Search engines can find your orchestra
✅ **Contact Form** - Visitors can easily contact you
✅ **Social Media Ready** - Instagram integration placeholder
✅ **Easy Updates** - Simple to update content
✅ **Professional Design** - Modern, clean, and engaging

## 🎯 Key Website Sections

1. **Hero Section** - Main call-to-action with "SPEEL MEE" 
2. **Over Ons** - Information about your unique approach
3. **Repetities** - Schedule, location, and requirements
4. **Agenda** - Upcoming performances
5. **Galerij** - Photo showcase of diverse locations
6. **Lid Worden** - How to join information
7. **Sponsoring** - Fundraising and support opportunities
8. **Contact** - Contact form and details

## 🔄 Regular Maintenance

**Weekly Updates:**
- Check and update the agenda section
- Add new photos to the gallery
- Post new content to Instagram

**Monthly Updates:**
- Review and update member information
- Check that all links still work
- Update any outdated information

**As Needed:**
- Add new events to the agenda
- Update contact information
- Add new photos from performances
- Update member/ conductor information

## 🆘 Common Updates

### Adding a New Event:
```html
<div class="event-card">
    <div class="event-date">
        <span class="day">15</span>
        <span class="month">NOV</span>
    </div>
    <div class="event-details">
        <h3>Concert Titel</h3>
        <p class="event-time">14:00 - 15:00</p>
        <p class="event-location">Locatie Adres</p>
        <p class="event-description">Event beschrijving</p>
        <a href="mailto:info@hijjeugdorkest.nl" class="btn btn-small">Meer info</a>
    </div>
</div>
```

### Updating Contact Information:
Find and replace:
- `info@hijjeugdorkest.nl` - General contact
- `bestuur@hijjeugdorkest.nl` - Membership inquiries
- `https://www.instagram.com/hijjeugdorkest/` - Instagram link

### Changing Rehearsal Info:
Look for the "Repetities" section and update:
- Days and times
- Location address
- Requirements and costs

## 🎨 Design Customization

The website uses your brand colors:
- **Primary:** Deep Burgundy (#7B2A4B)
- **Accent Colors:** Yellow, Teal, Red, Pink
- **Background:** Warm off-white (#FDFCF9)

To change colors, edit the CSS variables at the top of `styles.css`.

## 📞 Getting Help

**Simple Changes:** 
- Most text changes can be done by finding and replacing in the HTML file
- Image replacements just need the same filename

**Complex Changes:**
- Consider hiring a local web developer
- Many offer affordable website maintenance services
- You can also learn basic HTML/CSS through online tutorials

## 🎵 Your Website is Ready!

Your website beautifully captures the fun, energetic spirit of the H.I.J. while being professional enough to attract new members and sponsors. The diverse performance locations (parks, libraries, churches, floating pontoons) and the games during rehearsal breaks are all highlighted.

The design reflects the playful yet organized nature of your youth orchestra, with the hand-drawn logo style and musical elements that kids and parents will love.

**Welcome to the digital world of H.I.J.!** 🎼