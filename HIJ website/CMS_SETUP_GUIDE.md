# 🎵 H.I.J. Jeugdorkest Website met Netlify CMS

## 🎉 Gefeliciteerd! Je website is nu klaar voor Netlify CMS

### 📁 Nieuwe bestanden toegevoegd:
- `admin/index.html` - Netlify CMS interface
- `admin/config.yml` - CMS configuratie
- `_data/agenda.yml` - Agenda events
- `_data/content.yml` - Algemene website content
- `_data/faq.yml` - Veelgestelde vragen
- `_data/gallery.yml` - Galerij foto's
- `js/cms-loader.js` - Laadt CMS data in je website

### 🚀 **Volgende stappen voor jou:**

## **STAP 1: GitHub Repository Maken**
1. Ga naar **GitHub.com** en log in
2. Klik **"New repository"** (groene knop)
3. Repository naam: `hij-website` (of wat je wilt)
4. **Public** repository aanmaken
5. Klik **"Create repository"**

## **STAP 2: Website Uploaden naar GitHub**
1. **Download** alle website bestanden naar je computer
2. Open **GitHub.com** → Ga naar je nieuwe repository
3. Klik **"uploading an existing file"**
4. **Sleep** alle bestanden naar GitHub (inclusief de nieuwe CMS bestanden)
5. Voeg commit message toe: `"Initial website setup with Netlify CMS"`
6. Klik **"Commit changes"**

## **STAP 3: Netlify Deployment**
1. Ga naar **Netlify.com** en log in
2. Klik **"Add new site"** → **"Deploy manually"**
3. **Sleep** je website map naar Netlify
4. Wacht tot deployment klaar is
5. Je krijgt een tijdelijk domein (bijv. `amazing-site-123.netlify.app`)

## **STAP 4: GitHub Backend Instellen**
1. Ga naar je Netlify site → **Site settings** → **General**
2. Scroll naar **Build & deploy**
3. Klik **"Edit settings"**
4. Kies **GitHub** als backend
5. **Autoriseer** Netlify met je GitHub account
6. Selecteer je repository
7. Klik **"Save"**

## **STAP 5: CMS Configureren**
1. Ga naar **`jouwsite.netlify.app/admin`**
2. **Log in** met GitHub (eerste keer autoriseren)
3. Je ziet nu de CMS interface!

### 🎯 **Wat kun je nu doen via het CMS:**

#### **📅 Agenda Beheer**
- **Nieuwe events** toevoegen
- **Data wijzigen** (datum, tijd, locatie)
- **Beschrijvingen** updaten

#### **📝 Content Beheer**
- **Homepage tekst** wijzigen
- **"Over Ons"** sectie updaten
- **Contact gegevens** aanpassen

#### **❓ FAQ Beheer**
- **Nieuwe vragen** toevoegen
- **Antwoorden** updaten

#### **🖼️ Galerij Beheer**
- **Nieuwe foto's** uploaden
- **Bijschriften** toevoegen

### 🔧 **Belangrijke Updates:**

#### **Admin Configuratie Bijwerken:**
1. Open **`admin/config.yml`** in je GitHub repository
2. Zoek regel: `repo: # TODO: Update with your GitHub repository`
3. Vervang met: `repo: jouw-gebruikersnaam/hij-website`
4. Commit de wijziging

### 🎵 **Voorbeeld Workflow:**

#### **Nieuwe Agenda Event Toevoegen:**
1. Ga naar **`jouwsite.netlify.app/admin`**
2. Klik **"Agenda"** → **"New"**
3. Vul in: Dag, Maand, Titel, Tijd, Locatie, Beschrijving
4. Klik **"Publish"**
5. **Automatisch** wordt je website geüpdatet!

### 🆘 **Problemen oplossen:**

#### **Website laden geen CMS data:**
- Check of alle `_data` bestanden in je repository staan
- Controleer of `js/cms-loader.js` wordt geladen (browser console)

#### **CMS werkt niet:**
- Check `admin/config.yml` - staat de repo naam goed?
- Ga naar Netlify dashboard → Site settings → Build & deploy

#### **Wijzigingen niet zichtbaar:**
- Netlify deployment kan 2-5 minuten duren
- Hard refresh (Ctrl+F5) proberen

### 💡 **Tips:**

1. **Backup maken** - GitHub houdt alle versies bij
2. **Test eerst** - maak een copy van belangrijke content
3. **Team toegang** - nodig anderen uit als collaborators in GitHub
4. **Custom domain** - later kun je je eigen domein koppelen

### 🎉 **Je hebt nu een professionele website met CMS!**

**Voor vragen of hulp:** Bewaar deze handleiding en gebruik de browser console (F12) voor debugging.

**Happy music making! 🎵**